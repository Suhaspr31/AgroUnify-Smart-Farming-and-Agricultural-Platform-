import google.generativeai as genai
import os
from dotenv import load_dotenv
import time
from PIL import Image
import io

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("ERROR: GEMINI_API_KEY not found!")
    exit(1)

print(f"API key loaded: {api_key[:10]}...\n")

genai.configure(api_key=api_key)

print("="*60)
print("GEMINI API MODEL TEST")
print("="*60)

try:
    # List available models
    print("\nListing available models...")
    available_models = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available_models.append(m.name)
    
    print(f"Found {len(available_models)} models")
    
    if not available_models:
        print("❌ No models available!")
        exit(1)
    
    # Try models in priority order
    preferred_models = [
        "models/gemini-2.5-flash",
        "models/gemini-1.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-2.0-flash",
        "models/gemini-2.0-flash-exp"
    ]
    
    model_to_use = None
    for preferred in preferred_models:
        if preferred in available_models:
            model_to_use = preferred.replace("models/", "")
            break
    
    if not model_to_use:
        model_to_use = available_models[0].replace("models/", "")
    
    print(f"\n🎯 Using model: {model_to_use}")
    model = genai.GenerativeModel(model_to_use)
    print("✓ Model loaded successfully")
    
    # Test text-only
    print("\n1. Testing text generation...")
    try:
        response = model.generate_content("Hello, this is a test")
        print(f"✓ Text response: {response.text[:100]}...")
    except Exception as e:
        if "429" in str(e) or "quota" in str(e).lower():
            print(f"⚠ Quota exceeded. Waiting 30 seconds...")
            time.sleep(30)
            print("Retrying...")
            response = model.generate_content("Hello, this is a test")
            print(f"✓ Text response: {response.text[:100]}...")
        else:
            raise
    
    # Test with image
    print("\n2. Testing image analysis...")
    image_path = "../backend/reports/temp_1763805164066_Cucumber-Mosaic-Virus.jpg"
    
    if os.path.exists(image_path):
        # Load and validate image
        img = Image.open(image_path)
        print(f"✓ Image loaded: {img.size}, Format: {img.format}, Mode: {img.mode}")
        
        # Ensure proper format
        if img.format not in ['JPEG', 'PNG']:
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[-1])
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            print(f"✓ Image converted to RGB")
        
        try:
            response2 = model.generate_content(["Describe this image in detail", img])
            print(f"✓ Image response: {response2.text[:100]}...")
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                print(f"⚠ Quota exceeded. Waiting 30 seconds...")
                time.sleep(30)
                print("Retrying...")
                response2 = model.generate_content(["Describe this image in detail", img])
                print(f"✓ Image response: {response2.text[:100]}...")
            else:
                raise
    else:
        print(f"⚠ Image not found at: {image_path}")
        print("Skipping image test")
    
    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60 + "\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print(f"Error type: {type(e)}")
    import traceback
    traceback.print_exc()
