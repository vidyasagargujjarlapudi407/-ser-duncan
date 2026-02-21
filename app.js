# backend/models.py
from pydantic import BaseModel
from typing import List, Optional

# ── TAB 1: Brand Names ──────────────────────────────────────────────
class BrandNameRequest(BaseModel):
    keywords: str
    industry: str
    tone: str

# ── TAB 2: Logo Generator ───────────────────────────────────────────
class LogoRequest(BaseModel):
    brand_name: str
    industry: str
    keywords: str
    style_preference: str  # minimalist / bold / vintage / futuristic

# ── TAB 3: Marketing Content ────────────────────────────────────────
class ContentRequest(BaseModel):
    brand_description: str
    tone: str
    content_type: str  # product description / caption / ad copy / landing page copy

# ── TAB 4: Design System ────────────────────────────────────────────
class ColorRequest(BaseModel):
    brand_tone: str   # FIX: was causing req.tone crash in ai_services — field is brand_tone
    industry: str

# ── TAB 5: Sentiment Analysis ───────────────────────────────────────
class SentimentRequest(BaseModel):
    review_text: str
    brand_tone_reference: str

# ── TAB 6: AI Branding Chatbot ──────────────────────────────────────
class ChatMessage(BaseModel):
    role: str     # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

# ── TAB 7: Tagline & Slogan Generator ───────────────────────────────
class TaglineRequest(BaseModel):
    brand_name: str
    industry: str
    core_value: str
    tone: str

# ── TAB 8: Brand Story Generator ────────────────────────────────────
class BrandStoryRequest(BaseModel):
    founder_name: Optional[str] = None
    business_type: str
    mission: str
    target_audience: str
    year_founded: str

# ── TAB 9: Social Media Post Generator ──────────────────────────────
class SocialRequest(BaseModel):
    brand_description: str
    platform: str   # Instagram / LinkedIn / Twitter/X / Facebook
    topic: str
    tone: str

# ── TAB 10: Email Template Writer ───────────────────────────────────
class EmailRequest(BaseModel):
    email_type: str  # welcome / promotional / follow-up / newsletter / cold outreach
    brand_name: str
    key_message: str
    tone: str

# ── TAB 11: Product Description Generator ───────────────────────────
class ProductRequest(BaseModel):
    product_name: str
    key_features: str   # comma-separated
    target_customer: str
    tone: str

# ── TAB 12: Brand Mission & Vision Generator ────────────────────────
class MissionRequest(BaseModel):
    industry: str
    core_values: str
    target_audience: str
    impact_goal: str

# ── TAB 13: Target Audience Persona Builder ─────────────────────────
class PersonaRequest(BaseModel):
    product_type: str
    industry: str
    price_range: str
    geography: str

# ── TAB 14: Ad Copy Generator ───────────────────────────────────────
class AdRequest(BaseModel):
    product_service: str
    usp: str                 # unique selling point
    target_audience: str
    platform: str            # Google Ads / Facebook / Instagram / LinkedIn

# ── TAB 15: Hashtag Generator ───────────────────────────────────────
class HashtagRequest(BaseModel):
    brand_niche: str
    post_topic: str
    platform: str
    tone: str

# ── TAB 16: Press Release Generator ─────────────────────────────────
class PressReleaseRequest(BaseModel):
    announcement_type: str   # product launch / partnership / milestone / event
    brand_name: str
    key_details: str
    founder_quote: str

# ── TAB 17: SEO Meta Generator ──────────────────────────────────────
class SEORequest(BaseModel):
    page_topic: str
    target_keyword: str
    brand_name: str
    tone: str

# ── TAB 18: FAQ Generator ───────────────────────────────────────────
class FAQRequest(BaseModel):
    business_type: str
    product_description: str
    target_audience: str

# ── TAB 19: Brand Pitch Generator ───────────────────────────────────
class PitchRequest(BaseModel):
    business_name: str
    problem_solved: str
    solution: str
    target_market: str
    revenue_model: str
    traction: Optional[str] = None

# ── TAB 20: Long Text Summarizer ────────────────────────────────────
class SummarizeRequest(BaseModel):
    document_text: str

# ── TAB 21: Voice Transcription — handled as UploadFile, no model needed ──

# ── TAB 22: Brand Consistency Checker ───────────────────────────────
class ConsistencyRequest(BaseModel):
    content_pieces: List[str]   # list of 2-3 brand copy snippets

# ── TAB 23: Business Card Content Generator ─────────────────────────
class BizCardRequest(BaseModel):
    name: str
    role: str
    brand_name: str
    contact_info: str
    tagline_preference: str

# ── TAB 24: Brand Name Availability Checker ─────────────────────────
class AvailabilityRequest(BaseModel):
    brand_name: str
