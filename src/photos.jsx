import { createContext, useContext, useEffect, useState } from "react";

const PhotoContext = createContext(null);

export function PhotoProvider({ children }) {
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setPhoto(null);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <PhotoContext.Provider value={{ photo, openPhoto: setPhoto, closePhoto: () => setPhoto(null) }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotos() {
  return useContext(PhotoContext);
}

export function PhotoModal() {
  const { photo, closePhoto } = usePhotos();
  if (!photo) return null;
  return (
    <div className="modal open" role="dialog" aria-label="Gallery photo preview" onClick={(event) => { if (event.target === event.currentTarget) closePhoto(); }}>
      <button type="button" aria-label="Close image" onClick={closePhoto}>×</button>
      <img src={photo.src} alt={photo.alt} />
    </div>
  );
}
