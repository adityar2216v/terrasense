import os
import uuid
from typing import List, Optional
from datetime import datetime, timezone
import psycopg2
from psycopg2.extras import RealDictCursor
from app.repositories.local import IncidentRepository
from app.schemas.incidents import IncidentCreate, IncidentResponse, IncidentStatus, IncidentUpdate

class SupabaseIncidentRepository(IncidentRepository):
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL", "")

    def _get_connection(self):
        if not self.db_url:
            raise RuntimeError("DATABASE_URL is not set.")
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)

    def list_all(self) -> List[IncidentResponse]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM incidents ORDER BY created_at DESC;")
                rows = cur.fetchall()
                # Parse date strings correctly
                return [IncidentResponse(**dict(row)) for row in rows]
        finally:
            conn.close()

    def get(self, incident_id: str) -> Optional[IncidentResponse]:
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM incidents WHERE incident_id = %s;", (incident_id,))
                row = cur.fetchone()
                if not row:
                    return None
                return IncidentResponse(**dict(row))
        finally:
            conn.close()

    def create(self, incident: IncidentCreate) -> IncidentResponse:
        conn = self._get_connection()
        try:
            now = datetime.now(timezone.utc).isoformat()
            incident_id = str(uuid.uuid4())
            
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO incidents (
                        incident_id, category, title, description, latitude, longitude, 
                        severity, status, source_type, source_id, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *;
                """, (
                    incident_id, incident.category, incident.title, incident.description, 
                    incident.latitude, incident.longitude, incident.severity, "OPEN", 
                    incident.source_type, incident.source_id, now, now
                ))
                row = cur.fetchone()
                conn.commit()
                return IncidentResponse(**dict(row))
        finally:
            conn.close()

    def update_status(self, incident_id: str, update: IncidentUpdate) -> Optional[IncidentResponse]:
        conn = self._get_connection()
        try:
            now = datetime.now(timezone.utc).isoformat()
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE incidents 
                    SET status = %s, updated_at = %s 
                    WHERE incident_id = %s 
                    RETURNING *;
                """, (update.status.value, now, incident_id))
                row = cur.fetchone()
                conn.commit()
                
                if not row:
                    return None
                return IncidentResponse(**dict(row))
        finally:
            conn.close()
