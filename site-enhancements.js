(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };
  ready(() => {
    const brand = document.querySelector(".site-header .brand");
    if (brand) {
      brand.innerHTML = '<img src="img/logo.jpg" alt="Pottery Shop" class="site-logo">';
      brand.setAttribute("aria-label", "Pottery Shop home");
    }
    if (!document.querySelector('link[rel="icon"]')) {
      const favicon = document.createElement("link");
      favicon.rel = "icon";
      favicon.type = "image/jpeg";
      favicon.href = "img/logo.jpg";
      document.head.appendChild(favicon);
    }
    const audio = document.getElementById("studio-audio");
    const toggle = document.getElementById("studio-audio-toggle");
    const status = document.getElementById("studio-audio-status");
    if (audio && toggle) {
      audio.volume = 0.08;
      toggle.addEventListener("click", async () => {
        if (audio.paused) {
          try {
            await audio.play();
            toggle.textContent = "Pause music";
            toggle.setAttribute("aria-pressed", "true");
            if (status) status.textContent = "Playing softly · 8% volume";
          } catch (error) {
            if (status) status.textContent = "Playback was blocked. Please press Play again.";
          }
        } else {
          audio.pause();
          toggle.textContent = "Play studio music";
          toggle.setAttribute("aria-pressed", "false");
          if (status) status.textContent = "Music paused";
        }
      });
      audio.addEventListener("ended", () => {
        toggle.textContent = "Play studio music";
        toggle.setAttribute("aria-pressed", "false");
        if (status) status.textContent = "Music ended";
      });
    }
  });
})();
