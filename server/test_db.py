import sqlite3
from werkzeug.security import check_password_hash

conn=sqlite3.connect('c:/Users/jerso/OneDrive/Desktop/churn-main/server/data/churn_app.db')
cursor=conn.cursor()
cursor.execute("SELECT email, password_hash FROM users WHERE email='jersonjerson223@gmail.com'")
row = cursor.fetchone()
print(f"Hash: {row[1]}")
print("Checking 12345678:", check_password_hash(row[1], "12345678"))
