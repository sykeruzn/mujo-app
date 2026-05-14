import React from "react";

interface MonthCalendarGridProps {
  year: number;
  month: number; // 0-indexed
  // Array indexed by day-1: string = mood key, boolean = habit done/not, null = no data
  dayData: Array<string | boolean | null>;
  fillColor?: string; // single color for habit-type calendars
  moodColors?: Record<string, string>; // mood key -> hex color for mood calendars
  todayDay?: number; // 1-indexed
  cellSize?: number; // px, default 26
}

export function MonthCalendarGrid({
  year,
  month,
  dayData,
  fillColor,
  moodColors,
  todayDay,
  cellSize = 26,
}: MonthCalendarGridProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDow + 6) % 7; // Monday-start
  const gap = 2;

  const cells: Array<{ day: number } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push(null);

  const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function getCellColor(day: number): string | null {
    const data = dayData[day - 1];
    if (data === null || data === undefined) return null;
    if (typeof data === "boolean") {
      return data ? (fillColor || "#7DB890") : null;
    }
    if (typeof data === "string" && moodColors) {
      return moodColors[data] || null;
    }
    return null;
  }

  const totalWidth = cellSize * 7 + gap * 6;

  return (
    <div style={{ width: "100%" }}>
      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, 1fr)`,
          gap: `${gap}px`,
          marginBottom: "4px",
        }}
      >
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "9px",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              color: "#C0B0D0",
              lineHeight: 1,
              paddingBottom: "2px",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(7, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {cells.map((cell, i) => {
          if (!cell) {
            return (
              <div key={i} style={{ height: cellSize }} />
            );
          }

          const { day } = cell;
          const color = getCellColor(day);
          const isToday = day === todayDay;
          const isPast = !todayDay || day < todayDay;
          const isFuture = todayDay ? day > todayDay : false;

          if (color) {
            return (
              <div
                key={i}
                title={`Day ${day}`}
                style={{
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: cellSize * 0.72,
                  height: cellSize * 0.72,
                  borderRadius: "50%",
                  background: `${color}CC`,
                  boxShadow: isToday ? `0 0 0 2px white, 0 0 0 3.5px ${color}` : `0 1px 4px ${color}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    fontSize: cellSize * 0.3,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1,
                    userSelect: "none",
                  }}>
                    {day}
                  </span>
                </div>
              </div>
            );
          }

          // No data
          return (
            <div
              key={i}
              style={{
                height: cellSize,
                borderRadius: "6px",
                background: isFuture ? "transparent" : "transparent",
                border: isToday
                  ? "2px dashed rgba(61,31,114,0.35)"
                  : isPast
                  ? "1.5px solid rgba(61,31,114,0.1)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "default",
              }}
            >
              {(isPast || isToday) && (
                <span
                  style={{
                    fontSize: cellSize * 0.3,
                    fontFamily: "'Nunito', sans-serif",
                    color: isToday ? "rgba(61,31,114,0.5)" : "rgba(61,31,114,0.2)",
                    fontWeight: isToday ? 700 : 400,
                    lineHeight: 1,
                  }}
                >
                  {day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
