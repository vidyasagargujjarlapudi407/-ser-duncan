# backend/main.py
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models
import ai_services

# ── App Initialisation ─────────────────────────────────────────────────────────
app = FastAPI(
    title="BizForge AI Backend",
    description="GenAI-powered branding suite — 24 tools, one API.",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
# FIX: original only allowed POST which silently blocked GET requests needed
#      to serve static logo images. Now GET is included.
app.add_middleware(
    CORSMiddleware,
    # FIX: allow_credentials=True + allow_origins=["*"] is ILLEGAL in Starlette —
    # it raises ValueError at startup and the server never boots on Render.
    # Credentials are not needed (no cookies/auth), so False is correct here.
    # For production security, swap "*" for your Vercel domain:
    # allow_origins=["https://your-app.vercel.app"],
    allow_origins=["bizforge.vercel.app"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Static Files (Generated Logos) ─────────────────────────────────────────────
# FIX: without this mount the frontend could never load /static/generated_logos/*.png
STATIC_DIR = Path(__file__).resolve().parent.parent / "frontend" / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/")
async def health_check():
    return {"status": "BizForge API is running 🎬", "tools": 24}


# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — Brand Names Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-brand")
async def generate_brand(req: models.BrandNameRequest):
    return await ai_services.generate_brand_names(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — Logo Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-logo")
async def generate_logo(req: models.LogoRequest):
    return await ai_services.generate_logo_image(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — Marketing Content Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-content")
async def generate_content(req: models.ContentRequest):
    return await ai_services.generate_marketing_content(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 4 — Design System
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/get-colors")
async def get_colors(req: models.ColorRequest):
    return await ai_services.generate_design_system(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 5 — Sentiment Analysis / Review Analyzer
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/analyze-sentiment")
async def analyze_sentiment(req: models.SentimentRequest):
    return await ai_services.analyze_sentiment(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 6 — AI Branding Chatbot
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/chat")
async def chat(req: models.ChatRequest):
    return await ai_services.ibm_granite_chat(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 7 — Tagline & Slogan Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-tagline")
async def generate_tagline(req: models.TaglineRequest):
    return await ai_services.generate_taglines(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 8 — Brand Story Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-brand-story")
async def generate_brand_story(req: models.BrandStoryRequest):
    return await ai_services.generate_brand_story(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 9 — Social Media Post Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-social")
async def generate_social(req: models.SocialRequest):
    return await ai_services.generate_social_post(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 10 — Email Template Writer
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-email")
async def generate_email(req: models.EmailRequest):
    return await ai_services.generate_email_template(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 11 — Product Description Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-product")
async def generate_product(req: models.ProductRequest):
    return await ai_services.generate_product_description(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 12 — Brand Mission & Vision Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-mission")
async def generate_mission(req: models.MissionRequest):
    return await ai_services.generate_mission_vision(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 13 — Target Audience Persona Builder
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-persona")
async def generate_persona(req: models.PersonaRequest):
    return await ai_services.generate_personas(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 14 — Ad Copy Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-ad")
async def generate_ad(req: models.AdRequest):
    return await ai_services.generate_ad_copy(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 15 — Hashtag Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-hashtags")
async def generate_hashtags(req: models.HashtagRequest):
    return await ai_services.generate_hashtags(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 16 — Press Release Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-press-release")
async def generate_press_release(req: models.PressReleaseRequest):
    return await ai_services.generate_press_release(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 17 — SEO Meta Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-seo")
async def generate_seo(req: models.SEORequest):
    return await ai_services.generate_seo_meta(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 18 — FAQ Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-faq")
async def generate_faq(req: models.FAQRequest):
    return await ai_services.generate_faqs(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 19 — Brand Pitch Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-pitch")
async def generate_pitch(req: models.PitchRequest):
    return await ai_services.generate_pitch(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 20 — Long Text Summarizer
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/summarize")
async def summarize(req: models.SummarizeRequest):
    return await ai_services.summarize_text(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 21 — Voice Input Transcription (file upload — no Pydantic model)
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/transcribe-voice")
async def transcribe_voice(file: UploadFile = File(...)):
    return await ai_services.transcribe_audio(file)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 22 — Brand Consistency Checker
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/check-consistency")
async def check_consistency(req: models.ConsistencyRequest):
    return await ai_services.check_brand_consistency(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 23 — Business Card Content Generator
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/generate-bizcard")
async def generate_bizcard(req: models.BizCardRequest):
    return await ai_services.generate_business_card(req)


# ══════════════════════════════════════════════════════════════════════════════
# TAB 24 — Brand Name Availability Checker
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/api/check-availability")
async def check_availability(req: models.AvailabilityRequest):
    return await ai_services.check_domain_availability(req)


# ── Server Entry Point ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
