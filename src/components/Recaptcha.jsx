import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const SCRIPT_ID = "google-recaptcha-api";

/** Google reCAPTCHA v2 checkbox, used to protect public enquiry forms. */
export default function Recaptcha({ onChange, resetSignal = 0 }) {
  const mountRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY || !mountRef.current) return undefined;
    let active = true;

    const render = () => {
      if (!active || !mountRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.grecaptcha.render(mountRef.current, {
        sitekey: SITE_KEY,
        callback: onChange,
        "expired-callback": () => onChange(""),
        "error-callback": () => onChange(""),
      });
    };

    const existingScript = document.getElementById(SCRIPT_ID);
    if (window.grecaptcha?.render) {
      render();
    } else if (existingScript) {
      existingScript.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }

    return () => { active = false; };
  }, [onChange]);

  useEffect(() => {
    if (resetSignal && widgetIdRef.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;
  return <div className="ct-recaptcha" ref={mountRef} />;
}
