import os
import boto3
from typing import Optional

def publish_critical_alert(incident_id: str, dominant_risk: str, final_score: int, recommendations: list):
    """
    Publish an SNS notification for CRITICAL risk analyses.
    Uses AWS credentials from the environment.
    """
    topic_arn = os.environ.get("AWS_SNS_TOPIC_ARN")
    if not topic_arn:
        print("Skipping SNS alert: AWS_SNS_TOPIC_ARN not configured.")
        return

    try:
        sns = boto3.client(
            'sns',
            region_name=os.environ.get("AWS_REGION", "us-east-1")
        )
        
        recs_text = "\n".join([f"- {r.title}: {r.explanation}" for r in recommendations])
        
        message = (
            f"URGENT: TerraSense CRITICAL Risk Alert\n\n"
            f"Incident ID: {incident_id}\n"
            f"Final Risk Score: {final_score} (CRITICAL)\n"
            f"Primary Contributor: {dominant_risk} Agent\n\n"
            f"Recommendations:\n{recs_text}\n\n"
            f"Please review immediately."
        )

        response = sns.publish(
            TopicArn=topic_arn,
            Subject=f"CRITICAL: Environmental Risk Detected ({dominant_risk})",
            Message=message
        )
        print(f"Successfully published SNS alert. Message ID: {response['MessageId']}")
        return response
    except Exception as e:
        print(f"Failed to publish to SNS: {e}")
        # Non-fatal error for the analysis itself
        pass
