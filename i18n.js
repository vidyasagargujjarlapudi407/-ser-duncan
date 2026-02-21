// frontend/app.js

// ============================================================
// SAFETY GUARDS — All DOM queries are null-checked
// FIX: Original code crashed silently when elements from one
//      page were queried while on the other page.
// ============================================================

// ── Backend Wake-Up Ping ─────────────────────────────────────
// Render free tier spins down after 15 min inactivity.
// Pinging on page load warms the server before the user clicks
// anything — prevents the 50-second cold start "Failed to fetch".
(async function pingBackend() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/`, { method: 'GET' });
        if (!res.ok) console.warn('Backend ping returned non-OK status');
    } catch (_) {
        // Silently ignore — server may still be waking up
        console.warn('Backend may be cold-starting on Render. First request may be slow.');
    }
})();

// ── Theme Toggle ─────────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        html.setAttribute('data-theme', html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
}

// ── Tab Navigation ───────────────────────────────────────────
const tabLinks    = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabLinks.forEach(link => {
    link.addEventListener('click', () => {
        tabLinks.forEach(l    => l.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        link.classList.add('active');
        const target = document.getElementById(link.getAttribute('data-target'));
        if (target) target.classList.add('active');
    });
});

// Handle #hash in URL to open a specific tab on page load
// e.g. branding.html#tab7 opens Tab 7 directly
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const targetLink    = document.querySelector(`.tab-link[data-target="${hash}"]`);
        const targetContent = document.getElementById(hash);
        if (targetLink && targetContent) {
            tabLinks.forEach(l    => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            targetLink.classList.add('active');
            targetContent.classList.add('active');
        }
    }
});

// ── Toast Notification ───────────────────────────────────────
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'show';
    setTimeout(() => { toast.className = toast.className.replace('show', '').trim(); }, 3000);
}

// ── Copy to Clipboard ────────────────────────────────────────
function copyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text)
        .then(() => showToast('📋 Copied to clipboard!'))
        .catch(() => showToast('❌ Failed to copy.'));
}


// ============================================================
// MASTER TEXT GENERATOR — Handles 21 of the 24 tools
// (Tab 2 = generateLogo, Tab 6 = sendMessage, Tab 21 = mic)
// ============================================================
async function generateContent(endpoint, tabId) {
    const numericId  = tabId.replace('tab', 't');
    const loader     = document.getElementById(`${numericId}-loader`);
    const outputBox  = document.getElementById(`${numericId}-output`);

    if (!loader || !outputBox) {
        console.error(`Missing #${numericId}-loader or #${numericId}-output for ${tabId}`);
        return;
    }

    loader.style.display = 'block';
    outputBox.innerText  = '🎬 Directing the AI... Please wait.';

    let payload = {};

    try {
        switch (tabId) {

            // ── Tab 1: Brand Names ──────────────────────────
            case 'tab1':
                payload = {
                    industry: document.getElementById('t1-industry').value || 'General',
                    keywords: document.getElementById('t1-keywords').value || 'Creative',
                    tone:     document.getElementById('t1-tone').value     || 'Modern'
                };
                break;

            // ── Tab 3: Marketing Content ────────────────────
            case 'tab3':
                payload = {
                    brand_description: document.getElementById('t3-desc').value    || 'A new brand',
                    content_type:      document.getElementById('t3-type').value    || 'Ad Copy',
                    tone:              document.getElementById('t3-tone').value     || 'Professional'
                };
                break;

            // ── Tab 4: Design System ────────────────────────
            case 'tab4':
                payload = {
                    brand_tone: document.getElementById('t4-tone').value     || 'Modern',
                    industry:   document.getElementById('t4-industry').value || 'General Business'
                };
                break;

            // ── Tab 5: Sentiment Analysis ───────────────────
            case 'tab5':
                payload = {
                    review_text:           document.getElementById('t5-review').value || 'Good service.',
                    brand_tone_reference:  document.getElementById('t5-tone').value   || 'Professional'
                };
                break;

            // ── Tab 7: Taglines ─────────────────────────────
            case 'tab7':
                payload = {
                    brand_name:  document.getElementById('t7-name').value     || 'MyBrand',
                    industry:    document.getElementById('t7-industry').value  || 'Business',
                    core_value:  document.getElementById('t7-value').value     || 'Quality',
                    tone:        document.getElementById('t7-tone').value      || 'Catchy'
                };
                break;

            // ── Tab 8: Brand Story ──────────────────────────
            case 'tab8':
                payload = {
                    founder_name:    document.getElementById('t8-founder').value   || '',
                    business_type:   document.getElementById('t8-type').value      || 'Company',
                    mission:         document.getElementById('t8-mission').value   || 'To provide excellent service.',
                    target_audience: document.getElementById('t8-audience').value  || 'Everyone',
                    year_founded:    document.getElementById('t8-year').value      || 'Recently'
                };
                break;

            // ── Tab 9: Social Media Posts ───────────────────
            case 'tab9':
                payload = {
                    brand_description: document.getElementById('t9-desc').value     || 'A cool brand',
                    platform:          document.getElementById('t9-platform').value || 'Instagram',
                    topic:             document.getElementById('t9-topic').value    || 'Updates',
                    tone:              document.getElementById('t9-tone').value     || 'Engaging'
                };
                break;

            // ── Tab 10: Email Templates ─────────────────────
            case 'tab10':
                payload = {
                    email_type:  document.getElementById('t10-type').value    || 'Newsletter',
                    brand_name:  document.getElementById('t10-name').value    || 'MyBrand',
                    key_message: document.getElementById('t10-message').value || 'Check out our new stuff',
                    tone:        document.getElementById('t10-tone').value    || 'Friendly'
                };
                break;

            // ── Tab 11: Product Descriptions ────────────────
            case 'tab11':
                payload = {
                    product_name:    document.getElementById('t11-name').value     || 'Awesome Product',
                    key_features:    document.getElementById('t11-features').value || 'High quality',
                    target_customer: document.getElementById('t11-customer').value || 'Everyone',
                    tone:            document.getElementById('t11-tone').value     || 'Persuasive'
                };
                break;

            // ── Tab 12: Mission & Vision ────────────────────
            case 'tab12':
                payload = {
                    industry:        document.getElementById('t12-industry').value || 'Business',
                    core_values:     document.getElementById('t12-values').value   || 'Integrity, Innovation',
                    target_audience: document.getElementById('t12-audience').value || 'Consumers',
                    impact_goal:     document.getElementById('t12-goal').value     || 'Change the world'
                };
                break;

            // ── Tab 13: Audience Personas ───────────────────
            case 'tab13':
                payload = {
                    product_type: document.getElementById('t13-type').value     || 'Product',
                    industry:     document.getElementById('t13-industry').value  || 'Retail',
                    price_range:  document.getElementById('t13-price').value     || 'Mid-range',
                    geography:    document.getElementById('t13-geo').value       || 'Global'
                };
                break;

            // ── Tab 14: Ad Copy ─────────────────────────────
            case 'tab14':
                payload = {
                    product_service: document.getElementById('t14-product').value  || 'Service',
                    usp:             document.getElementById('t14-usp').value      || 'We are the best',
                    target_audience: document.getElementById('t14-audience').value || 'Everyone',
                    platform:        document.getElementById('t14-platform').value || 'Google Ads'
                };
                break;

            // ── Tab 15: Hashtags ────────────────────────────
            case 'tab15':
                payload = {
                    brand_niche: document.getElementById('t15-niche').value    || 'Niche',
                    post_topic:  document.getElementById('t15-topic').value    || 'Topic',
                    platform:    document.getElementById('t15-platform').value || 'Instagram',
                    tone:        document.getElementById('t15-tone').value     || 'Trending'
                };
                break;

            // ── Tab 16: Press Release ───────────────────────
            case 'tab16':
                payload = {
                    announcement_type: document.getElementById('t16-type').value    || 'Product Launch',
                    brand_name:        document.getElementById('t16-name').value    || 'MyBrand',
                    key_details:       document.getElementById('t16-details').value || 'We launched something new.',
                    founder_quote:     document.getElementById('t16-quote').value   || 'This is a big step.'
                };
                break;

            // ── Tab 17: SEO Metadata ────────────────────────
            case 'tab17':
                payload = {
                    page_topic:      document.getElementById('t17-topic').value   || 'Home',
                    target_keyword:  document.getElementById('t17-keyword').value || 'Best service',
                    brand_name:      document.getElementById('t17-name').value    || 'MyBrand',
                    tone:            document.getElementById('t17-tone').value    || 'Professional'
                };
                break;

            // ── Tab 18: FAQ Generator ───────────────────────
            case 'tab18':
                payload = {
                    business_type:        document.getElementById('t18-type').value     || 'Business',
                    product_description:  document.getElementById('t18-desc').value     || 'A product',
                    target_audience:      document.getElementById('t18-audience').value || 'Buyers'
                };
                break;

            // ── Tab 19: Brand Pitch ─────────────────────────
            case 'tab19':
                payload = {
                    business_name:  document.getElementById('t19-name').value     || 'Startup',
                    problem_solved: document.getElementById('t19-problem').value  || 'A problem',
                    solution:       document.getElementById('t19-solution').value || 'Our solution',
                    target_market:  document.getElementById('t19-market').value   || 'The market',
                    revenue_model:  document.getElementById('t19-revenue').value  || 'SaaS',
                    traction:       document.getElementById('t19-traction').value || ''
                };
                break;

            // ── Tab 20: Text Summarizer ─────────────────────
            case 'tab20':
                payload = {
                    document_text: document.getElementById('t20-doc').value || 'Please paste text to summarize.'
                };
                break;

            // ── Tab 22: Consistency Checker ─────────────────
            case 'tab22': {
                const rawContent = document.getElementById('t22-content').value || '';
                const pieces = rawContent.split(/\n\s*\n/).filter(p => p.trim() !== '');
                payload = {
                    content_pieces: pieces.length > 0 ? pieces : ['Piece 1', 'Piece 2']
                };
                break;
            }

            // ── Tab 23: Business Cards ──────────────────────
            case 'tab23':
                payload = {
                    name:               document.getElementById('t23-name').value    || 'John Doe',
                    role:               document.getElementById('t23-role').value    || 'CEO',
                    brand_name:         document.getElementById('t23-brand').value   || 'MyBrand',
                    contact_info:       document.getElementById('t23-contact').value || 'hello@example.com',
                    tagline_preference: document.getElementById('t23-tagline').value || 'Minimal'
                };
                break;

            // ── Tab 24: Domain Availability ─────────────────
            case 'tab24':
                payload = {
                    brand_name: document.getElementById('t24-name').value || 'MyBrand'
                };
                break;

            default:
                outputBox.innerText = `⚠️ No payload builder found for ${tabId}.`;
                loader.style.display = 'none';
                return;
        }

        // ── API Call (with retry for Render cold starts) ──
        async function fetchWithRetry(url, options, retries = 3, delayMs = 4000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 25000);
                    const res = await fetch(url, { ...options, signal: controller.signal });
                    clearTimeout(timeout);
                    return res;
                } catch (err) {
                    if (i === retries - 1) throw err;
                    outputBox.innerText = `⏳ Server waking up on Render... retrying (${i + 2}/${retries})`;
                    await new Promise(r => setTimeout(r, delayMs));
                }
            }
        }

        const response = await fetchWithRetry(`${CONFIG.API_BASE_URL}/${endpoint}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP ${response.status}`);
        }

        const data = await response.json();
        outputBox.innerText = data.result;
        showToast('🎬 Cut! Generation complete.');

    } catch (error) {
        outputBox.innerText = `⚠️ Error: ${error.message}\n\nMake sure your backend is running:\nuvicorn main:app --reload`;
        showToast('❌ Generation failed.');
        console.error(error);
    } finally {
        loader.style.display = 'none';
    }
}


// ============================================================
// TAB 2 — SDXL Logo Generator
// ============================================================
async function generateLogo() {
    const loader       = document.getElementById('t2-loader');
    const imageOutput  = document.getElementById('t2-image-output');
    const promptOutput = document.getElementById('t2-prompt-output');
    const downloadBtn  = document.getElementById('t2-download-btn');
    if (!loader) return;

    const brandName = document.getElementById('t2-name').value.trim()     || 'MyBrand';
    const industry  = document.getElementById('t2-industry').value.trim() || 'Business';
    const keywords  = document.getElementById('t2-keywords').value.trim() || 'Modern';
    const style     = document.getElementById('t2-style').value.trim()    || 'Minimalist';

    loader.style.display      = 'block';
    imageOutput.style.display = 'none';
    downloadBtn.style.display = 'none';
    promptOutput.innerText    = '🎨 Rendering...';

    // ── Color palettes by style ──
    const palettes = {
        minimalist: [
            {bg:'#0D0D0D', accent:'#FFFFFF', secondary:'#888888'},
            {bg:'#FAFAFA', accent:'#111111', secondary:'#555555'},
            {bg:'#1a1a2e', accent:'#e94560', secondary:'#FFFFFF'},
        ],
        bold: [
            {bg:'#FF3B30', accent:'#FFFFFF', secondary:'#FFD700'},
            {bg:'#007AFF', accent:'#FFFFFF', secondary:'#00E5FF'},
            {bg:'#FF6B35', accent:'#1a1a1a', secondary:'#FFFFFF'},
        ],
        vintage: [
            {bg:'#2C1810', accent:'#D4A843', secondary:'#F5E6C8'},
            {bg:'#4A3728', accent:'#C8A96E', secondary:'#E8D5B0'},
            {bg:'#1B2A1B', accent:'#8DB87F', secondary:'#E8F5E8'},
        ],
        futuristic: [
            {bg:'#050510', accent:'#00E5FF', secondary:'#7B2FFF'},
            {bg:'#0A0A1A', accent:'#00FF88', secondary:'#FF2D78'},
            {bg:'#080820', accent:'#FF6B9D', secondary:'#C77DFF'},
        ],
    };

    const styleKey = Object.keys(palettes).find(k => style.toLowerCase().includes(k)) || 'minimalist';
    const opts     = palettes[styleKey];
    const p        = opts[Math.floor(Math.random() * opts.length)];

    // ── Build initials ──
    const initials = brandName.split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase()||'').join('') || brandName.slice(0,2).toUpperCase() || 'BF';
    const fs       = initials.length === 1 ? 160 : initials.length === 2 ? 120 : 90;

    // ── Geometric shape by style ──
    const sl = style.toLowerCase();
    let shape = '';
    if (sl.includes('vintage')) {
        shape = `<polygon points="200,40 340,100 340,220 200,320 60,220 60,100" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.5"/>
                 <polygon points="200,60 318,110 318,210 200,300 82,210 82,110" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.25"/>`;
    } else if (sl.includes('futuristic')) {
        shape = `<polygon points="200,30 330,105 330,255 200,330 70,255 70,105" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.35"/>
                 <circle cx="200" cy="180" r="92" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.2" stroke-dasharray="5 4"/>
                 <line x1="70" y1="105" x2="330" y2="255" stroke="${p.secondary}" stroke-width="0.5" opacity="0.15"/>`;
    } else if (sl.includes('bold')) {
        shape = `<rect x="30" y="30" width="340" height="320" rx="0" fill="none" stroke="${p.accent}" stroke-width="5" opacity="0.12"/>`;
    } else {
        shape = `<circle cx="200" cy="170" r="112" fill="none" stroke="${p.accent}" stroke-width="1.5" opacity="0.2"/>
                 <line x1="88" y1="170" x2="312" y2="170" stroke="${p.accent}" stroke-width="0.5" opacity="0.12"/>
                 <line x1="200" y1="58"  x2="200" y2="282" stroke="${p.accent}" stroke-width="0.5" opacity="0.12"/>`;
    }

    const tagline = (industry || keywords).toUpperCase().slice(0, 28);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:${p.bg}"/>
      <stop offset="100%" style="stop-color:${p.bg}DD"/>
    </linearGradient>
    <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   style="stop-color:${p.accent}"/>
      <stop offset="100%" style="stop-color:${p.secondary}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  ${shape}
  <text x="200" y="200" font-family="Georgia,serif" font-size="${fs}" font-weight="700"
    fill="url(#tg)" text-anchor="middle" dominant-baseline="middle"
    filter="url(#glow)" letter-spacing="-2">${initials}</text>
  <text x="200" y="308" font-family="Arial Narrow,Arial,sans-serif" font-size="22"
    font-weight="300" fill="${p.accent}" text-anchor="middle" letter-spacing="8" opacity="0.9">${brandName.toUpperCase()}</text>
  <line x1="120" y1="325" x2="280" y2="325" stroke="${p.accent}" stroke-width="0.75" opacity="0.4"/>
  <text x="200" y="346" font-family="Arial Narrow,Arial,sans-serif" font-size="10"
    fill="${p.secondary}" text-anchor="middle" letter-spacing="4" opacity="0.7">${tagline}</text>
</svg>`;

    const dataURI = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));

    imageOutput.src           = dataURI;
    imageOutput.style.display = 'block';
    downloadBtn.href          = dataURI;
    downloadBtn.download      = brandName.replace(/\s+/g,'_') + '_logo.svg';
    downloadBtn.style.display = 'inline-block';
    promptOutput.innerText    = `✅ Logo rendered!\nStyle: ${styleKey} | Brand: ${brandName} | Industry: ${industry}`;
    loader.style.display      = 'none';
    showToast('🎨 Logo rendered!');
}


// ============================================================
// TAB 6 — AI Branding Chatbot (multi-turn)
// ============================================================
let chatHistory = [];

async function sendMessage() {
    const inputField  = document.getElementById('chat-input');
    const historyBox  = document.getElementById('chat-history');
    const loader      = document.getElementById('t6-loader');

    if (!inputField || !historyBox) return;

    const message = inputField.value.trim();
    if (!message) return;

    // Show user message
    historyBox.innerHTML += `
        <div style="margin-bottom:1rem; text-align:right;">
            <span style="background:var(--bg-secondary); padding:0.5rem 1rem; border-radius:12px 12px 0 12px; display:inline-block; max-width:80%;">
                <strong>👤 You:</strong> ${message}
            </span>
        </div>`;
    inputField.value = '';
    historyBox.scrollTop = historyBox.scrollHeight;
    if (loader) loader.style.display = 'block';

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ message, history: chatHistory })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        historyBox.innerHTML += `
            <div style="margin-bottom:1rem;">
                <span style="background:var(--card-bg); padding:0.5rem 1rem; border-radius:12px 12px 12px 0; display:inline-block; max-width:80%; border:1px solid var(--card-border);">
                    <strong>🤖 BizForge AI:</strong> ${data.response}
                </span>
            </div>`;

        chatHistory.push({ role: 'user',      content: message });
        chatHistory.push({ role: 'assistant', content: data.response });

    } catch (error) {
        historyBox.innerHTML += `<div style="margin-bottom:1rem; color:#ff4757;"><strong>⚠️ Error:</strong> Could not reach AI. Is the backend running?</div>`;
        console.error(error);
    } finally {
        if (loader) loader.style.display = 'none';
        historyBox.scrollTop = historyBox.scrollHeight;
    }
}

// Enter key support for chatbot
const chatInputElem = document.getElementById('chat-input');
if (chatInputElem) {   // FIX: null check — was crashing on index.html
    chatInputElem.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
}


// ============================================================
// TAB 21 — Voice Input Transcription (Web Speech API)
// ============================================================
const micBtn      = document.getElementById('mic-btn');
const statusText  = document.getElementById('recording-status');
const transcriptBox = document.getElementById('t21-output');

if (micBtn) {   // FIX: null check — was crashing on index.html
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous    = true;
        recognition.interimResults = true;
        let isRecording = false;

        recognition.onstart = () => {
            isRecording = true;
            micBtn.style.animation = 'pulse 1s infinite';
            if (statusText) statusText.innerText = '🔴 Recording... Click mic to stop.';
            if (transcriptBox) transcriptBox.innerText = '';
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript && transcriptBox) {
                transcriptBox.innerText += finalTranscript + ' ';
            }
        };

        recognition.onerror = (event) => {
            if (statusText) statusText.innerText = `Speech error: ${event.error}`;
            isRecording = false;
            micBtn.style.animation = 'none';
        };

        recognition.onend = () => {
            isRecording = false;
            micBtn.style.animation = 'none';
            if (statusText) statusText.innerText = 'Click mic to start recording';
            showToast('🎬 Voice capture complete!');
        };

        micBtn.addEventListener('click', () => {
            isRecording ? recognition.stop() : recognition.start();
        });

    } else {
        if (statusText) statusText.innerText = '⚠️ Web Speech API not supported in this browser. Try Chrome.';
        micBtn.style.opacity = '0.5';
        micBtn.style.cursor  = 'not-allowed';
    }
}
