(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ["welcome","personalLetter","notesScreen","ending"].map($);
  let current = 0, unlocked = 0, opened = false;
  const player = $("songPlayer");
  const tabs = $("noteTabs");
  const trackFiles = [1,2,3,4,5].map(n => `assets/songs/song-${n}.mp4`);
  const notePhotos = [
    ["vaishnavi-01.jpg", "dudu-01.jpg"],
    ["vaishnavi-02.jpg", "dudu-02.png"],
    ["vaishnavi-03.jpg", "dudu-03.jpg"],
    ["vaishnavi-05.jpg", "dudu-06.png"],
    ["vaishnavi-09.jpg", "dudu-04.jpg"]
  ];

  function showScreen(id) {
    screens.forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function stopSong() { player.pause(); player.removeAttribute("src"); player.load(); $("playBtn").textContent = "▶"; }
  function renderTabs() {
    tabs.innerHTML = "";
    window.LOVE_NOTES.forEach((note,i) => {
      const b = document.createElement("button");
      b.className = "note-tab" + (i === current ? " current" : "") + (i > unlocked ? " locked" : "");
      b.textContent = i > unlocked ? "🔒" : String(i+1);
      b.setAttribute("aria-label", i > unlocked ? `Note ${i+1}, locked` : `Open note ${i+1}`);
      b.disabled = i > unlocked;
      b.addEventListener("click", () => { if(i <= unlocked) loadNote(i, false); });
      tabs.appendChild(b);
    });
  }
  function loadNote(index, autoOpen) {
    current = index; opened = false; stopSong(); renderTabs();
    $("progressLabel").textContent = `Note ${index+1} of 5`;
    $("progressFill").style.width = `${(index+1)*20}%`;
    $("noteContent").hidden = true;
    $("noteEnvelope").classList.remove("open");
    $("noteEnvelope").style.display = "block";
    $("tapHint").style.display = "block";
    $("noteNumber").textContent = `NOTE ${index+1}`;
    $("noteTitle").textContent = window.LOVE_NOTES[index].title;
    $("songTitle").textContent = window.LOVE_NOTES[index].song;
    $("audioStatus").textContent = "Tap the envelope to open this note. The matching song will try to play.";
    $("audioStatus").classList.remove("error");
    $("noteBody").innerHTML = "";
    const paragraphs = window.LOVE_NOTES[index].body.split("\n\n");
    paragraphs.forEach(t => { const p=document.createElement("p"); p.textContent=t; $("noteBody").appendChild(p); });
    $("prevBtn").style.visibility = index === 0 ? "hidden" : "visible";
    $("nextBtn").textContent = index === 4 ? "OPEN OUR FINAL SURPRISE ♡" : "Unlock Next Surprise ♡";
    setPhoto($("notePhoto"), notePhotos[index][0]);
    setPhoto($("notePhotoSecond"), notePhotos[index][1]);
    if(autoOpen) openNote();
  }
  function setPhoto(container, file) {
    const img = new Image();
    img.onload = () => { container.innerHTML=""; container.appendChild(img); };
    img.onerror = () => {};
    img.src = `assets/photos/${file}`;
  }
  function openNote() {
    if(opened) return;
    opened = true;
    $("noteEnvelope").classList.add("open");
    $("tapHint").style.display = "none";
    // Start audio directly from the envelope tap so mobile browsers are more likely to allow playback.
    playCurrentSong();
    setTimeout(() => {
      $("noteEnvelope").style.display = "none";
      $("noteContent").hidden = false;
    }, 650);
  }
  function playCurrentSong() {
    stopSong();
    const src = trackFiles[current];
    player.src = src;
    player.volume = Number($("volume").value);
    player.load();
    player.play().then(() => {
      $("playBtn").textContent = "Ⅱ";
      $("audioStatus").textContent = "Now playing ♡";
      $("audioStatus").classList.remove("error");
    }).catch(() => {
      $("playBtn").textContent = "▶";
      $("audioStatus").textContent = "This song isn't available yet or your browser needs another tap. You can still enjoy the letter.";
      $("audioStatus").classList.add("error");
    });
  }
  $("beginBtn").addEventListener("click", () => { showScreen("notesScreen"); loadNote(0,false); });
  $("toNotesBtn").addEventListener("click", () => { showScreen("notesScreen"); loadNote(0,false); });
  $("noteEnvelope").addEventListener("click", openNote);
  $("playBtn").addEventListener("click", () => {
    if(!opened) return;
    if(!player.src) { playCurrentSong(); return; }
    if(player.paused) player.play().then(()=>{$("playBtn").textContent="Ⅱ";}).catch(()=>{$("audioStatus").textContent="Playback couldn't start. Please try again.";});
    else { player.pause(); $("playBtn").textContent="▶"; }
  });
  $("volume").addEventListener("input", e => { player.volume = Number(e.target.value); });
  player.addEventListener("ended", () => $("playBtn").textContent="▶");
  player.addEventListener("error", () => {
    $("playBtn").textContent="▶";
    $("audioStatus").textContent="Song file not found or unsupported. Add the verified MP4 for this note in assets/songs; you can continue reading.";
    $("audioStatus").classList.add("error");
  });
  $("prevBtn").addEventListener("click", () => { if(current>0) loadNote(current-1,true); });
  $("nextBtn").addEventListener("click", () => {
    if(current<4) { unlocked=Math.max(unlocked,current+1); loadNote(current+1,false); }
    else { unlocked=4; stopSong(); showScreen("ending"); }
  });
  $("replayBtn").addEventListener("click", () => { unlocked=0; stopSong(); showScreen("welcome"); });
  document.querySelectorAll("[data-photo]").forEach(el => {
    const key=el.dataset.photo;
    const file=key==="welcome"?"vaishnavi-07.jpg":"vaishnavi-08.jpg";
    setPhoto(el,file);
  });
  setPhoto($("personalPhoto"), "vaishnavi-04.jpg");
  renderTabs();
})();
