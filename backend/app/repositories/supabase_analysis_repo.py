import os
import uuid
import json
from typing import Optional
from supabase import create_client, Client
from app.agents.schemas import WorkflowState

class SupabaseAnalysisRepository:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL", "")
        key: str = os.environ.get("SUPABASE_KEY", "")
        
        if not url or not key:
            self.supabase: Optional[Client] = None
        else:
            self.supabase: Client = create_client(url, key)

    def _check_client(self):
        if not self.supabase:
            raise RuntimeError("Supabase client is not initialized. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")

    def save_analysis(self, incident_id: str, state: WorkflowState) -> dict:
        self._check_client()
        
        # Serialize Pydantic objects to dicts
        data = {
            "incident_id": incident_id,
            "input_data": state.input_data,
            "air_result": state.air_result.model_dump() if state.air_result else None,
            "water_result": state.water_result.model_dump() if state.water_result else None,
            "waste_result": state.waste_result.model_dump() if state.waste_result else None,
            "final_score": state.final_score,
            "final_risk_level": state.final_risk_level,
            "coordinator_evidence": state.coordinator_evidence,
            "recommendations": [r.model_dump() for r in state.recommendations],
            "dominant_risk_contributor": state.dominant_risk_contributor,
            "execution_status": state.execution_status
        }
            
        response = self.supabase.table("analyses").insert(data).execute()
        return response.data[0]
