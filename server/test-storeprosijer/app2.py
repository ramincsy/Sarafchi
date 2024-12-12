from flask import Flask, jsonify, request
import pyodbc
from flask_sqlalchemy import SQLAlchemy
import datetime
from flask_marshmallow import Marshmallow
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# تنظیمات اتصال به پایگاه داده SQL Server
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://@localhost/payDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)

class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.datetime.now)
    password = db.Column(db.String(200), nullable=False)

    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.password = password  # ذخیره رمز عبور بدون هش

class UserSchema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'email', 'date')

user_schema = UserSchema()
users_schema = UserSchema(many=True)

@app.route('/listusers', methods=['GET'])
def listusers():
    # اتصال به پایگاه داده
    conn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
                          'SERVER=localhost;'
                          'DATABASE=payDB;'
                          'Trusted_Connection=yes;')
    cursor = conn.cursor()

    # اجرای استور پروسیجر
    cursor.execute("{CALL GetUsers}")

    # دریافت نتایج
    users = cursor.fetchall()

    # تبدیل نتایج به قالب مناسب برای JSON
    users_list = []
    for user in users:
        user_data = {
            'id': user[0],
            'name': user[1],
            'email': user[2],
            'date': user[3].strftime('%Y-%m-%d %H:%M:%S')  # فرمت زمان به صورت مناسب
        }
        users_list.append(user_data)

    return jsonify(users_list)

if __name__ == '__main__':
    app.run(debug=True)
