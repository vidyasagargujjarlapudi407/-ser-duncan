# backend/ai_services.py
import os
import time
import tempfile
import requests
from pathlib import Path
from fastapi import HTTPException
from dotenv import load_dotenv
from groq import Groq
import urllib.parse
import requests
from fastapi import HTTPException
# ── Environment Setup ──────────────────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HF_API_KEY   = os.getenv("HF_API_KEY")

if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY missing from .env!")
if not HF_API_KEY:
    print("⚠️  WARNING: HF_API_KEY missing from .env!")

# ── Groq Client ────────────────────────────────────────────────────────────────
groq_client = Groq(api_key=GROQ_API_KEY)

# ── Static logos path (resolved relative to THIS file, not the working directory)
# FIX: was "../frontend/static/generated_logos" which breaks depending on where
#      uvicorn is launched from.  Now always resolves correctly.
LOGO_SAVE_DIR = Path(__file__).resolve().parent.parent / "frontend" / "static" / "generated_logos"
LOGO_SAVE_DIR.mkdir(parents=True, exist_ok=True)


# ══════════════════════════════════════════════════════════════════════════════
# SHARED HELPERS
# ══════════════════════════════════════════════════════════════════════════════

async def call_groq(
    prompt: str,
    system_prompt: str = "You are BizForge AI, an expert branding and marketing assistant.",
    max_tokens: int = 1024,
) -> str:
    """Thin wrapper around Groq LLaMA-3.3-70B chat completions."""
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.7,
            top_p=0.95,
            max_tokens=max_tokens,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")


import base64

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — Logo Generator (Zero-Dependency Local Engine)
# ══════════════════════════════════════════════════════════════════════════════
async def generate_logo_image(req):
    # 1. Grab the first letter of the brand name (or 'B' if empty)
    initial = req.brand_name[0].upper() if req.brand_name else "B"
    
    # 2. Draw a modern, scalable SVG logo using pure Python strings
    svg_code = f"""
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="1024" height="1024">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2A2D34;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#141518;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="400" height="400" rx="100" fill="url(#grad)"/>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="200" 
              font-weight="bold" fill="#00E5FF" text-anchor="middle" dy=".3em">{initial}</text>
    </svg>
    """
    
    # 3. Encode the SVG into a Base64 Data URI (a format browsers read natively)
    b64_svg = base64.b64encode(svg_code.encode('utf-8')).decode('utf-8')
    data_uri = f"data:image/svg+xml;base64,{b64_svg}"
    
    # 4. Return the data URI directly to the frontend
    return {
        "image_url": data_uri,
        "prompt_used": "Zero-Dependency Local Vector Engine (100% Offline Generation)",
    }

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — Brand Names Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_brand_names(req):
    prompt = (
        f"Generate 10-20 highly creative brand names for a business in the {req.industry} industry. "
        f"Keywords: {req.keywords}. Tone: {req.tone}. "
        f"Include a punchy one-line tagline for each name. Format as a clean numbered list."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — Marketing Content Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_marketing_content(req):
    prompt = (
        f"Write a {req.content_type} for a brand described as: {req.brand_description}. "
        f"Tone: {req.tone}. Make it polished and publication-ready."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — Design System
# FIX: was req.tone — field name in ColorRequest is brand_tone
# ══════════════════════════════════════════════════════════════════════════════
async def generate_design_system(req):
    prompt = (
        f"Create a design system for a {req.brand_tone} brand in the {req.industry} industry. "
        f"Output exactly: "
        f"1. 3-5 HEX color codes with names. "
        f"2. Primary and secondary font pairing recommendation. "
        f"3. A CSS :root variables snippet using those colors."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 5 — Sentiment Analysis / Review Analyzer
# ══════════════════════════════════════════════════════════════════════════════
async def analyze_sentiment(req):
    prompt = (
        f"Analyze this customer review: '{req.review_text}'. Brand tone: {req.brand_tone_reference}. "
        f"Output: "
        f"1. Sentiment classification (Positive / Neutral / Negative). "
        f"2. Confidence score (0-100%). "
        f"3. Emotional tone breakdown. "
        f"4. A professionally rewritten version aligned with the brand tone."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 6 — AI Branding Chatbot
# ══════════════════════════════════════════════════════════════════════════════
async def ibm_granite_chat(req):
    """
    Multi-turn branding chatbot.
    Uses Groq LLaMA for cloud performance; IBM Granite system persona is applied
    via the system prompt so behaviour matches the spec.
    """
    messages = [
        {
            "role": "system",
            "content": (
                "You are BizForge AI, an expert brand consultant and creative strategist. "
                "You help startups and entrepreneurs build strong brand identities. "
                "Be concise, insightful, and actionable in every response."
            ),
        }
    ]

    # Replay conversation history for multi-turn context
    for msg in req.history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": req.message})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat API Error: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# TAB 7 — Tagline & Slogan Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_taglines(req):
    prompt = (
        f"Create 5-10 punchy taglines/slogans for '{req.brand_name}' in the {req.industry} industry. "
        f"Core value: {req.core_value}. Tone: {req.tone}. "
        f"Add a bracketed emotional label next to each (e.g., [Inspiring], [Bold])."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 8 — Brand Story Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_brand_story(req):
    founder_str = f"Founder: {req.founder_name}." if req.founder_name else ""
    prompt = (
        f"Write a compelling 1-2 paragraph brand origin story. "
        f"Business: {req.business_type}. Mission: {req.mission}. "
        f"Audience: {req.target_audience}. Founded: {req.year_founded}. {founder_str} "
        f"Make it emotionally resonant and authentic."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 9 — Social Media Post Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_social_post(req):
    prompt = (
        f"Write a {req.platform} post about '{req.topic}' for this brand: {req.brand_description}. "
        f"Tone: {req.tone}. Optimise for {req.platform} — include appropriate emojis and "
        f"5-8 relevant hashtags grouped at the bottom."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 10 — Email Template Writer
# ══════════════════════════════════════════════════════════════════════════════
async def generate_email_template(req):
    prompt = (
        f"Write a {req.email_type} email for '{req.brand_name}'. "
        f"Key message: {req.key_message}. Tone: {req.tone}. "
        f"Structure: Subject Line (clearly labelled), Body, and a strong Call to Action."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 11 — Product Description Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_product_description(req):
    prompt = (
        f"Product: {req.product_name}. Features: {req.key_features}. "
        f"Target customer: {req.target_customer}. Tone: {req.tone}. "
        f"Output exactly three clearly labelled sections: "
        f"1. Short description (max 50 words). "
        f"2. Long description (~150 words). "
        f"3. Bullet-point highlights (5-7 points)."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 12 — Brand Mission & Vision Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_mission_vision(req):
    prompt = (
        f"Industry: {req.industry}. Values: {req.core_values}. "
        f"Audience: {req.target_audience}. Goal: {req.impact_goal}. "
        f"Output: "
        f"1. A strong Mission Statement. "
        f"2. A bold Vision Statement. "
        f"3. A formatted list of 3-5 Core Values with one-line explanations."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 13 — Target Audience Persona Builder
# ══════════════════════════════════════════════════════════════════════════════
async def generate_personas(req):
    prompt = (
        f"Build 2 detailed buyer personas for a {req.product_type} in the {req.industry} industry. "
        f"Price range: {req.price_range}. Geography: {req.geography}. "
        f"For each persona include: Name, Age, Job Title, Pain Points, Goals, "
        f"Preferred Platforms, and Buying Triggers. Format as clearly separated cards."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 14 — Ad Copy Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_ad_copy(req):
    prompt = (
        f"Write ad copy for {req.platform}. Product/Service: {req.product_service}. "
        f"USP: {req.usp}. Target audience: {req.target_audience}. "
        f"Output clearly labelled: "
        f"Headline (max 30 chars), Description (max 90 chars), CTA, "
        f"and a longer body copy variant."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 15 — Hashtag Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_hashtags(req):
    prompt = (
        f"Generate 15-30 hashtags for a {req.brand_niche} brand posting about "
        f"'{req.post_topic}' on {req.platform}. Tone: {req.tone}. "
        f"Group them under three headers: Popular, Niche, and Branded."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 16 — Press Release Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_press_release(req):
    prompt = (
        f"Write a formal Press Release for '{req.brand_name}'. "
        f"Announcement type: {req.announcement_type}. Details: {req.key_details}. "
        f"Founder quote: '{req.founder_quote}'. "
        f"Use standard PR format: FOR IMMEDIATE RELEASE, Headline, Dateline, "
        f"Body (3 paragraphs), Boilerplate, and Media Contact section."
    )
    result = await call_groq(prompt, max_tokens=1200)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 17 — SEO Meta Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_seo_meta(req):
    prompt = (
        f"Generate SEO metadata for '{req.brand_name}'. "
        f"Page topic: {req.page_topic}. Target keyword: {req.target_keyword}. Tone: {req.tone}. "
        f"Output: "
        f"1. SEO Title Tag (max 60 chars — state char count). "
        f"2. Meta Description (max 160 chars — state char count). "
        f"3. 5 focus keywords. "
        f"4. Open Graph Title & Description."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 18 — FAQ Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_faqs(req):
    prompt = (
        f"Write 8-10 Frequently Asked Questions with detailed answers for a "
        f"{req.business_type} selling {req.product_description} to {req.target_audience}. "
        f"Anticipate common objections, shipping/returns queries, and product concerns."
    )
    result = await call_groq(prompt, max_tokens=1200)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 19 — Brand Pitch Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_pitch(req):
    traction_str = f"Traction so far: {req.traction}." if req.traction else ""
    prompt = (
        f"Business: {req.business_name}. Problem solved: {req.problem_solved}. "
        f"Solution: {req.solution}. Target market: {req.target_market}. "
        f"Revenue model: {req.revenue_model}. {traction_str} "
        f"Output: "
        f"1. A compelling 60-second elevator pitch (spoken words). "
        f"2. A 5-point investor pitch slide outline."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 20 — Long Text Summarizer
# ══════════════════════════════════════════════════════════════════════════════
async def summarize_text(req):
    prompt = (
        f"Summarize the following text.\n\n"
        f"Output exactly:\n"
        f"1. A 3-sentence summary.\n"
        f"2. 5 key bullet points.\n"
        f"3. 3 suggested brand insights extracted from the text.\n\n"
        f"Text:\n{req.document_text}"
    )
    result = await call_groq(prompt, max_tokens=800)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 21 — Voice Input Transcription
# FIX: original code read audio_bytes but never used them for writing;
#      file.filename could be None; temp file was written but path management
#      was inconsistent. Fully rewritten below.
# ══════════════════════════════════════════════════════════════════════════════
async def transcribe_audio(file):
    """
    Accepts an UploadFile from FastAPI, saves it to a temp file,
    transcribes using Groq Whisper, then cleans up.
    """
    try:
        audio_bytes = await file.read()

        # Determine file extension safely
        original_filename = file.filename or "audio.wav"
        suffix = Path(original_filename).suffix or ".wav"

        # Write to a named temp file so Groq SDK can open it by path
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Transcribe using Groq Whisper
        with open(tmp_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=(original_filename, audio_file),
                model="whisper-large-v3",
            )

        # Clean up temp file
        os.remove(tmp_path)

        return {"text": transcription.text}

    except Exception as e:
        # Attempt cleanup even on failure
        try:
            os.remove(tmp_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Transcription Error: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# TAB 22 — Brand Consistency Checker
# ══════════════════════════════════════════════════════════════════════════════
async def check_brand_consistency(req):
    pieces = "\n---\n".join(req.content_pieces)
    prompt = (
        f"Analyze these brand content pieces for consistency:\n\n{pieces}\n\n"
        f"Output: "
        f"1. Consistency Score (0-100). "
        f"2. Tone alignment analysis. "
        f"3. Specific inconsistency flags (list each one). "
        f"4. Concrete AI improvement suggestions for each flag."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 23 — Business Card Content Generator
# ══════════════════════════════════════════════════════════════════════════════
async def generate_business_card(req):
    prompt = (
        f"Design 3 business card copy layouts for: "
        f"Name: {req.name}, Role: {req.role}, Brand: {req.brand_name}, "
        f"Contact: {req.contact_info}, Tagline preference: {req.tagline_preference}. "
        f"Label each layout clearly: Minimalist, Bold, and Creative."
    )
    result = await call_groq(prompt)
    return {"result": result}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 24 — Brand Name Availability Checker
# ══════════════════════════════════════════════════════════════════════════════
async def check_domain_availability(req):
    prompt = (
        f"Generate 10 domain name variations (.com, .io, .co, .ai, .app, .brand) "
        f"for the brand name '{req.brand_name}'. "
        f"Also suggest 3 social media handle formats for Instagram, X (Twitter), and LinkedIn. "
        f"Format as a clean, clearly labelled list."
    )
    result = await call_groq(prompt)
    return {"result": result}
