import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePublicSettings } from "../../hooks/usePublicSettings.js";
import { formatSettingsTime } from "../../utils/formatSettingsTime.js";
import {
  addMonths,
  buildCalendar,
  countNightsByType,
  currentMonthKey,
  dayStatusClass,
  monthGridCells,
  readableMonth,
  todayKeyColombo,
} from "../../utils/adminAvailabilityCalendar.js";
import AdminIcon from "./AdminIcon.jsx";

function PanelTitle({ title, actionTo }) {
  return (
    <header className="admin-panel-title">
      <span>
        <AdminIcon name="calendar" size={20} /> <h2>{title}</h2>
      </span>
      <Link to={actionTo}>View Full Calendar →</Link>
    </header>
  );
}

export default function DashboardAvailabilityCalendar({ onMonthStats }) {
  const pub = usePublicSettings();
  const [month, setMonth] = useState(currentMonthKey);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadError("");
    fetch(`/api/admin/availability?month=${encodeURIComponent(month)}`)
      .then((r) => {
        if (r.status === 403) return { requests: [], blocks: [] };
        if (!r.ok) return r.json().then((body) => Promise.reject(new Error(body.error || "Could not load calendar.")));
        return r.json();
      })
      .then((json) => {
        if (active) setData(json);
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setLoadError(err.message || "Could not load calendar.");
        }
      });
    return () => {
      active = false;
    };
  }, [month]);

  const calendar = useMemo(() => buildCalendar(month, data), [month, data]);
  const cells = useMemo(() => monthGridCells(month), [month]);
  const reportStats = useCallback(() => {
    if (!onMonthStats) return;
    const byType = countNightsByType(calendar);
    onMonthStats({ ...byType, total: Object.keys(calendar).length });
  }, [calendar, onMonthStats]);

  useEffect(() => {
    reportStats();
  }, [reportStats]);
  const todayKey = todayKeyColombo();
  const checkIn = formatSettingsTime(pub.checkInTime || "15:00");
  const checkOut = formatSettingsTime(pub.checkOutTime || "11:00");

  return (
    <article className="admin-panel admin-calendar-panel">
      <PanelTitle title="Availability Calendar" actionTo="/admin/availability" />
      {loadError ? <p className="admin-empty" style={{ margin: "0 0 10px", textAlign: "left" }}>{loadError}</p> : null}
      <div className="admin-calendar-layout">
        <div>
          <div className="admin-month">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((value) => addMonths(value, -1))}>
              ‹
            </button>
            <strong>{readableMonth(month)}</strong>
            <button type="button" aria-label="Next month" onClick={() => setMonth((value) => addMonths(value, 1))}>
              ›
            </button>
          </div>
          <div className="admin-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="admin-days">
            {cells.map(({ key, day, inMonth }) => {
              const entry = calendar[key];
              const title = inMonth && entry?.name ? entry.name : undefined;
              return (
                <span
                  key={key}
                  className={dayStatusClass(entry, inMonth, key === todayKey)}
                  title={title}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
        <div className="admin-calendar-key">
          <span>
            <i className="available" />
            Available
          </span>
          <span>
            <i className="booked" />
            Booked (Confirmed)
          </span>
          <span>
            <i className="hold" />
            Pending / Hold
          </span>
          <span>
            <i className="blocked" />
            Blocked (Owner)
          </span>
          <hr />
          <small>
            Check-in: {checkIn}
            <br />
            Check-out: {checkOut}
          </small>
        </div>
      </div>
    </article>
  );
}
