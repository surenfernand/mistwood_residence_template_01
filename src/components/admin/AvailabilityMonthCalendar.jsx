import { useMemo } from "react";
import {
  buildCalendarEvents,
  monthWeeks,
  segmentsForWeek,
  weekContainingDay,
} from "../../utils/adminAvailabilityCalendar.js";

export default function AvailabilityMonthCalendar({
  month,
  data,
  calendar,
  todayKey,
  selectedDay,
  onSelectDay,
  onSelectEvent,
  view = "month",
}) {
  const events = useMemo(() => buildCalendarEvents(data), [data]);
  const weeks = useMemo(() => {
    const all = monthWeeks(month);
    if (view === "week" && selectedDay) return [weekContainingDay(month, selectedDay)];
    return all;
  }, [month, view, selectedDay]);

  return (
    <div className={`cal-month${view === "week" ? " cal-month--week" : ""}`}>
      <div className="cal-weekdays" role="row">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <span key={label} role="columnheader">
            {label}
          </span>
        ))}
      </div>
      <div className="cal-weeks">
        {weeks.map((week) => {
          const { segments, laneCount } = segmentsForWeek(week, events);
          const barRows = Math.max(1, laneCount);
          return (
            <div
              key={week[0].key}
              className="cal-week-row"
              style={{ "--cal-bar-rows": barRows }}
            >
              {week.map(({ key, day, inMonth }) => {
                const entry = inMonth ? calendar[key] : null;
                const type = inMonth ? entry?.type || "available" : "outside";
                const isToday = key === todayKey;
                const isSelected = key === selectedDay;
                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      "cal-day",
                      `cal-day--${type}`,
                      !inMonth ? "cal-day--outside" : "",
                      isToday ? "cal-day--today" : "",
                      isSelected ? "cal-day--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => inMonth && onSelectDay(key)}
                    disabled={!inMonth}
                    aria-pressed={isSelected}
                    aria-label={inMonth ? `Day ${day}` : undefined}
                  >
                    <span className="cal-day-num">{day}</span>
                  </button>
                );
              })}
              <div className="cal-bars" aria-hidden={!segments.length}>
                {segments.map((seg) => (
                  <button
                    key={`${seg.kind}-${seg.id}-${seg.clipStart}`}
                    type="button"
                    className={[
                      "cal-bar",
                      `cal-bar--${seg.type}`,
                      seg.continuesPrior ? "cal-bar--clip-start" : "",
                      seg.continuesAfter ? "cal-bar--clip-end" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      gridColumn: `${seg.colStart} / ${seg.colEnd}`,
                      gridRow: seg.lane,
                    }}
                    onClick={() => onSelectEvent(seg, seg.clipStart)}
                    title={seg.label}
                  >
                    <span>{seg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}