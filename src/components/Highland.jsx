import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const nav = [
  ["/", "Home"],
  ["/about", "About"],
  ["/apartments", "Apartment"],
  ["/deals", "Offers"],
  ["/explore", "Explore"],
  ["/contact", "Contact"],
];

export function HighlandHeader() {
  const [menu, setMenu] = useState(false);
  const location = useLocation();

  useEffect(() => setMenu(false), [location.pathname]);

  useEffect(() => {
    const bar = document.querySelector(".mh-header");
    const onScroll = () => {
      const pin = document.querySelector(".mh-hero-pin");
      const pastHero = pin ? pin.getBoundingClientRect().bottom <= (bar?.offsetHeight || 82) : scrollY > 72;
      bar?.classList.toggle("scrolled", pastHero);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [location.pathname]);

  return (
    <header className="topbar mh-header">
      <Link className="brand mh-brand" to="/" aria-label="Mistwood Residence"><img className="mh-logo" alt="Mistwood Residence" src="/assets/mistwood/branding/logo.png" /></Link>
      <nav className={menu ? "nav mh-nav open" : "nav mh-nav"} aria-label="Primary">
        {nav.map(([to, label]) => (
          <NavLink key={label} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "is-current" : undefined)} onClick={() => setMenu(false)}>{label}</NavLink>
        ))}
      </nav>
      <div className="mh-tools">
        <Link className="mh-book" to="/contact#booking">Book Your Stay</Link>
        <button aria-label="Toggle navigation" className="menu-btn" type="button" onClick={() => setMenu((value) => !value)}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
    </header>
  );
}

export function PageHero({ kicker, title, lede, crumb }) {
  return (
    <section className="ab-hero" data-parallax>
      <div className="ab-hero-scene" aria-hidden="true">
        <div className="ab-hero-shift">
          <div className="ab-hero-photo" />
        </div>
      </div>
      <div className="mh-wrap ab-hero-copy">
        <img className="ab-hero-leaf" alt="" src="/assets/mistwood/decorations/leaf-branch.png" />
        <p className="mh-kicker light">{kicker}</p>
        <h1>{title}</h1>
        {lede ? <p className="ab-sub">{lede}</p> : null}
        <p className="ab-crumb">
          <Link to="/">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.2 12 5l8 6.2V20H4v-8.8Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            Home
          </Link>
          <span aria-hidden="true">›</span>
          {crumb}
        </p>
      </div>
    </section>
  );
}

export function HighlandFooter() {
  const pending = (event) => {
    event.preventDefault();
    alert("Demo link — add the owner-approved contact URL before launch.");
  };

  return (
    <footer className="mh-footer">
      <div className="mh-wrap mh-foot-grid" data-reveal="stagger">
        <div className="mh-foot-brand">
          <Link className="brand mh-brand" to="/" aria-label="Mistwood Residence"><img className="mh-logo" alt="Mistwood Residence" src="/assets/mistwood/branding/logo.png" /></Link>
          <p>A charming apartment in the heart of Nuwara Eliya, offering modern comfort, serene surroundings, and an unforgettable highland experience.</p>
          <div className="mh-social">
            <a aria-label="Facebook" href="https://www.facebook.com/share/19u5hKB7DJ/" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 8.5V6.8c0-.7.5-1 1.1-1H17V3h-2.1C12.4 3 11 4.4 11 6.6v1.9H9v2.8h2V21h3.5v-9.7h2.2l.4-2.8h-2.6Z" /></svg></a>
            <a aria-label="Instagram" href="#" title="Instagram — link pending" onClick={pending}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none" /></svg></a>
            <a aria-label="WhatsApp" href="https://wa.me/94765900800"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.1 3.2a8.7 8.7 0 0 0-7.5 13L3.4 20.6l4.5-1.2a8.7 8.7 0 0 0 4.2 1.1h.1a8.7 8.7 0 0 0 0-17.4Zm0 15.9h-.1a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.7.7.7-2.6-.2-.3a7.2 7.2 0 1 1 6.3 3.4Zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1l-.5.6c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.6c-.2-.4.2-.3.5-1.1.1-.1 0-.3 0-.4l-.7-1.6c-.1-.3-.3-.3-.5-.3h-.4c-.2 0-.4.1-.6.3-.3.3-.8.8-.8 1.9s.8 2.2.9 2.4a9.7 9.7 0 0 0 3.6 3.2c1.3.6 1.8.6 2.5.5.4-.1 1.3-.5 1.4-1.1.2-.5.2-.9.1-1Z" /></svg></a>
            <a aria-label="YouTube" href="#" title="YouTube — link pending" onClick={pending}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 8.2a3 3 0 0 0-2.1-2.1C17.2 5.7 12 5.7 12 5.7s-5.2 0-6.9.4A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.7.4 6.9.4 6.9.4s5.2 0 6.9-.4a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8ZM10.4 14.8V9.2L15.2 12l-4.8 2.8Z" /></svg></a>
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/apartments">Apartment</Link>
          <Link to="/#offers">Monthly Deals</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
       
        <div className="mh-touch">
          <h3>Get in Touch</h3>
          <p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="11" r="1.7" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg> Nuwara Eliya, Sri Lanka</p>
          <p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3L16 12.5 20 14v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg> <a href="https://wa.me/94765900800">+94 76 590 0800</a></p>
          <p><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg> <Link to="/contact#enquiry">info@mistwoodresidence.com</Link></p>
          <p><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 5l8 5.5V20H4V10.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 20v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg> <a href="https://www.google.com/maps/search/?api=1&query=Nuwara+Eliya+Sri+Lanka" rel="noopener noreferrer" target="_blank">View on Google Maps</a></p>
        </div>
      </div>
      <img className="mh-footer-leaf" alt="" src="/assets/mistwood/decorations/gold-branch.png" />
      <div className="mh-foot-bottom">
        <span>© 2026 Mistwood Residence. All Rights Reserved. <Link to="/credits">Media credits</Link></span>
        <span>Designed &amp; Developed by Web Loom Zone</span>
      </div>
    </footer>
  );
}
