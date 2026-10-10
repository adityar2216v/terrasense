import sqlite3
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.schemas.incidents import IncidentCreate, IncidentResponse, IncidentStatus, IncidentUpdate
from app.repositories.local import IncidentRepository

class SQLiteIncidentRepository(IncidentRepository):
    def __init__(self, db_path: str = "terrasense.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS incidents (
                    incident_id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    latitude REAL,
                    longitude REAL,
                    severity TEXT NOT NULL,
                    status TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    evidence_metadata TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def _row_to_model(self, row: sqlite3.Row) -> IncidentResponse:
        return IncidentResponse(
            incident_id=row['incident_id'],
            category=row['category'],
            title=row['title'],
            description=row['description'],
            latitude=row['latitude'],
            longitude=row['longitude'],
            severity=row['severity'],
            status=row['status'],
            source_type=row['source_type'],
            evidence_metadata=json.loads(row['evidence_metadata']) if row['evidence_metadata'] else None,
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at'])
        )

    def create(self, incident: IncidentCreate) -> IncidentResponse:
        incident_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        response = IncidentResponse(
            **incident.model_dump(),
            incident_id=incident_id,
            status=IncidentStatus.OPEN,
            created_at=now,
            updated_at=now
        )
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO incidents (
                    incident_id, category, title, description, latitude, longitude,
                    severity, status, source_type, evidence_metadata, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                response.incident_id,
                response.category,
                response.title,
                response.description,
                response.latitude,
                response.longitude,
                response.severity.value,
                response.status.value,
                response.source_type,
                json.dumps(response.evidence_metadata) if response.evidence_metadata else None,
                response.created_at.isoformat(),
                response.updated_at.isoformat()
            ))
            conn.commit()
            
        return response

    def get(self, incident_id: str) -> Optional[IncidentResponse]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,)).fetchone()
            if row:
                return self._row_to_model(row)
        return None

    def list_all(self) -> List[IncidentResponse]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute("SELECT * FROM incidents ORDER BY created_at DESC").fetchall()
            return [self._row_to_model(row) for row in rows]

    def update_status(self, incident_id: str, update: IncidentUpdate) -> Optional[IncidentResponse]:
        now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE incidents SET status = ?, updated_at = ? WHERE incident_id = ?",
                (update.status.value, now, incident_id)
            )
            conn.commit()
        return self.get(incident_id)
