import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PinkFlower,
  YellowFlower,
  TealFlower,
  FernBranch,
  Sparkle,
  SmallBranch,
} from "../components/FloralDecor";
import { apiFetch } from "../../lib/api";

const MOODS = [
  { key: "joy",      label: "Joy",      color: "#F5C518", bg: "rgba(245,197,24,0.1)",   text: "#7A5800" },
  { key: "surprise", label: "Surprise", color: "#F07830", bg: "rgba(240,120,48,0.1)",   text: "#7A3A00" },
  { key: "neutral",  label: "Neutral",  color: "#7DB890", bg: "rgba(125,184,144,0.1)",  text: "#2E5E40" },
  { key: "sadness",  label: "Sadness",  color: "#4466CC", bg: "rgba(68,102,204,0.1)",   text: "#1E3575" },
  { key: "anger",    label: "Anger",    color: "#E84E3A", bg: "rgba(232,78,58,0.1)",    text: "#8B1A0A" },
  { key: "fear",     label: "Fear",     color: "#9B59B6", bg: "rgba(155,89,182,0.1)",   text: "#4A1A6B" },
  { key: "disgust",  label: "Disgust",  color: "#8FA020", bg: "rgba(143,160,32,0.1)",   text: "#4A5400" },
];

interface JournalEntry {
  id: string;
  entry_text: string;
  dominant_mood: string;
  score_joy: number;
  score_sadness: number;
  score_anger: number;
  score_fear: number;
  score_disgust: number;
  score_neutral: number;
  score_surprise: number;
  created_at: string;
}

export function MoodTracker() {
  const [entry, setEntry] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  useEffect(() => {
    apiFetch("/journal/entries?limit=5")
      .then(setRecentEntries)
      .catch(console.error)
      .finally(() => setLoadingEntries(false));
  }, []);

  const handleAnalyze = async () => {
    if (entry.trim().length < 5) return;
    setAnalyzing(true);
    setResult(null);
    setAnalyzed(false);

    try {
      const data = await apiFetch("/journal/analyze", {
        method: "POST",
        body: JSON.stringify({ entry_text: entry }),
      });

      // data.scores: { anger, disgust, fear, joy, neutral, sadness, surprise } (0.0–1.0)
      // Convert to percentages for the existing UI
      const pctScores: Record<string, number> = {};
      for (const [key, val] of Object.entries(data.scores as Record<string, number>)) {
        pctScores[key] = Math.round((val as number) * 100);
      }

      setResult(pctScores);
      setAnalyzing(false);
      setAnalyzed(true);

      // Refresh recent entries
      const entries = await apiFetch("/journal/entries?limit=5");
      setRecentEntries(entries);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err) {
      console.error("Analysis failed:", err);
      setAnalyzing(false);
    }
  };

  const dominantMood = result
    ? MOODS.find(
        (m) =>
          m.key === Object.entries(result).sort((a, b) => b[1] - a[1])[0][0]
      )
    : null;

  const sortedMoods = result
    ? MOODS.slice().sort((a, b) => (result[b.key] || 0) - (result[a.key] || 0))
    : MOODS;

  // Dynamic date label
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ height: "100%", overflow: "auto", background: "#FFF8ED", position: "relative" }}>
      {/* Top-right decoration */}
      <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "210px", height: "155px" }}>
          <FernBranch size={68} style={{ position: "absolute", top: -5, right: 38, opacity: 0.32, transform: "rotate(-20deg)" }} />
          <PinkFlower size={52} style={{ position: "absolute", top: 18, right: 18, opacity: 0.6 }} />
          <YellowFlower size={36} style={{ position: "absolute", top: 62, right: 76, opacity: 0.52 }} />
          <TealFlower size={28} style={{ position: "absolute", top: 8, right: 92, opacity: 0.42 }} />
          <Sparkle size={15} color="#F5C518" style={{ position: "absolute", top: 48, right: 52 }} />
          <Sparkle size={9} color="#E84E8A" style={{ position: "absolute", top: 28, right: 126 }} />
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "38px 32px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <SmallBranch size={42} style={{ opacity: 0.65 }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "10px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#9B59B6" }}>
              {todayLabel}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "38px", fontWeight: 900, color: "#2D1B4E", lineHeight: 1.1, margin: 0 }}>
            Today's Journal
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#7A6A8A", maxWidth: "420px", lineHeight: 1.6 }}>
            Write freely about your day. The mood analyzer will map what you're feeling across seven emotional dimensions.
          </p>
        </div>

        {/* Notebook textarea */}
        <div
          style={{
            background: "#FFFDF8",
            borderRadius: "18px",
            boxShadow: "0 4px 28px rgba(61,31,114,0.07), 0 1px 4px rgba(61,31,114,0.05)",
            overflow: "hidden",
            border: "1px solid rgba(61,31,114,0.07)",
            marginBottom: "20px",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: "54px", top: 0, bottom: 0, width: "2px", background: "rgba(232,78,138,0.16)", zIndex: 0 }} />
          {[48, 108, 168].map((top) => (
            <div key={top} style={{ position: "absolute", left: "17px", top: `${top}px`, width: "15px", height: "15px", borderRadius: "50%", background: "rgba(61,31,114,0.05)", border: "1px solid rgba(61,31,114,0.09)" }} />
          ))}
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="What's on your mind today? How are you feeling? Write anything — about your morning, a conversation, what made you pause..."
            style={{
              width: "100%",
              minHeight: "190px",
              padding: "26px 26px 26px 72px",
              border: "none",
              outline: "none",
              resize: "vertical",
              background: "transparent",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "15px",
              lineHeight: "32px",
              color: "#2D1B4E",
              backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, rgba(61,31,114,0.065) 31px, rgba(61,31,114,0.065) 32px)",
              position: "relative",
              zIndex: 1,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 26px 8px 72px", background: "rgba(61,31,114,0.025)", borderTop: "1px solid rgba(61,31,114,0.055)" }}>
            <span style={{ fontSize: "11px", color: "#B0A0C0" }}>{entry.length} characters</span>
            <span style={{ fontSize: "11px", color: "#B0A0C0" }}>{entry.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>

        {/* Analyze button */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
          <motion.button
            onClick={handleAnalyze}
            disabled={analyzing || entry.trim().length < 5}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            style={{
              padding: "13px 34px",
              background: entry.trim().length >= 5 ? "linear-gradient(135deg, #3D1F72 0%, #6B3FA0 100%)" : "rgba(61,31,114,0.12)",
              color: entry.trim().length >= 5 ? "#F5C518" : "#9B8AB0",
              border: "none",
              borderRadius: "50px",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: "15px",
              cursor: entry.trim().length >= 5 ? "pointer" : "not-allowed",
              boxShadow: entry.trim().length >= 5 ? "0 6px 18px rgba(61,31,114,0.28)" : "none",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {analyzing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "17px", height: "17px", border: "2px solid rgba(245,197,24,0.3)", borderTopColor: "#F5C518", borderRadius: "50%" }} />
                Analyzing...
              </>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                MuJo This
              </>
            )}
          </motion.button>

          {analyzed && dominantMood && (
            <motion.div
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderRadius: "50px", background: dominantMood.bg, border: `1.5px solid ${dominantMood.color}38` }}
            >
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: dominantMood.color, boxShadow: `0 0 7px ${dominantMood.color}80` }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "13px", color: dominantMood.text }}>
                Primarily {dominantMood.label}
              </span>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {analyzed && result && (
            <motion.div ref={resultsRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} style={{ marginBottom: "36px" }}>
              <div style={{ background: "#FFFDF8", borderRadius: "18px", border: "1px solid rgba(61,31,114,0.07)", boxShadow: "0 4px 28px rgba(61,31,114,0.07)", overflow: "hidden" }}>
                <div style={{ padding: "18px 26px 14px", borderBottom: "1px solid rgba(61,31,114,0.055)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: `${dominantMood?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${dominantMood?.color}38` }}>
                    <div style={{ width: "11px", height: "11px", borderRadius: "50%", background: dominantMood?.color }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "16px", color: "#2D1B4E" }}>Mood Analysis</div>
                    <div style={{ fontSize: "11px", color: "#9B8AB0", marginTop: "1px" }}>Distribution across 7 emotional dimensions</div>
                  </div>
                </div>

                <div style={{ padding: "22px 26px" }}>
                  {sortedMoods.map((mood, i) => {
                    const pct = result[mood.key] || 0;
                    return (
                      <motion.div key={mood.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.065, duration: 0.32 }} style={{ marginBottom: i < sortedMoods.length - 1 ? "12px" : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                          <div style={{ width: "68px", flexShrink: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "12px", color: "#2D1B4E", textAlign: "right" }}>
                            {mood.label}
                          </div>
                          <div style={{ flex: 1, height: "17px", background: `${mood.color}16`, borderRadius: "50px", overflow: "hidden", position: "relative" }}>
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.065 + 0.14, duration: 0.6, ease: "easeOut" }}
                              style={{ height: "100%", background: `linear-gradient(90deg, ${mood.color}BB, ${mood.color})`, borderRadius: "50px", boxShadow: `0 2px 7px ${mood.color}45`, position: "relative" }}
                            >
                              {pct > 18 && (
                                <div style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: "rgba(255,255,255,0.9)" }}>
                                  {pct}%
                                </div>
                              )}
                            </motion.div>
                          </div>
                          <div style={{ width: "34px", flexShrink: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "12px", color: pct > 18 ? mood.color : "#9B8AB0" }}>
                            {pct}%
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "12px", fontWeight: 600, color: "#9B8AB0", letterSpacing: "1px", textTransform: "uppercase" }}>Recent Entries</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
        </div>

        {/* Recent entries — live from DB */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loadingEntries ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#9B8AB0", fontSize: "13px" }}>
              Loading entries...
            </div>
          ) : recentEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#9B8AB0", fontSize: "13px" }}>
              No entries yet. Write your first one above!
            </div>
          ) : (
            recentEntries.map((e) => {
              const domColor = MOODS.find((m) => m.key === e.dominant_mood)?.color ?? "#7DB890";
              const dateStr = new Date(e.created_at).toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric",
              });
              return (
                <motion.div
                  key={e.id}
                  whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(61,31,114,0.1)" }}
                  style={{ background: "#FFFDF8", borderRadius: "14px", border: "1px solid rgba(61,31,114,0.07)", padding: "14px 18px", display: "flex", gap: "14px", alignItems: "flex-start", cursor: "pointer", boxShadow: "0 2px 10px rgba(61,31,114,0.05)", transition: "box-shadow 0.2s" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: `${domColor}16`, border: `2px solid ${domColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: domColor, boxShadow: `0 0 7px ${domColor}55` }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "12px", color: "#9B8AB0", marginBottom: "3px" }}>{dateStr}</div>
                    <p style={{ fontSize: "13px", color: "#4A3A60", margin: 0, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.entry_text}</p>
                  </div>
                  <div style={{ flexShrink: 0, padding: "3px 11px", borderRadius: "50px", background: `${domColor}16`, border: `1.5px solid ${domColor}30`, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "11px", color: domColor, textTransform: "capitalize", alignSelf: "center" }}>
                    {e.dominant_mood}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
