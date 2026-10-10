import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from app.schemas.incidents import IncidentCreate, IncidentResponse, IncidentStatus, IncidentUpdate

class IncidentRepository:
    def create(self, incident: IncidentCreate) -> IncidentResponse:
        pass
        
    def get(self, incident_id: str) -> Optional[IncidentResponse]:
        pass
        
    def list_all(self) -> List[IncidentResponse]:
        pass
        
    def update_status(self, incident_id: str, update: IncidentUpdate) -> Optional[IncidentResponse]:
        pass

# In-memory implementation for local dev
class LocalIncidentRepository(IncidentRepository):
    def __init__(self):
        self._store: Dict[str, IncidentResponse] = {}
        
        # Seed some initial demo data
        self._seed_data()
        
    def _seed_data(self):
        demo_id = str(uuid.uuid4())
        self._store[demo_id] = IncidentResponse(
            incident_id=demo_id,
            category="Air Quality",
            title="Severe AQI Alert",
            description="Hazardous air quality detected in industrial zone.",
            severity="CRITICAL",
            source_type="SYSTEM",
            status=IncidentStatus.OPEN,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
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
        self._store[incident_id] = response
        return response

    def get(self, incident_id: str) -> Optional[IncidentResponse]:
        return self._store.get(incident_id)

    def list_all(self) -> List[IncidentResponse]:
        return list(self._store.values())

    def update_status(self, incident_id: str, update: IncidentUpdate) -> Optional[IncidentResponse]:
        if incident_id not in self._store:
            return None
            
        incident = self._store[incident_id]
        
        # Simple policy: CLOSED cannot be reopened easily in this basic impl
        incident.status = update.status
        incident.updated_at = datetime.now(timezone.utc)
        self._store[incident_id] = incident
        return incident
