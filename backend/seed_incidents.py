import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

demo_incidents = [
    {
        "category": "AIR",
        "title": "Severe Industrial Emissions Detected",
        "description": "Unusually high levels of PM2.5 and SO2 detected near the industrial sector. Satellite data confirms thick smoke plumes.",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "severity": "CRITICAL",
        "status": "OPEN",
        "source_type": "SATELLITE_SENSOR",
        "source_id": "sat-aq-001"
    },
    {
        "category": "WATER",
        "title": "Chemical Runoff in River",
        "description": "Sensors report a sudden spike in water toxicity and heavy metals. Suspected untreated factory discharge.",
        "latitude": 28.5355,
        "longitude": 77.3910,
        "severity": "HIGH",
        "status": "OPEN",
        "source_type": "IOT_WATER_SENSOR",
        "source_id": "ws-04"
    },
    {
        "category": "WASTE",
        "title": "Illegal Landfill Fire",
        "description": "Thermal cameras have detected a sub-surface fire in an illegal dumping ground.",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "severity": "MODERATE",
        "status": "IN_PROGRESS",
        "source_type": "THERMAL_CAMERA",
        "source_id": "cam-therm-09"
    }
]

def seed_db():
    try:
        for inc in demo_incidents:
            now = datetime.now(timezone.utc).isoformat()
            incident_id = str(uuid.uuid4())
            
            data = {
                "incident_id": incident_id,
                "category": inc["category"],
                "title": inc["title"],
                "description": inc["description"],
                "latitude": inc["latitude"],
                "longitude": inc["longitude"],
                "severity": inc["severity"],
                "status": inc["status"],
                "source_type": inc["source_type"],
                "source_id": inc["source_id"],
                "created_at": now,
                "updated_at": now
            }
            
            supabase.table("incidents").insert(data).execute()
        
        print("Successfully inserted demo incidents into the database via REST API!")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_db()
