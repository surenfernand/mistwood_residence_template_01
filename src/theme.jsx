import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("mistwood-look") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#161412" : "#f8f5ef");
    try {
      localStorage.setItem("mistwood-look", theme);
    } catch {
      /* storage can be blocked */
    }
  }, [theme]);

  const toggle = () => setTheme((current) => (current === "dark" ? "light" : "dark"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  const label = dark ? "Dark mode on. Switch to light mode." : "Light mode on. Switch to dark mode.";
  return (
    <button className="theme-switch" type="button" role="switch" aria-checked={dark} aria-label={label} title={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
      <span className="switch-track">
        <span className="switch-thumb">
          <svg className="switch-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg className="switch-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20.6 15.6A8.8 8.8 0 0 1 8.4 3.4 9 9 0 1 0 20.6 15.6Z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
