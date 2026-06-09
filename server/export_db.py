import sqlite3
import csv
import os

def export_to_csv():
    db_path = 'data/churn_app.db'
    export_dir = 'data_export'

    os.makedirs(export_dir, exist_ok=True)

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
    tables = [t[0] for t in cursor.fetchall()]

    for table in tables:
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        
        cursor.execute(f"PRAGMA table_info({table})")
        headers = [col[1] for col in cursor.fetchall()]
        
        csv_path = os.path.join(export_dir, f"{table}.csv")
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerows(rows)
        print(f"Exported {table} to {csv_path}")

    conn.close()

if __name__ == '__main__':
    export_to_csv()
