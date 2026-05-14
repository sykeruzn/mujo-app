import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PinkFlower, TealFlower, FernBranch, Sparkle } from "../components/FloralDecor";
import * as faceapi from "face-api.js";

const EXPRESSIONS = [
  { key: "neutral",   label: "Neutral",   color: "#7DB890", light: "rgba(125,184,144,0.18)" },
  { key: "happy",     label: "Happy",     color: "#F5C518", light: "rgba(245,197,24,0.18)" },
  { key: "sad",       label: "Sad",       color: "#4466CC", light: "rgba(68,102,204,0.18)" },
  { key: "angry",     label: "Angry",     color: "#E84E3A", light: "rgba(232,78,58,0.18)" },
  { key: "fearful",   label: "Fearful",   color: "#9B59B6", light: "rgba(155,89,182,0.18)" },
  { key: "disgusted", label: "Disgusted", color: "#8FA020", light: "rgba(143,160,32,0.18)" },
  { key: "surprised", label: "Surprised", color: "#F07830", light: "rgba(240,120,48,0.18)" },
];

const EXPRESSION_NOTES: Record<string, { title: string; body: string }> = {
  neutral: {
    title: "A quiet, steady state.",
    body: "Clarity often finds us in these calm in-between moments. Let yourself just be here without needing to feel more.",
  },
  happy: {
    title: "You're radiating warmth.",
    body: "This lightness in you is real and worth savoring. Let joy be permission to move through today with ease.",
  },
  sad: {
    title: "Sadness is valid here.",
    body: "Give yourself the grace you'd offer someone you love. You don't have to rush past this feeling — sit with it gently.",
  },
  angry: {
    title: "Something stirred a fire.",
    body: "Breathe through it slowly. Beneath anger there's usually something important speaking — it's worth listening to.",
  },
  fearful: {
    title: "Fear points to what matters.",
    body: "You are safe in this moment. Take one breath at a time. What you're feeling is asking for your attention, not your panic.",
  },
  disgusted: {
    title: "Something feels off.",
    body: "Your instincts and boundaries are speaking right now. That discomfort is information — it's worth listening to without judgment.",
  },
  surprised: {
    title: "Something caught you off guard.",
    body: "Sit with that unexpected feeling for a moment. Wonder lives in surprise — there may be something new here worth noticing.",
  },
};

function getDominant(readings: Record<string, number>): string {
  return Object.entries(readings).sort((a, b) => b[1] - a[1])[0][0];
}

type CameraState = "idle" | "requesting" | "active" | "denied" | "error";

export function LiveTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [readings, setReadings] = useState<Record<string, number>>({
    neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0,
  });
  const [confidence, setConfidence] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelsError, setModelsError] = useState(false);

  // Load face-api.js models once on mount
  useEffect(() => {
    const MODEL_URL = "/models";
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])
      .then(() => setModelsLoaded(true))
      .catch((err) => {
        console.error("Failed to load face-api models:", err);
        setModelsError(true);
      });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Real detection loop — 2 fps
  const startDetectionLoop = useCallback(() => {
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || !modelsLoaded) return;

      setFrameCount((f) => f + 1);

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detection) {
          // detection.expressions keys: neutral, happy, sad, angry, fearful, disgusted, surprised
          const expressions = detection.expressions as unknown as Record<string, number>;
          setReadings(expressions);

          const dominantKey = Object.entries(expressions)
            .sort((a, b) => b[1] - a[1])[0][0];
          setConfidence(expressions[dominantKey]); // ← expression score, not face score
        }
      } catch {
        // Non-fatal — no face in frame, etc.
      }
    }, 500);
  }, [modelsLoaded]);

  const handleStartCamera = async () => {
    if (!modelsLoaded) {
      alert("Face detection models are still loading, please wait a moment.");
      return;
    }
    setCameraState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraState("active");
      // setReadings({ neutral: 0.85, happy: 0.06, sad: 0.02, angry: 0.01, fearful: 0.03, disgusted: 0.01, surprised: 0.02 });
      setTimeout(() => startDetectionLoop(), 900);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setCameraState(e.name === "NotAllowedError" || e.name === "PermissionDeniedError" ? "denied" : "error");
    }
  };

  const handleStopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraState("idle");
    setReadings({ neutral: 0, happy: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 });
    setFrameCount(0);
  };

  const dominant = getDominant(readings);
  const dominantExpr = EXPRESSIONS.find((e) => e.key === dominant);
  const note = EXPRESSION_NOTES[dominant];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#FFF8ED", position: "relative" }}>
      {/* Top-right decoration */}
      <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "165px", height: "136px" }}>
          <FernBranch size={58} style={{ position: "absolute", top: 0, right: 22, opacity: 0.26, transform: "rotate(-14deg)" }} />
          <PinkFlower size={44} style={{ position: "absolute", top: 16, right: 10, opacity: 0.6 }} />
          <TealFlower size={28} style={{ position: "absolute", top: 56, right: 62, opacity: 0.52 }} />
          <Sparkle size={11} color="#F5C518" style={{ position: "absolute", top: 33, right: 92 }} />
        </div>
      </div>

      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "38px 32px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: cameraState === "active" ? "#3DBD6D" : "#9B8AB0", boxShadow: cameraState === "active" ? "0 0 9px #3DBD6D" : "none" }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "10px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: cameraState === "active" ? "#3DBD6D" : "#9B8AB0" }}>
              {cameraState === "active" ? "Live Detection Active" : modelsLoaded ? "Checking in" : modelsError ? "Models failed to load" : "Loading models..."}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "38px", fontWeight: 900, color: "#2D1B4E", lineHeight: 1.1, margin: 0 }}>
            Mirror
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#7A6A8A", maxWidth: "460px", lineHeight: 1.6 }}>
            Point your camera at your face. The model reads your micro-expressions in real time and maps them across seven emotional dimensions.
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "18px", alignItems: "start" }}>
          {/* === Left: Camera === */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Camera viewport */}
            <div
              style={{
                background: "#1A0E30",
                borderRadius: "20px",
                overflow: "hidden",
                aspectRatio: "4/3",
                position: "relative",
                boxShadow: "0 8px 38px rgba(61,31,114,0.28)",
                border: cameraState === "active"
                  ? `2px solid ${dominantExpr?.color || "#7DB890"}55`
                  : "2px solid rgba(61,31,114,0.14)",
                transition: "border-color 0.5s",
              }}
            >
              <video ref={videoRef} autoPlay muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraState === "active" ? "block" : "none", transform: "scaleX(-1)" }}
              />

              {cameraState !== "active" && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "32px" }}>
                  {cameraState === "idle" && (
                    <>
                      <div style={{ width: "68px", height: "68px", borderRadius: "18px", background: "rgba(245,197,24,0.08)", border: "2px solid rgba(245,197,24,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(245,197,24,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "17px", color: "#FFF8ED", marginBottom: "7px" }}>Camera not active</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,248,237,0.4)", maxWidth: "260px", lineHeight: 1.6 }}>Enable your camera below to start real-time expression detection</div>
                      </div>
                    </>
                  )}
                  {cameraState === "requesting" && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ width: "44px", height: "44px", border: "3px solid rgba(245,197,24,0.18)", borderTopColor: "#F5C518", borderRadius: "50%" }} />
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "15px", color: "#FFF8ED" }}>Requesting camera access...</div>
                    </>
                  )}
                  {cameraState === "denied" && (
                    <>
                      <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(232,78,58,0.14)", border: "2px solid rgba(232,78,58,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E84E3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "15px", color: "#FFF8ED", marginBottom: "5px" }}>Camera access denied</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,248,237,0.4)" }}>Allow camera access in your browser settings</div>
                      </div>
                    </>
                  )}
                  {cameraState === "error" && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "15px", color: "#FFF8ED" }}>Camera unavailable</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,248,237,0.4)", marginTop: "5px" }}>Check that no other app is using your camera</div>
                    </div>
                  )}
                </div>
              )}

              {cameraState === "active" && (
                <>
                  {/* Corner brackets */}
                  {[
                    { top: "12%", left: "28%", tr: "translate(-50%,-50%)" },
                    { top: "12%", left: "72%", tr: "translate(50%,-50%) scaleX(-1)" },
                    { top: "82%", left: "28%", tr: "translate(-50%,50%) scaleY(-1)" },
                    { top: "82%", left: "72%", tr: "translate(50%,50%) scale(-1,-1)" },
                  ].map((pos, i) => (
                    <div key={i} style={{ position: "absolute", top: pos.top, left: pos.left, transform: pos.tr, width: "22px", height: "22px", borderTop: `2.5px solid ${dominantExpr?.color || "#7DB890"}BB`, borderLeft: `2.5px solid ${dominantExpr?.color || "#7DB890"}BB`, transition: "border-color 0.5s" }} />
                  ))}

                  {/* Expression label */}
                  <AnimatePresence mode="wait">
                    <motion.div key={dominant} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                      style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", padding: "7px 18px", borderRadius: "50px", background: `${dominantExpr?.color || "#7DB890"}22`, border: `1.5px solid ${dominantExpr?.color || "#7DB890"}55`, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
                    >
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: dominantExpr?.color, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "14px", color: "#FFF8ED" }}>{dominantExpr?.label}</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,248,237,0.55)", fontFamily: "'Nunito', sans-serif" }}>{Math.round(confidence * 100)}%</span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Frame counter */}
                  <div style={{ position: "absolute", top: "11px", right: "11px", padding: "3px 9px", borderRadius: "7px", background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)", fontSize: "10px", fontFamily: "'Nunito', sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                    Frame {frameCount}
                  </div>
                  <div style={{ position: "absolute", top: "11px", left: "11px", padding: "3px 9px", borderRadius: "7px", background: "rgba(232,78,58,0.78)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FFF8ED", animation: "blink 1s step-end infinite" }} />
                    <span style={{ fontSize: "10px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: "#FFF8ED", letterSpacing: "1px" }}>LIVE</span>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "10px" }}>
              {cameraState !== "active" ? (
                <motion.button
                  whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                  onClick={handleStartCamera}
                  disabled={cameraState === "requesting" || !modelsLoaded}
                  style={{
                    flex: 1, padding: "13px 22px",
                    background: (cameraState === "requesting" || !modelsLoaded) ? "rgba(61,31,114,0.12)" : "linear-gradient(135deg, #3D1F72, #6B3FA0)",
                    color: (cameraState === "requesting" || !modelsLoaded) ? "#9B8AB0" : "#F5C518",
                    border: "none", borderRadius: "13px",
                    fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "14px",
                    cursor: (cameraState === "requesting" || !modelsLoaded) ? "not-allowed" : "pointer",
                    boxShadow: (cameraState !== "requesting" && modelsLoaded) ? "0 6px 18px rgba(61,31,114,0.28)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  {cameraState === "requesting" ? "Starting..." : !modelsLoaded ? (modelsError ? "Models unavailable" : "Loading models...") : "Enable Camera"}
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleStopCamera}
                  style={{ flex: 1, padding: "13px 22px", background: "rgba(232,78,58,0.09)", color: "#E84E3A", border: "1.5px solid rgba(232,78,58,0.28)", borderRadius: "13px", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                  Stop Camera
                </motion.button>
              )}
            </div>

            {/* Info cards row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B3FA0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>, title: "2 fps", desc: "Detection rate" },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1DB5B5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, title: "7 Expressions", desc: "Simultaneously" },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E84E8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>, title: "On-Device", desc: "No data sent" },
              ].map((card) => (
                <div key={card.title} style={{ background: "#FFFDF8", borderRadius: "12px", border: "1px solid rgba(61,31,114,0.07)", padding: "13px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(61,31,114,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "13px", color: "#2D1B4E" }}>{card.title}</div>
                    <div style={{ fontSize: "11px", color: "#9B8AB0", marginTop: "1px" }}>{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === Right: Emotion bar chart + note === */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", height: "100%", justifyContent: "space-between" }}>
            {/* Vertical bar chart */}
            <div style={{ background: "#FFFDF8", borderRadius: "18px", border: "1px solid rgba(61,31,114,0.07)", boxShadow: "0 3px 22px rgba(61,31,114,0.07)", padding: "18px 14px" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "14px", color: "#2D1B4E" }}>Emotion Levels</div>
              <div style={{ fontSize: "10px", color: "#9B8AB0", marginTop: "2px", marginBottom: "14px" }}>
                {cameraState === "active" ? "Real-time detection" : "Awaiting camera"}
              </div>

              <div style={{ display: "flex", gap: "8px", height: "200px", alignItems: "flex-end", justifyContent: "space-between" }}>
                {EXPRESSIONS.map((expr) => {
                  const value = readings[expr.key] || 0;
                  const isDominant = dominant === expr.key && cameraState === "active";
                  const barHeight = Math.max(4, Math.round(value * 186));
                  return (
                    <div key={expr.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", height: "100%", justifyContent: "flex-end" }}>
                      <motion.div animate={{ opacity: cameraState === "active" ? 1 : 0 }} style={{ fontSize: "9px", fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: isDominant ? expr.color : "#C0B0D0", textAlign: "center" }}>
                        {cameraState === "active" ? `${Math.round(value * 100)}%` : ""}
                      </motion.div>
                      <div style={{ width: "100%", height: "186px", background: "rgba(61,31,114,0.04)", borderRadius: "50px", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                        <motion.div
                          animate={{ height: cameraState === "active" ? `${barHeight}px` : "4px", background: isDominant ? expr.color : `${expr.color}88`, boxShadow: isDominant ? `0 0 14px ${expr.color}55, 0 0 28px ${expr.color}28` : "none" }}
                          transition={{ duration: 0.38, ease: "easeOut" }}
                          style={{ width: "100%", borderRadius: "50px", minHeight: "4px", position: "absolute", bottom: 0 }}
                        />
                      </div>
                      <div style={{ fontSize: "8px", fontFamily: "'Nunito', sans-serif", fontWeight: isDominant ? 700 : 500, color: isDominant ? expr.color : "#C0B0D0", textAlign: "center", lineHeight: 1.2, width: "100%" }}>
                        {expr.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reflection Note card */}
            <AnimatePresence mode="wait">
              {cameraState === "active" && note && (
                <motion.div
                  key={dominant}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  style={{ background: "#FFFDF8", borderRadius: "16px", border: `1.5px solid ${dominantExpr?.color || "#7DB890"}30`, boxShadow: "0 3px 18px rgba(61,31,114,0.07)", padding: "16px", position: "relative", overflow: "hidden" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${dominantExpr?.color}, ${dominantExpr?.color}55)`, borderRadius: "16px 16px 0 0" }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "4px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `${dominantExpr?.color}20`, border: `2px solid ${dominantExpr?.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                      <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: dominantExpr?.color }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "13px", color: "#2D1B4E", lineHeight: 1.3, marginBottom: "5px" }}>
                        {note.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7A6A8A", lineHeight: 1.6 }}>
                        {note.body}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {cameraState !== "active" && (
                <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(61,31,114,0.03)", border: "1.5px dashed rgba(61,31,114,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#C0B0D0", fontFamily: "'Nunito', sans-serif" }}>Start camera to see a live reflection note</div>
                </div>
              )}
            </AnimatePresence>

            {/* Dominant card */}
            <AnimatePresence mode="wait">
              {cameraState === "active" && dominantExpr && (
                <motion.div key={`dom-${dominant}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  style={{ padding: "14px", borderRadius: "14px", background: dominantExpr.light, border: `1.5px solid ${dominantExpr.color}38`, textAlign: "center" }}
                >
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: dominantExpr.color, margin: "0 auto 7px", boxShadow: `0 4px 12px ${dominantExpr.color}48` }} />
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "15px", color: "#2D1B4E" }}>{dominantExpr.label}</div>
                  <div style={{ fontSize: "10px", color: "#9B8AB0", marginTop: "1px" }}>Primary expression</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.3); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
