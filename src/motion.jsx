import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const HERO = "/assets/mistwood/backgrounds/tea-sunrise.jpg";

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

function pageImagesReady(root) {
  const view = window.innerHeight * 1.2;
  const images = [...root.querySelectorAll("img")].filter((img) => {
    if (!img.getAttribute("src")) return false;
    if (img.loading !== "lazy") return true;
    const top = img.getBoundingClientRect().top;
    return top < view && top > -200;
  });
  return Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    });
  }));
}

export function RouteLoader() {
  const { pathname } = useLocation();
  const seen = useRef(pathname);
  const [phase, setPhase] = useState("off");

  useEffect(() => {
    if (seen.current === pathname) return undefined;
    seen.current = pathname;

    let cancelled = false;
    setPhase("on");
    const started = performance.now();

    const frame = requestAnimationFrame(() => {
      const root = document.querySelector(".page-enter") || document.body;
      const images = pageImagesReady(root);
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const cap = new Promise((resolve) => window.setTimeout(resolve, 2200));
      Promise.race([Promise.all([images, fonts]), cap]).then(() => {
        if (cancelled) return;
        const wait = Math.max(0, 420 - (performance.now() - started));
        window.setTimeout(() => {
          if (cancelled) return;
          setPhase("leave");
        }, wait);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (phase !== "leave") return undefined;
    const timer = window.setTimeout(() => setPhase("off"), 420);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "off") return null;

  return (
    <div className={phase === "leave" ? "route-loader is-leave" : "route-loader"} role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <svg className="route-spin" viewBox="0 0 150 150" aria-hidden="true">
        <circle className="route-spin-track" cx="75" cy="75" r="72" />
        <circle className="route-spin-arc" cx="75" cy="75" r="72" />
      </svg>
    </div>
  );
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
