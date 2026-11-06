import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { PhotoModal } from "./photos.jsx";
import { PageShell } from "./components/Chrome.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Apartments from "./pages/Apartments.jsx";
import Photos from "./pages/Photos.jsx";
import Gallery from "./pages/Gallery.jsx";
import Explore from "./pages/Explore.jsx";
import Deals from "./pages/Deals.jsx";
import Contact from "./pages/Contact.jsx";
import Policies from "./pages/Policies.jsx";
import Credits from "./pages/Credits.jsx";

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

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/apartments" element={<Apartments />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/contact" element={<Contact />} />
        <Route element={<PageShell />}>
          <Route path="/photos" element={<Photos />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/credits" element={<Credits />} />
        </Route>
      </Routes>
      <PhotoModal />
    </>
  );
}
