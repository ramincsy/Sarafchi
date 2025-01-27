# استفاده از تصویر پایه Python
FROM python:3.13-slim

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های پروژه به کانتینر
COPY . .

# نصب وابستگی‌های موردنیاز
RUN pip install --no-cache-dir -r requirements.txt

# مشخص کردن پورت
EXPOSE 5000

# تنظیم متغیر محیطی برای Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

# اجرای اپلیکیشن با flask run
CMD ["flask", "run"]
