import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "The apartment" },
  { to: "/explore", label: "Around Nuwara Eliya" },
  { to: "/contact", label: "Contact us" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="topbar">
      <NavLink className="brand" to="/" end>
        <span className="logo-frame"><img alt="" className="official-logo" src="/assets/logo-mark.png" /></span>
        Mistwood Residence
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
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <NavLink className="brand" to="/">
              <span className="logo-frame"><img alt="" className="official-logo" src="/assets/logo-mark.png" /></span>
              Mistwood Residence
              <small>NUWARA ELIYA · SRI LANKA</small>
            </NavLink>
            <p className="muted" style={{ maxWidth: 340, marginTop: 24 }}>One apartment in Nuwara Eliya, reserved as a whole for your group.</p>
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
            <a href="https://wa.me/94765900800">Message us on WhatsApp</a>
            <NavLink to="/policies">Guest policies</NavLink>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Mistwood Residence. Design concept for client review.</span>
          <span>Made for the beauty of Sri Lanka's highlands.</span>
          <NavLink to="/credits">Media credits</NavLink>
        </div>
      </div>
    </footer>
  );
}

export function SocialDock() {
  const [open, setOpen] = useState(false);
  const pending = (event) => {
    event.preventDefault();
    alert("Demo link — add the owner-approved contact URL before launch.");
  };
  return (
    <div className={open ? "social-dock open" : "social-dock"}>
      <div className="social-actions">
        <a aria-label="WhatsApp" className="social-btn" href="https://wa.me/94765900800" title="WhatsApp Mistwood Residence">
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3.5A11.7 11.7 0 0 0 12.1 0C5.5 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.7 6L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.2-3.6-8.4ZM12.2 21.8a10 10 0 0 1-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a10 10 0 1 1 8.5 4.7Zm5.5-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.4 8.4 0 0 1-4.2-3.7c-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.6L8.8 7c-.2-.4-.4-.4-.7-.4h-.6c-.2 0-.6.1-.9.4a3.6 3.6 0 0 0-1.1 2.7c0 1.6 1.2 3.2 1.3 3.4a13.4 13.4 0 0 0 5.1 4.5c1.9.8 2.7.9 3.7.8 1.1-.2 1.8-.8 2-1.5.2-.7.2-1.3.1-1.5Z" /></svg>
        </a>
        <a aria-label="Telegram" className="social-btn" href="#" title="Telegram — link pending" onClick={pending}>
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="m21.9 3.5-3.4 16.1c-.3 1.1-.9 1.4-1.8.9l-5.2-3.8-2.5 2.4c-.3.3-.5.5-1 .5l.4-5.3L18 5.7c.4-.4-.1-.6-.6-.3L5.6 12.9l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.3 2c.9-.4 1.8.2 1.6 1.5Z" /></svg>
        </a>
        <a aria-label="Facebook" className="social-btn" href="https://www.facebook.com/share/19u5hKB7DJ/" rel="noopener noreferrer" target="_blank" title="Facebook page">
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.7-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></svg>
        </a>
      </div>
      <button aria-expanded={open} aria-label="Open social links" className="social-btn social-main" type="button" onClick={() => setOpen((value) => !value)}>
        <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16" /></svg>
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
      <SocialDock />
    </>
  );
}
