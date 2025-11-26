# ai/crop_analyzer.py - FIXED VERSION

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER
import os
import io
import google.generativeai as genai
from dotenv import load_dotenv
from google.api_core.exceptions import ResourceExhausted
import time

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("ERROR: No API key!")
    exit(1)

print(f"[OK] API Key: {api_key[:10]}...")
genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app)

print("\n" + "="*60)
print("CROP ANALYZER - STARTING")
print("="*60 + "\n")

def fix_image(img_bytes):
    """Convert image to RGB JPEG for Gemini"""
    img = Image.open(io.BytesIO(img_bytes))
    print(f"  Input: {img.format} {img.mode} {img.size}")
    
    # Convert to RGB
    if img.mode not in ['RGB', 'L']:
        if img.mode in ('RGBA', 'PA', 'LA'):
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = bg
        else:
            img = img.convert('RGB')
        print(f"  -> Converted to RGB")
    
    # Ensure JPEG format
    if img.format not in ['JPEG', 'PNG'] or img.format is None:
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=95)
        buf.seek(0)
        img = Image.open(buf)
        img.format = 'JPEG'
        print(f"  -> Converted to JPEG")
    
    print(f"  Output: {img.format} {img.mode}")
    return img

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "2.0"}), 200

@app.route("/analyze", methods=["POST"])
def analyze():
    print("\n" + "="*60)
    print("ANALYZE REQUEST")
    print("="*60)
    
    try:
        # Check image
        if "image" not in request.files:
            print("[ERROR] No image in request")
            return jsonify({"error": "No image"}), 400
        
        file = request.files["image"]
        if not file.filename:
            print("[ERROR] Empty filename")
            return jsonify({"error": "No filename"}), 400
        
        print(f"[OK] File: {file.filename}")
        
        # Get params
        lang = request.form.get('language', 'English')
        fmt = request.args.get('format', 'pdf')
        print(f"[OK] Language: {lang}")
        print(f"[OK] Format: {fmt}")

        # Read image
        img_bytes = file.read()
        print(f"[OK] Read: {len(img_bytes)} bytes")

        # Fix image
        print("Converting image...")
        img = fix_image(img_bytes)
        print("[OK] Image ready")
        
        # Call Gemini AI API
        print("Calling Gemini AI API...")

        # Try different available Gemini models in order of preference
        models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-pro"]

        model = None
        for m in models:
            try:
                model = genai.GenerativeModel(m)
                print(f"[OK] Using: {m}")
                break
            except Exception as e:
                print(f"  [FAIL] {m} failed: {str(e)[:50]}")
                continue

        if not model:
            return jsonify({"error": "No Gemini model available. Please check API key and model access."}), 503

        prompt = f"""Analyze this crop image and provide a detailed agricultural report in {lang}. Structure your response EXACTLY as follows:

**Crop Species**
[Identify the crop type and species]

**Plant Health Status**
[Overall health assessment: Healthy/Diseased/etc.]

**Disease Identification**
Name: [Disease name]
Description: [Detailed description of the disease]

**Assessment**
Severity Level: [Mild/Moderate/Severe]
Confidence Level: [Percentage]%

**Visible Symptoms**
• [List specific symptoms as bullet points]

**Recommended Actions**
Chemical Treatment:
• [Specific chemical recommendations with dosages]

Organic Treatment:
• [Organic/biological alternatives]

Immediate Actions:
• [Urgent steps to take]

**Prevention Strategies**
• [List prevention methods as bullet points]

**General Precautions**
• [List general precautions as bullet points]

**Additional Insights**
• [Additional observations and insights]

**Summary Report**
[Final summary paragraph]

Make the analysis practical and farmer-friendly. Use clear, actionable language. If you're uncertain about any aspect, clearly state the uncertainty.

IMPORTANT: Base your analysis ONLY on what you can observe in the image. Do not make assumptions about conditions not visible in the photo."""

        # Call with retry logic
        text = ""
        for attempt in range(3):  # Increased retries
            try:
                print(f"  Attempt {attempt+1}/3...")
                resp = model.generate_content([prompt, img])
                text = resp.text.strip()
                if text and len(text) > 100:  # Ensure we got a meaningful response
                    print(f"[OK] Got response: {len(text)} chars")
                    break
                else:
                    print(f"  [WARN] Empty or too short response, retrying...")
                    time.sleep(2)
            except ResourceExhausted:
                if attempt < 2:  # Don't wait on last attempt
                    wait_time = 30 + (attempt * 15)  # Progressive wait: 30s, 45s
                    print(f"  [WARN] Quota exceeded, waiting {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise
            except Exception as e:
                print(f"  [ERROR] Attempt {attempt+1} failed: {str(e)[:60]}")
                if attempt < 2:
                    time.sleep(2)
                else:
                    raise

        if not text or len(text) < 100:
            # Fallback response if all attempts fail
            text = f"""# Crop Analysis Report

## Analysis Status
Unable to complete automated analysis due to API limitations.

## Recommendations
- Consult local agricultural extension services
- Take clear, well-lit photos of affected plant parts
- Consider soil testing and nutrient analysis
- Monitor for common local pests and diseases

## Note
Please try again later or contact agricultural experts for immediate assistance.

**Language:** {lang}
**Analysis Time:** {time.strftime('%Y-%m-%d %H:%M:%S')}"""
            print(f"[WARN] Using fallback response due to API issues")
        
        # JSON format
        if fmt == 'json':
            return jsonify({"analysis": text[:1000], "full": text})
        
        # PDF format
        print("Creating PDF...")
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=50, bottomMargin=50)
        story = []
        styles = getSampleStyleSheet()

        # Define styles
        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, spaceAfter=20)
        section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=16, spaceAfter=10, textColor='darkgreen')
        subsection_style = ParagraphStyle('Subsection', parent=styles['Heading3'], fontSize=14, spaceAfter=8, textColor='darkblue')
        normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=11, leading=16)
        bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'], fontSize=11, leading=16, leftIndent=20)

        # Title
        story.append(Paragraph("Crop Disease Analysis Report", title_style))
        story.append(Spacer(1, 30))

        # Add image
        try:
            ib = io.BytesIO()
            im = img.copy()
            im.thumbnail((400, 300), Image.LANCZOS)
            im.save(ib, format='PNG')
            ib.seek(0)
            story.append(RLImage(ib, width=400, height=300))
            story.append(Spacer(1, 20))
            print("  [OK] Added image")
        except Exception as e:
            print(f"  [WARN] Image skip: {e}")

        # Parse and format the structured response
        lines = text.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue

            # Main sections
            if line.startswith('**') and line.endswith('**'):
                section_title = line.strip('**')
                story.append(Paragraph(section_title, section_style))
                story.append(Spacer(1, 10))
                i += 1
                continue

            # Subsections (like Chemical Treatment, Organic Treatment, etc.)
            elif line.endswith(':') and not line.startswith('•'):
                if any(keyword in line for keyword in ['Chemical Treatment', 'Organic Treatment', 'Immediate Actions']):
                    story.append(Paragraph(line, subsection_style))
                    story.append(Spacer(1, 5))
                else:
                    story.append(Paragraph(line, normal_style))
                    story.append(Spacer(1, 5))
                i += 1
                continue

            # Bullet points
            elif line.startswith('•') or line.startswith('*') or line.startswith('-'):
                bullet_char = line[0]
                content = line[1:].strip()
                # Add bullet symbol if not already present
                if not content.startswith('•'):
                    content = '• ' + content
                story.append(Paragraph(content, bullet_style))
                story.append(Spacer(1, 3))
                i += 1
                continue

            # Regular content
            else:
                story.append(Paragraph(line, normal_style))
                story.append(Spacer(1, 6))
                i += 1

        doc.build(story)
        buf.seek(0)
        
        print(f"[OK] PDF created: {len(buf.getvalue())} bytes")
        print("="*60 + "\n")
        
        return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name="report.pdf")
        
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv('PORT', 7000))
    print(f"Starting on http://localhost:{port}")
    print(f"   Health: http://localhost:{port}/health")
    print("="*60 + "\n")
    app.run(host="0.0.0.0", port=port, debug=True)
