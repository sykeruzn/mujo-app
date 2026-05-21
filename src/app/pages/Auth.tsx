import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import {
  PinkFlower,
  YellowFlower,
  TealFlower,
  PurpleFlower,
  GreenFlower,
  MonsteraLeaf,
  FernBranch,
  Sparkle,
  TropicalLeaf,
} from "../components/FloralDecor";

type Tab = "signin" | "register";

interface FormState {
  name: string;
  email: string;
  birthday: string;
  password: string;
  confirm: string;
}

export function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signin");
  const [form, setForm] = useState<FormState>({ name: "", email: "", birthday: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const setField = (key: keyof FormState, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
      } else {
        // register — includes name and optional birthday
        if (form.password !== form.confirm) throw new Error("Passwords do not match");

        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name } },
        });
        if (error) throw error;

        if (form.birthday && data.user) {
          await supabase
            .from("profiles")
            .update({ birthday: form.birthday })
            .eq("id", data.user.id);
        }
      }

      setDone(true);
      setTimeout(() => navigate("/"), 1400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "signin", label: "Sign In" },
    { key: "register", label: "Register" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    background: "rgba(61,31,114,0.04)",
    border: "1.5px solid rgba(61,31,114,0.12)",
    borderRadius: "12px",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "14px",
    color: "#2D1B4E",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: "12px",
    color: "#5A4A70",
    marginBottom: "6px",
    letterSpacing: "0.3px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#FFF8ED",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Nunito', sans-serif",
        position: "relative",
        overflow: "auto",
        paddingTop: "48px",
        paddingBottom: "48px",
        boxSizing: "border-box",
      }}
    >
      {/* === Decorative flora — corners === */}
      {/* Top left */}
      <div style={{ position: "fixed", top: -20, left: -20, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <MonsteraLeaf size={90} style={{ position: "absolute", top: 0, left: 0, opacity: 0.35 }} />
          <FernBranch size={70} style={{ position: "absolute", top: 30, left: 60, opacity: 0.28, transform: "rotate(20deg)" }} />
          <PinkFlower size={52} style={{ position: "absolute", top: 55, left: 20 }} />
          <TealFlower size={34} style={{ position: "absolute", top: 15, left: 90, opacity: 0.7 }} />
          <Sparkle size={14} color="#F5C518" style={{ position: "absolute", top: 100, left: 75 }} />
        </div>
      </div>

      {/* Top right */}
      <div style={{ position: "fixed", top: -10, right: -10, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "180px", height: "180px" }}>
          <TropicalLeaf size={65} color="#3DBD6D" style={{ position: "absolute", top: 0, right: 10, opacity: 0.3, transform: "rotate(-15deg)" }} />
          <YellowFlower size={50} style={{ position: "absolute", top: 35, right: 20 }} />
          <PurpleFlower size={32} style={{ position: "absolute", top: 10, right: 80, opacity: 0.7 }} />
          <Sparkle size={12} color="#E84E8A" style={{ position: "absolute", top: 75, right: 60 }} />
        </div>
      </div>

      {/* Bottom left */}
      <div style={{ position: "fixed", bottom: -20, left: -20, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "180px", height: "180px" }}>
          <TropicalLeaf size={70} color="#3DBD6D" style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.3, transform: "rotate(10deg) scaleX(-1)" }} />
          <GreenFlower size={44} style={{ position: "absolute", bottom: 45, left: 40 }} />
          <PurpleFlower size={30} style={{ position: "absolute", bottom: 80, left: 90, opacity: 0.65 }} />
          <Sparkle size={10} color="#1DB5B5" style={{ position: "absolute", bottom: 100, left: 55 }} />
        </div>
      </div>

      {/* Bottom right */}
      <div style={{ position: "fixed", bottom: -20, right: -20, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "200px", height: "200px" }}>
          <MonsteraLeaf size={80} style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.3, transform: "scaleX(-1)" }} />
          <PinkFlower size={48} style={{ position: "absolute", bottom: 50, right: 30 }} />
          <TealFlower size={32} style={{ position: "absolute", bottom: 85, right: 90, opacity: 0.7 }} />
          <Sparkle size={12} color="#F5C518" style={{ position: "absolute", bottom: 110, right: 55 }} />
          <Sparkle size={8} color="#E84E8A" style={{ position: "absolute", bottom: 65, right: 100 }} />
        </div>
      </div>

      {/* === Auth card === */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          width: "420px",
          background: "#FFFDF8",
          borderRadius: "24px",
          boxShadow: "0 20px 80px rgba(61,31,114,0.14), 0 4px 20px rgba(61,31,114,0.08)",
          border: "1px solid rgba(61,31,114,0.08)",
          overflow: "hidden",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Card header */}
        <div
          style={{
            background: "linear-gradient(160deg, #3D1F72 0%, #2A1050 100%)",
            padding: "28px 32px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", right: -15, top: -15, opacity: 0.14 }}>
            <PinkFlower size={80} />
          </div>
          <div style={{ position: "absolute", left: -10, bottom: -20, opacity: 0.1 }}>
            <TealFlower size={70} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", position: "relative", zIndex: 1 }}>
            <PinkFlower size={28} />
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "24px", fontWeight: 900, color: "#FFF8ED", lineHeight: 1 }}>MuJo</div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "2.5px", color: "rgba(245,197,24,0.65)", textTransform: "uppercase", marginTop: "1px" }}>
                Mood Journal
              </div>
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "rgba(255,248,237,0.5)", fontFamily: "'Nunito', sans-serif", position: "relative", zIndex: 1 }}>
            Your personal emotional landscape
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(61,31,114,0.08)",
            background: "rgba(61,31,114,0.02)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setDone(false); }}
              style={{
                flex: 1,
                padding: "13px 8px",
                background: "transparent",
                border: "none",
                borderBottom: tab === t.key ? "2.5px solid #3D1F72" : "2.5px solid transparent",
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontSize: "13px",
                color: tab === t.key ? "#3D1F72" : "#9B8AB0",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 32px" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "20px 0" }}
              >
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(61,189,109,0.12)", border: "2px solid rgba(61,189,109,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3DBD6D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "18px", color: "#2D1B4E", marginBottom: "6px" }}>
                  {tab === "signin" ? "Welcome back!" : "Account created!"}
                </div>
                <div style={{ fontSize: "13px", color: "#9B8AB0" }}>Taking you to your journal...</div>
              </motion.div>
            ) : (
              <motion.form
                key={tab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {/* Name — register only */}
                {tab === "register" && (
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Your name"
                      required
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.12)")}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.12)")}
                  />
                </div>

                {/* Birthday — register only */}
                {tab === "register" && (
                  <div>
                    <label style={labelStyle}>Birthday <span style={{ color: "#B0A0C0", fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={(e) => setField("birthday", e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.12)")}
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="••••••••"
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.12)")}
                  />
                </div>

                {/* Confirm password — register only */}
                {tab === "register" && (
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) => setField("confirm", e.target.value)}
                      placeholder="••••••••"
                      required
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#6B3FA0")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(61,31,114,0.12)")}
                    />
                  </div>
                )}

                {/* Forgot password — sign in only */}
                {tab === "signin" && (
                  <div style={{ textAlign: "right", marginTop: "-8px" }}>
                    <button type="button" style={{ background: "none", border: "none", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "12px", color: "#6B3FA0", cursor: "pointer", padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    padding: "14px",
                    background: loading ? "rgba(61,31,114,0.2)" : "linear-gradient(135deg, #3D1F72, #6B3FA0)",
                    color: loading ? "#9B8AB0" : "#F5C518",
                    border: "none",
                    borderRadius: "14px",
                    fontFamily: "'Fraunces', serif",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 6px 20px rgba(61,31,114,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    marginTop: "4px",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: "16px", height: "16px", border: "2px solid rgba(155,138,176,0.3)", borderTopColor: "#9B8AB0", borderRadius: "50%" }} />
                      Processing...
                    </>
                  ) : (
                    tab === "signin" ? "Sign In to MuJo" : "Create Account"
                  )}
                </motion.button>

                {/* Switch tab prompt */}
                <div style={{ textAlign: "center", fontSize: "12px", color: "#9B8AB0", marginTop: "2px" }}>
                  {tab === "signin" ? (
                    <>
                      No account yet?{" "}
                      <button type="button" onClick={() => setTab("register")} style={{ background: "none", border: "none", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "12px", color: "#6B3FA0", cursor: "pointer", padding: 0 }}>
                        Create one
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button type="button" onClick={() => setTab("signin")} style={{ background: "none", border: "none", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "12px", color: "#6B3FA0", cursor: "pointer", padding: 0 }}>
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Back to app */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          background: "rgba(61,31,114,0.07)",
          border: "1px solid rgba(61,31,114,0.12)",
          borderRadius: "10px",
          padding: "8px 14px",
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
          fontSize: "13px",
          color: "#5A4A70",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "7px",
          zIndex: 20,
          transition: "all 0.2s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Journal
      </button>
    </div>
  );
}
