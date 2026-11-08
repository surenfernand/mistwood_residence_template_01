import { useEffect } from "react";
import ApartmentGallery from "../components/ApartmentGallery.jsx";

export default function Photos() {
  useEffect(() => { document.title = "Hotel photos | Mistwood Residence"; }, []);

  return (
    <>
      <ApartmentGallery />
    </>
  );
}
