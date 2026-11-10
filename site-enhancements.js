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
    /*
     * Add future client-approved tracks to this playlist in the order they should play.
     * Keep each file inside /img and use its exact filename.
     */
    const PLAYLIST = [
      { src: "img/Artisan_Hands.mp3", type: "audio/mpeg" }
      // Example for later: { src: "img/Next_Track.mp3", type: "audio/mpeg" }
    ];
    const SESSION_KEY = "ps_music_session_v2";
    const readSession = () => {
      try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); }
      catch (_) { return {}; }
    };
    const writeSession = state => {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch (_) {}
    };
    const previous = readSession();
    let trackIndex = Number.isInteger(previous.trackIndex) && previous.trackIndex >= 0 && previous.trackIndex < PLAYLIST.length ? previous.trackIndex : 0;
    let shouldPlay = previous.wasPlaying !== false;
    let savedTime = Number.isFinite(previous.currentTime) && previous.currentTime > 0 ? previous.currentTime : 0;

    const audio=document.createElement("audio");
    audio.id="site-background-audio";
    audio.preload="auto";
    audio.loop=false;
    audio.autoplay=true;
    const button=document.createElement("button");
    button.type="button";
    button.className="music-control";
    button.setAttribute("aria-label","Play background music");
    button.setAttribute("aria-pressed","false");
    button.innerHTML='<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.8c0-.78.86-1.25 1.52-.83l9.2 5.95a1.28 1.28 0 0 1 0 2.16l-9.2 5.95A1 1 0 0 1 8 18.2V5.8Z" fill="currentColor"/></svg>';
    document.body.append(audio,button);

    const savedVolume=localStorage.getItem(VOLUME_KEY);
    audio.volume=clampVolume(savedVolume===null?.08:savedVolume);
    
    const savePosition=() => writeSession({
      trackIndex,
      currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : savedTime,
      wasPlaying: !audio.paused && !audio.ended
    });
    const sync=playing=>{
      button.classList.toggle("is-playing",playing);
      button.setAttribute("aria-pressed",String(playing));
      button.setAttribute("aria-label",playing?"Pause background music":"Play background music");
      button.innerHTML=playing?'<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z" fill="currentColor"/></svg>':'<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.8c0-.78.86-1.25 1.52-.83l9.2 5.95a1.28 1.28 0 0 1 0 2.16l-9.2 5.95A1 1 0 0 1 8 18.2V5.8Z" fill="currentColor"/></svg>';
      button.title=playing?"Pause background music":"Play background music";
    };
    const loadTrack=(index,position=0,autoplay=true)=>{
      trackIndex=(index+PLAYLIST.length)%PLAYLIST.length;
      const track=PLAYLIST[trackIndex];
      audio.src=track.src;
      audio.load();
      audio.addEventListener("loadedmetadata",function restore(){
        audio.removeEventListener("loadedmetadata",restore);
        if(Number.isFinite(position)&&position>0&&Number.isFinite(audio.duration)){
          try { audio.currentTime=Math.min(position,Math.max(0,audio.duration-0.25)); } catch (_) {}
        }
        if(autoplay&&shouldPlay) start();
        else sync(false);
      });
    };
    const start=async()=>{
      shouldPlay=true;
      try { await audio.play(); sync(true); savePosition(); }
      catch(_) { sync(false); button.title="Tap to start background music"; savePosition(); }
    };
    button.addEventListener("click",()=>{
      if(audio.paused){shouldPlay=true;start();}
      else{shouldPlay=false;audio.pause();sync(false);savePosition();}
    });
    audio.addEventListener("play",()=>{shouldPlay=true;sync(true);savePosition();});
    audio.addEventListener("pause",()=>{sync(false);savePosition();});
    audio.addEventListener("timeupdate",savePosition);
    audio.addEventListener("ended",()=>{
      const next=(trackIndex+1)%PLAYLIST.length;
      savedTime=0;
      shouldPlay=true;
      loadTrack(next,0,true);
    });
    // Preserve the same track and playback position as the visitor moves between pages.
    window.addEventListener("pagehide",savePosition);
    window.addEventListener("beforeunload",savePosition);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")savePosition();});
    const retryAutoplay=()=>{if(shouldPlay&&audio.paused)start();};
    window.addEventListener("pointerdown",retryAutoplay,{once:true,passive:true});
    window.addEventListener("keydown",retryAutoplay,{once:true});
    loadTrack(trackIndex,savedTime,shouldPlay);
    sync(false);
  });
})();