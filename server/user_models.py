from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from sqlalchemy import Column, Integer, String, DateTime, Boolean
import datetime

db = SQLAlchemy()
ma = Marshmallow()

# مدل کاربر
class Users(db.Model):
    __tablename__ = "Users"
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, nullable=True)  # مقدار پیش‌فرض None
    FirstName = db.Column(db.String(100), nullable=False)
    LastName = db.Column(db.String(100), nullable=False)
    NationalID = db.Column(db.String(20), nullable=False, unique=True)
    PhoneNumber = db.Column(db.String(20), nullable=False, unique=True)
    Email = db.Column(db.String(100), nullable=False, unique=True)
    Password = db.Column(db.String(255), nullable=False)
    CreatedBy = db.Column(db.String(100), nullable=False)
    WalletAddress = db.Column(db.String(255), nullable=True)
    DateCreated = db.Column(db.DateTime, default=datetime.datetime.now)

    def __init__(self, UserID, FirstName, LastName, NationalID, PhoneNumber, Email, Password, CreatedBy, WalletAddress=None):
        self.UserID = UserID
        self.FirstName = FirstName
        self.LastName = LastName
        self.NationalID = NationalID
        self.PhoneNumber = PhoneNumber
        self.Email = Email
        self.Password = Password
        self.CreatedBy = CreatedBy
        self.WalletAddress = WalletAddress

# مدل JwtTokens
class JwtTokens(db.Model):
    __tablename__ = 'JwtTokens'
    
    Id = db.Column(Integer, primary_key=True, autoincrement=True)
    UserId = db.Column(Integer, nullable=False)
    RefreshToken = db.Column(String(500), nullable=False)
    ExpireDate = db.Column(DateTime, nullable=False)
    CreatedAt = db.Column(DateTime, nullable=False, default=datetime.datetime.now)
    Revoked = db.Column(Boolean, nullable=False, default=False)
    #DeviceId = db.Column(String(100), nullable=False)

    def __init__(self, user_id, refresh_token, expire_date):
        self.UserId = user_id
        self.RefreshToken = refresh_token
        #self.DeviceId = device_id
        self.ExpireDate = expire_date
        self.CreatedAt = datetime.datetime.now()
        self.Revoked = False
class UserSchema(ma.Schema):
    class Meta:
        fields = ('ID', 'UserID', 'FirstName', 'LastName', 'NationalID', 'PhoneNumber', 'Email', 'Password', 'CreatedBy', 'WalletAddress', 'DateCreated')

user_schema = UserSchema()
users_schema = UserSchema(many=True)