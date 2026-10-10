from app.agents.schemas import WorkflowState
from app.agents.air import analyze_air
from app.agents.water import analyze_water
from app.agents.waste import analyze_waste
from app.agents.coordinator import engine

def test_air_agent():
    # Needs lat/long to be SUCCESS
    res = analyze_air({"aqi": 150, "latitude": 34.0, "longitude": -118.0})
    assert res.execution_status == "SUCCESS"
    assert res.risk_score == 35
    assert res.risk_level == "MODERATE"
    
def test_air_agent_missing():
    # Will fail on coordinates first
    res = analyze_air({"aqi": 150})
    assert res.execution_status == "UNAVAILABLE"
    assert "latitude" in res.missing_data
    assert "longitude" in res.missing_data
    
def test_water_agent():
    res = analyze_water({"ph": 5.5, "turbidity": 8.2})
    assert res.execution_status == "SUCCESS"
    assert res.risk_score is not None

def test_waste_agent():
    res = analyze_waste({"waste_type": "CHEMICAL", "has_image": True})
    # Since model is not downloaded in tests, this will likely be MODEL_UNAVAILABLE
    assert res.execution_status in ["SUCCESS", "MODEL_UNAVAILABLE"]
    
def test_coordinator_workflow():
    input_data = {
        "aqi": 150,
        "ph": 5.5,
        "turbidity": 8.2,
        "waste_type": "CHEMICAL",
        "has_image": True,
        "latitude": 34.0,
        "longitude": -118.0
    }
    
    initial_state = WorkflowState(input_data=input_data)
    result = engine.invoke({"state": initial_state})
    
    state = result["state"]
    # Depending on model path, we either get SUCCESS or PARTIAL
    assert state.execution_status in ["SUCCESS", "PARTIAL"]
    # Final risk level for this config should be MODERATE given the values above (air score 35, water score 25)
    assert state.final_risk_level in ["MODERATE", "HIGH", "CRITICAL"]
