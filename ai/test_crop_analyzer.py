import requests
import os

# Test the crop analyzer service
url = "http://localhost:7000/analyze"
image_path = "../backend/reports/temp_1763805164066_Cucumber-Mosaic-Virus.jpg"

print("="*60)
print("CROP ANALYZER TEST")
print("="*60)

# First, check health
print("\n1. Checking service health...")
try:
    health_response = requests.get("http://localhost:7000/health", timeout=5)
    if health_response.status_code == 200:
        print(f"[OK] Service is running: {health_response.json()}")
    else:
        print(f"[ERROR] Service health check failed: {health_response.status_code}")
except Exception as e:
    print(f"[ERROR] Cannot connect to service: {e}")
    print("   Make sure Flask server is running on port 7000")
    exit(1)

# Check if image exists
print(f"\n2. Checking image file...")
if not os.path.exists(image_path):
    print(f"[ERROR] Image file not found: {image_path}")
    print("   Please verify the path or use a valid image")
    exit(1)
else:
    file_size = os.path.getsize(image_path)
    print(f"[OK] Image found: {file_size} bytes")

# Test with PDF format
print(f"\n3. Testing crop analysis (PDF format)...")
try:
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'language': 'English'}
        
        print("   Sending request to server...")
        response = requests.post(url, files=files, data=data, timeout=60)
        
        print(f"   Status code: {response.status_code}")
        
        if response.status_code == 200:
            # Save PDF
            with open("test_output.pdf", "wb") as f:
                f.write(response.content)
            pdf_size = len(response.content)
            print(f"[OK] PDF generated and saved: test_output.pdf ({pdf_size} bytes)")
        else:
            print(f"[ERROR] Error: {response.text}")

except requests.exceptions.Timeout:
    print(f"[ERROR] Request timed out (60s). The analysis might be taking too long.")
except Exception as e:
    print(f"[ERROR] Error: {e}")

# Test with JSON format
print(f"\n4. Testing crop analysis (JSON format)...")
try:
    with open(image_path, 'rb') as f:
        files = {'image': f}
        data = {'language': 'English'}
        
        print("   Sending request to server...")
        response = requests.post(url + "?format=json", files=files, data=data, timeout=60)
        
        print(f"   Status code: {response.status_code}")
        
        if response.status_code == 200:
            json_data = response.json()
            print(f"[OK] JSON response received")
            print(f"   Crop Species: {json_data.get('Crop_Species', 'N/A')}")
            print(f"   Health Status: {json_data.get('Plant_Health_Status', 'N/A')}")
            print(f"   Disease: {json_data.get('Disease_Identification', {}).get('name', 'N/A')}")
        else:
            print(f"[ERROR] Error: {response.text}")

except requests.exceptions.Timeout:
    print(f"[ERROR] Request timed out (60s).")
except Exception as e:
    print(f"[ERROR] Error: {e}")

print("\n" + "="*60)
print("TEST COMPLETED")
print("="*60 + "\n")
