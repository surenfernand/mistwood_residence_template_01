import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BrowserQRCodeReader } from "@zxing/browser";
import AdminSidebar, { AdminMenuToggle } from "../components/admin/AdminSidebar.jsx";
import AdminUserTools from "../components/admin/AdminUserTools.jsx";

export default function AdminCheckIn() {
  const [navOpen, setNavOpen] = useState(false);
  const [token, setToken] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const fallbackControlsRef = useRef(null);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    fallbackControlsRef.current?.stop();
    fallbackControlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  const open = () => {
    const trimmed = token.trim().replace(/^.*\/check-in\//, "");
    if (!trimmed) return;
    window.location.href = `/check-in/${encodeURIComponent(trimmed)}`;
  };

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
        if (!value) return;
        stopCamera();
        setScannerOpen(false);
        setToken(value);
        window.location.href = `/check-in/${encodeURIComponent(value.replace(/^.*\/check-in\//, ""))}`;
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

  return (
    <main className="admin-app booking-admin">
      <AdminSidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <section className="admin-main">
        <header className="admin-topbar">
          <AdminMenuToggle onOpen={() => setNavOpen(true)} />
          <div>
            <p>Admin panel</p>
            <h1>Check-in</h1>
            <span>Scan a guest QR code with this device’s camera, or paste its link.</span>
          </div>
          <img src="/assets/mistwood/decorations/leaf-branch.png" alt="" />
          <AdminUserTools />
        </header>
        <div className="booking-requests-page" style={{ maxWidth: 520, padding: 24 }}>
          <Link to="/admin/booking-requests">← Booking requests</Link>
          <label className="booking-search" style={{ display: "block", marginTop: 16 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Check-in token or URL</span>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="/check-in/…" style={{ width: "100%" }} />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            <button className="mh-btn" type="button" onClick={startScanner}>Open camera scanner</button>
            <button className="mh-btn" type="button" onClick={open}>Open check-in page</button>
          </div>
          {scannerError ? <p className="notice" role="alert">{scannerError}</p> : null}
          {scannerOpen ? <section style={{ marginTop: 16 }} aria-label="QR camera scanner">
            <video ref={videoRef} muted playsInline style={{ width: "100%", borderRadius: 10, background: "#111" }} />
            <button className="mh-btn" type="button" onClick={() => { stopCamera(); setScannerOpen(false); }} style={{ marginTop: 8 }}>Close camera</button>
          </section> : null}
          <p style={{ marginTop: 16, fontSize: 13 }}>The QR contains no public check-in action. Only a signed-in admin can open its booking and confirm arrival.</p>
        </div>
      </section>
    </main>
  );
}
