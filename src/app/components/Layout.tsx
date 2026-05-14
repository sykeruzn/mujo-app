import { Outlet, NavLink, useNavigate } from "react-router";
import {
  PinkFlower,
  YellowFlower,
  TealFlower,
  PurpleFlower,
  GreenFlower,
  MonsteraLeaf,
  FernBranch,
  Sparkle,
} from "./FloralDecor";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";

export function Layout() {
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/",
      label: "Journal",
      sublabel: "Today's entry",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
    },
    {
      to: "/moods",
      label: "Moods",
      sublabel: "Looking back",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
      ),
    },
    {
      to: "/mirror",
      label: "Mirror",
      sublabel: "Checking in",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      to: "/habits",
      label: "Habits",
      sublabel: "Daily tracking",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
  ];

  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "'Nunito', sans-serif",
        background: "#FFF8ED",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "230px",
          minWidth: "230px",
          background: "linear-gradient(175deg, #3D1F72 0%, #2A1050 60%, #1E0B3A 100%)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          boxShadow: "4px 0 24px rgba(61,31,114,0.25)",
        }}
      >
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.15 }}>
          <MonsteraLeaf size={85} />
        </div>
        <div style={{ position: "absolute", top: 18, left: -8, opacity: 0.1 }}>
          <FernBranch size={55} />
        </div>

        {/* Brand — MuJo */}
        <div style={{ padding: "28px 22px 18px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <PinkFlower size={30} />
            <div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#FFF8ED",
                  lineHeight: 1,
                  letterSpacing: "-0.5px",
                }}
              >
                MuJo
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "2.5px",
                  color: "rgba(245,197,24,0.7)",
                  textTransform: "uppercase",
                  marginTop: "1px",
                }}
              >
                Mood Journal
              </div>
            </div>
          </div>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, rgba(245,197,24,0.4) 0%, transparent 100%)",
              marginTop: "14px",
            }}
          />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "6px 14px", position: "relative", zIndex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "11px 13px",
                borderRadius: "14px",
                marginBottom: "4px",
                textDecoration: "none",
                transition: "all 0.2s ease",
                background: isActive
                  ? "linear-gradient(135deg, rgba(245,197,24,0.22) 0%, rgba(232,78,138,0.12) 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(245,197,24,0.28)"
                  : "1px solid transparent",
                color: isActive ? "#F5C518" : "rgba(255,248,237,0.6)",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive
                        ? "rgba(245,197,24,0.18)"
                        : "rgba(255,255,255,0.06)",
                      color: isActive ? "#F5C518" : "rgba(255,248,237,0.45)",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: isActive ? "#F5C518" : "#FFF8ED",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: isActive
                          ? "rgba(245,197,24,0.75)"
                          : "rgba(255,248,237,0.35)",
                        lineHeight: 1,
                        marginTop: "2px",
                      }}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#F5C518",
                        boxShadow: "0 0 8px #F5C518",
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom flower cluster */}
        <div style={{ padding: "0 0 12px", position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "190px", height: "118px" }}>
            <MonsteraLeaf size={65} style={{ position: "absolute", left: 0, bottom: 0, opacity: 0.55 }} />
            <FernBranch size={50} style={{ position: "absolute", right: 8, bottom: 18, opacity: 0.45 }} />
            <PinkFlower size={44} style={{ position: "absolute", left: 28, bottom: 38 }} />
            <YellowFlower size={34} style={{ position: "absolute", right: 26, bottom: 46 }} />
            <TealFlower size={28} style={{ position: "absolute", left: 76, bottom: 54 }} />
            <GreenFlower size={25} style={{ position: "absolute", right: 56, bottom: 18 }} />
            <PurpleFlower size={24} style={{ position: "absolute", left: 8, bottom: 65 }} />
            <Sparkle size={13} color="#F5C518" style={{ position: "absolute", left: 58, bottom: 85 }} />
            <Sparkle size={9} color="#E84E8A" style={{ position: "absolute", right: 38, bottom: 70 }} />
            <Sparkle size={7} color="#1DB5B5" style={{ position: "absolute", left: 115, bottom: 42 }} />
          </div>
        </div>

        {/* Sign In */}
        <div style={{ margin: "0 14px 14px", position: "relative", zIndex: 1 }}>
        {session ? (
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(232,78,58,0.1)",
              border: "1px solid rgba(232,78,58,0.22)",
              borderRadius: "11px",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: "13px",
              color: "rgba(232,78,58,0.85)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth")}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(245,197,24,0.1)",
              border: "1px solid rgba(245,197,24,0.22)",
              borderRadius: "11px",
              fontFamily: "'Fraunces', serif",
              fontWeight: 700,
              fontSize: "13px",
              color: "rgba(245,197,24,0.85)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </button>
        )}
      </div>

        {/* Date chip */}
        <div
          style={{
            margin: "0 14px 18px",
            padding: "8px 12px",
            background: "rgba(245,197,24,0.08)",
            border: "1px solid rgba(245,197,24,0.16)",
            borderRadius: "10px",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "9px", color: "rgba(255,248,237,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>
            Today
          </div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(245,197,24,0.8)",
              marginTop: "2px",
            }}
          >
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
