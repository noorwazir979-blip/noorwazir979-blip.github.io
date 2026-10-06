// Noor AI Concierge website: forms (FormSubmit, free, emails Noor) + the instant-answer chat assistant.
// The assistant is rule-based on purpose: free, fast, and it only says what is true on this page.
// Anything it can't answer goes to Noor on WhatsApp.
const WA = "971589358857";
const MAIL = "imnoorzamn@gmail.com";
const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

// ---------- forms ----------
document.querySelectorAll("form[data-kind]").forEach((f) => {
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = f.querySelector(".ok"), err = f.querySelector(".err"), btn = f.querySelector("button[type=submit]");
    ok.style.display = err.style.display = "none";
    const data = Object.fromEntries(new FormData(f).entries());
    data._subject = f.dataset.kind === "book" ? `New booking: ${data.business || data.name}` : f.dataset.kind === "speakly" ? "Speakly waitlist" : `New message: ${data.name}`;
    data._template = "table";
    data._captcha = "false";
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(r.status);
      ok.style.display = "block"; f.reset();
    } catch (x) {
      err.innerHTML = `It didn't send. Please <a href="${waLink("Hi Noor, I tried your website form: " + (data.message || data.business || ""))}" target="_blank" rel="noopener">message on WhatsApp</a> instead.`;
      err.style.display = "block";
    }
    btn.disabled = false; btn.textContent = f.dataset.label || "Send";
  });
});

// ---------- chat assistant ----------
const KB = [
  { k: /price|cost|how much|fee|charge|aed|kitna|qeemat|سعر|كم/i, a: "Two packages:\n• Chat (WhatsApp + email assistant): AED 500 setup, AED 999 a month.\n• Full (chat + phone answering, about 500 minutes): AED 1,000 setup, AED 1,299 a month. Extra minutes AED 1/min.\nOffice automation (quotes, follow-ups, reminders, reports) starts from AED 1,500 setup + AED 500 a month.\nNot happy in the first 7 days? Your setup fee back in full." },
  { k: /refund|trial|guarantee|risk|money back|pilot/i, a: "If the assistant doesn't help your business in the first 7 days, Noor refunds the setup fee in full. No long contract: the monthly plan can be stopped any month." },
  { k: /language|arabic|urdu|hindi|english|عربي/i, a: "The assistant can answer customers in English, Arabic, Urdu and Hindi, and switches to the language the customer writes in." },
  { k: /whatsapp|chat|message|instagram|website chat/i, a: "It answers your WhatsApp (and email, website chat or Instagram DMs if you want) day and night: prices, opening hours, bookings and orders, from your own information. Anything it is unsure about goes to your team." },
  { k: /call|phone|voice|receptionist|missed/i, a: "With the Full package, an AI receptionist answers calls you miss or after hours, books appointments, takes messages and sends urgent ones to you. About 500 minutes a month are included." },
  { k: /how long|setup time|when|ready|start|live/i, a: "Most setups are live within a few days: a short call to learn your business, then Noor builds and tests it with you before it talks to customers." },
  { k: /how.*work|process|steps|what do you need/i, a: "1) 10-minute call about your business. 2) Noor builds the assistant from your prices and FAQs. 3) You test it. 4) It goes live, and Noor keeps improving it every month." },
  { k: /quote|invoice|follow|reminder|report|office|data entry|automation/i, a: "Office automation handles the repeat work: quotations from enquiries, follow-ups, payment and appointment reminders, daily reports and data entry. From AED 1,500 setup + AED 500 a month, depending on the job." },
  { k: /speakly|voice invoice|invoice app/i, a: "Speakly is Noor's app that makes an invoice from your voice: you say what you sold, it writes the invoice. It's coming soon. Join the waitlist on the Speakly page." },
  { k: /demo|example|see it|show/i, a: "Watch the three demo videos on this page (WhatsApp, phone call, quotation). For a demo with your own business name and prices, book a call below." },
  { k: /who|about|noor|company|you\b/i, a: "Noor AI Concierge is run by Noor Zaman in Abu Dhabi. Noor builds AI assistants and tools, including a free open-source AI video editor on GitHub." },
  { k: /book|meeting|visit|appointment|call me|talk/i, a: "Use the booking form below (pick a day and time), or message Noor directly on WhatsApp: " },
  { k: /safe|data|privacy|secure/i, a: "Your customer conversations stay in your own WhatsApp and accounts. Noor only uses your business information to set up the assistant. Details are on the Privacy page." },
];
const chips = ["Prices", "How does it work?", "Phone calls", "Languages", "Refund", "Book a call"];
const btn = document.querySelector(".chat-btn"), box = document.querySelector(".chat");
if (btn && box) {
  const msgs = box.querySelector(".msgs"), form = box.querySelector("form"), input = form.querySelector("input");
  const say = (html, who = "bot") => { const d = document.createElement("div"); d.className = "m " + who; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const answer = (q) => {
    say(esc(q), "me");
    const hit = KB.find((x) => x.k.test(q));
    setTimeout(() => {
      const wa = `<a href="${waLink("Hi Noor, " + q)}" target="_blank" rel="noopener">WhatsApp Noor</a>`;
      if (!hit) say(`Good question. Noor will answer that himself: ${wa}, or leave a message in the form below.`);
      else say(esc(hit.a) + (/book|meeting|visit|appointment|call me|talk/i.test(q) ? wa : "") + `\n\nAnything else? Or ${wa}.`);
    }, 450);
  };
  const cbox = box.querySelector(".chips");
  chips.forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.textContent = c; b.onclick = () => answer(c); cbox.appendChild(b); });
  let started = false;
  btn.addEventListener("click", () => {
    box.classList.toggle("open");
    if (!started) { started = true; say("Hi! I'm the instant-answer assistant for Noor AI Concierge. Ask about prices, how it works, phone calls or languages."); }
    if (box.classList.contains("open")) input.focus();
  });
  box.querySelector("header button").addEventListener("click", () => box.classList.remove("open"));
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { answer(q); input.value = ""; } });
}
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
