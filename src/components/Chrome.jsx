import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { usePublicSettings } from "../hooks/usePublicSettings.js";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "The apartment" },
  { to: "/explore", label: "Around Nuwara Eliya" },
  { to: "/contact", label: "Contact us" },
];

export function SiteHeader() {
  const pub = usePublicSettings();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="topbar">
      <NavLink className="brand" to="/" end>
        <span className="logo-frame"><img alt="" className="official-logo" src={pub.logoUrl || "/assets/logo-mark.png"} /></span>
        {pub.propertyName}
        <small>NUWARA ELIYA · SRI LANKA</small>
      </NavLink>
      <button aria-label="Toggle navigation" className="menu-btn" type="button" onClick={() => setOpen((value) => !value)}>☰</button>
      <nav className={open ? "nav open" : "nav"}>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "active" : undefined)}>
            {link.label}
          </NavLink>
        ))}
        <NavLink className="nav-cta" to="/contact#booking">Book your stay</NavLink>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const pub = usePublicSettings();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <NavLink className="brand" to="/">
              <span className="logo-frame"><img alt="" className="official-logo" src={pub.logoUrl || "/assets/logo-mark.png"} /></span>
              {pub.propertyName}
              <small>NUWARA ELIYA · SRI LANKA</small>
            </NavLink>
            <p className="muted" style={{ maxWidth: 340, marginTop: 24 }}>{pub.footerTagline}</p>
          </div>
          <div>
            <span className="eyebrow">On this website</span>
            <NavLink to="/about">The apartment</NavLink>
            <NavLink to="/about#meals">Meals</NavLink>
            <NavLink to="/apartments">Photo gallery</NavLink>
            <NavLink to="/explore">Around Nuwara Eliya</NavLink>
            <NavLink to="/deals">Offers</NavLink>
            <NavLink to="/about#practical">Practical notes</NavLink>
          </div>
          <div>
            <span className="eyebrow">Plan your stay</span>
            <NavLink to="/contact#booking">Book your stay</NavLink>
            <NavLink to="/contact#enquiry">Send an enquiry</NavLink>
            <a href={pub.whatsappUrl}>Message us on WhatsApp</a>
            <NavLink to="/policies">Guest policies</NavLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {pub.propertyName}. Design concept for client review.</span>
          <span>Made for the beauty of Sri Lanka's highlands.</span>
          <NavLink to="/credits">Media credits</NavLink>
        </div>
      </div>
    </footer>
  );
}

export function SocialDock() {
  const [open, setOpen] = useState(false);
  const pub = usePublicSettings();
  const items = [
    { label: "Facebook", href: pub.facebookUrl, icon: "facebook" },
    { label: "WhatsApp", href: pub.whatsappUrl, icon: "whatsapp" },
    { label: "YouTube", href: pub.youtubeUrl, icon: "youtube" },
    { label: "Instagram", href: pub.instagramUrl, icon: "instagram" },
    { label: "Telegram", href: pub.telegramUrl, icon: "telegram" },
  ].filter((item) => item.href);
  if (!items.length) return null;
  return (
    <div className={open ? "social-dock open" : "social-dock"}>
      <div className="social-actions" id="social-links">
        {items.map((item) => (
          <a key={item.label} aria-label={item.label} className="social-btn" href={item.href} rel="noopener noreferrer" target="_blank" title={item.label}>
            {item.icon === "facebook" ? (
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></svg>
            ) : item.icon === "whatsapp" ? (
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.5 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.7 6L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.2-3.6-8.4ZM12.2 21.8a10 10 0 0 1-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a10 10 0 1 1 8.5 4.7Zm5.5-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.4 8.4 0 0 1-4.2-3.7c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.6L8.8 7c-.2-.4-.4-.4-.7-.4h-.6c-.2 0-.6.1-.9.4a3.6 3.6 0 0 0-1.1 2.7c0 1.6 1.2 3.2 1.3 3.4a13.4 13.4 0 0 0 5.1 4.5c1.9.8 2.7.9 3.7.8 1.1-.2 1.8-.8 2-1.5.2-.7.2-1.3.1-1.5Z" /></svg>
            ) : (
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M21 8.2a3 3 0 0 0-2.1-2.1C17.2 5.7 12 5.7 12 5.7s-5.2 0-6.9.4A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.7.4 6.9.4 6.9.4s5.2 0 6.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10.4 14.8V9.2L15.2 12l-4.8 2.8Z" /></svg>
            )}
          </a>
        ))}
      </div>
      <button aria-controls="social-links" aria-expanded={open} aria-label="Social links" className="social-btn social-main" type="button" onClick={() => setOpen((value) => !value)}>
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.2" /><circle cx="16.5" cy="6.5" r="2.2" /><circle cx="16.5" cy="17.5" r="2.2" /><path d="m8 11 6.4-3.4M8 13l6.4 3.4" /></svg>
      </button>
    </div>
  );
}

export function PageShell() {
  const location = useLocation();

  useEffect(() => {
    const bar = document.querySelector(".topbar");
    const prog = document.querySelector(".progress");
    const update = () => {
      bar?.classList.toggle("scrolled", scrollY > 48);
      if (prog) prog.style.width = `${(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100}%`;
    };
    addEventListener("scroll", update, { passive: true });
    update();
    return () => removeEventListener("scroll", update);
  }, [location.pathname]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.09 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <>
      <div className="progress" />
      <SiteHeader />
      <main><Outlet /></main>
      <SiteFooter />
    </>
  );
}
