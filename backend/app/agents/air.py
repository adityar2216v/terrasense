from datetime import datetime, timezone
from typing import Dict, Any
from app.agents.schemas import AgentResult
import requests

def analyze_air(input_data: Dict[str, Any]) -> AgentResult:
    lat = input_data.get("latitude")
    lng = input_data.get("longitude")
    
    result = AgentResult(
        agent_name="Air Intelligence Core",
        execution_status="SUCCESS",
        data_sources=["Open-Meteo Air Quality API", "LangGraph Reasoning Engine"],
        observation_timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    if lat is None or lng is None:
        result.execution_status = "UNAVAILABLE"
        result.missing_data.extend(["latitude", "longitude"])
        result.errors.append("Valid coordinates are required for air quality analysis.")
        return result

    try:
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone"
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        data = r.json()
        current = data.get("current", {})
        
        obs_time = current.get("time")
        if obs_time:
            result.observation_timestamp = obs_time
            
        aqi = current.get("us_aqi")
        if aqi is None:
            raise ValueError("US AQI not available in provider response.")
            
        # Standard US AQI Thresholds
        if aqi <= 50:
            result.risk_level = "LOW"
            result.risk_score = 10
        elif aqi <= 100:
            result.risk_level = "MODERATE"
            result.risk_score = 35
        elif aqi <= 150:
            result.risk_level = "HIGH"
            result.risk_score = 65
        else:
            result.risk_level = "CRITICAL"
            result.risk_score = min(100, 85 + int((aqi - 150) / 10))
            
        result.evidence.append(f"US AQI measured at {aqi}.")
        
        pm10 = current.get('pm10')
        pm2_5 = current.get('pm2_5')
        ozone = current.get('ozone')
        no2 = current.get('nitrogen_dioxide')
        
        if pm10 is not None and pm2_5 is not None:
            result.evidence.append(f"PM10: {pm10} μg/m³, PM2.5: {pm2_5} μg/m³.")
        else:
            result.missing_data.extend(["pm10", "pm2_5"])
            
        if ozone is not None and no2 is not None:
            result.evidence.append(f"Ozone: {ozone} μg/m³, NO2: {no2} μg/m³.")
        else:
            result.missing_data.extend(["ozone", "nitrogen_dioxide"])
            
        if result.risk_level in ["HIGH", "CRITICAL"]:
            result.recommended_actions.append("Issue automated API alert to regional health authorities due to high AQI.")
            
    except requests.exceptions.RequestException as e:
        result.execution_status = "FAILED"
        result.errors.append(f"Provider connection error: {str(e)}")
    except ValueError as e:
        result.execution_status = "FAILED"
        result.errors.append(str(e))
    except Exception as e:
        result.execution_status = "FAILED"
        result.errors.append(f"Unexpected error: {str(e)}")
        
    return result
