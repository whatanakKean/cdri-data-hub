from datetime import datetime

import json

from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import distinct

db = SQLAlchemy()


class Users(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(64), nullable=True)
    password = db.Column(db.Text())
    jwt_auth_active = db.Column(db.Boolean())
    date_joined = db.Column(db.DateTime(), default=datetime.utcnow)

    def __repr__(self):
        return f"User {self.username}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def update_email(self, new_email):
        self.email = new_email

    def update_username(self, new_username):
        self.username = new_username

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    def toDICT(self):

        cls_dict = {}
        cls_dict['_id'] = self.id
        cls_dict['username'] = self.username
        cls_dict['email'] = self.email

        return cls_dict

    def toJSON(self):

        return self.to_dict()


class JWTTokenBlocklist(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    jwt_token = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False)

    def __repr__(self):
        return f"Expired Token: {self.jwt_token}"

    def save(self):
        db.session.add(self)
        db.session.commit()

class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    province = db.Column(db.String(255), nullable=True)
    series_name = db.Column(db.String(255), nullable=True)
    indicator_value = db.Column(db.Float, nullable=True)
    indicator = db.Column(db.String(255), nullable=True)
    year = db.Column(db.String(4), nullable=True)
    series_code = db.Column(db.String(255), nullable=True)
    sector = db.Column(db.String(255), nullable=True)
    subsector_1 = db.Column(db.String(255), nullable=True)
    subsector_2 = db.Column(db.String(255), nullable=True)
    source = db.Column(db.String(255), nullable=True)
    latitude = db.Column(db.String(255), nullable=True)
    longitude = db.Column(db.String(255), nullable=True)
    indicator_unit = db.Column(db.String(255), nullable=True)
    tag = db.Column(db.String(255), nullable=True)
    filters = db.Column(db.String(255), nullable=True)

    def save(self):
        """Save instance to DB."""
        db.session.add(self)
        db.session.commit()

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_by_province(cls, province):
        return cls.query.filter_by(province=province).all()

    @classmethod
    def get_data(cls, **filters):
        query = cls.query
        for column, value in filters.items():
            if value and column != "filters":
                query = query.filter(getattr(cls, column) == value)

        # Convert data to dictionary format
        result = [entry.to_dict() for entry in query.all()]

        # Specify the columns you want to retrieve unique values from
        exclude_column = ['id', 'indicator_value', 'series_code', 'series_name', 'source', 'latitude', 'longitude', 'indicator_unit', 'tag']
        unique_values = {}

        for column_name in result[0].keys():
            if column_name in exclude_column:
                continue

            if column_name == "sector" or column_name == "series_name" or column_name == "subsector_1":
                query_unique = db.session.query(getattr(cls, column_name)).distinct().all()
                unique_values[column_name] = [item[0] for item in query_unique if item[0] not in [None, '']]

            elif column_name == "subsector_2":
                query_unique = db.session.query(getattr(cls, column_name)).distinct().filter(
                    getattr(cls, "subsector_1") == filters.get("subsector_1")
                ).all()
                unique_values[column_name] = [item[0] for item in query_unique if item[0] not in [None, '']]

            else:
                query_unique = list(set(entry[column_name] for entry in result))
                unique_values[column_name] = [item for item in query_unique if item not in [None, '']]


        return {
            'data': result,
            'filters': unique_values
        }
    
    @classmethod
    def get_menu(cls, **filters):
        unique_values = {}

        # Only include these columns for unique values
        columns_of_interest = ['sector', 'subsector_1', 'subsector_2', 'series_name']

        for column_name in columns_of_interest:
            if column_name == "subsector_2" and "subsector_1" in filters:
                # Only query subsector_2 if subsector_1 filter is provided
                query_unique = db.session.query(getattr(cls, column_name)).distinct().filter(
                    getattr(cls, "subsector_1") == filters.get("subsector_1"),
                    getattr(cls, column_name) != None  # Exclude None values
                ).all()
                unique_values[column_name] = [item[0] for item in query_unique if item[0] not in ['', None]]

            else:
                # Directly query the unique values for the column
                query_unique = db.session.query(getattr(cls, column_name)).distinct().filter(
                    getattr(cls, column_name) != None  # Exclude None values
                ).all()
                unique_values[column_name] = [item[0] for item in query_unique if item[0] not in ['', None]]

        return unique_values

    
    
    def to_dict(self):
        filters_dict = json.loads(self.filters) if self.filters else {}
        return {
            'id': self.id,
            'sector': self.sector,
            'subsector_1': self.subsector_1,
            'subsector_2': self.subsector_2,
            'series_name': self.series_name,
            'indicator_value': self.indicator_value,
            'indicator': self.indicator,
            'province': self.province,
            'year': self.year,
            'series_code': self.series_code,
            'source': self.source,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'indicator_unit': self.indicator_unit,
            'tag': self.tag,
            **filters_dict
        }

    def toJSON(self):
        return self.to_dict()

# Define child models dynamically bound to tables
class EducationData(BaseModel):
    __tablename__ = 'education_data'

class AgricultureData(BaseModel):
    __tablename__ = 'agriculture_data'

class EconomicData(BaseModel):
    __tablename__ = 'economic_data'