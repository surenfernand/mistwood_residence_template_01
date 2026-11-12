import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth/me")
      .then((response) => active && navigate(response.ok ? "/admin/dashboard" : "/admin/login", { replace: true }))
      .catch(() => active && navigate("/admin/login", { replace: true }));
    return () => { active = false; };
  }, [navigate]);

  return <main className="admin-login-page"><p className="sr-only" role="status">Checking your admin session…</p></main>;
}
