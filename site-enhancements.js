(() => {
  "use strict";
  const ready = fn => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn, { once:true }) : fn();
  const VOLUME_KEY = "ps_music_volume_v1";
  const clampVolume = value => Math.max(0, Math.min(0.3, Number(value) || 0));
  ready(() => {
    const brand=document.querySelector(".site-header .brand");
    if(brand){brand.innerHTML='<img src="img/logo.jpg" alt="Pottery Shop" class="site-logo">';brand.setAttribute("aria-label","Pottery Shop home");}
    if(!document.querySelector('link[rel="icon"]')){const f=document.createElement("link");f.rel="icon";f.type="image/jpeg";f.href="img/logo.jpg";document.head.appendChild(f);}
    if(document.body.dataset.page==="admin"){
      const slider=document.getElementById("admin-music-volume"),out=document.getElementById("admin-music-volume-value");
      if(slider){
        const saved=localStorage.getItem(VOLUME_KEY);slider.value=String(Math.round((saved===null?.08:Number(saved))*100));if(out)out.value=slider.value+"%";
        slider.addEventListener("input",()=>{const value=clampVolume(Number(slider.value)/100);localStorage.setItem(VOLUME_KEY,String(value));if(out)out.value=Math.round(value*100)+"%";});
      }
      return;
    }
    const audio=document.createElement("audio");audio.id="site-background-audio";audio.loop=true;audio.preload="auto";
    const source=document.createElement("source");source.src="img/Artisan_Hands.mp3";source.type="audio/mpeg";audio.appendChild(source);document.body.appendChild(audio);
    const saved=localStorage.getItem(VOLUME_KEY);audio.volume=clampVolume(saved===null?.08:saved);
    const button=document.createElement("button");button.type="button";button.className="music-control";button.setAttribute("aria-label","Play background music");button.setAttribute("aria-pressed","false");button.innerHTML='<span class="music-state"></span><span class="music-label">Play music</span>';document.body.appendChild(button);
    const label=button.querySelector(".music-label");
    const sync=playing=>{button.classList.toggle("is-playing",playing);button.setAttribute("aria-pressed",String(playing));button.setAttribute("aria-label",playing?"Pause background music":"Play background music");label.textContent=playing?"Pause music":"Play music";};
    const start=async()=>{try{await audio.play();sync(true);}catch(_){sync(false);label.textContent="Play music";button.title="Your browser blocked automatic audio. Tap to start.";}}
    button.addEventListener("click",async()=>{if(audio.paused)await start();else{audio.pause();sync(false);}});
    audio.addEventListener("play",()=>sync(true));audio.addEventListener("pause",()=>sync(false));
    // Attempt autoplay on every customer-facing page. Browsers may block audible autoplay until a visitor interacts.
    start();
  });
})();