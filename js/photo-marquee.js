(() => {
  const gallery = document.querySelector(".photo-journal-gallery");
  const track = gallery?.querySelector(".photo-marquee-track");
  const group = track?.querySelector(".photo-marquee-group");

  if (!gallery || !track || !group) return;

  const duplicate = group.cloneNode(true);
  duplicate.setAttribute("aria-hidden", "true");
  duplicate.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });
  track.append(duplicate);

  const updateVisibility = (isVisible) => {
    gallery.classList.toggle("is-paused", !isVisible || document.hidden);
  };

  const observer = new IntersectionObserver(
    ([entry]) => updateVisibility(entry.isIntersecting),
    { threshold: 0.05 }
  );

  observer.observe(gallery);
  document.addEventListener("visibilitychange", () => {
    updateVisibility(gallery.getBoundingClientRect().bottom > 0 && gallery.getBoundingClientRect().top < window.innerHeight);
  });
})();
