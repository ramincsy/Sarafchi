from datetime import datetime
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from flask_marshmallow import Marshmallow  # type: ignore
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text  # type: ignore

db = SQLAlchemy()
ma = Marshmallow()

# مدل کاربر


class WalletsUSDT(db.Model):
    __tablename__ = "Wallets_USDT"

    WalletID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, nullable=False)
    WalletAddress = db.Column(db.String(255), nullable=False, unique=True)
    Balance = db.Column(db.Float, default=0)  # موجودی کیف پول
    LockedBalance = db.Column(db.Float, default=0)  # موجودی قفل شده
    CurrencyType = db.Column(db.String(10), nullable=False, default="USDT")
    Status = db.Column(db.String(50), default="Active")
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    LastUpdated = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<WalletsUSDT {self.WalletAddress} - Balance: {self.Balance}>"


class Users(db.Model):
    __tablename__ = "Users"
    ID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    FirstName = db.Column(db.String(100), nullable=False)
    LastName = db.Column(db.String(100), nullable=False)
    NationalID = db.Column(db.String(20), nullable=False, unique=True)
    PhoneNumber = db.Column(db.String(20), nullable=False, unique=True)
    Email = db.Column(db.String(100), nullable=False, unique=True)
    Password = db.Column(db.String(255), nullable=False)
    CreatedBy = db.Column(db.String(100), nullable=False)
    WalletAddress = db.Column(db.String(255), nullable=True)
    DateCreated = db.Column(db.DateTime, default=datetime.now)
    Status = db.Column(db.String(50), default="Active")  # وضعیت حساب کاربر
    LastLoginAt = db.Column(db.DateTime, nullable=True)  # آخرین زمان ورود
    FailedLoginAttempts = db.Column(
        db.Integer, default=0)  # تعداد تلاش‌های ناموفق

    def __init__(self, FirstName, LastName, NationalID, PhoneNumber, Email, Password, CreatedBy, WalletAddress=None):
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
    CreatedAt = db.Column(DateTime, nullable=False, default=datetime.now)
    Revoked = db.Column(Boolean, nullable=False, default=False)
    IPAddress = db.Column(String(50), nullable=True)  # آدرس IP
    LastUsedAt = db.Column(DateTime, nullable=True)  # آخرین زمان استفاده
    DeviceId = db.Column(String(100), nullable=True)  # شناسه دستگاه
    Purpose = db.Column(String(100), nullable=True)  # هدف استفاده از توکن

    def __init__(self, user_id, refresh_token, expire_date, ip_address=None, device_id=None, purpose=None):
        self.UserId = user_id
        self.RefreshToken = refresh_token
        self.ExpireDate = expire_date
        self.CreatedAt = datetime.now()
        self.Revoked = False
        self.IPAddress = ip_address
        self.LastUsedAt = None
        self.DeviceId = device_id
        self.Purpose = purpose


class UserSchema(ma.Schema):
    class Meta:
        fields = (
            'ID', 'FirstName', 'LastName', 'NationalID', 'PhoneNumber',
            'Email', 'Password', 'CreatedBy', 'WalletAddress', 'DateCreated',
            'Status', 'LastLoginAt', 'FailedLoginAttempts'
        )


user_schema = UserSchema()
users_schema = UserSchema(many=True)


class TRXWallet(db.Model):
    __tablename__ = 'TRXWallet'  # نام جدول در دیتابیس

    id = db.Column(db.Integer, primary_key=True)  # شناسه منحصر به فرد
    address = db.Column(db.String(100), unique=True,
                        nullable=False)  # آدرس کیف پول
    used = db.Column(db.Boolean, default=False,
                     nullable=False)  # وضعیت استفاده‌شده

    def __repr__(self):
        return f"<TRXWallet {self.address}>"


class Notification(db.Model):
    __tablename__ = 'Notifications'

    NotificationID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.Integer, nullable=False)
    Title = db.Column(db.String(255), nullable=False)
    Message = db.Column(db.Text, nullable=False)
    IsRead = db.Column(db.Boolean, default=False)
    Timestamp = db.Column(db.DateTime, default=datetime.now)
    Type = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return f"<Notification(NotificationID={self.NotificationID}, Title='{self.Title}', IsRead={self.IsRead})>"