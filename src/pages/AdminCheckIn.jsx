import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";
import { formatAdminDate } from "../utils/adminDates.js";
import { useAdminSession } from "../utils/adminSession.js";
import { useSiteTitle } from "../hooks/useSiteTitle.js";

const STAY_STATUS = {
  confirmed: "Confirmed",
  checked_in: "Checked in",
  checked_out: "Checked out",
  cancelled: "Cancelled",
};

const REQUEST_STATUS = {
  new: "New",
  contacted: "Contacted",
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS = {
  unpaid: "Unpaid",
  partial: "Deposit paid",
  paid: "Paid in full",
};

function label(map, key) {
  return map[key] || String(key || "—").replace(/_/g, " ");
}

/** Normalize pasted text, legacy paths, or admin QR URLs to a raw check-in token. */
export function parseCheckInToken(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    if (url.pathname === "/admin/check-in" || url.pathname === "/admin/check-in/") {
      return url.searchParams.get("token")?.trim() || "";
    }
    const legacy = url.pathname.match(/^\/check-in\/([^/]+)/);
    if (legacy) return decodeURIComponent(legacy[1]);
  } catch {
    // plain token
  }
  if (value.includes("/check-in/")) {
    return value.replace(/^.*\/check-in\//, "").split(/[?#]/)[0];
  }
  if (value.includes("token=")) {
    return value.replace(/^.*[?&]token=/, "").split(/[&#]/)[0];
  }
  return value;
}

function adminCheckInPath(token) {
  const trimmed = token.trim();
  return trimmed ? `/admin/check-in?token=${encodeURIComponent(trimmed)}` : "/admin/check-in";
}

export default function AdminCheckIn() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { admin, loading: sessionLoading } = useAdminSession();
  const qrToken = (searchParams.get("token") || "").trim();

  const [navOpen, setNavOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [bookingLoad, setBookingLoad] = useState({ loading: false, error: "", data: null });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const fallbackControlsRef = useRef(null);

  useSiteTitle(qrToken ? "Confirm check-in" : "QR check-in");

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    fallbackControlsRef.current?.stop();
    fallbackControlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (sessionLoading) return;
    if (admin) return;
    const returnPath = adminCheckInPath(qrToken);
    navigate(`/admin/login?return=${encodeURIComponent(returnPath)}`, { replace: true });
  }, [admin, sessionLoading, navigate, qrToken]);

  const loadBooking = useCallback(async (token) => {
    if (!token) {
      setBookingLoad({ loading: false, error: "", data: null });
      setSuccess(false);
      return;
    }
    setBookingLoad({ loading: true, error: "", data: null });
    setSuccess(false);
    try {
      const r = await fetch(`/api/check-in/${encodeURIComponent(token)}`, { credentials: "include" });
      const x = await r.json();
      if (r.status === 401) {
        navigate(`/admin/login?return=${encodeURIComponent(adminCheckInPath(token))}`, { replace: true });
        return;
      }
      if (!r.ok) throw new Error(x.error || "Could not load booking.");
      setBookingLoad({ loading: false, error: "", data: x });
    } catch (e) {
      setBookingLoad({ loading: false, error: e.message, data: null });
    }
  }, [navigate]);

  useEffect(() => {
    if (!admin || sessionLoading) return;
    loadBooking(qrToken);
  }, [admin, sessionLoading, qrToken, loadBooking]);

  const goToToken = (raw) => {
    const parsed = parseCheckInToken(raw);
    if (!parsed) return;
    stopCamera();
    setScannerOpen(false);
    setSearchParams(parsed ? { token: parsed } : {}, { replace: true });
  };

  const openFromInput = () => goToToken(tokenInput);

  const startScanner = async () => {
    setScannerError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError("Camera access is not available in this browser.");
      return;
    }
    setScannerOpen(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        setScannerOpen(false);
        setScannerError("Could not start the camera. Please try again.");
        return;
      }
      const useResult = (value) => {
        const parsed = parseCheckInToken(value);
        if (!parsed) return;
        goToToken(parsed);
      };

      if ("BarcodeDetector" in window) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const scan = async () => {
          try {
            useResult((await detector.detect(video))[0]?.rawValue?.trim());
            if (!streamRef.current) return;
          } catch {
            // Keep scanning while the camera is adjusting focus.
          }
          frameRef.current = requestAnimationFrame(scan);
        };
        frameRef.current = requestAnimationFrame(scan);
        return;
      }

      const reader = new BrowserQRCodeReader();
      fallbackControlsRef.current = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        useResult(result?.getText()?.trim());
      });
    } catch (error) {
      stopCamera();
      setScannerOpen(false);
      setScannerError(error.name === "NotAllowedError" ? "Camera permission was denied. Allow camera access and try again." : "Could not open the camera. Please try again.");
    }
  };

  const confirmCheckIn = async () => {
    if (!qrToken || !bookingLoad.data?.canCheckIn) return;
    setBusy(true);
    setBookingLoad((current) => ({ ...current, error: "" }));
    try {
      const r = await fetch(`/api/check-in/${encodeURIComponent(qrToken)}`, { method: "POST", credentials: "include" });
      const x = await r.json();
      if (r.status === 401) {
        navigate(`/admin/login?return=${encodeURIComponent(adminCheckInPath(qrToken))}`, { replace: true });
        return;
      }
      if (!r.ok) throw new Error(x.error || "Check-in failed.");
      setSuccess(true);
      await loadBooking(qrToken);
    } catch (e) {
      setBookingLoad((current) => ({ ...current, error: e.message }));
    } finally {
      setBusy(false);
    }
  };

  if (sessionLoading || !admin) {
    return <main className="admin-login-page"><p className="sr-only" role="status">Checking your admin session…</p></main>;
  }

  const booking = bookingLoad.data?.booking;
  const canCheckIn = Boolean(bookingLoad.data?.canCheckIn) && !success;
  const stayStatus = success ? "checked_in" : booking?.status;

  return (
    <main className="admin-app booking-admin">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>{qrToken ? "Confirm arrival" : "Check-in"}</h1>
            <span>{qrToken ? "Review the booking below and confirm when the guest arrives." : "Scan a guest QR code with this device’s camera, or paste its link."}</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page" style={{ maxWidth: 640 }}>
          <p>
            <Link to="/admin/booking-requests">← Booking requests</Link>
            {qrToken ? (
              <>
                {" · "}
                <Link to="/admin/check-in" onClick={() => { setSuccess(false); setTokenInput(""); }}>Scan another QR</Link>
              </>
            ) : null}
          </p>

          {qrToken ? (
            <section className="booking-list-card" style={{ marginTop: 16, padding: 20 }}>
              {bookingLoad.loading ? (
                <p role="status">Loading booking…</p>
              ) : null}
              {bookingLoad.error && !booking ? (
                <p className="booking-error" role="alert">{bookingLoad.error}</p>
              ) : null}
              {booking ? (
                <>
                  <h2 style={{ marginTop: 0 }}>{booking.guestName}</h2>
                  <dl className="booking-dialog-list" style={{ margin: "16px 0" }}>
                    <div>
                      <dt>Check-in</dt>
                      <dd>{formatAdminDate(booking.checkIn)}</dd>
                    </div>
                    <div>
                      <dt>Check-out</dt>
                      <dd>{formatAdminDate(booking.checkOut)}</dd>
                    </div>
                    <div>
                      <dt>Guests</dt>
                      <dd>{booking.guests || "—"}</dd>
                    </div>
                    <div>
                      <dt>Payment</dt>
                      <dd>{label(PAYMENT_STATUS, booking.paymentStatus)}</dd>
                    </div>
                    <div>
                      <dt>Booking request</dt>
                      <dd>{booking.requestStatus ? label(REQUEST_STATUS, booking.requestStatus) : "—"}</dd>
                    </div>
                    <div>
                      <dt>Stay status</dt>
                      <dd>{label(STAY_STATUS, stayStatus)}</dd>
                    </div>
                  </dl>
                  {success ? (
                    <p className="notice" role="status" style={{ marginBottom: 0 }}>
                      Guest checked in successfully. This booking cannot be checked in again.
                    </p>
                  ) : null}
                  {bookingLoad.error ? <p className="booking-error" role="alert">{bookingLoad.error}</p> : null}
                  {canCheckIn ? (
                    <button className="mh-btn" type="button" onClick={confirmCheckIn} disabled={busy}>
                      {busy ? "Confirming…" : "Confirm check-in"}
                    </button>
                  ) : !success ? (
                    <p style={{ marginBottom: 0, color: "#65706a", fontSize: 14 }}>
                      Check-in is only available when the stay status is Confirmed.
                    </p>
                  ) : null}
                </>
              ) : null}
            </section>
          ) : (
            <>
              <label className="booking-search" style={{ display: "block", marginTop: 16 }}>
                <span style={{ display: "block", marginBottom: 6 }}>Check-in token or QR URL</span>
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="/admin/check-in?token=… or legacy /check-in/…"
                  style={{ width: "100%" }}
                />
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <button className="mh-btn" type="button" onClick={startScanner}>Open camera scanner</button>
                <button className="mh-btn" type="button" onClick={openFromInput}>Open booking</button>
              </div>
              {scannerError ? <p className="notice" role="alert">{scannerError}</p> : null}
              {scannerOpen ? (
                <section style={{ marginTop: 16 }} aria-label="QR camera scanner">
                  <video ref={videoRef} muted playsInline style={{ width: "100%", borderRadius: 10, background: "#111" }} />
                  <button className="mh-btn" type="button" onClick={() => { stopCamera(); setScannerOpen(false); }} style={{ marginTop: 8 }}>Close camera</button>
                </section>
              ) : null}
              <p style={{ marginTop: 16, fontSize: 13, color: "#65706a" }}>
                QR codes from confirmation emails open this admin page. Only signed-in staff can view booking details or confirm arrival.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}