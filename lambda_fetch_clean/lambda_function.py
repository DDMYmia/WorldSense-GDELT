import json
import boto3
import urllib3
from datetime import datetime, timedelta
import os

# Initialize AWS clients
s3_client = boto3.client('s3')
opensearch_client = boto3.client('opensearch')

def lambda_handler(event, context):
    """
    GDELT data fetch and clean function
    Triggered by EventBridge every 15 minutes
    """
    print('GDELT fetch and clean function started')
    print('Event:', json.dumps(event, indent=2))
    
    try:
        # Get current timestamp
        current_time = datetime.utcnow()
        print(f'Processing time: {current_time}')
        
        # Simulate GDELT data fetch
        # In a real implementation, this would fetch from GDELT API
        gdelt_data = simulate_gdelt_fetch(current_time)
        
        # Clean and process the data
        cleaned_data = clean_gdelt_data(gdelt_data)
        
        # Store processed data to S3
        store_to_s3(cleaned_data, current_time)
        
        # Send success notification
        send_notification("GDELT data fetch completed successfully", "SUCCESS")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'GDELT data fetch and clean completed',
                'timestamp': current_time.isoformat(),
                'records_processed': len(cleaned_data)
            })
        }
        
    except Exception as e:
        print(f'Error in GDELT fetch and clean: {str(e)}')
        
        # Send error notification
        send_notification(f"GDELT data fetch failed: {str(e)}", "ERROR")
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'GDELT data fetch and clean failed',
                'error': str(e)
            })
        }

def simulate_gdelt_fetch(timestamp):
    """
    Simulate fetching GDELT data
    In production, this would make HTTP requests to GDELT API
    """
    print('Simulating GDELT data fetch...')
    
    # Simulate some sample GDELT data
    sample_data = [
        {
            'event_id': f'EVENT_{timestamp.strftime("%Y%m%d%H%M%S")}_001',
            'date': timestamp.strftime('%Y%m%d'),
            'time': timestamp.strftime('%H%M%S'),
            'actor1_name': 'Sample Actor 1',
            'actor2_name': 'Sample Actor 2',
            'event_code': '14',
            'event_base_code': '14',
            'event_root_code': '1',
            'quad_class': '1',
            'goldstein_scale': 2.5,
            'num_mentions': 5,
            'num_sources': 3,
            'num_articles': 8,
            'avg_tone': -1.2,
            'actor1_geo_country_code': 'US',
            'actor2_geo_country_code': 'CN',
            'action_geo_country_code': 'US',
            'action_geo_lat': 39.8283,
            'action_geo_long': -98.5795,
            'action_geo_full_name': 'United States',
            'date_added': timestamp.isoformat()
        }
    ]
    
    print(f'Simulated {len(sample_data)} GDELT records')
    return sample_data

def clean_gdelt_data(raw_data):
    """
    Clean and validate GDELT data
    """
    print('Cleaning GDELT data...')
    
    cleaned_data = []
    for record in raw_data:
        # Basic data validation and cleaning
        cleaned_record = {
            'event_id': record.get('event_id', ''),
            'date': record.get('date', ''),
            'time': record.get('time', ''),
            'actor1_name': record.get('actor1_name', ''),
            'actor2_name': record.get('actor2_name', ''),
            'event_code': record.get('event_code', ''),
            'event_base_code': record.get('event_base_code', ''),
            'event_root_code': record.get('event_root_code', ''),
            'quad_class': record.get('quad_class', ''),
            'goldstein_scale': float(record.get('goldstein_scale', 0)),
            'num_mentions': int(record.get('num_mentions', 0)),
            'num_sources': int(record.get('num_sources', 0)),
            'num_articles': int(record.get('num_articles', 0)),
            'avg_tone': float(record.get('avg_tone', 0)),
            'actor1_geo_country_code': record.get('actor1_geo_country_code', ''),
            'actor2_geo_country_code': record.get('actor2_geo_country_code', ''),
            'action_geo_country_code': record.get('action_geo_country_code', ''),
            'action_geo_lat': float(record.get('action_geo_lat', 0)),
            'action_geo_long': float(record.get('action_geo_long', 0)),
            'action_geo_full_name': record.get('action_geo_full_name', ''),
            'date_added': record.get('date_added', ''),
            'processed_at': datetime.utcnow().isoformat()
        }
        cleaned_data.append(cleaned_record)
    
    print(f'Cleaned {len(cleaned_data)} records')
    return cleaned_data

def store_to_s3(data, timestamp):
    """
    Store processed data to S3
    """
    print('Storing data to S3...')
    
    bucket_name = 'gdelt-processed-worldsense'
    key = f'processed/{timestamp.strftime("%Y/%m/%d")}/gdelt_{timestamp.strftime("%Y%m%d_%H%M%S")}.json'
    
    try:
        # Convert data to JSON
        json_data = json.dumps(data, indent=2)
        
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=json_data,
            ContentType='application/json'
        )
        
        print(f'Data stored to S3: s3://{bucket_name}/{key}')
        
    except Exception as e:
        print(f'Error storing to S3: {str(e)}')
        raise

def send_notification(message, status):
    """
    Send notification via SNS
    """
    try:
        sns_client = boto3.client('sns')
        topic_arn = 'arn:aws:sns:us-east-1:810731468776:GlobalSentimentAlerts.fifo'
        
        subject = f'GDELT Fetch - {status}'
        message_body = {
            'status': status,
            'message': message,
            'timestamp': datetime.utcnow().isoformat(),
            'function': 'gdelt-fetch-clean'
        }
        
        sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps(message_body),
            Subject=subject,
            MessageGroupId='gdelt-fetch',
            MessageDeduplicationId=f'gdelt-fetch-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}'
        )
        
        print(f'Notification sent: {status}')
        
    except Exception as e:
        print(f'Error sending notification: {str(e)}')
        # Don't raise exception for notification failures
