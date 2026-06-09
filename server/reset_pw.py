import sqlite3
from werkzeug.security import generate_password_hash

conn=sqlite3.connect('c:/Users/jerso/OneDrive/Desktop/churn-main/server/data/churn_app.db')
cursor=conn.cursor()

# Set password to "password123" for jersonjerson223@gmail.com
new_hash = generate_password_hash('password123')
cursor.execute("UPDATE users SET password_hash=? WHERE email='jersonjerson223@gmail.com'", (new_hash,))
conn.commit()

print("Password updated to password123 for jersonjerson223@gmail.com")
