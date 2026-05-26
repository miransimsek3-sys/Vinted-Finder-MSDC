import { useState, useMemo, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bwjehefepaqfkplwboud.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3amVoZWZlcGFxZmtwbHdib3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzUzODUsImV4cCI6MjA5NTM1MTM4NX0.LvCu_gLq-hez326Z3OMw4q6w95DnHtmAWv3l7hoAwgk";

async function supabaseFetch(path, options = {}, token = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function supabaseAuth(action, email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${action}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.error || data.error_description) throw new Error(data.error_description || data.error?.message || "Fehler");
  return data;
}

// ─── DATA ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "🔥 Alles" },
  { id: "accessories", label: "👜 Accessoires" },
  { id: "streetwear", label: "🧢 Streetwear" },
  { id: "shoes", label: "👟 Schuhe" },
  { id: "vintage", label: "🕶️ Vintage" },
];

const TREND_DATA = {
  all: [
    { name: "Cardholder", brand: "Goyard", hype_score: 98, avg_price_eur: 180, sell_speed: "extrem schnell", trend_reason: "Ikonisches Luxus-Accessoire viral bei Gen Z auf TikTok & Instagram.", tip: "Echtheitsnachweis im Bild zeigen – erhöht Preis deutlich.", emoji: "👜", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80" },
    { name: "Cargo Pants", brand: "Carhartt", hype_score: 92, avg_price_eur: 55, sell_speed: "extrem schnell", trend_reason: "Workwear-Ästhetik dominiert Streetwear 2025 komplett.", tip: "M und L verkaufen sich am schnellsten.", emoji: "👖", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
    { name: "Air Force 1", brand: "Nike", hype_score: 90, avg_price_eur: 65, sell_speed: "sehr schnell", trend_reason: "Zeitloser Klassiker der nie aus dem Trend kommt.", tip: "Weiß/Weiß ist der meistgesuchte Colorway.", emoji: "👟", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { name: "Bucket Hat", brand: "New Era", hype_score: 85, avg_price_eur: 22, sell_speed: "sehr schnell", trend_reason: "90s Revival trifft auf aktuelle Hip-Hop Kultur.", tip: "Mit Outfit-Foto stylen – erhöht Klicks enorm.", emoji: "🪣", img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&q=80" },
    { name: "Crossbody Bag", brand: "Supreme", hype_score: 88, avg_price_eur: 95, sell_speed: "sehr schnell", trend_reason: "Supreme Drops werden auf Vinted extrem schnell weiterverkauft.", tip: "Box Logo sichtbar im Titelbild.", emoji: "🎒", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
    { name: "Fleece Pullover", brand: "Patagonia", hype_score: 83, avg_price_eur: 70, sell_speed: "schnell", trend_reason: "Outdoor-Chic ist 2025 mainstream – Patagonia ist Must-Have.", tip: "Zustand ehrlich beschreiben.", emoji: "🧥", img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80" },
    { name: "Vintage T-Shirt", brand: "Vintage USA", hype_score: 87, avg_price_eur: 35, sell_speed: "sehr schnell", trend_reason: "Echte Vintage USA-Prints aus den 90s werden heiß gehandelt.", tip: "Made in USA Tag im Foto zeigen.", emoji: "👕", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80" },
    { name: "Mini Shoulder Bag", brand: "Coach", hype_score: 80, avg_price_eur: 85, sell_speed: "schnell", trend_reason: "Affordable Luxury – Coach ist die go-to Alternative bei Gen Z.", tip: "Innenfotos und Seriennummer zeigen.", emoji: "👛", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80" },
  ],
  accessories: [
    { name: "Cardholder", brand: "Goyard", hype_score: 98, avg_price_eur: 180, sell_speed: "extrem schnell", trend_reason: "Ikonisches Luxus-Accessoire viral bei Gen Z.", tip: "Echtheitsnachweis im Bild zeigen.", emoji: "👜", img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80" },
    { name: "Canvas Tote", brand: "Goyard", hype_score: 94, avg_price_eur: 320, sell_speed: "extrem schnell", trend_reason: "Goyard St. Louis ist das meistgesuchte Tote auf Vinted.", tip: "Beide Seiten + Bodenstempel fotografieren.", emoji: "🛍️", img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80" },
    { name: "GG Belt", brand: "Gucci", hype_score: 86, avg_price_eur: 150, sell_speed: "sehr schnell", trend_reason: "Gucci Belt Statussymbol auf Vinted.", tip: "Maße und Schnallengröße angeben.", emoji: "👔", img: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80" },
    { name: "Bag Charm", brand: "Louis Vuitton", hype_score: 88, avg_price_eur: 95, sell_speed: "sehr schnell", trend_reason: "LV Bag Charms günstigerer Einstieg in die Marke.", tip: "An Tasche hängend fotografieren.", emoji: "🔑", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80" },
  ],
  streetwear: [
    { name: "Cargo Pants", brand: "Carhartt", hype_score: 92, avg_price_eur: 55, sell_speed: "extrem schnell", trend_reason: "Workwear dominiert Streetwear 2025.", tip: "M und L verkaufen sich am schnellsten.", emoji: "👖", img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80" },
    { name: "Hoodie", brand: "Palace", hype_score: 89, avg_price_eur: 80, sell_speed: "sehr schnell", trend_reason: "Palace ist das angesagteste Skate-Label nach Supreme.", tip: "Season und Kollektion im Titel.", emoji: "🧥", img: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80" },
    { name: "Puffer Jacket", brand: "The North Face", hype_score: 91, avg_price_eur: 110, sell_speed: "extrem schnell", trend_reason: "TNF Nuptse meistverkauftes Winterstück auf Vinted.", tip: "Farbfoto bei Tageslicht.", emoji: "🧊", img: "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=400&q=80" },
    { name: "Shorts", brand: "Corteiz", hype_score: 90, avg_price_eur: 60, sell_speed: "sehr schnell", trend_reason: "Corteiz heißestes Underground-Label in Europa.", tip: "Marke groß in den Titel.", emoji: "🩲", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80" },
  ],
  shoes: [
    { name: "Air Force 1", brand: "Nike", hype_score: 90, avg_price_eur: 65, sell_speed: "extrem schnell", trend_reason: "Zeitloser Klassiker der nie aus dem Trend kommt.", tip: "Weiß/Weiß ist der meistgesuchte Colorway.", emoji: "👟", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { name: "Samba OG", brand: "Adidas", hype_score: 96, avg_price_eur: 80, sell_speed: "extrem schnell", trend_reason: "Adidas Samba meistverkaufter Sneaker in Europa 2025.", tip: "Originalbox mitverkaufen – +15-20€.", emoji: "⚽", img: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80" },
    { name: "Jordan 1 Retro", brand: "Jordan", hype_score: 93, avg_price_eur: 140, sell_speed: "extrem schnell", trend_reason: "AJ1 meistgesuchter Basketball-Sneaker auf Vinted.", tip: "Colorway-Name ausschreiben.", emoji: "🐂", img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80" },
    { name: "Gel-Kayano 14", brand: "Asics", hype_score: 87, avg_price_eur: 70, sell_speed: "sehr schnell", trend_reason: "Asics Gel-Serie heißester Sneaker-Trend nach Samba.", tip: "Original-Colorways bringen das Doppelte.", emoji: "🏃", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80" },
  ],
  vintage: [
    { name: "Levi's 501", brand: "Levi's", hype_score: 91, avg_price_eur: 45, sell_speed: "extrem schnell", trend_reason: "Vintage Levi's 501 meistverkauftes Vintage-Stück.", tip: "Innenwaschzettel fotografieren – Jahrgang erhöht Preis.", emoji: "👖", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80" },
    { name: "Band Tee", brand: "Vintage Rock", hype_score: 88, avg_price_eur: 50, sell_speed: "sehr schnell", trend_reason: "Vintage Band-Shirts Statussymbole in der Streetwear-Szene.", tip: "Band-Name und Tour-Jahr im Titel.", emoji: "🎸", img: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&q=80" },
    { name: "Polo Shirt", brand: "Ralph Lauren Vintage", hype_score: 86, avg_price_eur: 30, sell_speed: "sehr schnell", trend_reason: "Vintage Ralph Lauren Polo meistgesuchtes Preppy-Item.", tip: "Pony-Logo groß im Bild.", emoji: "🐎", img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&q=80" },
  ],
};

const ALL_ITEMS = Object.values(TREND_DATA).flat().filter((item, index, self) =>
  index === self.findIndex(t => t.name === item.name && t.brand === item.brand)
);

const getHypeColor = (s) => s >= 90 ? "#ff3b3b" : s >= 75 ? "#ff8c00" : s >= 60 ? "#ffd700" : "#4caf50";
const getSpeedBadge = (speed) => ({
  "extrem schnell": { bg: "#ff3b3b", text: "⚡ Extrem schnell" },
  "sehr schnell": { bg: "#ff8c00", text: "🔥 Sehr schnell" },
  schnell: { bg: "#ffd700", text: "💨 Schnell" },
  mittel: { bg: "#4caf50", text: "📦 Mittel" },
}[speed] || { bg: "#888", text: speed });

const inputStyle = {
  background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10,
  padding: "10px 12px", fontSize: 14, color: "#fff", width: "100%",
  boxSizing: "border-box", outline: "none",
};

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = async () => {
    if (!email || !password) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "login") {
        const data = await supabaseAuth("token?grant_type=password", email, password);
        onLogin({ token: data.access_token, email: data.user?.email, id: data.user?.id });
      } else {
        await supabaseAuth("signup", email, password);
        setSuccess("✅ Konto erstellt! Bitte bestätige deine Email, dann kannst du dich einloggen.");
        setMode("login");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, background: "linear-gradient(90deg,#fff,#aaa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Vinted Trend Finder</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#444" }}>by denizcoban · Köln 🇩🇪</p>
        </div>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", gap: 4, background: "#1a1a1a", borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{ flex: 1, background: mode === m ? "#fff" : "transparent", color: mode === m ? "#000" : "#666", border: "none", borderRadius: 7, padding: "8px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {m === "login" ? "Einloggen" : "Registrieren"}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase" }}>Email</p>
            <input type="email" placeholder="deine@email.de" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555", fontWeight: 600, textTransform: "uppercase" }}>Passwort</p>
            <input type="password" placeholder="Mindestens 6 Zeichen" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} style={inputStyle} />
          </div>

          {error && <div style={{ background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#ff6b6b" }}>{error}</div>}
          {success && <div style={{ background: "#0a1a0a", border: "1px solid #1a4a1a", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#4caf50" }}>{success}</div>}

          <button onClick={handle} disabled={loading || !email || !password} style={{ width: "100%", background: email && password ? "#fff" : "#1a1a1a", color: email && password ? "#000" : "#444", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: email && password ? "pointer" : "default" }}>
            {loading ? "..." : mode === "login" ? "Einloggen →" : "Konto erstellen →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI CHAT ────────────────────────────────────────────────────────────────
function AiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! 👋 Ich bin dein Vinted-Experte. Frag mich alles – Prognosen, Preise, was sich gut verkauft, Tipps für deine Anzeigen. Los geht's!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Du bist ein absoluter Vinted-Experte und Reselling-Profi. Du kennst den deutschen Second-Hand-Markt in- und auswendig. Du gibst konkrete Prognosen, Preisempfehlungen und Verkaufstipps für Vinted.de. Antworte immer auf Deutsch, casual und direkt wie ein Kumpel der Bescheid weiß. Wenn jemand nach einem Produkt fragt, gib immer: Aktueller Trend, empfohlener Verkaufspreis, wie schnell es sich verkauft, und 2-3 konkrete Tipps.`,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(i => i.type === "text" ? i.text : "").join("") || "Fehler.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Fehler: " + e.message }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 2px" }}>💬 KI Vinted-Experte</h2>
        <p style={{ color: "#555", fontSize: 12, margin: 0 }}>Frag nach Prognosen, Preisen & Tipps</p>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {["Was verkauft sich gerade am besten?", "Lohnt sich Nike Tech Fleece?", "Prognose für Adidas Samba?"].map(q => (
          <button key={q} onClick={() => setInput(q)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "5px 10px", fontSize: 11, color: "#888", cursor: "pointer" }}>{q}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.role === "assistant" && <span style={{ fontSize: 20, marginRight: 8, alignSelf: "flex-end" }}>🤖</span>}
            <div style={{ maxWidth: "80%", background: m.role === "user" ? "#09B1BA" : "#1a1a1a", border: m.role === "assistant" ? "1px solid #2a2a2a" : "none", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: 13, color: "#fff", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>🤖</span><div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", color: "#555", fontSize: 13 }}>Analysiere... ✨</div></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="z.B. Lohnt sich ein Goyard Cardholder?" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={send} disabled={loading || !input.trim()} style={{ background: input.trim() ? "#09B1BA" : "#1a1a1a", color: input.trim() ? "#fff" : "#444", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 16, cursor: input.trim() ? "pointer" : "default" }}>➤</button>
      </div>
    </div>
  );
}

// ─── WEB SEARCH ─────────────────────────────────────────────────────────────
function WebSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim() || loading) return;
    setLoading(true); setResults(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `Du bist ein Vinted-Reselling-Experte. Antworte NUR als JSON ohne Backticks: {"trend":"steigend|stabil|fallend","hype_score":0-100,"avg_price_vinted":"X-Y€","sell_speed":"extrem schnell|sehr schnell|schnell|mittel","summary":"2-3 Sätze auf Deutsch","tips":["Tipp1","Tipp2","Tipp3"],"vinted_url":"https://www.vinted.de/catalog?search_text=PRODUKT"}`,
          messages: [{ role: "user", content: `Analysiere für Vinted.de: "${query}"` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(i => i.type === "text" ? i.text : "").join("") || "";
      try { setResults(JSON.parse(text.replace(/```json|```/g, "").trim())); }
      catch { setResults({ summary: text, trend: "unbekannt", tips: [] }); }
    } catch (e) { setResults({ summary: "Fehler: " + e.message, trend: "unbekannt", tips: [] }); }
    setLoading(false);
  };

  const trendColor = { steigend: "#4caf50", stabil: "#ff8c00", fallend: "#ff3b3b" };

  return (
    <div>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>🔍 Live Marktsuche</h2>
      <p style={{ color: "#555", fontSize: 12, margin: "0 0 14px" }}>KI sucht live im Web nach Vinted-Marktdaten</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder="z.B. Supreme Box Logo, Levi's 501..." style={{ ...inputStyle, flex: 1 }} />
        <button onClick={search} disabled={loading || !query.trim()} style={{ background: query.trim() ? "#fff" : "#1a1a1a", color: query.trim() ? "#000" : "#444", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: query.trim() ? "pointer" : "default", whiteSpace: "nowrap" }}>{loading ? "..." : "Suchen"}</button>
      </div>
      {loading && <div style={{ textAlign: "center", padding: "40px", background: "#111", borderRadius: 14, border: "1px solid #1e1e1e" }}><div style={{ width: 36, height: 36, border: "3px solid #222", borderTop: "3px solid #09B1BA", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} /><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><p style={{ color: "#555", fontSize: 13 }}>Suche live im Web...</p></div>}
      {results && !loading && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[{ label: "TREND", value: results.trend || "–", color: trendColor[results.trend] || "#888", icon: results.trend === "steigend" ? "📈" : results.trend === "fallend" ? "📉" : "➡️" }, { label: "HYPE SCORE", value: (results.hype_score || "–") + (results.hype_score ? "/100" : ""), color: getHypeColor(results.hype_score || 0), icon: "🔥" }, { label: "Ø PREIS", value: results.avg_price_vinted || "–", color: "#fff", icon: "💶" }, { label: "TEMPO", value: results.sell_speed || "–", color: "#ff8c00", icon: "⚡" }].map(s => (
              <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px" }}>
                <p style={{ margin: "0 0 2px", fontSize: 9, color: "#555", fontWeight: 700 }}>{s.icon} {s.label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          {results.summary && <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px", marginBottom: 10 }}><p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", fontWeight: 700 }}>📊 ANALYSE</p><p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{results.summary}</p></div>}
          {results.tips?.length > 0 && <div style={{ background: "#0f1a0f", border: "1px solid #1a3a1a", borderRadius: 12, padding: "14px", marginBottom: 10 }}><p style={{ margin: "0 0 8px", fontSize: 10, color: "#3a7a3a", fontWeight: 700 }}>💡 TIPPS</p>{results.tips.map((t, i) => <p key={i} style={{ margin: "0 0 6px", fontSize: 13, color: "#5a9e5a" }}>• {t}</p>)}</div>}
          {results.vinted_url && <a href={results.vinted_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#09B1BA", color: "#fff", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>🛍️ Auf Vinted suchen →</a>}
        </div>
      )}
      {!results && !loading && <div style={{ textAlign: "center", padding: "40px 20px", background: "#111", borderRadius: 14, border: "1px solid #1e1e1e" }}><span style={{ fontSize: 48 }}>🔍</span><p style={{ color: "#555", fontSize: 13, marginTop: 12 }}>Gib ein Produkt oder eine Marke ein</p></div>}
    </div>
  );
}

// ─── PROFIT CALCULATOR ───────────────────────────────────────────────────────
function GewinnRechner() {
  const [bp, setBp] = useState(""); const [sp, setSp] = useState("");
  const [qty, setQty] = useState("1"); const [sh, setSh] = useState("");
  const buy = parseFloat(bp)||0, sell = parseFloat(sp)||0, q = parseInt(qty)||1, ship = parseFloat(sh)||0;
  const perItem = sell-buy-ship, total = perItem*q;
  const margin = buy>0 ? ((perItem/buy)*100).toFixed(0) : null;
  const pc = total>0?"#4caf50":total<0?"#ff3b3b":"#888";
  return (
    <div>
      <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, margin:"0 0 4px" }}>💰 Gewinnrechner</h2>
      <p style={{ color:"#555", fontSize:13, margin:"0 0 20px" }}>Berechne deinen Gewinn für jede Bestellung</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        {[{label:"Einkaufspreis €",val:bp,set:setBp,ph:"z.B. 6"},{label:"Verkaufspreis €",val:sp,set:setSp,ph:"z.B. 25"},{label:"Anzahl Stück",val:qty,set:setQty,ph:"1"},{label:"Versand € gesamt",val:sh,set:setSh,ph:"0"}].map(f=>(
          <div key={f.label}><p style={{ margin:"0 0 6px", fontSize:11, color:"#555", fontWeight:600, textTransform:"uppercase" }}>{f.label}</p><input type="number" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} style={inputStyle}/></div>
        ))}
      </div>
      {buy>0&&sell>0?(<div style={{ background:total>0?"#0a1a0a":"#1a0a0a", border:"1px solid "+(total>0?"#1a4a1a":"#4a1a1a"), borderRadius:14, padding:"18px" }}>
        {[{label:"Einkauf gesamt",val:(buy*q).toFixed(2)+"€",color:"#ff6b6b"},{label:"Gewinn pro Stück",val:(perItem>=0?"+":"")+perItem.toFixed(2)+"€",color:pc},{label:"Gesamtgewinn",val:(total>=0?"+":"")+total.toFixed(2)+"€",color:pc,big:true},...(margin!==null?[{label:"Rendite",val:margin+"%",color:pc}]:[])].map(s=>(
          <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}><span style={{ fontSize:13, color:"#666" }}>{s.label}</span><span style={{ fontSize:s.big?24:15, fontWeight:800, color:s.color }}>{s.val}</span></div>
        ))}
        <div style={{ background:pc+"20", borderRadius:10, padding:"10px", textAlign:"center" }}><span style={{ fontSize:14, color:pc, fontWeight:700 }}>{margin>200?"🔥 Krasse Marge!":margin>100?"✅ Sehr gute Marge!":margin>50?"👍 Solide Marge":margin>0?"⚠️ Niedrige Marge":"❌ Verlust!"}</span></div>
      </div>):(<div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:14, padding:"30px", textAlign:"center" }}><span style={{ fontSize:40 }}>🧮</span><p style={{ color:"#555", fontSize:13, marginTop:10 }}>Einkaufs- und Verkaufspreis eingeben</p></div>)}
    </div>
  );
}

// ─── ITEM MODAL ──────────────────────────────────────────────────────────────
function ItemModal({ item, onClose, onAddInventory }) {
  const speed = getSpeedBadge(item.sell_speed);
  const [tab, setTab] = useState(0);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState(String(item.avg_price_eur));
  const [qty, setQty] = useState("1");
  const [shipping, setShipping] = useState("");
  const [added, setAdded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);
  const buy=parseFloat(buyPrice)||0, sell=parseFloat(sellPrice)||0, q=parseInt(qty)||1, ship=parseFloat(shipping)||0;
  const profitPerItem=sell-buy-ship, totalProfit=profitPerItem*q;
  const margin=buy>0?((profitPerItem/buy)*100).toFixed(0):null;
  const pc=totalProfit>0?"#4caf50":totalProfit<0?"#ff3b3b":"#888";

  const generateAi = async () => {
    setAiLoading(true); setAiResult("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Schreib eine Vinted-Anzeige auf Deutsch für: ${item.brand} ${item.name}, Preis: ${sellPrice||item.avg_price_eur}€, Zustand: Sehr gut.\nFormat:\nTITEL: [max 60 Zeichen]\nBESCHREIBUNG: [3 Sätze casual]\nHASHTAGS: [5 Hashtags]\n\nNur den Text.`}]}),
      });
      const data = await res.json();
      setAiResult(data.content?.map(i=>i.type==="text"?i.text:"").join("")||"Fehler.");
    } catch(e){setAiResult("Fehler: "+e.message);}
    setAiLoading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#0a0a0a", zIndex:999, display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#111", borderBottom:"1px solid #1e1e1e", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={onClose} style={{ background:"#1e1e1e", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>← Zurück</button>
        <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{item.brand} {item.name}</span>
      </div>
      <div style={{ flex:1, overflowY:"auto" }}>
        <img src={item.img} alt={item.name} style={{ width:"100%", height:200, objectFit:"cover" }} onError={e=>{e.target.style.display="none";}}/>
        <div style={{ padding:"16px 20px" }}>
          <p style={{ margin:"0 0 2px", fontSize:10, color:"#555", fontWeight:700, textTransform:"uppercase" }}>{item.brand}</p>
          <h2 style={{ margin:"0 0 14px", fontSize:22, fontWeight:800, color:"#fff" }}>{item.name}</h2>
          <div style={{ display:"flex", gap:6, marginBottom:16, background:"#1a1a1a", borderRadius:12, padding:4 }}>
            {["📊 Info","💰 Rechner","🤖 KI Anzeige"].map((t,i)=>(
              <button key={i} onClick={()=>setTab(i)} style={{ flex:1, background:tab===i?"#fff":"transparent", color:tab===i?"#000":"#666", border:"none", borderRadius:9, padding:"8px 4px", fontSize:11, fontWeight:700, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
          {tab===0&&(<>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[{label:"HYPE",value:item.hype_score+"/100",color:getHypeColor(item.hype_score)},{label:"Ø PREIS",value:item.avg_price_eur+"€",color:"#fff"},{label:"SPEED",value:item.sell_speed,color:speed.bg}].map(s=>(
                <div key={s.label} style={{ background:"#1a1a1a", borderRadius:10, padding:"10px 8px", textAlign:"center" }}><p style={{ margin:"0 0 3px", fontSize:9, color:"#555", fontWeight:700 }}>{s.label}</p><p style={{ margin:0, fontSize:12, fontWeight:800, color:s.color }}>{s.value}</p></div>
              ))}
            </div>
            <div style={{ background:"#161616", border:"1px solid #222", borderRadius:12, padding:"12px 14px", marginBottom:10 }}><p style={{ margin:"0 0 4px", fontSize:10, color:"#555", fontWeight:700, textTransform:"uppercase" }}>📈 Warum im Hype</p><p style={{ margin:0, fontSize:13, color:"#ccc", lineHeight:1.5 }}>{item.trend_reason}</p></div>
            <div style={{ background:"#0f1a0f", border:"1px solid #1a2e1a", borderRadius:12, padding:"12px 14px", marginBottom:14 }}><p style={{ margin:"0 0 4px", fontSize:10, color:"#3a7a3a", fontWeight:700, textTransform:"uppercase" }}>💡 Vinted Tipp</p><p style={{ margin:0, fontSize:13, color:"#5a9e5a", lineHeight:1.5 }}>{item.tip}</p></div>
            <a href={`https://www.vinted.de/catalog?search_text=${encodeURIComponent(item.brand+" "+item.name)}&order=newest_first`} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#09B1BA", color:"#fff", borderRadius:12, padding:"14px", fontSize:15, fontWeight:700, textDecoration:"none" }}>🛍️ Jetzt auf Vinted suchen →</a>
          </>)}
          {tab===1&&(<>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              {[{label:"Einkaufspreis €",val:buyPrice,set:setBuyPrice,ph:"z.B. 6"},{label:"Verkaufspreis €",val:sellPrice,set:setSellPrice,ph:"z.B. 25"},{label:"Anzahl",val:qty,set:setQty,ph:"1"},{label:"Versand €",val:shipping,set:setShipping,ph:"0"}].map(f=>(
                <div key={f.label}><p style={{ margin:"0 0 5px", fontSize:10, color:"#555", fontWeight:600, textTransform:"uppercase" }}>{f.label}</p><input type="number" placeholder={f.ph} value={f.val} onChange={e=>f.set(e.target.value)} style={inputStyle}/></div>
              ))}
            </div>
            {buy>0&&sell>0&&(<div style={{ background:totalProfit>0?"#0a1a0a":"#1a0a0a", border:"1px solid "+(totalProfit>0?"#1a3a1a":"#3a1a1a"), borderRadius:12, padding:"14px", marginBottom:14 }}>
              {[{label:"Gewinn pro Stück",val:(profitPerItem>=0?"+":"")+profitPerItem.toFixed(2)+"€"},{label:`Gesamtgewinn (${q}x)`,val:(totalProfit>=0?"+":"")+totalProfit.toFixed(2)+"€",big:true},...(margin!==null?[{label:"Rendite",val:margin+"%"}]:[])].map(s=>(
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontSize:12, color:"#555" }}>{s.label}</span><span style={{ fontSize:s.big?20:14, fontWeight:800, color:pc }}>{s.val}</span></div>
              ))}
            </div>)}
            <button onClick={()=>{if(!buyPrice)return;onAddInventory(item,buyPrice,qty,sellPrice);setAdded(true);setTimeout(()=>setAdded(false),2000);}} disabled={!buyPrice} style={{ width:"100%", background:added?"#4caf50":buyPrice?"#fff":"#1a1a1a", color:added?"#fff":buyPrice?"#000":"#444", border:"none", borderRadius:12, padding:"14px", fontSize:14, fontWeight:700, cursor:buyPrice?"pointer":"default" }}>
              {added?"✅ Zum Lager hinzugefügt!":"📦 Zum Lager hinzufügen"}
            </button>
          </>)}
          {tab===2&&(<>
            <div style={{ marginBottom:12 }}><p style={{ margin:"0 0 5px", fontSize:10, color:"#555", fontWeight:600, textTransform:"uppercase" }}>Verkaufspreis €</p><input type="number" placeholder={String(item.avg_price_eur)} value={sellPrice} onChange={e=>setSellPrice(e.target.value)} style={inputStyle}/></div>
            <button onClick={generateAi} style={{ width:"100%", background:"linear-gradient(135deg,#6c63ff,#ff6b9d)", color:"#fff", border:"none", borderRadius:12, padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:14 }}>{aiLoading?"✨ Generiere...":"🤖 KI Anzeige generieren"}</button>
            {aiLoading&&<div style={{ textAlign:"center", padding:"20px" }}><div style={{ width:34, height:34, border:"3px solid #222", borderTop:"3px solid #6c63ff", borderRadius:"50%", margin:"0 auto 10px", animation:"spin 0.8s linear infinite" }}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><p style={{ color:"#555", fontSize:13 }}>KI schreibt...</p></div>}
            {aiResult&&!aiLoading&&(<div style={{ background:"#0d0d1a", border:"1px solid #2a2a4a", borderRadius:12, padding:"16px" }}><pre style={{ margin:0, fontSize:13, color:"#ddd", lineHeight:1.6, whiteSpace:"pre-wrap", fontFamily:"inherit" }}>{aiResult}</pre><button onClick={()=>{navigator.clipboard?.writeText(aiResult);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{ marginTop:12, background:copied?"#4caf50":"#1a1a2e", color:copied?"#fff":"#6c63ff", border:"1px solid #2a2a4a", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%" }}>{copied?"✅ Kopiert!":"📋 Kopieren"}</button></div>)}
          </>)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
const TABS = ["🔥 Trends","🔍 Suche","💬 KI Chat","💰 Rechner","📦 Lager","📊 Dashboard"];

export default function VintedTrendFinder() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabaseFetch(`inventory?user_id=eq.${user.id}&order=created_at.desc`, {}, user.token)
      .then(data => {
        setInventory(data.map(r => ({ id: r.id, name: r.name, brand: r.brand, emoji: r.emoji, buyPrice: r.buy_price, sellPrice: r.sell_price, qty: r.qty, sold: r.sold, addedAt: r.added_at })));
        setDbReady(true);
      }).catch(() => setDbReady(false));
  }, [user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_ITEMS.filter(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
  }, [searchQuery]);

  const displayItems = searchQuery.trim() ? searchResults : activeCategory ? TREND_DATA[activeCategory] : [];

  const addToInventory = async (item, buyPrice, qty, sellPrice) => {
    const newItem = { name: item.name, brand: item.brand, emoji: item.emoji, buy_price: parseFloat(buyPrice), sell_price: parseFloat(sellPrice)||item.avg_price_eur, qty: parseInt(qty), sold: 0, added_at: new Date().toLocaleDateString("de-DE"), user_id: user?.id };
    try {
      const [saved] = await supabaseFetch("inventory", { method:"POST", body:JSON.stringify(newItem) }, user?.token);
      setInventory(prev => [{ id:saved.id, name:saved.name, brand:saved.brand, emoji:saved.emoji, buyPrice:saved.buy_price, sellPrice:saved.sell_price, qty:saved.qty, sold:saved.sold, addedAt:saved.added_at }, ...prev]);
    } catch { setInventory(prev => [{ id:Date.now(), ...newItem, buyPrice:newItem.buy_price, sellPrice:newItem.sell_price, addedAt:newItem.added_at }, ...prev]); }
  };

  const markSold = async (id) => {
    const item = inventory.find(i=>i.id===id);
    if (!item||item.sold>=item.qty) return;
    const newSold = item.sold+1;
    try { await supabaseFetch(`inventory?id=eq.${id}`, { method:"PATCH", body:JSON.stringify({sold:newSold}) }, user?.token); } catch {}
    setInventory(prev=>prev.map(i=>i.id===id?{...i,sold:newSold}:i));
  };

  const removeItem = async (id) => {
    try { await supabaseFetch(`inventory?id=eq.${id}`, { method:"DELETE" }, user?.token); } catch {}
    setInventory(prev=>prev.filter(i=>i.id!==id));
  };

  const stats = useMemo(()=>({
    invested: inventory.reduce((s,i)=>s+i.buyPrice*i.qty,0),
    revenue: inventory.reduce((s,i)=>s+i.sellPrice*i.sold,0),
    profit: inventory.reduce((s,i)=>s+(i.sellPrice-i.buyPrice)*i.sold,0),
    unsold: inventory.reduce((s,i)=>s+(i.qty-i.sold),0),
  }),[inventory]);

  if (!user) return <AuthScreen onLogin={setUser} />;

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#fff" }}>
      <div style={{ background:"#111", borderBottom:"1px solid #1e1e1e", padding:"12px 16px 0", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:640, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>🔥</span>
              <div>
                <h1 style={{ margin:0, fontSize:15, fontWeight:800, background:"linear-gradient(90deg,#fff,#aaa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Vinted Trend Finder</h1>
                <p style={{ margin:0, fontSize:9, color:"#444" }}>👤 {user.email}</p>
              </div>
            </div>
            <button onClick={()=>setUser(null)} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"5px 10px", color:"#555", fontSize:11, cursor:"pointer" }}>Logout</button>
          </div>
          <div style={{ display:"flex", overflowX:"auto" }}>
            {TABS.map((tab,i)=>(
              <button key={i} onClick={()=>setActiveTab(i)} style={{ flexShrink:0, background:"none", border:"none", borderBottom:activeTab===i?"2px solid #fff":"2px solid transparent", color:activeTab===i?"#fff":"#555", padding:"8px 10px", fontSize:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"16px" }}>
        {activeTab===0&&(<>
          <div style={{ position:"relative", marginBottom:12 }}>
            <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#555" }}>🔍</span>
            <input type="text" placeholder="Schnellsuche z.B. Samba, Goyard..." value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);setActiveCategory(null);}} style={{ ...inputStyle, paddingLeft:36, paddingRight:searchQuery?36:12 }}/>
            {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:16 }}>✕</button>}
          </div>
          {!searchQuery&&(<div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
            {CATEGORIES.map(cat=>(<button key={cat.id} onClick={()=>setActiveCategory(cat.id)} style={{ background:activeCategory===cat.id?"#fff":"#1a1a1a", color:activeCategory===cat.id?"#000":"#888", border:activeCategory===cat.id?"none":"1px solid #222", borderRadius:20, padding:"6px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{cat.label}</button>))}
          </div>)}
          {!activeCategory&&!searchQuery&&(<div style={{ textAlign:"center", padding:"40px 20px" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🛍️</div>
            <h2 style={{ color:"#fff", fontSize:17, fontWeight:700, margin:"0 0 8px" }}>Was läuft auf Vinted?</h2>
            <p style={{ color:"#555", fontSize:13, margin:"0 0 20px" }}>Kategorie wählen oder Artikel suchen</p>
            <button onClick={()=>setActiveCategory("all")} style={{ background:"#fff", color:"#000", border:"none", borderRadius:10, padding:"11px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>🔥 Alle Trends</button>
          </div>)}
          {searchQuery&&searchResults.length===0&&(<div style={{ textAlign:"center", padding:"24px 0" }}>
            <p style={{ color:"#555", fontSize:13, marginBottom:12 }}>Nicht in der Datenbank – live suchen:</p>
            <button onClick={()=>{setActiveTab(1);}} style={{ background:"#09B1BA", color:"#fff", border:"none", borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>🔍 Live Marktsuche →</button>
          </div>)}
          {displayItems.map((item,i)=>{
            const speed=getSpeedBadge(item.sell_speed);
            return (<div key={i} onClick={()=>setSelectedItem(item)} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:14, marginBottom:10, overflow:"hidden", cursor:"pointer", display:"flex" }}>
              <div style={{ width:90, flexShrink:0, position:"relative" }}>
                <img src={item.img} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", minHeight:100 }} onError={e=>{e.target.style.display="none";}}/>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,transparent 60%,#111)" }}/>
              </div>
              <div style={{ flex:1, padding:"12px 12px 12px 8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div><p style={{ margin:"0 0 1px", fontSize:9, color:"#555", fontWeight:700, textTransform:"uppercase" }}>{item.brand}</p><h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#fff" }}>{item.name}</h3></div>
                  <span style={{ fontSize:9, color:"#333", fontWeight:800 }}>#{i+1}</span>
                </div>
                <div style={{ marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}><span style={{ fontSize:9, color:"#444", fontWeight:600 }}>HYPE</span><span style={{ fontSize:10, fontWeight:800, color:getHypeColor(item.hype_score) }}>{item.hype_score}/100</span></div>
                  <div style={{ background:"#1e1e1e", borderRadius:3, height:3 }}><div style={{ height:3, borderRadius:3, width:item.hype_score+"%", background:getHypeColor(item.hype_score) }}/></div>
                </div>
                <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ background:speed.bg+"22", color:speed.bg, border:"1px solid "+speed.bg+"44", borderRadius:20, padding:"2px 7px", fontSize:9, fontWeight:600 }}>{speed.text}</span>
                  <span style={{ background:"#1a1a1a", color:"#777", border:"1px solid #222", borderRadius:20, padding:"2px 7px", fontSize:9, fontWeight:600 }}>~{item.avg_price_eur}€</span>
                  <span style={{ marginLeft:"auto", fontSize:9, color:"#09B1BA", fontWeight:700 }}>Details →</span>
                </div>
              </div>
            </div>);
          })}
        </>)}
        {activeTab===1&&<WebSearch/>}
        {activeTab===2&&<AiChat/>}
        {activeTab===3&&<GewinnRechner/>}
        {activeTab===4&&(<div>
          <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, margin:"0 0 4px" }}>📦 Lagerbestand</h2>
          <p style={{ color:"#555", fontSize:13, margin:"0 0 16px" }}>{dbReady?"✅ Gespeichert in Supabase":"⚠️ Nur lokal gespeichert"}</p>
          {inventory.length===0?(<div style={{ textAlign:"center", padding:"40px 20px", background:"#111", borderRadius:14, border:"1px solid #1e1e1e" }}><span style={{ fontSize:48 }}>📦</span><p style={{ color:"#555", fontSize:14, marginTop:12 }}>Noch nichts im Lager</p></div>):inventory.map(item=>{
            const remaining=item.qty-item.sold, profit=(item.sellPrice-item.buyPrice)*item.sold;
            return (<div key={item.id} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:14, padding:"14px", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:28 }}>{item.emoji}</span>
                  <div><p style={{ margin:"0 0 1px", fontSize:10, color:"#555", fontWeight:700, textTransform:"uppercase" }}>{item.brand}</p><p style={{ margin:0, fontSize:14, fontWeight:700, color:"#fff" }}>{item.name}</p><p style={{ margin:0, fontSize:10, color:"#444" }}>{item.addedAt}</p></div>
                </div>
                <button onClick={()=>removeItem(item.id)} style={{ background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:18 }}>🗑️</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                {[{label:"Einkauf",val:item.buyPrice+"€"},{label:"Verkauf",val:item.sellPrice+"€"},{label:"Gesamt",val:item.qty+"x"},{label:"Im Lager",val:remaining+"x",color:remaining>0?"#ff8c00":"#4caf50"}].map(s=>(
                  <div key={s.label} style={{ background:"#1a1a1a", borderRadius:8, padding:"8px", textAlign:"center" }}><p style={{ margin:"0 0 2px", fontSize:9, color:"#555", fontWeight:600 }}>{s.label}</p><p style={{ margin:0, fontSize:12, fontWeight:800, color:s.color||"#fff" }}>{s.val}</p></div>
                ))}
              </div>
              {profit>0&&(<div style={{ background:"#0a1a0a", borderRadius:8, padding:"8px 12px", marginBottom:10, display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:12, color:"#3a7a3a" }}>Gewinn bisher</span><span style={{ fontSize:14, fontWeight:800, color:"#4caf50" }}>+{profit.toFixed(2)}€</span></div>)}
              <button onClick={()=>markSold(item.id)} disabled={remaining===0} style={{ width:"100%", background:remaining>0?"#4caf50":"#1a1a1a", color:remaining>0?"#fff":"#444", border:"none", borderRadius:10, padding:"10px", fontSize:13, fontWeight:700, cursor:remaining>0?"pointer":"default" }}>{remaining===0?"✅ Alles verkauft":"✅ 1 verkauft"}</button>
            </div>);
          })}
        </div>)}
        {activeTab===5&&(<div>
          <h2 style={{ color:"#fff", fontSize:18, fontWeight:800, margin:"0 0 4px" }}>📊 Dashboard</h2>
          <p style={{ color:"#555", fontSize:13, margin:"0 0 16px" }}>Deine Zahlen auf einen Blick</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            {[{label:"Investiert",val:stats.invested.toFixed(2)+"€",color:"#ff6b6b",icon:"💸"},{label:"Umsatz",val:stats.revenue.toFixed(2)+"€",color:"#09B1BA",icon:"📈"},{label:"Gewinn",val:"+"+stats.profit.toFixed(2)+"€",color:"#4caf50",icon:"💰"},{label:"Im Lager",val:stats.unsold+" Stück",color:"#ff8c00",icon:"📦"}].map(s=>(
              <div key={s.label} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:14, padding:"16px" }}><p style={{ margin:"0 0 4px", fontSize:20 }}>{s.icon}</p><p style={{ margin:"0 0 2px", fontSize:10, color:"#555", fontWeight:600, textTransform:"uppercase" }}>{s.label}</p><p style={{ margin:0, fontSize:20, fontWeight:800, color:s.color }}>{s.val}</p></div>
            ))}
          </div>
          {inventory.length>0&&(<div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:14, padding:"16px" }}>
            <p style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:"#fff" }}>🏆 Top Artikel</p>
            {[...inventory].sort((a,b)=>(b.sellPrice-b.buyPrice)*b.sold-(a.sellPrice-a.buyPrice)*a.sold).slice(0,5).map(item=>(
              <div key={item.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}><span style={{ fontSize:20 }}>{item.emoji}</span><div><p style={{ margin:0, fontSize:13, fontWeight:600, color:"#fff" }}>{item.name}</p><p style={{ margin:0, fontSize:10, color:"#555" }}>{item.sold}/{item.qty} verkauft</p></div></div>
                <span style={{ fontSize:14, fontWeight:800, color:"#4caf50" }}>+{((item.sellPrice-item.buyPrice)*item.sold).toFixed(2)}€</span>
              </div>
            ))}
          </div>)}
        </div>)}
      </div>
      {selectedItem&&<ItemModal item={selectedItem} onClose={()=>setSelectedItem(null)} onAddInventory={addToInventory}/>}
    </div>
  );
}
