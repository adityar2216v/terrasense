import psycopg2
import sys
import os

connection_string = "postgresql://postgres:rani%40Bubbly1@db.ofmtsdzsbbwbexbzdvrl.supabase.co:5432/postgres"

# Make sure to url-encode the password if it contains special characters
# @ -> %40

try:
    conn = psycopg2.connect(connection_string)
    conn.autocommit = True
    cursor = conn.cursor()
    
    with open("supabase/migrations/002_analyses.sql", "r") as f:
        sql = f.read()
        
    cursor.execute(sql)
    print("Migration applied successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
finally:
    if 'conn' in locals():
        conn.close()
