import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PinkFlower, TealFlower, FernBranch, Sparkle, SmallBranch } from "../components/FloralDecor";
import { MonthCalendarGrid } from "../components/MonthCalendarGrid";
import { apiFetch } from "../../lib/api";

const MOOD_COLORS: Record<string, { color: string; label: string; light: string }> = {
  anger:    { color: "#E84E3A", label: "Anger",    light: "rgba(232,78,58,0.14)" },
  disgust:  { color: "#8FA020", label: "Disgust",  light: "rgba(143,160,32,0.14)" },
  fear:     { color: "#9B59B6", label: "Fear",     light: "rgba(155,89,182,0.14)" },
  joy:      { color: "#F5C518", label: "Joy",      light: "rgba(245,197,24,0.14)" },
  neutral:  { color: "#7DB890", label: "Neutral",  light: "rgba(125,184,144,0.14)" },
  sadness:  { color: "#4466CC", label: "Sadness",  light: "rgba(68,102,204,0.14)" },
  surprise: { color: "#F07830", label: "Surprise", light: "rgba(240,120,48,0.14)" },
};

// Groups days into flowers of 5 petals each
function buildFlowerGroups(daysInMonth: number, moodsByDay: (string | null)[]) {
  const PETALS_PER_FLOWER = 5;
  const flowers: Array<{ days: Array<{ dayIndex: number; mood: string | null }> }> = [];
  for (let i = 0; i < daysInMonth; i += PETALS_PER_FLOWER) {
    const days = [];
    for (let j = 0; j < PETALS_PER_FLOWER && i + j < daysInMonth; j++) {
      days.push({ dayIndex: i + j, mood: moodsByDay[i + j] ?? null });
    }
    flowers.push({ days });
  }
  return flowers;
}

interface FlowerProps {
  daysInMonth: number;
  moodsByDay: (string | null)[];
  trackedCount: number;
}

function SmallMoodFlower({
  days,
  size = 64,
}: {
  days: Array<{ dayIndex: number; mood: string | null }>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const petalCount = days.length;
  const petalDist = size * 0.28;
  const rx = size * 0.13;
  const ry = size * 0.22;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id={`glow-${days[0]?.dayIndex}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {days.map(({ dayIndex, mood }, i) => {
        const angle = (i * 360) / petalCount;
        const rad = (angle * Math.PI) / 180;
        const px = cx + petalDist * Math.sin(rad);
        const py = cy - petalDist * Math.cos(rad);
        const hasMood = mood && MOOD_COLORS[mood];
        const fill = hasMood ? MOOD_COLORS[mood!].color : "rgba(255,248,237,0.12)";
        const stroke = hasMood ? `${MOOD_COLORS[mood!].color}55` : "rgba(255,248,237,0.18)";
        return (
          <ellipse
            key={dayIndex}
            cx={px} cy={py} rx={rx} ry={ry}
            fill={fill} stroke={stroke}
            strokeWidth={hasMood ? 0 : 1}
            transform={`rotate(${angle}, ${px}, ${py})`}
            opacity={hasMood ? 0.93 : 0.38}
            filter={hasMood ? `url(#glow-${days[0]?.dayIndex})` : undefined}
          >
            <title>Day {dayIndex + 1}{mood ? ` — ${MOOD_COLORS[mood]?.label}` : " — not logged"}</title>
          </ellipse>
        );
      })}
      <circle cx={cx} cy={cy} r={size * 0.14} fill="#3D1F72" />
      <circle cx={cx} cy={cy} r={size * 0.09} fill="#F5C518" />
      <circle cx={cx} cy={cy} r={size * 0.045} fill="#2D1B4E" />
    </svg>
  );
}

function MonthFlower({ daysInMonth, moodsByDay, trackedCount }: FlowerProps) {
  const flowers = buildFlowerGroups(daysInMonth, moodsByDay);
  const COLS = 4;
  const flowerSize = 72;
  const gap = 18;

  const rows: typeof flowers[] = [];
  for (let i = 0; i < flowers.length; i += COLS) rows.push(flowers.slice(i, i + COLS));

  const totalWidth = COLS * flowerSize + (COLS - 1) * gap;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: `${gap}px`, width: "100%" }}>
      {rows.map((row, rowIdx) => {
        const rowWidth = row.length * flowerSize + (row.length - 1) * gap;
        const offsetLeft = (totalWidth - rowWidth) / 2;
        return (
          <div key={rowIdx} style={{ display: "flex", gap: `${gap}px`, marginLeft: `${offsetLeft}px` }}>
            {row.map((flower, colIdx) => (
              <div key={colIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <SmallMoodFlower days={flower.days} size={flowerSize} />
                <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "9px", fontWeight: 600, color: "rgba(255,248,237,0.3)", letterSpacing: "0.5px" }}>
                  {flower.days[0].dayIndex + 1}–{flower.days[flower.days.length - 1].dayIndex + 1}
                </span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ marginTop: "4px", fontSize: "11px", fontFamily: "'Nunito', sans-serif", color: "rgba(255,248,237,0.35)", fontWeight: 600 }}>
        {trackedCount} of {daysInMonth} days tracked
      </div>
    </div>
  );
}

const MOOD_COLOR_MAP = Object.fromEntries(
  Object.entries(MOOD_COLORS).map(([k, v]) => [k, v.color])
);

export function Analytics() {
  const [hoveredPrevMonth] = useState<string | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-based
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

  const [currentMoods, setCurrentMoods] = useState<(string | null)[]>(Array(31).fill(null));
  const [trackedCount, setTrackedCount] = useState(0);
  const [monthData, setMonthData] = useState<
    { label: string; short: string; year: number; month: number; data: (string | null)[]; days: number }[]
  >([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    // Current month moods
    apiFetch(`/analytics/moods-by-month?year=${currentYear}&month=${currentMonth}`)
      .then((rows: { day: number; dominant_mood: string }[]) => {
        const arr: (string | null)[] = Array(31).fill(null);
        rows.forEach((r) => { arr[r.day - 1] = r.dominant_mood; });
        setCurrentMoods(arr);
        setTrackedCount(rows.length);
      })
      .catch(console.error);

    // Past 3 months
    const pastMonths = [-3, -2, -1].map((offset) => {
      const d = new Date(currentYear, currentMonth - 1 + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

    Promise.all(
      pastMonths.map((m) =>
        apiFetch(`/analytics/moods-by-month?year=${m.year}&month=${m.month}`)
          .then((rows: { day: number; dominant_mood: string }[]) => {
            const daysInMonth = new Date(m.year, m.month, 0).getDate();
            const arr: (string | null)[] = Array(daysInMonth).fill(null);
            rows.forEach((r) => { arr[r.day - 1] = r.dominant_mood; });
            const label = new Date(m.year, m.month - 1).toLocaleString("default", { month: "long", year: "numeric" });
            return {
              label,
              short: label.slice(0, 3),
              year: m.year,
              month: m.month - 1, // 0-based for MonthCalendarGrid
              data: arr,
              days: daysInMonth,
            };
          })
      )
    ).then(setMonthData).catch(console.error);

    // 3-month emotion distribution
    apiFetch("/analytics/distribution?months=3").then(setDistribution).catch(console.error);
  }, []);

  // Dominant mood for current month — derived from live state
  const dominantCurrentMood = (() => {
    const counts: Record<string, number> = {};
    for (const m of currentMoods.filter(Boolean) as string[]) counts[m] = (counts[m] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
  })();

  // Top emotions sorted by distribution for the summary card
  const topEmotions = Object.entries(distribution).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const currentMonthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#FFF8ED", position: "relative" }}>
      {/* Top-right decoration */}
      <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "relative", width: "175px", height: "145px" }}>
          <FernBranch size={62} style={{ position: "absolute", top: 0, right: 28, opacity: 0.28, transform: "rotate(-10deg)" }} />
          <TealFlower size={46} style={{ position: "absolute", top: 18, right: 12, opacity: 0.62 }} />
          <PinkFlower size={30} style={{ position: "absolute", top: 60, right: 68, opacity: 0.52 }} />
          <Sparkle size={13} color="#1DB5B5" style={{ position: "absolute", top: 38, right: 98 }} />
        </div>
      </div>

      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "38px 34px 60px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <SmallBranch size={38} style={{ opacity: 0.65 }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "10px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "#1DB5B5" }}>
              Looking back
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "38px", fontWeight: 900, color: "#2D1B4E", lineHeight: 1.1, margin: 0 }}>
            Moods
          </h1>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#7A6A8A", maxWidth: "400px" }}>
            Each petal is a day. Each color is a feeling. Watch the flower bloom as you journal.
          </p>
        </div>

        {/* === ARTISTIC MONTH FLOWER === */}
        <div style={{ background: "linear-gradient(160deg, #1E0B3A 0%, #2A1050 50%, #3D1F72 100%)", borderRadius: "24px", overflow: "hidden", marginBottom: "20px", boxShadow: "0 12px 50px rgba(61,31,114,0.35)", position: "relative" }}>
          <div style={{ position: "absolute", top: -8, left: -8, opacity: 0.14 }}><PinkFlower size={90} /></div>
          <div style={{ position: "absolute", bottom: -10, right: -10, opacity: 0.1 }}><TealFlower size={100} /></div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 0 }}>
            {/* Left: flower */}
            <div style={{ padding: "36px 24px 36px 40px", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "11px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(245,197,24,0.65)", marginBottom: "4px" }}>
                  Current Month
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "32px", fontWeight: 900, color: "#FFF8ED", lineHeight: 1 }}>
                  {currentMonthLabel}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,248,237,0.45)", marginTop: "6px" }}>
                  {`${trackedCount} of ${daysInCurrentMonth} days tracked`}
                </div>
              </div>

              <div style={{ marginTop: "24px", marginBottom: "4px", width: "100%" }}>
                <MonthFlower
                  daysInMonth={daysInCurrentMonth}
                  moodsByDay={currentMoods}
                  trackedCount={trackedCount}
                />
              </div>

              {/* Dominant mood badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 14px", borderRadius: "50px", background: `${MOOD_COLORS[dominantCurrentMood]?.color}20`, border: `1.5px solid ${MOOD_COLORS[dominantCurrentMood]?.color}40`, marginTop: "16px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: MOOD_COLORS[dominantCurrentMood]?.color, boxShadow: `0 0 8px ${MOOD_COLORS[dominantCurrentMood]?.color}` }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "13px", color: "#FFF8ED" }}>
                  Mostly {MOOD_COLORS[dominantCurrentMood]?.label}
                </span>
              </div>
            </div>

            {/* Right: mood legend */}
            <div style={{ padding: "36px 32px 36px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", borderLeft: "1px solid rgba(255,248,237,0.06)" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "10px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,248,237,0.35)", marginBottom: "6px" }}>
                Mood Key
              </div>
              {Object.entries(MOOD_COLORS).map(([key, m]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div style={{ width: "12px", height: "20px", borderRadius: "50px", background: m.color, opacity: 0.9, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: "12px", fontWeight: 600, color: "rgba(255,248,237,0.65)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === PAST 3 MONTHS === */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "12px", fontWeight: 600, color: "#9B8AB0", letterSpacing: "1px", textTransform: "uppercase" }}>Previous Months</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(61,31,114,0.09)" }} />
          </div>

          {monthData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px", color: "#9B8AB0", fontSize: "13px" }}>
              Loading previous months...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", alignItems: "stretch" }}>
              {monthData.map((month) => {
                const counts: Record<string, number> = {};
                const logged = month.data.filter(Boolean) as string[];
                for (const m of logged) counts[m] = (counts[m] || 0) + 1;
                const dom = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";
                const domColor = MOOD_COLORS[dom];

                return (
                  <div key={month.label} style={{ background: "#FFFDF8", borderRadius: "18px", border: "1px solid rgba(61,31,114,0.07)", boxShadow: "0 3px 18px rgba(61,31,114,0.06)", padding: "18px 16px", display: "flex", flexDirection: "column", gap: "12px", height: "100%", boxSizing: "border-box" as const }}>
                    <div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "15px", color: "#2D1B4E" }}>{month.label}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "4px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: domColor.color }} />
                        <span style={{ fontSize: "11px", fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#7A6A8A" }}>
                          {logged.length > 0 ? `Mostly ${domColor.label}` : "No entries"}
                        </span>
                      </div>
                    </div>

                    <MonthCalendarGrid
                      year={month.year}
                      month={month.month}
                      dayData={month.data}
                      moodColors={MOOD_COLOR_MAP}
                      cellSize={28}
                    />

                    <div style={{ height: "6px", borderRadius: "50px", overflow: "hidden", display: "flex", background: "rgba(61,31,114,0.05)", marginTop: "auto" }}>
                      {Object.entries(MOOD_COLORS).map(([key, m]) => {
                        const pct = ((counts[key] || 0) / month.days) * 100;
                        if (pct < 1) return null;
                        return <div key={key} style={{ width: `${pct}%`, background: m.color }} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* === 3-MONTH DISTRIBUTION CHART === */}
        <div style={{ background: "#FFFDF8", borderRadius: "18px", border: "1px solid rgba(61,31,114,0.07)", boxShadow: "0 3px 18px rgba(61,31,114,0.06)", padding: "22px 24px", marginBottom: "20px" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "17px", color: "#2D1B4E" }}>3-Month Emotion Distribution</div>
            <div style={{ fontSize: "12px", color: "#9B8AB0", marginTop: "2px" }}>Combined across your last 3 months of journaling</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {Object.entries(MOOD_COLORS)
              .sort((a, b) => (distribution[b[0]] || 0) - (distribution[a[0]] || 0))
              .map(([key, m]) => {
                const pct = distribution[key] || 0;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "62px", flexShrink: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "12px", color: "#2D1B4E", textAlign: "right" }}>{m.label}</div>
                    <div style={{ flex: 1, height: "18px", background: `${m.color}14`, borderRadius: "50px", overflow: "hidden", position: "relative" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        style={{ height: "100%", background: `linear-gradient(90deg, ${m.color}BB, ${m.color})`, borderRadius: "50px", boxShadow: `0 2px 8px ${m.color}40`, position: "relative" }}
                      >
                        {pct > 16 && (
                          <div style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", fontSize: "10px", fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: "rgba(255,255,255,0.9)" }}>{pct}%</div>
                        )}
                      </motion.div>
                    </div>
                    <div style={{ width: "34px", flexShrink: 0, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "12px", color: pct > 16 ? m.color : "#B0A0C0" }}>{pct}%</div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* === SUMMARY CARD — dynamically built from real distribution === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: "linear-gradient(135deg, #3D1F72 0%, #6B3FA0 100%)", borderRadius: "20px", padding: "24px 28px", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.1 }}><PinkFlower size={78} /></div>
          <div style={{ position: "absolute", right: 58, bottom: -16, opacity: 0.08 }}><TealFlower size={68} /></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "11px", color: "rgba(245,197,24,0.75)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "7px" }}>
              3-Month Summary
            </div>
            {topEmotions.length > 0 ? (
              <>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "19px", color: "#FFF8ED", marginBottom: "10px" }}>
                  {MOOD_COLORS[topEmotions[0][0]]?.label} leads your emotional landscape
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,248,237,0.65)", lineHeight: 1.65, maxWidth: "480px" }}>
                  Over the past 3 months, {MOOD_COLORS[topEmotions[0][0]]?.label} accounts for the largest share of your recorded moods
                  {topEmotions[1] ? ` — followed by ${MOOD_COLORS[topEmotions[1][0]]?.label}` : ""}.
                </div>
                <div style={{ display: "flex", gap: "22px", marginTop: "16px" }}>
                  {topEmotions.map(([key, pct]) => (
                    <div key={key}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "21px", color: MOOD_COLORS[key]?.color }}>{pct}%</div>
                      <div style={{ fontSize: "10px", color: "rgba(255,248,237,0.45)", marginTop: "2px" }}>Avg. {MOOD_COLORS[key]?.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "17px", color: "#FFF8ED" }}>
                Start journaling to see your 3-month summary.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
