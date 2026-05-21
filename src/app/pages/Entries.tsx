import { useState, useEffect, useCallback } from "react";
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

const PAGE_SIZE = 15;

export function Entries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchEntries = useCallback(
    async (reset: boolean) => {
      const currentOffset = reset ? 0 : offset;
      reset ? setLoading(true) : setLoadingMore(true);

      try {
        const moodParam = selectedMood ? `&mood=${selectedMood}` : "";
        const data: JournalEntry[] = await apiFetch(
          `/journal/entries?limit=${PAGE_SIZE}&offset=${currentOffset}${moodParam}`
        );

        if (reset) {
          setEntries(data);
          setOffset(data.length);
        } else {
          setEntries((prev) => [...prev, ...data]);
          setOffset(currentOffset + data.length);
        }

        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error("Failed to load entries:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMood, offset]
  );

  // Re-fetch from scratch whenever mood filter changes
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchEntries(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMood]);

  const handleLoadMore = () => {
    fetchEntries(false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────
  const startEdit = (e: React.MouseEvent, entry: JournalEntry) => {
    e.stopPropagation();
    setEditingId(entry.id);
    setEditText(entry.entry_text);
    setConfirmDeleteId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (!editText.trim() || editText.trim().length < 5) {
      alert("Entry must be at least 5 characters.");
      return;
    }
    setEditSaving(true);
    try {
      const updated: JournalEntry = await apiFetch(`/journal/entries/${entryId}`, {
        method: "PUT",
        body: JSON.stringify({ entry_text: editText.trim() }),
      });
      setEntries((prev) => prev.map((en) => (en.id === entryId ? updated : en)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const askDelete = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    setConfirmDeleteId(entryId);
    setEditingId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const confirmDelete = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    setDeletingId(entryId);
    try {
      await apiFetch(`/journal/entries/${entryId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((en) => en.id !== entryId));
      if (expandedId === entryId) setExpandedId(null);
      setConfirmDeleteId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // Client-side search filter on top of already-loaded entries
  const displayed = search.trim()
    ? entries.filter((e) =>
        e.entry_text.toLowerCase().includes(search.trim().toLowerCase())
      )
    : entries;

  const totalLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{ height: "100%", overflow: "auto", background: "#FFF8ED", position: "relative" }}>
      {/* Top-right decoration — mirrors MoodTracker */}
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
              {totalLabel}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "38px", fontWeight: 900, color: "#2D1B4E", lineHeight: 1.1, margin: 0 }}>
            Past Entries
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#7A6A8A", maxWidth: "420px", lineHeight: 1.6 }}>
            Browse every journal entry you've written. Filter by mood or search by keyword.
          </p>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: "18px", position: "relative" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9B8AB0" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your entries..."
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              background: "#FFFDF8",
              border: "1.5px solid rgba(61,31,114,0.1)",
              borderRadius: "14px",
              fontFamily: "'Nunito', sans-serif",
              fontSize: "14px",
              color: "#2D1B4E",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 2px 10px rgba(61,31,114,0.05)",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.1)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B8AB0", padding: 0, display: "flex" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Mood filter pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "26px" }}>
          <button
            onClick={() => setSelectedMood(null)}
            style={{
              padding: "6px 14px",
              borderRadius: "50px",
              border: `1.5px solid ${selectedMood === null ? "#3D1F72" : "rgba(61,31,114,0.15)"}`,
              background: selectedMood === null ? "rgba(61,31,114,0.08)" : "transparent",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: "12px",
              color: selectedMood === null ? "#3D1F72" : "#9B8AB0",
              cursor: "pointer",
              transition: "all 0.18s",
            }}
          >
            All Moods
          </button>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMood(selectedMood === m.key ? null : m.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "50px",
                border: `1.5px solid ${selectedMood === m.key ? m.color : `${m.color}40`}`,
                background: selectedMood === m.key ? m.bg : "transparent",
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "12px",
                color: selectedMood === m.key ? m.text : "#9B8AB0",
                cursor: "pointer",
                transition: "all 0.18s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: m.color, flexShrink: 0 }} />
              {m.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "12px", fontWeight: 600, color: "#9B8AB0", letterSpacing: "1px", textTransform: "uppercase" }}>
            {loading ? "Loading..." : `${displayed.length} entr${displayed.length === 1 ? "y" : "ies"}${selectedMood ? ` · ${MOODS.find(m => m.key === selectedMood)?.label}` : ""}${search ? ` · "${search}"` : ""}`}
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
        </div>

        {/* Entry list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: "72px", borderRadius: "14px", background: "rgba(61,31,114,0.04)", border: "1px solid rgba(61,31,114,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#9B8AB0" }}>
              <div style={{ fontSize: "38px", marginBottom: "10px" }}>🌿</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "16px", color: "#5A4A70", marginBottom: "6px" }}>
                {search ? "No entries match your search" : selectedMood ? `No ${MOODS.find(m => m.key === selectedMood)?.label} entries yet` : "No entries yet"}
              </div>
              <div style={{ fontSize: "13px" }}>
                {search || selectedMood ? "Try a different filter or clear the search." : "Head to Today's Journal to write your first entry."}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {displayed.map((e, i) => {
                const mood = MOODS.find((m) => m.key === e.dominant_mood);
                const domColor = mood?.color ?? "#7DB890";
                const domBg = mood?.bg ?? "rgba(125,184,144,0.1)";
                const domText = mood?.text ?? "#2E5E40";

                const dateStr = new Date(e.created_at).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                });
                const timeStr = new Date(e.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric", minute: "2-digit",
                });

                const isExpanded = expandedId === e.id;
                const isEditing = editingId === e.id;
                const isConfirmingDelete = confirmDeleteId === e.id;
                const isDeleting = deletingId === e.id;

                // Score bars for expanded view
                const scores: { key: string; label: string; color: string; value: number }[] = [
                  { key: "joy",      label: "Joy",      color: "#F5C518", value: Math.round(e.score_joy * 100) },
                  { key: "surprise", label: "Surprise", color: "#F07830", value: Math.round(e.score_surprise * 100) },
                  { key: "neutral",  label: "Neutral",  color: "#7DB890", value: Math.round(e.score_neutral * 100) },
                  { key: "sadness",  label: "Sadness",  color: "#4466CC", value: Math.round(e.score_sadness * 100) },
                  { key: "anger",    label: "Anger",    color: "#E84E3A", value: Math.round(e.score_anger * 100) },
                  { key: "fear",     label: "Fear",     color: "#9B59B6", value: Math.round(e.score_fear * 100) },
                  { key: "disgust",  label: "Disgust",  color: "#8FA020", value: Math.round(e.score_disgust * 100) },
                ].sort((a, b) => b.value - a.value);

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isDeleting ? 0 : 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    onClick={() => {
                      if (isEditing || isConfirmingDelete) return;
                      setExpandedId(isExpanded ? null : e.id);
                    }}
                    whileHover={!isExpanded ? { y: -2, boxShadow: "0 8px 28px rgba(61,31,114,0.1)" } : {}}
                    style={{
                      background: "#FFFDF8",
                      borderRadius: "16px",
                      border: `1px solid ${isExpanded ? `${domColor}30` : "rgba(61,31,114,0.07)"}`,
                      boxShadow: isExpanded ? `0 6px 24px ${domColor}18` : "0 2px 10px rgba(61,31,114,0.05)",
                      cursor: isEditing || isConfirmingDelete ? "default" : "pointer",
                      overflow: "hidden",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                  >
                    {/* Collapsed row */}
                    <div style={{ padding: "14px 18px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: `${domColor}16`, border: `2px solid ${domColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: domColor, boxShadow: `0 0 7px ${domColor}55` }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "12px", color: "#9B8AB0", marginBottom: "3px" }}>
                          {dateStr} · {timeStr}
                        </div>
                        <p style={{ fontSize: "13px", color: "#4A3A60", margin: 0, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isExpanded ? "normal" : "nowrap" }}>
                          {e.entry_text}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        <div style={{ padding: "3px 11px", borderRadius: "50px", background: domBg, border: `1.5px solid ${domColor}30`, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "11px", color: domText, textTransform: "capitalize" }}>
                          {e.dominant_mood}
                        </div>
                        <div style={{ color: "#9B8AB0", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ borderTop: `1px solid ${domColor}20`, padding: "18px 18px 20px 18px" }}>

                            {/* ── Edit / Delete action bar ── */}
                            {!isEditing && !isConfirmingDelete && (
                              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", justifyContent: "flex-end" }}>
                                <button
                                  onClick={(ev) => startEdit(ev, e)}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    padding: "6px 13px",
                                    background: "rgba(61,31,114,0.06)",
                                    border: "1.5px solid rgba(61,31,114,0.12)",
                                    borderRadius: "50px",
                                    fontFamily: "'Fraunces', serif",
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    color: "#5A4A70",
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={(ev) => askDelete(ev, e.id)}
                                  style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    padding: "6px 13px",
                                    background: "rgba(232,78,58,0.06)",
                                    border: "1.5px solid rgba(232,78,58,0.18)",
                                    borderRadius: "50px",
                                    fontFamily: "'Fraunces', serif",
                                    fontWeight: 700,
                                    fontSize: "11px",
                                    color: "#C0392B",
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}

                            {/* ── Delete confirmation ── */}
                            {isConfirmingDelete && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                  marginBottom: "16px",
                                  padding: "14px 16px",
                                  background: "rgba(232,78,58,0.05)",
                                  border: "1.5px solid rgba(232,78,58,0.18)",
                                  borderRadius: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: "12px",
                                }}
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "13px", color: "#8B1A0A" }}>
                                  Delete this entry permanently?
                                </span>
                                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                  <button
                                    onClick={(ev) => cancelDelete(ev)}
                                    style={{
                                      padding: "5px 12px",
                                      background: "rgba(61,31,114,0.06)",
                                      border: "1.5px solid rgba(61,31,114,0.12)",
                                      borderRadius: "50px",
                                      fontFamily: "'Fraunces', serif",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      color: "#5A4A70",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(ev) => confirmDelete(ev, e.id)}
                                    disabled={isDeleting}
                                    style={{
                                      padding: "5px 12px",
                                      background: isDeleting ? "rgba(232,78,58,0.2)" : "rgba(232,78,58,0.9)",
                                      border: "none",
                                      borderRadius: "50px",
                                      fontFamily: "'Fraunces', serif",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      color: "#fff",
                                      cursor: isDeleting ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                    }}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "10px", height: "10px", border: "1.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                                        Deleting...
                                      </>
                                    ) : "Yes, delete"}
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {/* ── Edit textarea ── */}
                            {isEditing ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ marginBottom: "16px" }}
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                <textarea
                                  value={editText}
                                  onChange={(ev) => setEditText(ev.target.value)}
                                  rows={5}
                                  autoFocus
                                  style={{
                                    width: "100%",
                                    padding: "13px 14px",
                                    background: "rgba(61,31,114,0.03)",
                                    border: `1.5px solid ${domColor}50`,
                                    borderRadius: "12px",
                                    fontFamily: "'Nunito', sans-serif",
                                    fontSize: "14px",
                                    lineHeight: "1.7",
                                    color: "#2D1B4E",
                                    outline: "none",
                                    resize: "vertical",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s",
                                  }}
                                  onFocus={(ev) => (ev.target.style.borderColor = "#6B3FA0")}
                                  onBlur={(ev) => (ev.target.style.borderColor = `${domColor}50`)}
                                />
                                <div style={{ display: "flex", gap: "8px", marginTop: "10px", justifyContent: "flex-end" }}>
                                  <button
                                    onClick={cancelEdit}
                                    style={{
                                      padding: "6px 14px",
                                      background: "rgba(61,31,114,0.06)",
                                      border: "1.5px solid rgba(61,31,114,0.12)",
                                      borderRadius: "50px",
                                      fontFamily: "'Fraunces', serif",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      color: "#5A4A70",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={(ev) => saveEdit(ev, e.id)}
                                    disabled={editSaving}
                                    style={{
                                      padding: "6px 14px",
                                      background: editSaving ? "rgba(61,31,114,0.15)" : "linear-gradient(135deg, #3D1F72, #6B3FA0)",
                                      border: "none",
                                      borderRadius: "50px",
                                      fontFamily: "'Fraunces', serif",
                                      fontWeight: 700,
                                      fontSize: "11px",
                                      color: editSaving ? "#9B8AB0" : "#F5C518",
                                      cursor: editSaving ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                    }}
                                  >
                                    {editSaving ? (
                                      <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "10px", height: "10px", border: "1.5px solid rgba(155,138,176,0.3)", borderTopColor: "#9B8AB0", borderRadius: "50%" }} />
                                        Saving...
                                      </>
                                    ) : "Save changes"}
                                  </button>
                                </div>
                                <p style={{ marginTop: "8px", fontSize: "11px", color: "#B0A0C0", fontFamily: "'Fraunces', serif", textAlign: "right" }}>
                                  Note: mood scores will be re-analyzed on save.
                                </p>
                              </motion.div>
                            ) : (
                              /* Full entry text (read mode) */
                              <div style={{
                                background: "rgba(61,31,114,0.025)",
                                borderRadius: "12px",
                                padding: "14px 16px",
                                marginBottom: "18px",
                                fontFamily: "'Nunito', sans-serif",
                                fontSize: "14px",
                                lineHeight: "1.7",
                                color: "#2D1B4E",
                                borderLeft: `3px solid ${domColor}60`,
                              }}>
                                {e.entry_text}
                              </div>
                            )}

                            {/* Mood score bars — hidden while editing */}
                            {!isEditing && (
                              <div style={{ marginBottom: "4px" }}>
                                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "12px", color: "#5A4A70", marginBottom: "12px", letterSpacing: "0.5px" }}>
                                  MOOD BREAKDOWN
                                </div>
                                {scores.map((s, si) => (
                                  <div key={s.key} style={{ marginBottom: si < scores.length - 1 ? "9px" : 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                      <div style={{ width: "60px", flexShrink: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "11px", color: "#2D1B4E", textAlign: "right" }}>
                                        {s.label}
                                      </div>
                                      <div style={{ flex: 1, height: "14px", background: `${s.color}16`, borderRadius: "50px", overflow: "hidden" }}>
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${s.value}%` }}
                                          transition={{ delay: si * 0.055, duration: 0.5, ease: "easeOut" }}
                                          style={{ height: "100%", background: `linear-gradient(90deg, ${s.color}BB, ${s.color})`, borderRadius: "50px" }}
                                        />
                                      </div>
                                      <div style={{ width: "32px", flexShrink: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "11px", color: s.value > 15 ? s.color : "#9B8AB0" }}>
                                        {s.value}%
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Load more */}
        {!loading && !search && hasMore && displayed.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <motion.button
              onClick={handleLoadMore}
              disabled={loadingMore}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "11px 32px",
                background: loadingMore ? "rgba(61,31,114,0.06)" : "rgba(61,31,114,0.07)",
                border: "1.5px solid rgba(61,31,114,0.14)",
                borderRadius: "50px",
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "13px",
                color: loadingMore ? "#9B8AB0" : "#3D1F72",
                cursor: loadingMore ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {loadingMore ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "13px", height: "13px", border: "2px solid rgba(155,138,176,0.3)", borderTopColor: "#9B8AB0", borderRadius: "50%" }} />
                  Loading...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Load more entries
                </>
              )}
            </motion.button>
          </div>
        )}

        {/* Search note when searching (load more is hidden) */}
        {!loading && search && hasMore && (
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", color: "#B0A0C0", fontFamily: "'Fraunces', serif" }}>
            Search only looks within loaded entries. Clear the search and scroll to load more.
          </p>
        )}
      </div>
    </div>
  );
}
