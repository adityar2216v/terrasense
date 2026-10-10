import psycopg2
import sys

connection_string = "postgresql://postgres:rani%40Bubbly1@db.ofmtsdzsbbwbexbzdvrl.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(connection_string)
    cursor = conn.cursor()
    
    # Check what tables exist in the public schema
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print("Database connected successfully!")
    print("Tables in 'public' schema:")
    for table in tables:
        print(f" - {table[0]}")
        
except Exception as e:
    print(f"Error checking database: {e}")
    sys.exit(1)
finally:
    if 'conn' in locals():
        conn.close()
