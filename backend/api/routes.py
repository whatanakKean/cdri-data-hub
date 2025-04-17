from datetime import datetime, timezone, timedelta

from functools import wraps

from flask import request
from flask_restx import Api, Resource, fields

import jwt
import json
import google.generativeai as genai
import re

from .models import db, Users, JWTTokenBlocklist, EducationData, AgricultureData, EconomicData
from .config import BaseConfig
import requests
from collections import defaultdict

rest_api = Api(version="1.0", title="CDRI Data Hub API")
genai.configure(api_key=BaseConfig.GOOGLE_API_KEY)


"""
    Flask-Restx models for api request and response data
"""

signup_model = rest_api.model('SignUpModel', {"username": fields.String(required=True, min_length=2, max_length=32),
                                              "email": fields.String(required=True, min_length=4, max_length=64),
                                              "password": fields.String(required=True, min_length=4, max_length=16)
                                              })

login_model = rest_api.model('LoginModel', {"email": fields.String(required=True, min_length=4, max_length=64),
                                            "password": fields.String(required=True, min_length=4, max_length=16)
                                            })

user_edit_model = rest_api.model('UserEditModel', {"userID": fields.String(required=True, min_length=1, max_length=32),
                                                   "username": fields.String(required=True, min_length=2, max_length=32),
                                                   "email": fields.String(required=True, min_length=4, max_length=64)
                                                   })

query_model = rest_api.model('QueryModel', {
    'sector': fields.String(required=True, description="Sector"),
    'series_name': fields.String(required=False, description="Series Name"),
    'subsector_1': fields.String(required=False, description="Subsector 1"),
    'subsector_2': fields.String(required=False, description="Subsector 2"),
})

chat_model = rest_api.model('ChatModel', {
    'query': fields.String(required=True, description="Natural language description of the chatbot (e.g., 'Generate a line graph with sales data')")
})



"""
   Helper function for JWT token required
"""

def token_required(f):

    @wraps(f)
    def decorator(*args, **kwargs):

        token = None

        if "authorization" in request.headers:
            token = request.headers["authorization"]

        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400

        try:
            data = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=["HS256"])
            current_user = Users.get_by_email(data["email"])

            if not current_user:
                return {"success": False,
                        "msg": "Sorry. Wrong auth token. This user does not exist."}, 400

            token_expired = db.session.query(JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()

            if token_expired is not None:
                return {"success": False, "msg": "Token revoked."}, 400

            if not current_user.check_jwt_auth_active():
                return {"success": False, "msg": "Token expired."}, 400

        except:
            return {"success": False, "msg": "Token is invalid"}, 400

        return f(current_user, *args, **kwargs)

    return decorator


"""
    Flask-Restx routes
"""

@rest_api.route('/api/chat')
class GenerateChat(Resource):
    """
    Generates an ECharts configuration for testing based on a natural language query.
    Requires JWT authentication.
    """
    @rest_api.expect(chat_model, validate=True)
    def post(self):
        try:
            data = rest_api.payload
            query = data.get('query', '')

            if not query:
                return {"success": False, "msg": "No query provided"}, 400

            # Prepare prompt for Gemini
            prompt = f"""
            You are an expert in generating ECharts configuration code for charts. Based on the user's query, generate an ECharts option object as a valid JSON string, compatible with echarts-for-react. Include sample data since no external data is provided. Return ONLY the JSON object as a string, without markdown (e.g., no ```json or ```), without explanations, and without any extra text or whitespace outside the JSON.

            User Query:
            {query}
            """

            # Call Gemini API
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(prompt)

            # Parse and validate the generated ECharts code
            response_text = response.text.strip()
            json_pattern = r'```json\s*(.*?)\s*```'
            match = re.match(json_pattern, response_text, re.DOTALL)
            if match:
                json_str = match.group(1).strip()
            else:
                json_str = response_text
            chart_config = json.loads(json_str)

            return {
                "success": True,
                "chartConfig": chart_config
            }, 200

        except json.JSONDecodeError:
            return {"success": False, "msg": "Invalid ECharts configuration generated"}, 500
        except Exception as e:
            return {"success": False, "msg": str(e)}, 500

# Define the resource class to handle the GET request
@rest_api.route('/api/query-data')
class QueryData(Resource):
    @rest_api.expect(query_model)
    def post(self):
        data = rest_api.payload

        # Call the `query` method of the EducationData model
        sector = data.get('sector', None)

        # Dynamically select the model based on sector
        if sector == "Education":
            ModelClass = EducationData
        elif sector == "Agriculture":
            ModelClass = AgricultureData
        elif sector == "Economic":
            ModelClass = EconomicData

        if not ModelClass:
            return {"error": "Invalid sector. Supported sectors: Education, Agriculture"}, 400
        
        # Prepare filters (excluding 'sector' itself)
        filters = {key: value for key, value in data.items() if key != 'sector'}
        
        # Query data dynamically
        filtered_data = ModelClass.get_data(**filters)

        if not filtered_data:
            return {"message": "No data found matching the criteria."}, 404
        
        return filtered_data, 200

@rest_api.route('/api/query-menu')
class QueryMenu(Resource):
    def get(self):
        print("Hello")
        ModelClasses = [EducationData, AgricultureData, EconomicData]
        
        # Initialize an empty dictionary to store the aggregated data
        aggregated_menu = defaultdict(lambda: defaultdict(list))
        aggregated_series_name = []

        # Query hierarchical data from all sector models
        for model_class in ModelClasses:
            filtered_data, series_name_list = model_class.get_menu()

            # Merge the dictionaries
            for key, sub_dict in filtered_data.items():
                for sub_key, sub_value in sub_dict.items():
                    aggregated_menu[key][sub_key].extend(sub_value)

            # Extend the list instead of appending
            aggregated_series_name.extend(series_name_list)

        # Convert back to a regular dictionary if needed
        aggregated_menu = {k: dict(v) for k, v in aggregated_menu.items()}

        return {"menu": aggregated_menu, "data_explorer": aggregated_series_name}, 200


@rest_api.route('/api/users/register')
class Register(Resource):
    """
       Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(signup_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(username=_username, email=_email)

        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
       Login user by taking 'login_model' input and return JWT token
    """

    @rest_api.expect(login_model, validate=True)
    def post(self):

        req_data = request.get_json()

        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)

        user_exists.set_jwt_auth_active(True)
        user_exists.save()

        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
       Edits User's username or password or both using 'user_edit_model' input
    """

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):

        req_data = request.get_json()

        _new_username = req_data.get("username")
        _new_email = req_data.get("email")

        if _new_username:
            self.update_username(_new_username)

        if _new_email:
            self.update_email(_new_email)

        self.save()

        return {"success": True}, 200


@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
       Logs out User using 'logout_model' input
    """

    @token_required
    def post(self, current_user):

        _jwt_token = request.headers["authorization"]

        jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
        jwt_block.save()

        self.set_jwt_auth_active(False)
        self.save()

        return {"success": True}, 200


@rest_api.route('/api/sessions/oauth/github/')
class GitHubLogin(Resource):
    def get(self):
        code = request.args.get('code')
        client_id = BaseConfig.GITHUB_CLIENT_ID
        client_secret = BaseConfig.GITHUB_CLIENT_SECRET
        root_url = 'https://github.com/login/oauth/access_token'

        params = { 'client_id': client_id, 'client_secret': client_secret, 'code': code }

        data = requests.post(root_url, params=params, headers={
            'Content-Type': 'application/x-www-form-urlencoded',
        })

        response = data._content.decode('utf-8')
        access_token = response.split('&')[0].split('=')[1]

        user_data = requests.get('https://api.github.com/user', headers={
            "Authorization": "Bearer " + access_token
        }).json()
        
        user_exists = Users.get_by_username(user_data['login'])
        if user_exists:
            user = user_exists
        else:
            try:
                user = Users(username=user_data['login'], email=user_data['email'])
                user.save()
            except:
                user = Users(username=user_data['login'])
                user.save()
        
        user_json = user.toJSON()

        token = jwt.encode({"username": user_json['username'], 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)
        user.set_jwt_auth_active(True)
        user.save()

        return {"success": True,
                "user": {
                    "_id": user_json['_id'],
                    "email": user_json['email'],
                    "username": user_json['username'],
                    "token": token,
                }}, 200
    

@rest_api.route('/api/sessions/oauth/google/')
class GoogleLogin(Resource):
    def get(self):
        code = request.args.get('code')
        client_id = BaseConfig.GOOGLE_CLIENT_ID  # Loaded from .env
        client_secret = BaseConfig.GOOGLE_CLIENT_SECRET  # Loaded from .env
        root_url = 'https://oauth2.googleapis.com/token'  # Google's token endpoint

        # Parameters for the token request
        params = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': 'YOUR_REDIRECT_URI',  # Ensure you have set this in Google API Console
            'grant_type': 'authorization_code'
        }

        # Get the access token from Google
        data = requests.post(root_url, data=params, headers={
            'Content-Type': 'application/x-www-form-urlencoded',
        })

        response = data.json()
        access_token = response.get('access_token')

        if not access_token:
            return {"success": False, "msg": "Failed to obtain access token from Google."}, 400

        # Use the access token to fetch the user's Google profile
        user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        user_data = requests.get(user_info_url, headers={
            'Authorization': f'Bearer {access_token}'
        }).json()

        # Check if user already exists
        user_exists = Users.get_by_email(user_data['email'])
        if user_exists:
            user = user_exists
        else:
            try:
                # Create a new user if the user doesn't exist
                user = Users(username=user_data['name'], email=user_data['email'])
                user.save()
            except Exception as e:
                # Handle any exception while creating the user
                user = Users(username=user_data['name'])
                user.save()

        # Generate a JWT token
        user_json = user.toJSON()
        token = jwt.encode(
            {"username": user_json['username'], 'exp': datetime.utcnow() + timedelta(minutes=30)},
            BaseConfig.SECRET_KEY
        )
        user.set_jwt_auth_active(True)
        user.save()

        return {
            "success": True,
            "user": {
                "_id": user_json['_id'],
                "email": user_json['email'],
                "username": user_json['username'],
                "token": token,
            }
        }, 200
