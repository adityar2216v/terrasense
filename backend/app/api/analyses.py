from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import Dict, Any
from app.agents.schemas import WorkflowState, AgentResult
from app.agents.coordinator import engine
from app.agents.air import analyze_air
from app.agents.water import analyze_water
from app.agents.waste import analyze_waste
from pydantic import BaseModel
from app.api.incidents import get_repo
from app.repositories.local import IncidentRepository
import uuid
from datetime import datetime, timezone

router = APIRouter()

class AnalysisRequest(BaseModel):
    incident_id: str
    input_data: Dict[str, Any]

@router.post("/analyze", response_model=WorkflowState)
@router.post("/analyses", response_model=WorkflowState) # Backward compatibility
def run_analysis(request: AnalysisRequest, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.get(request.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    initial_state = WorkflowState(input_data=request.input_data)
    
    # Run the langgraph workflow
    result = engine.invoke({"state": initial_state})
    final_state = result["state"]
    
    # Persist the final assessment to Supabase
    try:
        from app.repositories.supabase_analysis_repo import SupabaseAnalysisRepository
        analysis_repo = SupabaseAnalysisRepository()
        analysis_repo.save_analysis(request.incident_id, final_state)
    except Exception as e:
        print(f"Failed to persist analysis to Supabase: {e}")
        raise HTTPException(status_code=500, detail="Failed to save analysis to database")
        
    # AWS Integration for Hackathon Demo: Send SNS for CRITICAL risks
    if final_state.final_risk_level == "CRITICAL" and not getattr(request, "is_simulation", False):
        try:
            from app.api.aws_sns import publish_critical_alert
            publish_critical_alert(
                incident_id=request.incident_id,
                dominant_risk=final_state.dominant_risk_contributor or "Unknown",
                final_score=final_state.final_score or 100,
                recommendations=final_state.recommendations
            )
        except Exception as e:
            print(f"Failed to trigger AWS SNS: {e}")
            
    return final_state

@router.post("/air/analyze", response_model=AgentResult)
def run_air_analysis(request: AnalysisRequest, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.get(request.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Run just air agent
    result = analyze_air(request.input_data)
    return result

@router.post("/water/analyze", response_model=AgentResult)
def run_water_analysis(request: AnalysisRequest, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.get(request.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Run just water agent
    result = analyze_water(request.input_data)
    return result

@router.post("/waste/analyze", response_model=AgentResult)
def run_waste_analysis(request: AnalysisRequest, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.get(request.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Run just waste agent
    result = analyze_waste(request.input_data)
    return result

@router.post("/waste/upload", response_model=Dict[str, Any])
def upload_waste_image(file: UploadFile = File(...)):
    # Validate file type and size
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
        
    # For now, simulate upload success and prepare for inference
    return {"filename": file.filename, "status": "UPLOADED", "has_image": True}

import random
from app.schemas.incidents import IncidentCreate

@router.post("/analyses/simulate", response_model=Dict[str, Any])
def simulate_end_to_end(repo: IncidentRepository = Depends(get_repo)):
    # 1. Inject simulated incident
    lat = round(random.uniform(-90, 90), 4)
    lng = round(random.uniform(-180, 180), 4)
    mock_incident = IncidentCreate(
        title=f"Simulated Anomaly at {lat}, {lng}",
        description="Autonomous simulation injected by TerraSense Engine for end-to-end testing.",
        category="Air Quality",
        severity="HIGH",
        latitude=lat,
        longitude=lng
    )
    
    created_incident = repo.create(mock_incident)
    
    # 2. Setup Analysis Request
    mock_input = {
        "latitude": lat,
        "longitude": lng,
        "ph": round(random.uniform(4.0, 8.5), 1),
        "turbidity": round(random.uniform(10.0, 60.0), 1),
        "waste_type": random.choice(["CHEMICAL", "BIOLOGICAL", "ELECTRONIC", "UNKNOWN"]),
        "has_image": True,
        "category": "Air Quality"
    }
    
    # 3. Run Analysis
    initial_state = WorkflowState(input_data=mock_input)
    result = engine.invoke({"state": initial_state})
    final_state = result["state"]
    
    # 4. Persist Analysis
    try:
        from app.repositories.supabase_analysis_repo import SupabaseAnalysisRepository
        analysis_repo = SupabaseAnalysisRepository()
        analysis_repo.save_analysis(created_incident.incident_id, final_state)
    except Exception as e:
        print(f"Failed to persist simulation analysis to Supabase: {e}")
        # Ignore for simulation to keep going, but log it
        
    return {
        "incident": created_incident,
        "analysis": final_state
    }
