import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { IntroLoader, MotionBoot, RouteLoader } from "./motion.jsx";
import { PhotoModal } from "./photos.jsx";
import { PageShell, SocialDock } from "./components/Chrome.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Apartments from "./pages/Apartments.jsx";
import Gallery from "./pages/Gallery.jsx";
import Explore from "./pages/Explore.jsx";
import Deals from "./pages/Deals.jsx";
import Contact from "./pages/Contact.jsx";
import Policies from "./pages/Policies.jsx";
import Credits from "./pages/Credits.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminResetPassword from "./pages/AdminResetPassword.jsx";
import AdminForgotPassword from "./pages/AdminForgotPassword.jsx";
import AdminBookingRequests from "./pages/AdminBookingRequests.jsx";
import AdminBookingCreate from "./pages/AdminBookingCreate.jsx";
import AdminBookingsToday from "./pages/AdminBookingsToday.jsx";
import AdminAvailability from "./pages/AdminAvailability.jsx";
import AdminRates from "./pages/AdminRates.jsx";
import AdminPayments from "./pages/AdminPayments.jsx";
import AdminGuests from "./pages/AdminGuests.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminEntry from "./pages/AdminEntry.jsx";
import GuestCheckIn from "./pages/GuestCheckIn.jsx";
import GuestAccount, { GuestLogin, GuestSetup } from "./pages/GuestAccount.jsx";
import AdminCheckIn from "./pages/AdminCheckIn.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import AdminNotifications from "./pages/AdminNotifications.jsx";
import AdminProfile from "./pages/AdminProfile.jsx";
import AdminAccount from "./pages/AdminAccount.jsx";
import AdminAppearance from "./pages/AdminAppearance.jsx";
import AdminHelp from "./pages/AdminHelp.jsx";

function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    const highland = ["/", "/about", "/apartments", "/deals", "/explore", "/contact"].includes(location.pathname);
    document.body.classList.toggle("home", highland);
    document.body.classList.toggle("about-page", location.pathname === "/about");
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/apartments" element={<Apartments />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/check-in/:token" element={<GuestCheckIn />} />
        <Route path="/account/login" element={<GuestLogin />} />
        <Route path="/account/setup" element={<GuestSetup />} />
        <Route path="/account" element={<GuestAccount />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminEntry />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/account" element={<AdminAccount />} />
        <Route path="/admin/account/appearance" element={<AdminAppearance />} />
        <Route path="/admin/help" element={<AdminHelp />} />
        <Route path="/admin/booking-requests" element={<AdminBookingRequests />} />
        <Route path="/admin/bookings/today" element={<AdminBookingsToday />} />
        <Route path="/admin/bookings/new" element={<AdminBookingCreate />} />
        <Route path="/admin/bookings" element={<Navigate to="/admin/booking-requests" replace />} />
        <Route path="/admin/availability" element={<AdminAvailability />} />
        <Route path="/admin/offers" element={<AdminRates />} />
        <Route path="/admin/rates" element={<Navigate to="/admin/offers" replace />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/guests-enquiries" element={<AdminGuests />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/check-in" element={<AdminCheckIn />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route element={<PageShell />}>
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/credits" element={<Credits />} />
        </Route>
      </Routes>
    </div>
  );
}

function PublicSocialDock() {
  const location = useLocation();
  return location.pathname.startsWith("/admin") ? null : <SocialDock />;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <MotionBoot />
      <IntroLoader />
      <AnimatedRoutes />
      <PublicSocialDock />
      <RouteLoader />
      <PhotoModal />
    </>
  );
}
