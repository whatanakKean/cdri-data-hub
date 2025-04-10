from datetime import datetime

import json

from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import distinct
from collections import defaultdict

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
        
        # Remove columns where all values are empty or None
        if result:  # Only process if there are results
            columns_to_remove = []
            # Check each column
            for column in result[0].keys():
                # Check if all values in this column are empty/None
                if all(not entry[column] or entry[column] == "" for entry in result):
                    columns_to_remove.append(column)
            
            # Remove identified columns from all entries
            for entry in result:
                for column in columns_to_remove:
                    del entry[column]

        # Specify the columns you want to retrieve unique values from
        exclude_column = ['sector', 'subsector_1', 'subsector_2', 'id', 'indicator_value', 'series_code', 'series_name', 'source', 'latitude', 'longitude', 'indicator_unit', 'tag']
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

        unique_values = {key: value for key, value in unique_values.items() if value}
        return {
            'data': result,
            'filters': unique_values
        }
    

    @classmethod
    def get_menu(cls):
        # Step 1: Query distinct sectors
        sectors = db.session.query(cls.sector).distinct().all()
        sectors = [s[0] for s in sectors if s[0] not in [None, ""]]

        # Step 2: Query distinct subsector_1 values mapped to sectors
        subsector_1_data = db.session.query(cls.sector, cls.subsector_1).distinct().all()

        # Step 3: Query distinct series names mapped to subsector_1
        series_data = db.session.query(cls.subsector_1, cls.series_name).distinct().all()

        # Step 4: Build the hierarchical structure
        menu = defaultdict(lambda: defaultdict(list))
        series_name_list = []

        # Mapping subsector_1 to sectors
        for sector, sub1 in subsector_1_data:
            if sector and sub1:
                menu[sector][sub1] = []

        # Mapping series to subsector_1
        for sub1, series in series_data:
            if sub1 and series:
                # series_name_list.add(series)
                for sector in menu:
                    if sub1 in menu[sector]:
                        menu[sector][sub1].append(series)
                        new_item = {"series_name": series, "sector": sector}
                        if new_item not in series_name_list:
                            series_name_list.append(new_item)

        return menu, series_name_list

    
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