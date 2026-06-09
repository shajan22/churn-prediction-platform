import sqlite3
import sys

def inspect_db():
    db_path = 'data/churn_app.db'
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"--- Table: {table_name} ---")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"Total rows: {count}")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            print(f"Columns: {', '.join(columns)}")
            
            # Print sample data
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            rows = cursor.fetchall()
            
            for i, row in enumerate(rows):
                print(f"  Row {i+1}: {row}")
            print("\n")
            
        conn.close()
    except Exception as e:
        print(f"Error inspecting database: {e}")

if __name__ == '__main__':
    inspect_db()
