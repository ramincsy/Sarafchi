# استفاده از تصویر پایه Node.js
FROM node:18-slim

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های پروژه به کانتینر
COPY . .

# نصب وابستگی‌های پروژه
RUN npm install

# مشخص کردن پورت
EXPOSE 3000

# اجرای پروژه
CMD ["npm", "start"]
