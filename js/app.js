document.addEventListener("DOMContentLoaded", function () {
  // ⚠️  | Leads baza spreadsheet'ining Apps Script URL'i.
  // /1/js/app.js bilan BIR XIL bo'lishi kerak (ikkala sayt ham shu spreadsheet'ga yozadi).
  const SHEETS_URL = "https://script.google.com/macros/s/AKfycbz1Q7fxWjIvdOghIkeEz0ioXwfJtr3F6rlhnznD7z0B02J-BghHqAJMsuZuFVfzmErBzA/exec";
  const SHEET_NAME = "ustoz_zakariyya";
  const REDIRECT_URL = "thankYou.html";

  const registerBtns = document.querySelectorAll(".registerBtn");
  const modal = document.getElementById("registrationModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const overlay = document.querySelector(".homeModalOverlay");
  const form = document.getElementById("registrationForm");
  const nameInput = document.getElementById("name");
  const nameError = document.getElementById("nameError");
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phoneError");
  const submitBtn = document.getElementById("submitBtn");
  const formatter = window.phoneFormatter;

  let isOpen = false;
  let scrollY = 0;

  function openModal() {
    if (!modal) return;
    isOpen = true;
    scrollY = window.scrollY;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    if (nameError) nameError.style.display = "none";
    if (phoneError) phoneError.style.display = "none";
  }

  function closeModal() {
    if (!modal || !isOpen) return;
    isOpen = false;
    modal.style.display = "none";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function buildTimestamp() {
    const d = new Date();
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  registerBtns.forEach((b) => b.addEventListener("click", function () {
    if (this.disabled) return;
    openModal();
  }));
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) overlay.addEventListener("click", closeModal);

  if (!form) return;

  let isSubmitting = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formatter) {
      console.error("phoneFormatter is not initialized.");
      phoneError.style.display = "block";
      return;
    }

    const name = nameInput.value.trim();
    const phoneRaw = phoneInput.value.trim();
    let hasError = false;

    if (name) nameError.style.display = "none";
    else { nameError.style.display = "block"; hasError = true; }

    if (formatter.validate(phoneRaw)) phoneError.style.display = "none";
    else { phoneError.style.display = "block"; hasError = true; }

    if (hasError) return;

    isSubmitting = true;
    submitBtn.textContent = "YUBORILMOQDA...";
    submitBtn.disabled = true;

    const fullPhone = (formatter.getCurrentCode() + phoneRaw).replace(/\s/g, "");
    const ts = buildTimestamp();

    // Facebook Pixel — Lead event
    try {
      if (typeof fbq === "function") {
        const eventId = "lead_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
        fbq("track", "Lead", {
          content_name: "Root site Lead",
          content_category: "Registration",
        }, { eventID: eventId });
      }
    } catch (err) {
      console.error("Pixel error:", err);
    }

    // Ta'limPro Apps Script kutadigan oddiy format
    const body = new URLSearchParams();
    body.append("sheetName", SHEET_NAME);
    body.append("name", name);
    body.append("phone", fullPhone);
    body.append("telegram", "");

    fetch(SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: body.toString(),
      keepalive: true,
    }).catch((err) => console.error("Sheets error:", err));

    setTimeout(() => {
      window.location.href = REDIRECT_URL;
    }, 1200);
  });
});

// Sahifa pastidagi taymer (agar bo'lsa)
const timerEl = document.getElementById("timer");
if (timerEl) {
  let s = 120;
  const t = setInterval(() => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    timerEl.textContent = `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
    if (s <= 0) clearInterval(t); else s -= 1;
  }, 1000);
}
