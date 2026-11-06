import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const HERO = "/assets/mistwood/backgrounds/tea-sunrise.png";

export function MotionBoot() {
  const { pathname } = useLocation();
  const revealRef = useRef(null);

  useEffect(() => {
    if (!document.documentElement.classList.contains("motion")) return undefined;

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    revealRef.current = reveal;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const bar = document.querySelector(".mv-progress");
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        document.querySelectorAll("[data-parallax]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
          el.style.setProperty("--p", progress.toFixed(3));
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      reveal.disconnect();
      revealRef.current = null;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const reveal = revealRef.current;
    if (!reveal) return undefined;
    const frame = requestAnimationFrame(() => {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => reveal.observe(el));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <div className="mv-progress" aria-hidden="true" />;
}

export function IntroLoader() {
  const [phase, setPhase] = useState("off");

  useEffect(() => {
    if (!document.documentElement.classList.contains("motion")) return undefined;
    try {
      if (sessionStorage.getItem("mistwood-entered")) return undefined;
    } catch {
      /* storage can be blocked */
    }

    let shown = false;
    let leaveTimer = 0;
    const image = new Image();
    image.src = HERO;

    const finish = () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(cap);
      try {
        sessionStorage.setItem("mistwood-entered", "1");
      } catch {
        /* storage can be blocked */
      }
      if (!shown) return;
      setPhase("leave");
      leaveTimer = window.setTimeout(() => setPhase("off"), 520);
    };

    const showTimer = window.setTimeout(() => {
      shown = true;
      setPhase("on");
    }, 160);
    const cap = window.setTimeout(finish, 1600);

    if (image.complete && image.naturalWidth) finish();
    else {
      image.onload = finish;
      image.onerror = finish;
    }

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(cap);
      window.clearTimeout(leaveTimer);
    };
  }, []);

  if (phase === "off") return null;

  return (
    <div className={phase === "leave" ? "mv-loader is-leave" : "mv-loader"} aria-hidden="true">
      <img alt="" src="/assets/mistwood/branding/logo.png" />
      <span className="mv-loader-line" />
    </div>
  );
}
