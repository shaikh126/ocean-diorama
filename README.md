# Yusra's Diorama (Teacher: Ms. Wendy) — three.js 3D ocean PWA
Static PWA (index.html, app.js, sw.js, manifest.json, icons). Host on any HTTPS static host (GitHub Pages).
Teacher PIN: 1234 (TEACHER_PIN in app.js). Max selfies: 30.
Shared sync: define window.OCEAN_SYNC = {pull, push, clear, subscribe} before app.js loads. Without it, selfies are kept on this device only (IndexedDB).
Make QR after deploy: python3 mkqr.py https://USER.github.io/ocean-diorama/
