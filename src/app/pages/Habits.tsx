import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { PinkFlower, TealFlower, YellowFlower, FernBranch, Sparkle, SmallBranch } from "../components/FloralDecor";
import { MonthCalendarGrid } from "../components/MonthCalendarGrid";
import { apiFetch } from "../../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface HabitRow {
  id: string;
  key: string;
  label: string;
  color: string;
  icon_name: string;
  sort_order: number;
}

interface CompletionRow {
  habit_id: string;
  date: string; // "YYYY-MM-DD"
}

// ---------------------------------------------------------------------------
// Icon lookup — mirrors the icon_name values seeded into the DB
// ---------------------------------------------------------------------------
const HABIT_ICONS: Record<string, React.ReactNode> = {
  exercise: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5 L17.5 17.5" />
      <path d="M5 8.5 L3 10.5 L8 15.5 L10 13.5" />
      <path d="M14 10.5 L16 8.5 L21 13.5 L19 15.5" />
      <line x1="2" y1="21" x2="6" y2="17" />
      <line x1="18" y1="5" x2="22" y2="1" />
    </svg>
  ),
  vitamins: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="3" width="8" height="18" rx="4" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  sleep: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  water: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6 8 4 13 4 16a8 8 0 0 0 16 0c0-3-2-8-8-14z" />
    </svg>
  ),
  read: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  watch: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  music: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  games: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="5" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <circle cx="17" cy="10" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  clean: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
    </svg>
  ),
};

function HabitIcon({ name }: { name: string }) {
  return <>{HABIT_ICONS[name] ?? null}</>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Habits() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-based

  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        apiFetch("/habits/"),
        apiFetch(`/habits/completions?year=${currentYear}&month=${currentMonth}`),
      ]);
      setHabits(h);
      setCompletions(c);
    } catch (err) {
      console.error("Failed to load habits:", err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Is a habit done today?
  const isDoneToday = (habitId: string) =>
    completions.some((c) => c.habit_id === habitId && c.date === todayStr);

  // Toggle with optimistic update
  const toggleHabit = async (habit: HabitRow) => {
    const done = isDoneToday(habit.id);
    if (done) {
      setCompletions((prev) => prev.filter((c) => !(c.habit_id === habit.id && c.date === todayStr)));
    } else {
      setCompletions((prev) => [...prev, { habit_id: habit.id, date: todayStr }]);
    }
    try {
      await apiFetch("/habits/toggle", {
        method: "POST",
        body: JSON.stringify({ habit_id: habit.id, date: todayStr, completed: !done }),
      });
    } catch {
      fetchData(); // revert on error
    }
  };

  // Build a 31-slot boolean array for the calendar
  const buildCalendarData = (habitId: string): (boolean | null)[] => {
    const data: (boolean | null)[] = Array(31).fill(null);
    completions
      .filter((c) => c.habit_id === habitId)
      .forEach((c) => {
        const day = parseInt(c.date.split("-")[2], 10) - 1;
        if (day >= 0 && day < todayDay) data[day] = true;
      });
    // Mark past days without a completion as false
    for (let i = 0; i < todayDay; i++) {
      if (data[i] === null) data[i] = false;
    }
    return data;
  };

  // Streak = consecutive days completed up to and including today
  const getStreak = (habitId: string): number => {
    let streak = 0;
    for (let i = todayDay - 1; i >= 0; i--) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      if (completions.some((c) => c.habit_id === habitId && c.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const doneCount = habits.filter((h) => isDoneToday(h.id)).length;

  // Total completions this month across all habits
  const totalThisMonth = completions.length;

  // Dynamic labels
  const todayLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const monthLabel = today.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#FFF8ED", position: "relative" }}>
      {/* Top-right decoration */}
      <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "185px", height: "150px" }}>
          <FernBranch size={65} style={{ position: "absolute", top: -4, right: 30, opacity: 0.3, transform: "rotate(-12deg)" }} />
          <YellowFlower size={48} style={{ position: "absolute", top: 18, right: 12, opacity: 0.65 }} />
          <TealFlower size={30} style={{ position: "absolute", top: 58, right: 68, opacity: 0.55 }} />
          <Sparkle size={13} color="#F5C518" style={{ position: "absolute", top: 40, right: 96 }} />
        </div>
      </div>

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "38px 32px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <SmallBranch size={38} style={{ opacity: 0.65 }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "10px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#3DBD6D" }}>
              Daily Tracking
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "38px", fontWeight: 900, color: "#2D1B4E", lineHeight: 1.1, margin: 0 }}>
            Habits
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#7A6A8A", maxWidth: "400px", lineHeight: 1.6 }}>
            Track your daily habits. Check off what you've done today, then watch the month fill in below.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#9B8AB0", fontSize: "14px" }}>
            Loading habits...
          </div>
        ) : (
          <>
            {/* === TODAY'S CHECKLIST === */}
            <div style={{ background: "#FFFDF8", borderRadius: "20px", border: "1px solid rgba(61,31,114,0.07)", boxShadow: "0 4px 24px rgba(61,31,114,0.07)", padding: "22px 24px", marginBottom: "26px" }}>
              {/* Checklist header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "17px", color: "#2D1B4E" }}>
                    Today — {todayLabel}
                  </div>
                  <div style={{ fontSize: "12px", color: "#9B8AB0", marginTop: "2px" }}>
                    {doneCount} of {habits.length} habits completed
                  </div>
                </div>

                {/* Progress ring */}
                <div style={{ position: "relative", width: "52px", height: "52px" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(61,31,114,0.08)" strokeWidth="4" />
                    <circle
                      cx="26" cy="26" r="22"
                      fill="none"
                      stroke="#3D1F72"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      strokeDashoffset={`${2 * Math.PI * 22 * (1 - doneCount / Math.max(habits.length, 1))}`}
                      transform="rotate(-90 26 26)"
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "13px", color: "#3D1F72" }}>
                    {doneCount}/{habits.length}
                  </div>
                </div>
              </div>

              {/* Habit toggle chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {habits.map((habit) => {
                  const done = isDoneToday(habit.id);
                  return (
                    <motion.button
                      key={habit.id}
                      onClick={() => toggleHabit(habit)}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "9px 16px",
                        borderRadius: "50px",
                        border: done ? "none" : `1.5px solid ${habit.color}40`,
                        background: done
                          ? `linear-gradient(135deg, ${habit.color}EE, ${habit.color}BB)`
                          : `${habit.color}0A`,
                        color: done ? "#fff" : habit.color,
                        cursor: "pointer",
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        boxShadow: done ? `0 4px 12px ${habit.color}40` : "none",
                        transition: "all 0.18s",
                      }}
                    >
                      <div style={{ color: done ? "rgba(255,255,255,0.9)" : habit.color }}>
                        <HabitIcon name={habit.icon_name} />
                      </div>
                      {habit.label}
                      {done && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* === HABIT CALENDAR CARDS — 3-column grid === */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "12px", fontWeight: 600, color: "#9B8AB0", letterSpacing: "1px", textTransform: "uppercase" }}>
                {monthLabel} — Habit Calendars
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
              {habits.map((habit) => {
                const calData = buildCalendarData(habit.id);
                const streak = getStreak(habit.id);
                const doneThisMonth = calData.slice(0, todayDay).filter(Boolean).length;

                return (
                  <div
                    key={habit.id}
                    style={{
                      background: "#FFFDF8",
                      borderRadius: "18px",
                      border: "1px solid rgba(61,31,114,0.07)",
                      boxShadow: "0 3px 16px rgba(61,31,114,0.055)",
                      padding: "18px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Color accent line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${habit.color}, ${habit.color}55)`, borderRadius: "18px 18px 0 0" }} />

                    {/* Card header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: `${habit.color}16`, border: `1.5px solid ${habit.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: habit.color }}>
                          <HabitIcon name={habit.icon_name} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "14px", color: "#2D1B4E" }}>
                            {habit.label}
                          </div>
                          <div style={{ fontSize: "10px", color: "#9B8AB0", marginTop: "1px" }}>
                            {doneThisMonth}/{todayDay} this month
                          </div>
                        </div>
                      </div>

                      {/* Streak badge */}
                      {streak > 0 && (
                        <div style={{ padding: "3px 9px", borderRadius: "50px", background: `${habit.color}18`, border: `1.5px solid ${habit.color}35`, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "11px", color: habit.color }}>
                          {streak}d
                        </div>
                      )}
                    </div>

                    {/* Calendar grid */}
                    <MonthCalendarGrid
                      year={currentYear}
                      month={currentMonth - 1} // 0-based for the component
                      dayData={calData}
                      fillColor={habit.color}
                      todayDay={todayDay}
                      cellSize={24}
                    />

                    {/* Mini progress bar */}
                    <div style={{ height: "5px", background: `${habit.color}14`, borderRadius: "50px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${todayDay > 0 ? (doneThisMonth / todayDay) * 100 : 0}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        style={{ height: "100%", background: habit.color, borderRadius: "50px" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom summary strip */}
            <div style={{ marginTop: "20px", background: "linear-gradient(135deg, #3D1F72 0%, #6B3FA0 100%)", borderRadius: "18px", padding: "20px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -12, top: -12, opacity: 0.1 }}>
                <PinkFlower size={80} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "17px", color: "#FFF8ED", marginBottom: "3px" }}>
                  Keep it up!
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,248,237,0.55)" }}>
                  {doneCount} habit{doneCount !== 1 ? "s" : ""} done today — you're building something real.
                </div>
              </div>
              <div style={{ display: "flex", gap: "18px", position: "relative", zIndex: 1 }}>
                {[
                  { label: "Today", value: `${doneCount}/${habits.length}` },
                  { label: "This month", value: `${totalThisMonth}` },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "19px", color: "#F5C518" }}>{stat.value}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,248,237,0.45)", marginTop: "2px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
