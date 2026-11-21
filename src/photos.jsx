import { createContext, useContext, useEffect, useRef, useState } from "react";

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

function ModalVideo({ item }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const play = () => {
      el.play().catch(() => {});
    };
    if (el.readyState >= 2) play();
    else el.addEventListener("loadeddata", play, { once: true });
    return () => {
      el.pause();
    };
  }, [item.src]);

  return (
    <video
      ref={ref}
      key={item.src}
      className="modal-video"
      src={item.src}
      poster={item.poster}
      controls
      playsInline
      autoPlay
      aria-label={item.alt || item.title}
    />
  );
}

export function PhotoModal() {
  const { photo, openPhoto, closePhoto } = usePhotos();
  const gallery = photo?.gallery;
  const index = photo?.index ?? 0;
  const current = gallery ? gallery[index] : photo;
  const isVideo = current?.mediaType === "video";

  useEffect(() => {
    if (!photo) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (!gallery || gallery.length < 2) return;
      if (event.key === "ArrowRight") openPhoto({ ...gallery[(index + 1) % gallery.length], gallery, index: (index + 1) % gallery.length });
      if (event.key === "ArrowLeft") openPhoto({ ...gallery[(index - 1 + gallery.length) % gallery.length], gallery, index: (index - 1 + gallery.length) % gallery.length });
    };
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      removeEventListener("keydown", onKey);
    };
  }, [photo, gallery, index, openPhoto]);

  if (!current) return null;

  const step = (delta) => {
    if (!gallery || gallery.length < 2) return;
    const next = (index + delta + gallery.length) % gallery.length;
    openPhoto({ ...gallery[next], gallery, index: next });
  };

  const dialogLabel = isVideo ? "Enlarged apartment video" : "Enlarged hotel photos";

  return (
    <div className="modal open" role="dialog" aria-modal="true" aria-label={dialogLabel} onClick={(event) => { if (event.target === event.currentTarget) closePhoto(); }}>
      <button className="modal-close" type="button" aria-label="Close viewer" onClick={closePhoto}>×</button>
      {gallery && gallery.length > 1 ? <button className="modal-nav prev" type="button" aria-label="Previous item" onClick={() => step(-1)}>‹</button> : null}
      <figure className="modal-figure">
        {isVideo ? (
          <ModalVideo item={current} />
        ) : (
          <img key={`${current.src}-${index}`} src={current.src} alt={current.alt} />
        )}
        {isVideo && current.title ? <figcaption>{current.title}</figcaption> : null}
      </figure>
      {gallery && gallery.length > 1 ? <button className="modal-nav next" type="button" aria-label="Next item" onClick={() => step(1)}>›</button> : null}
    </div>
  );
}