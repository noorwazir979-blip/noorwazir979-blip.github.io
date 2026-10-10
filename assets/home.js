// Noor AI Concierge v6 "Always On". Framework-free, no tracking. The 3D ring lives in hero3d.js and reads window.RING.
const WA = "971589358857", MAIL = "imnoorzamn@gmail.com";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const tz = { timeZone: "Asia/Dubai" };
const uaeTime = () => new Intl.DateTimeFormat("en-US", { ...tz, hour: "numeric", minute: "2-digit" }).format(new Date());
const uaeHour = () => { const p = new Intl.DateTimeFormat("en-GB", { ...tz, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()); const g = (t) => +p.find((x) => x.type === t).value; return (g("hour") % 24) + g("minute") / 60; };
const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// ---------- time of day: real Abu Dhabi time (?night / ?day to preview) ----------
const OPEN = 9, CLOSE = 18;
const nowH = uaeHour();
const night = /[?&]day\b/.test(location.search) ? false : /[?&]night\b/.test(location.search) ? true : nowH >= CLOSE || nowH < OPEN;
window.RING = { open: OPEN, close: CLOSE, now: nowH, sweep: 0, pulses: [] };
function clock() { const t = uaeTime(); $("#clock").textContent = (night ? "Abu Dhabi · " + t + " · most businesses are closed" : "Abu Dhabi · " + t + " · your team is busy"); $("#ringTime").textContent = t; $("#tryTime").textContent = t; }
clock(); setInterval(clock, 20000);
if (!night) $("#h1").innerHTML = "Your hands are full.<br><em>Your replies aren't.</em>";
// headline words rise in one by one
{
  const h = $("#h1"); let i = 0;
  const wrap = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) { const f = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s = document.createElement("span"); s.className = "w"; s.textContent = w; s.style.animationDelay = (reduce ? 0 : .08 + i++ * .07) + "s"; f.append(s); } }); n.replaceWith(f); }
    else if (n.tagName === "EM") { n.classList.add("w"); n.style.animationDelay = (reduce ? 0 : .08 + i++ * .07 + .1) + "s"; }
    else if (n.nodeType === 1 && n.tagName !== "BR") wrap(n);
  });
  wrap(h);
}

// ---------- header and mobile menu ----------
{ const top = $("#top"); const f = () => top.classList.toggle("solid", scrollY > 20 || $("#drawer").classList.contains("open")); addEventListener("scroll", f, { passive: true }); f(); }
$("#menuBtn").addEventListener("click", () => { const o = $("#drawer").classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); $("#top").classList.toggle("solid", o || scrollY > 20); });
$$("#drawer a").forEach((a) => a.addEventListener("click", () => { $("#drawer").classList.remove("open"); $("#menuBtn").setAttribute("aria-expanded", false); }));
{ const links = $$(".nav a[href^='#']"); const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle("cur", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" }); links.forEach((l) => { const s = $(l.getAttribute("href")); if (s) spy.observe(s); }); }
{ const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" }); $$(".reveal").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el))); }

// ---------- cards: cursor spotlight + gentle 3D tilt ----------
if (fine && !reduce) $$(".card, .plan").forEach((el) => {
  el.classList.add("tilt");
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
    el.style.transform = `perspective(1100px) rotateX(${(.5 - y) * 7}deg) rotateY(${(x - .5) * 9}deg) translateZ(6px)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
});

// ---------- hero: the 24-hour ring (SVG; the 3D version draws over it when WebGL is available) ----------
const ang = (h) => (h / 24) * Math.PI * 2 - Math.PI / 2;
const pt = (cx, cy, r, h) => [cx + r * Math.cos(ang(h)), cy + r * Math.sin(ang(h))];
function arc(cx, cy, r, h0, h1) {
  if (h1 - h0 >= 23.99) h1 = h0 + 23.99;
  if (h1 <= h0) return "";
  const [x0, y0] = pt(cx, cy, r, h0), [x1, y1] = pt(cx, cy, r, h1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${h1 - h0 > 12 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
{
  const NS = "http://www.w3.org/2000/svg", ticks = $("#ticks");
  for (let h = 0; h < 24; h++) {
    const big = h % 6 === 0, [x0, y0] = pt(200, 200, 140, h), [x1, y1] = pt(200, 200, big ? 128 : 134, h);
    const l = document.createElementNS(NS, "line"); l.setAttribute("x1", x0); l.setAttribute("y1", y0); l.setAttribute("x2", x1); l.setAttribute("y2", y1); l.setAttribute("class", "tick" + (big ? " big" : "")); ticks.append(l);
    if (big) { const [tx, ty] = pt(200, 200, 112, h), t = document.createElementNS(NS, "text"); t.setAttribute("x", tx); t.setAttribute("y", ty + 4); t.setAttribute("text-anchor", "middle"); t.setAttribute("class", "hl"); t.textContent = ["12 AM", "6 AM", "12 PM", "6 PM"][h / 6]; ticks.append(t); }
  }
  $("#arcYou").setAttribute("d", arc(200, 200, 168, OPEN, CLOSE));
  const [nx, ny] = pt(200, 200, 168, nowH); $("#needle").setAttribute("transform", `translate(${nx} ${ny})`);
  const st = $("#ringState"), who = $("#ringWho");
  st.textContent = night ? "Closed" : "Busy"; who.textContent = night ? "No one at the desk" : "Your team is busy";
  const t0 = performance.now() + (reduce ? 0 : 900), D = reduce ? 1 : 2400;
  const step = (now) => {
    const k = Math.min(1, Math.max(0, (now - t0) / D)), e = 1 - Math.pow(1 - k, 3);
    RING.sweep = e; const ai = $("#arcAI"); if (ai) ai.setAttribute("d", arc(200, 200, 168, CLOSE, CLOSE + e * (24 - (CLOSE - OPEN))));
    if (k >= 1) { st.textContent = "AI on"; st.classList.add("on"); who.textContent = night ? "Still answering" : "Nobody waits"; startFeed(); } else requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// things the assistant handles while you're away; each lights its hour on the ring
const EVENTS = [
  { h: 23.7, ch: "WhatsApp", icon: "i-wa", col: "#25d366", t: "11:42 PM", q: "Is the AC check available tomorrow?", a: "Yes, AED 80. 9:00 or 11:00?", done: "Booked · 9:00 am" },
  { h: 1.25, ch: "Missed call", icon: "i-phone", col: "#ffb84d", t: "1:15 AM", q: "Caller wants a dentist appointment", a: "Answered by the AI in 1 ring", done: "Appointment booked" },
  { h: 6.1, ch: "Email", icon: "i-mail", col: "#8fb3ff", t: "6:05 AM", q: "Quote for 40 office chairs?", a: "Quote drafted from your price list", done: "Waiting for your OK" },
  { h: 21.9, ch: "Instagram", icon: "i-ig", col: "#ff6f91", t: "9:54 PM", q: "Do you deliver to Khalifa City?", a: "Yes, free above AED 200", done: "Answered in 4 seconds" },
];
let feedOn = false;
function startFeed() {
  if (feedOn) return; feedOn = true;
  const feed = $("#feed"), dots = $("#dots"), NS = "http://www.w3.org/2000/svg"; let i = 0;
  const one = () => {
    const ev = EVENTS[i++ % EVENTS.length], c = document.createElement("div");
    c.className = "note-card";
    c.innerHTML = `<div class="nh"><span class="chn" style="background:${ev.col}"><svg><use href="#${ev.icon}"/></svg></span><b>${ev.ch}</b><time>${ev.t}</time></div><div class="cq">${esc(ev.q)}</div><div class="ca">${esc(ev.a)}</div><span class="done"><svg><use href="#i-check"/></svg>${esc(ev.done)}</span>`;
    const cards = $$(".note-card", feed);
    cards.forEach((x) => x.classList.add("old"));
    if (cards.length >= 2) { const g = cards[0]; g.classList.add("gone"); setTimeout(() => g.remove(), 600); }
    feed.append(c); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("in")));
    const [x, y] = pt(200, 200, 168, ev.h), d = document.createElementNS(NS, "circle"); d.setAttribute("cx", x); d.setAttribute("cy", y); d.setAttribute("r", 5); d.setAttribute("class", "ev"); if (dots && dots.isConnected) dots.append(d);
    RING.pulses.push({ h: ev.h, t: performance.now() });
  };
  one(); if (!reduce) setInterval(() => { if (!document.hidden) one(); }, 4200);
}

// ---------- languages card ----------
{
  const H = [["en", "How can I help?"], ["ar", "كيف أقدر أساعدك؟"], ["ur", "میں کیسے مدد کروں؟"], ["hi", "मैं कैसे मदद करूँ?"]], el = $("#hello"); let i = 0;
  if (el && !reduce) setInterval(() => { el.classList.add("out"); setTimeout(() => { i = (i + 1) % H.length; el.lang = H[i][0]; el.dir = H[i][0] === "ar" || H[i][0] === "ur" ? "rtl" : "ltr"; el.textContent = H[i][1]; el.classList.remove("out"); }, 400); }, 2600);
}
function group(el, onChange) { $$("button", el).forEach((b) => b.addEventListener("click", () => { $$("button", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); onChange(b.dataset.v); })); }

const NAME = { garage: ["Your Garage", "YG"], clinic: ["Your Clinic", "YC"], salon: ["Your Salon", "YS"], laundry: ["Your Laundry", "YL"] };
Object.assign(NAME, {"printing":["Your Print Shop","YP"],"tyres":["Your Tyre Shop","YT"],"restaurant":["Your Restaurant","YR"],"realestate":["Your Property Office","YO"],"maintenance":["Your AC & Maintenance","YM"],"trading":["Your Trading Co.","YT"]});
const S = {
  garage: {
    en: [["c", "Hi, my car AC is blowing hot air. Can you check it tomorrow?"], ["a", "Hello! Yes 👍 An AC check is AED 80. What car is it?"], ["c", "Camry 2019"], ["a", "We have 9:00 or 11:00 tomorrow. Which suits you?"], ["c", "9 please"], ["a", "Booked ✅ Tomorrow 9:00, AC check for your Camry. The workshop team confirms by 8:30."]],
    ar: [["c", "مرحبا، مكيف السيارة يطلع هواء حار. ممكن تفحصونه بكرة؟"], ["a", "أهلاً! نعم 👍 فحص المكيف 80 درهم. ما نوع السيارة؟"], ["c", "كامري 2019"], ["a", "عندنا 9:00 أو 11:00 بكرة. أيهما يناسبك؟"], ["c", "9 لو سمحت"], ["a", "تم الحجز ✅ بكرة 9:00 فحص مكيف الكامري. فريق الورشة يؤكد قبل 8:30."]],
    ur: [["c", "السلام علیکم، گاڑی کا AC گرم ہوا دے رہا ہے۔ کل چیک ہو سکتا ہے؟"], ["a", "وعلیکم السلام! جی 👍 AC چیک 80 درہم کا ہے۔ کون سی گاڑی ہے؟"], ["c", "کیمری 2019"], ["a", "کل صبح 9 یا 11 بجے کا وقت ہے۔ کون سا ٹھیک ہے؟"], ["c", "9 بجے"], ["a", "بکنگ ہو گئی ✅ کل 9 بجے، کیمری کا AC چیک۔ ورکشاپ 8:30 تک کنفرم کرے گی۔"]],
    hi: [["c", "नमस्ते, गाड़ी का AC गरम हवा दे रहा है। कल चेक हो सकता है?"], ["a", "नमस्ते! जी 👍 AC चेक 80 दिरहम का है। कौन सी गाड़ी है?"], ["c", "कैमरी 2019"], ["a", "कल सुबह 9 या 11 बजे का समय है। कौन सा ठीक रहेगा?"], ["c", "9 बजे"], ["a", "बुकिंग हो गई ✅ कल 9 बजे, कैमरी का AC चेक। वर्कशॉप 8:30 तक कन्फर्म करेगी।"]],
  },
  clinic: {
    en: [["c", "Hi, I have tooth pain. Can I see a dentist tomorrow?"], ["a", "Sorry to hear that. We have 10:00 or 16:00 tomorrow. Which is better?"], ["c", "10 please"], ["a", "Booked ✅ Tomorrow 10:00 with the dentist. Please bring your Emirates ID. We'll confirm on WhatsApp in the morning."]],
    ar: [["c", "مرحبا، عندي ألم في السن. ممكن موعد مع طبيب الأسنان بكرة؟"], ["a", "سلامتك. عندنا 10:00 أو 16:00 بكرة. أيهما أفضل لك؟"], ["c", "10 لو سمحت"], ["a", "تم الحجز ✅ بكرة 10:00 مع طبيب الأسنان. يرجى إحضار الهوية الإماراتية. سنؤكد على واتساب صباحاً."]],
    ur: [["c", "السلام علیکم، دانت میں درد ہے۔ کل ڈینٹسٹ سے ملاقات ہو سکتی ہے؟"], ["a", "اللہ شفا دے۔ کل صبح 10 یا شام 4 بجے وقت ہے۔ کون سا بہتر ہے؟"], ["c", "10 بجے"], ["a", "اپوائنٹمنٹ بک ہو گئی ✅ کل 10 بجے۔ ایمریٹس آئی ڈی ساتھ لائیں۔ صبح واٹس ایپ پر کنفرم کریں گے۔"]],
    hi: [["c", "नमस्ते, दाँत में दर्द है। कल डेंटिस्ट से मिल सकते हैं?"], ["a", "जल्दी ठीक हो जाइए। कल सुबह 10 या शाम 4 बजे समय है। कौन सा बेहतर है?"], ["c", "10 बजे"], ["a", "अपॉइंटमेंट बुक ✅ कल 10 बजे। एमिरेट्स आईडी साथ लाएँ। सुबह WhatsApp पर कन्फर्म करेंगे।"]],
  },
  salon: {
    en: [["c", "Hi! Threading and a haircut on Saturday? How much?"], ["a", "Hi ✨ Threading is AED 30, haircut from AED 60. Saturday we have 2:00 or 5:00 pm."], ["c", "5 pm"], ["a", "Booked ✅ Saturday 5:00 pm, threading and haircut. See you then!"]],
    ar: [["c", "مرحبا! أبي خيط وقص شعر يوم السبت. كم السعر؟"], ["a", "أهلاً ✨ الخيط 30 درهم، وقص الشعر من 60 درهم. السبت متاح 2:00 أو 5:00 مساءً."], ["c", "5 مساءً"], ["a", "تم الحجز ✅ السبت 5:00 مساءً، خيط وقص شعر. بانتظارك!"]],
    ur: [["c", "السلام علیکم! ہفتے کو تھریڈنگ اور ہیئر کٹ؟ کتنے کا ہے؟"], ["a", "جی ✨ تھریڈنگ 30 درہم، ہیئر کٹ 60 درہم سے۔ ہفتے کو 2 یا 5 بجے وقت ہے۔"], ["c", "5 بجے"], ["a", "بکنگ ہو گئی ✅ ہفتہ شام 5 بجے، تھریڈنگ اور ہیئر کٹ۔"]],
    hi: [["c", "नमस्ते! शनिवार को थ्रेडिंग और हेयरकट? कितने का है?"], ["a", "जी ✨ थ्रेडिंग 30 दिरहम, हेयरकट 60 दिरहम से। शनिवार को 2 या 5 बजे समय है।"], ["c", "5 बजे"], ["a", "बुकिंग हो गई ✅ शनिवार शाम 5 बजे, थ्रेडिंग और हेयरकट।"]],
  },
  laundry: {
    en: [["c", "Do you pick up from Musaffah? I have 2 carpets."], ["a", "Yes, free pickup and delivery 🚚 Carpet cleaning is AED 15 per m². Pickup tomorrow at 10:00?"], ["c", "Yes"], ["a", "Done ✅ Pickup tomorrow 10:00. Send your building name and we'll be there."]],
    ar: [["c", "هل تستلمون من مصفح؟ عندي سجادتين."], ["a", "نعم، استلام وتوصيل مجاني 🚚 تنظيف السجاد 15 درهم للمتر المربع. الاستلام بكرة 10:00؟"], ["c", "نعم"], ["a", "تم ✅ الاستلام بكرة 10:00. أرسل لنا اسم البناية ونكون عندك."]],
    ur: [["c", "کیا آپ مصفح سے پک اپ کرتے ہیں؟ میرے پاس 2 قالین ہیں۔"], ["a", "جی، پک اپ اور ڈیلیوری فری ہے 🚚 قالین کی دھلائی 15 درہم فی مربع میٹر۔ کل 10 بجے پک اپ ٹھیک ہے؟"], ["c", "جی"], ["a", "ہو گیا ✅ کل 10 بجے پک اپ۔ بلڈنگ کا نام بھیج دیں۔"]],
    hi: [["c", "क्या आप मुसफ्फह से पिकअप करते हैं? मेरे पास 2 कालीन हैं।"], ["a", "जी, पिकअप और डिलीवरी फ्री है 🚚 कालीन धुलाई 15 दिरहम प्रति वर्ग मीटर। कल 10 बजे पिकअप ठीक है?"], ["c", "हाँ"], ["a", "हो गया ✅ कल 10 बजे पिकअप। बिल्डिंग का नाम भेज दीजिए।"]],
  },
};
Object.assign(S, {"printing":{"en":[["c","Hi, I need 500 business cards. How much?"],["a","Hello! 500 standard business cards are AED 245, ready in 2 days. Is your design ready?"],["c","Yes, I have the design"],["a","Great 👍 Send it here as a PDF. I'll make your quotation now and the team will confirm the order."]],"ar":[["c","مرحبا، أحتاج 500 بطاقة عمل. كم السعر؟"],["a","أهلاً! 500 بطاقة عمل عادية بـ 245 درهم، جاهزة خلال يومين. هل التصميم جاهز؟"],["c","نعم، التصميم جاهز"],["a","ممتاز 👍 أرسله هنا بصيغة PDF. سأجهز عرض السعر الآن والفريق يؤكد الطلب."]],"ur":[["c","السلام علیکم، 500 بزنس کارڈ چاہئیں۔ کتنے کے ہوں گے؟"],["a","وعلیکم السلام! 500 عام بزنس کارڈ 245 درہم کے ہیں، 2 دن میں تیار۔ کیا ڈیزائن تیار ہے؟"],["c","جی، ڈیزائن تیار ہے"],["a","زبردست 👍 یہاں PDF بھیج دیں۔ میں ابھی کوٹیشن بنا دیتا ہوں، ٹیم آرڈر کنفرم کرے گی۔"]],"hi":[["c","नमस्ते, 500 बिज़नेस कार्ड चाहिए। कितने के होंगे?"],["a","नमस्ते! 500 नॉर्मल बिज़नेस कार्ड 245 दिरहम के हैं, 2 दिन में तैयार। क्या डिज़ाइन तैयार है?"],["c","जी, डिज़ाइन तैयार है"],["a","बढ़िया 👍 यहाँ PDF भेज दीजिए। मैं अभी कोटेशन बना देता हूँ, टीम ऑर्डर कन्फर्म करेगी।"]]},"tyres":{"en":[["c","Price for 4 tyres 265/65 R17?"],["a","Hello! For 265/65 R17: budget AED 1,280, mid-range AED 1,680, premium AED 2,240 for all 4, fitting and VAT included. Which one?"],["c","Mid-range. Today possible?"],["a","Yes 👍 We can fit them today at 4:30 pm at the shop. Shall I book it?"],["c","Yes"],["a","Booked ✅ Today 4:30 pm, 4 mid-range tyres. See you at the shop."]],"ar":[["c","كم سعر 4 إطارات 265/65 R17؟"],["a","أهلاً! مقاس 265/65 R17: اقتصادي 1,280 درهم، متوسط 1,680 درهم، ممتاز 2,240 درهم للأربعة، شامل التركيب والضريبة. أيهم تفضل؟"],["c","المتوسط. ممكن اليوم؟"],["a","نعم 👍 نقدر نركبها اليوم الساعة 4:30 عصراً في المحل. أحجز لك؟"],["c","نعم"],["a","تم الحجز ✅ اليوم 4:30 عصراً، 4 إطارات متوسطة. نشوفك في المحل."]],"ur":[["c","265/65 R17 کے 4 ٹائر کتنے کے ہیں؟"],["a","السلام علیکم! 265/65 R17: سستے 1,280 درہم، درمیانے 1,680 درہم، اچھے برانڈ 2,240 درہم، چاروں کے، فٹنگ اور VAT سمیت۔ کون سے چاہئیں؟"],["c","درمیانے۔ آج ہو سکتا ہے؟"],["a","جی 👍 آج شام 4:30 بجے دکان پر لگ سکتے ہیں۔ بک کر دوں؟"],["c","جی"],["a","بکنگ ہو گئی ✅ آج 4:30 بجے، 4 درمیانے ٹائر۔ دکان پر ملتے ہیں۔"]],"hi":[["c","265/65 R17 के 4 टायर कितने के हैं?"],["a","नमस्ते! 265/65 R17: सस्ते 1,280 दिरहम, मीडियम 1,680 दिरहम, प्रीमियम 2,240 दिरहम, चारों के, फिटिंग और VAT के साथ। कौन से चाहिए?"],["c","मीडियम। आज हो सकता है?"],["a","जी 👍 आज शाम 4:30 बजे दुकान पर लग सकते हैं। बुक कर दूँ?"],["c","हाँ"],["a","बुकिंग हो गई ✅ आज 4:30 बजे, 4 मीडियम टायर। दुकान पर मिलते हैं।"]]},"restaurant":{"en":[["c","Do you deliver to Khalifa City? I want 2 chicken biryani."],["a","Yes, we deliver to Khalifa City 👍 2 chicken biryani are AED 50, delivery free above AED 40. Shall I place the order?"],["c","Yes please"],["a","Order taken ✅ 2 chicken biryani, about 40 minutes. Please send your location pin."]],"ar":[["c","توصلون لمدينة خليفة؟ أبغى 2 برياني دجاج."],["a","نعم نوصل لمدينة خليفة 👍 2 برياني دجاج بـ 50 درهم، والتوصيل مجاني فوق 40 درهم. أسجل الطلب؟"],["c","نعم لو سمحت"],["a","تم الطلب ✅ 2 برياني دجاج، حوالي 40 دقيقة. أرسل لنا موقعك."]],"ur":[["c","خلیفہ سٹی ڈیلیوری کرتے ہیں؟ 2 چکن بریانی چاہئیں۔"],["a","جی، خلیفہ سٹی ڈیلیوری ہے 👍 2 چکن بریانی 50 درہم، 40 درہم سے اوپر ڈیلیوری فری۔ آرڈر لگا دوں؟"],["c","جی لگا دیں"],["a","آرڈر ہو گیا ✅ 2 چکن بریانی، تقریباً 40 منٹ۔ اپنی لوکیشن بھیج دیں۔"]],"hi":[["c","खलीफा सिटी डिलीवरी करते हैं? 2 चिकन बिरयानी चाहिए।"],["a","जी, खलीफा सिटी डिलीवरी है 👍 2 चिकन बिरयानी 50 दिरहम, 40 दिरहम से ऊपर डिलीवरी फ्री। ऑर्डर कर दूँ?"],["c","हाँ कर दीजिए"],["a","ऑर्डर हो गया ✅ 2 चिकन बिरयानी, लगभग 40 मिनट। अपनी लोकेशन भेज दीजिए।"]]},"realestate":{"en":[["c","Hi, any 2 bedroom flat for rent in Al Reem?"],["a","Hello! Yes, we have 3 options in Al Reem from AED 95,000 a year. Do you want to see photos?"],["c","Yes, and can I visit Saturday?"],["a","Sending the photos now 📸 Saturday we have 11 am or 5 pm for a viewing. Which suits you?"],["c","5 pm"],["a","Booked ✅ Saturday 5 pm viewing in Al Reem. The agent will call you before."]],"ar":[["c","مرحبا، عندكم شقة غرفتين للإيجار في جزيرة الريم؟"],["a","أهلاً! نعم، عندنا 3 خيارات في الريم تبدأ من 95,000 درهم سنوياً. تحب أرسل الصور؟"],["c","نعم، وممكن أزورها يوم السبت؟"],["a","أرسل الصور الآن 📸 يوم السبت عندنا 11 صباحاً أو 5 مساءً للمعاينة. أيهما يناسبك؟"],["c","5 مساءً"],["a","تم الحجز ✅ السبت 5 مساءً معاينة في الريم. الوكيل يتصل بك قبلها."]],"ur":[["c","السلام علیکم، الریم میں 2 بیڈروم فلیٹ کرائے پر ملے گا؟"],["a","وعلیکم السلام! جی، الریم میں 3 فلیٹ ہیں، 95,000 درہم سالانہ سے۔ تصویریں بھیج دوں؟"],["c","جی، اور ہفتے کو دیکھ سکتے ہیں؟"],["a","تصویریں بھیج رہا ہوں 📸 ہفتے کو صبح 11 یا شام 5 بجے دیکھ سکتے ہیں۔ کون سا وقت ٹھیک ہے؟"],["c","شام 5 بجے"],["a","بکنگ ہو گئی ✅ ہفتہ شام 5 بجے، الریم میں فلیٹ دیکھنا۔ ایجنٹ پہلے کال کرے گا۔"]],"hi":[["c","नमस्ते, अल रीम में 2 बेडरूम फ्लैट किराए पर मिलेगा?"],["a","नमस्ते! जी, अल रीम में 3 फ्लैट हैं, 95,000 दिरहम सालाना से। फोटो भेज दूँ?"],["c","जी, और शनिवार को देख सकते हैं?"],["a","फोटो भेज रहा हूँ 📸 शनिवार को सुबह 11 या शाम 5 बजे देख सकते हैं। कौन सा समय ठीक है?"],["c","शाम 5 बजे"],["a","बुकिंग हो गई ✅ शनिवार शाम 5 बजे, अल रीम में फ्लैट देखना। एजेंट पहले कॉल करेगा।"]]},"maintenance":{"en":[["c","My AC is leaking water. Can someone come today?"],["a","Sorry about that! An AC visit is AED 150, and we can come today at 6 pm. What is your area?"],["c","Mohammed Bin Zayed City"],["a","Booked ✅ Today 6 pm, AC check in MBZ City. The technician will call when he is on the way."]],"ar":[["c","المكيف عندي يسرّب ماء. ممكن أحد يجي اليوم؟"],["a","نأسف لذلك! زيارة فني المكيف 150 درهم، ونقدر نجي اليوم الساعة 6 مساءً. وين منطقتك؟"],["c","مدينة محمد بن زايد"],["a","تم الحجز ✅ اليوم 6 مساءً، فحص المكيف في مدينة محمد بن زايد. الفني يتصل وهو في الطريق."]],"ur":[["c","AC سے پانی ٹپک رہا ہے۔ آج کوئی آ سکتا ہے؟"],["a","معذرت! AC وزٹ 150 درہم ہے، آج شام 6 بجے آ سکتے ہیں۔ آپ کا ایریا کون سا ہے؟"],["c","محمد بن زاید سٹی"],["a","بکنگ ہو گئی ✅ آج شام 6 بجے، MBZ سٹی میں AC چیک۔ ٹیکنیشن راستے میں کال کرے گا۔"]],"hi":[["c","AC से पानी टपक रहा है। आज कोई आ सकता है?"],["a","माफ़ कीजिए! AC विज़िट 150 दिरहम है, आज शाम 6 बजे आ सकते हैं। आपका एरिया कौन सा है?"],["c","मोहम्मद बिन ज़ायद सिटी"],["a","बुकिंग हो गई ✅ आज शाम 6 बजे, MBZ सिटी में AC चेक। टेक्नीशियन रास्ते में कॉल करेगा।"]]},"trading":{"en":[["c","Need a quote for 40 office chairs, delivered to Musaffah."],["a","Hello! 40 office chairs at AED 350 each = AED 14,000, plus delivery AED 600. Total AED 14,600. Shall I send the quotation as PDF?"],["c","Yes, in the company name Al Noor Trading"],["a","Done ✅ Quotation for Al Noor Trading is ready for the manager's OK. You'll get the PDF on WhatsApp shortly."]],"ar":[["c","أحتاج عرض سعر لـ 40 كرسي مكتب، التوصيل لمصفح."],["a","أهلاً! 40 كرسي مكتب × 350 درهم = 14,000 درهم، والتوصيل 600 درهم. الإجمالي 14,600 درهم. أرسل لك عرض السعر PDF؟"],["c","نعم، باسم شركة النور للتجارة"],["a","تم ✅ عرض السعر لشركة النور للتجارة جاهز لموافقة المدير. يصلك الـ PDF على واتساب قريباً."]],"ur":[["c","40 آفس چیئرز کی کوٹیشن چاہیے، مصفح ڈیلیوری۔"],["a","السلام علیکم! 40 آفس چیئرز × 350 درہم = 14,000 درہم، ڈیلیوری 600 درہم۔ ٹوٹل 14,600 درہم۔ کوٹیشن PDF میں بھیج دوں؟"],["c","جی، کمپنی کا نام النور ٹریڈنگ"],["a","ہو گیا ✅ النور ٹریڈنگ کی کوٹیشن مینیجر کی منظوری کے لیے تیار ہے۔ PDF جلد واٹس ایپ پر آ جائے گی۔"]],"hi":[["c","40 ऑफिस चेयर का कोटेशन चाहिए, मुसफ्फह डिलीवरी।"],["a","नमस्ते! 40 ऑफिस चेयर × 350 दिरहम = 14,000 दिरहम, डिलीवरी 600 दिरहम। कुल 14,600 दिरहम। कोटेशन PDF में भेज दूँ?"],["c","जी, कंपनी का नाम अल नूर ट्रेडिंग"],["a","हो गया ✅ अल नूर ट्रेडिंग का कोटेशन मैनेजर की मंज़ूरी के लिए तैयार है। PDF जल्द WhatsApp पर आ जाएगा।"]]}});
const PRICE = {
  garage: { en: "An AC check is AED 80, an oil change from AED 120", ar: "فحص المكيف 80 درهم، وتغيير الزيت من 120 درهم", ur: "AC چیک 80 درہم، آئل چینج 120 درہم سے", hi: "AC चेक 80 दिरहम, ऑयल चेंज 120 दिरहम से" },
  clinic: { en: "A consultation is AED 150, cleaning from AED 250", ar: "الاستشارة 150 درهم، والتنظيف من 250 درهم", ur: "مشورہ 150 درہم، صفائی 250 درہم سے", hi: "परामर्श 150 दिरहम, सफ़ाई 250 दिरहम से" },
  salon: { en: "Threading AED 30, haircut from AED 60", ar: "الخيط 30 درهم، وقص الشعر من 60 درهم", ur: "تھریڈنگ 30 درہم، ہیئر کٹ 60 درہم سے", hi: "थ्रेडिंग 30 दिरहम, हेयरकट 60 दिरहम से" },
  laundry: { en: "Shirts AED 5 each, carpets AED 15 per m², free pickup", ar: "القميص 5 دراهم، السجاد 15 درهم للمتر، والاستلام مجاني", ur: "شرٹ 5 درہم، قالین 15 درہم فی مربع میٹر، پک اپ فری", hi: "शर्ट 5 दिरहम, कालीन 15 दिरहम प्रति वर्ग मीटर, पिकअप फ्री" },
};
Object.assign(PRICE, {"printing":{"en":"500 business cards AED 245, A5 flyers from AED 180 for 1,000","ar":"500 بطاقة عمل 245 درهم، و1,000 فلاير A5 من 180 درهم","ur":"500 بزنس کارڈ 245 درہم، 1,000 A5 فلائر 180 درہم سے","hi":"500 बिज़नेस कार्ड 245 दिरहम, 1,000 A5 फ़्लायर 180 दिरहम से"},"tyres":{"en":"A set of 4 from AED 1,280, fitting and VAT included","ar":"طقم 4 إطارات من 1,280 درهم شامل التركيب والضريبة","ur":"4 ٹائروں کا سیٹ 1,280 درہم سے، فٹنگ اور VAT سمیت","hi":"4 टायर का सेट 1,280 दिरहम से, फिटिंग और VAT के साथ"},"restaurant":{"en":"Chicken biryani AED 25, family meal from AED 89, free delivery above AED 40","ar":"برياني دجاج 25 درهم، وجبة عائلية من 89 درهم، توصيل مجاني فوق 40 درهم","ur":"چکن بریانی 25 درہم، فیملی میل 89 درہم سے، 40 درہم سے اوپر ڈیلیوری فری","hi":"चिकन बिरयानी 25 दिरहम, फैमिली मील 89 दिरहम से, 40 दिरहम से ऊपर डिलीवरी फ्री"},"realestate":{"en":"2-bedroom flats from AED 95,000 a year, studios from AED 45,000","ar":"شقق غرفتين من 95,000 درهم سنوياً، واستوديو من 45,000 درهم","ur":"2 بیڈروم 95,000 درہم سالانہ سے، اسٹوڈیو 45,000 درہم سے","hi":"2 बेडरूम 95,000 दिरहम सालाना से, स्टूडियो 45,000 दिरहम से"},"maintenance":{"en":"An AC visit is AED 150, AC cleaning from AED 120 per unit","ar":"زيارة فني المكيف 150 درهم، وتنظيف المكيف من 120 درهم للوحدة","ur":"AC وزٹ 150 درہم، AC صفائی 120 درہم فی یونٹ سے","hi":"AC विज़िट 150 दिरहम, AC सफ़ाई 120 दिरहम प्रति यूनिट से"},"trading":{"en":"Office chairs from AED 350 each, delivery from AED 600","ar":"كراسي المكتب من 350 درهم للقطعة، والتوصيل من 600 درهم","ur":"آفس چیئر 350 درہم فی پیس سے، ڈیلیوری 600 درہم سے","hi":"ऑफिस चेयर 350 दिरहम प्रति पीस से, डिलीवरी 600 दिरहम से"}});
const REPLY = {
  price: { en: (p) => `${p} (example prices). Shall I book you a time?`, ar: (p) => `${p} (أسعار للمثال). هل أحجز لك موعداً؟`, ur: (p) => `${p} (مثال کے ریٹ)۔ کیا آپ کے لیے وقت بک کر دوں؟`, hi: (p) => `${p} (उदाहरण के रेट)। क्या आपके लिए समय बुक कर दूँ?` },
  hours: { en: "We're open 8 am to 10 pm, and I can book you in right now.", ar: "نحن مفتوحون من 8 صباحاً حتى 10 مساءً، ويمكنني حجزك الآن.", ur: "ہم صبح 8 سے رات 10 بجے تک کھلے ہیں، اور ابھی بکنگ ہو سکتی ہے۔", hi: "हम सुबह 8 से रात 10 बजे तक खुले हैं, और अभी बुकिंग हो सकती है।" },
  where: { en: "We're in Musaffah, Abu Dhabi (example). Shall I send the location pin?", ar: "نحن في مصفح، أبوظبي (مثال). هل أرسل لك الموقع؟", ur: "ہم مصفح، ابوظہبی میں ہیں (مثال)۔ لوکیشن بھیج دوں؟", hi: "हम मुसफ्फह, अबू धाबी में हैं (उदाहरण)। लोकेशन भेज दूँ?" },
  book: { en: "Sure! Which day and time suit you? I'll hold the slot and the team confirms.", ar: "بالتأكيد! أي يوم ووقت يناسبك؟ سأحجز الموعد والفريق يؤكد.", ur: "ضرور! کون سا دن اور وقت ٹھیک ہے؟ وقت رکھ لیتا ہوں، ٹیم کنفرم کرے گی۔", hi: "ज़रूर! कौन सा दिन और समय ठीक रहेगा? स्लॉट रख लेता हूँ, टीम कन्फर्म करेगी।" },
  other: { en: "Good question. I've passed it to the team and they'll reply first thing in the morning ✅", ar: "سؤال جيد. حوّلته للفريق وسيردون أول شيء صباحاً ✅", ur: "اچھا سوال ہے۔ ٹیم کو بھیج دیا ہے، وہ صبح سب سے پہلے جواب دیں گے ✅", hi: "अच्छा सवाल है। टीम को भेज दिया है, वे सुबह सबसे पहले जवाब देंगे ✅" },
};
const INTENT = [
  ["price", /price|cost|how much|charge|rate|كم|سعر|قیمت|کتن|ریٹ|پیسے|कितन|रेट|दाम|कीमत/i],
  ["hours", /open|close|hour|timing|when|متى|ساعات|دوام|وقت|ٹائم|کب|खुल|समय|कब/i],
  ["where", /where|location|address|map|وين|أين|موقع|عنوان|کہاں|لوکیشن|पता|कहाँ|लोकेशन/i],
  ["book", /book|appointment|slot|tomorrow|today|حجز|موعد|بكرة|بکنگ|اپوائنٹ|کل|बुक|अपॉइंट|कल/i],
];
const ONLINE = { en: "online", ar: "متصل", ur: "آن لائن", hi: "ऑनलाइन" }, TYPING = { en: "typing…", ar: "يكتب…", ur: "لکھ رہا ہے…", hi: "टाइप कर रहा है…" };
const PH4 = { en: "Ask it something…", ar: "اسأل كعميل…", ur: "کچھ پوچھیں…", hi: "कुछ पूछिए…" };

// ---------- the demo chat ----------
let trade = "garage", lang = "en", run = 0;
const LBL = { c: { en: "Customer", ar: "العميل", ur: "کسٹمر", hi: "ग्राहक" }, a: { en: "AI assistant", ar: "المساعد", ur: "اسسٹنٹ", hi: "असिस्टेंट" } };
const log = $("#logList");
function bubble(who, text, l) {
  const p = document.createElement("div"); p.className = `m ${who} ${l}`; p.dir = "auto";
  p.innerHTML = `<span class="who">${esc(LBL[who][l] || LBL[who].en)}</span>${esc(text)}`; log.appendChild(p); log.scrollTop = log.scrollHeight;
}
async function say(who, text, l = lang, id = run, typing = true) {
  if (typing && !reduce) {
    const t = document.createElement("div"); t.className = "typing " + who; t.innerHTML = "<i></i><i></i><i></i>"; log.appendChild(t); log.scrollTop = log.scrollHeight;
    $("#status").textContent = who === "a" ? (TYPING[l] || TYPING.en) : (ONLINE[l] || ONLINE.en);
    await wait(who === "a" ? 900 + Math.min(1400, text.length * 12) : 650); t.remove();
    $("#status").textContent = "AI assistant · " + (ONLINE[l] || ONLINE.en);
  }
  if (id !== run) return false;
  bubble(who, text, l); return true;
}
async function play() {
  const id = ++run; log.innerHTML = ""; $("#bizName").textContent = NAME[trade][0]; $("#av").textContent = NAME[trade][1];
  $("#askIn").placeholder = PH4[lang]; $("#askIn").dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr";
  await document.fonts.ready;
  for (const [f, t] of S[trade][lang]) { if (!(await say(f, t, lang, id))) return; await wait(reduce ? 100 : 500); if (id !== run) return; }
}
const URDU = /[پچگکھیےٹڈڑ]/;
async function ask(q) {
  const id = ++run;
  const ql = /[؀-ۿ]/.test(q) ? (URDU.test(q) ? "ur" : "ar") : /[ऀ-ॿ]/.test(q) ? "hi" : lang;
  bubble("c", q, ql);
  const hit = INTENT.find(([, re]) => re.test(q)), k = hit ? hit[0] : "other";
  await say("a", k === "price" ? REPLY.price[ql](PRICE[trade][ql]) : REPLY[k][ql], ql, id);
}
$("#askForm").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#askIn").value.trim(); if (!q) return; $("#askIn").value = ""; ask(q); });
$$(".tryq button").forEach((b) => b.addEventListener("click", () => ask(b.dataset.q)));
$("#trade").addEventListener("change", (e) => { trade = e.target.value; play(); });
group($("#lang"), (v) => { lang = v; play(); });
$("#replay").addEventListener("click", play);
{ let started = false; new IntersectionObserver(([e], o) => { if (e.isIntersecting && !started) { started = true; o.disconnect(); play(); } }, { threshold: .35 }).observe(log); }

// ---------- a real recorded call; its words appear in the chat ----------
{
  const aud = $("#aud"), btn = $("#bell"), st = $("#bellState"), wave = $("#ccWave"), N = 44;
  for (let i = 0; i < N; i++) wave.append(document.createElement("i"));
  const bars = $$("i", wave);
  const CALL = [[0, "a", "Good evening, Your Clinic. How can I help you?"], [3.8, "c", "Hi, I have a toothache. Can I see a dentist tomorrow?"], [9.3, "a", "I'm sorry to hear that. We have 10 am or 4 pm tomorrow. Which is better for you?"], [15.7, "c", "Ten in the morning, please."], [18.5, "a", "Done. You're booked for 10 am tomorrow. Our team will confirm on WhatsApp in the morning."]];
  let next = 0, raf = 0;
  const anim = () => {
    const f = aud.duration ? aud.currentTime / aud.duration : 0;
    bars.forEach((b, i) => { b.classList.toggle("p", i / N <= f); b.style.height = aud.paused ? "" : 15 + Math.abs(Math.sin(performance.now() / 140 + i * 1.7) * Math.sin(i * .9 + performance.now() / 420)) * 85 + "%"; });
    if (!aud.paused) raf = requestAnimationFrame(anim);
  };
  btn.addEventListener("click", () => {
    if (!aud.paused) { aud.pause(); return; }
    if (aud.ended || aud.currentTime === 0) { next = 0; aud.currentTime = 0; run++; log.innerHTML = ""; $("#bizName").textContent = "Your Clinic · phone call"; $("#av").textContent = "YC"; }
    aud.play().catch(() => (st.textContent = "Couldn't play the sound on this device"));
    if (innerWidth < 960) log.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });
  aud.addEventListener("play", () => { btn.classList.add("on"); st.textContent = "On the phone… tap to pause"; cancelAnimationFrame(raf); anim(); });
  aud.addEventListener("pause", () => { btn.classList.remove("on"); if (!aud.ended) st.textContent = "Paused · tap to carry on"; anim(); });
  aud.addEventListener("timeupdate", () => { while (next < CALL.length && aud.currentTime >= CALL[next][0]) { const [, w, t] = CALL[next++]; bubble(w, t, "en"); } });
  aud.addEventListener("ended", () => { st.textContent = "Booked ✓ Tap to play again"; });
}

const tweens = new Map();
function tween(key, from, to, cb, ms = 500) {
  cancelAnimationFrame(tweens.get(key)); if (reduce) return cb(to);
  const t0 = performance.now(); const f = (now) => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); cb(from + (to - from) * e); if (k < 1) tweens.set(key, requestAnimationFrame(f)); }; requestAnimationFrame(f);
}

// ---------- your hours ----------
{
  const o = $("#hOpen"), c = $("#hClose"), d = $("#hDays"); if (o) {
  const ap = (h) => (h === 24 || h === 0 ? "midnight" : h === 12 ? "12 pm" : h < 12 ? h + " am" : h - 12 + " pm");
  let shown = 114;
  const upd = () => {
    const a = +o.value, b = +c.value, n = +d.value, gap = 168 - n * (b - a);
    $("#hOpenV").textContent = ap(a); $("#hCloseV").textContent = ap(b); $("#hDaysV").textContent = n;
    $("#mYou").setAttribute("d", arc(120, 120, 100, a, b)); $("#mGap").setAttribute("d", arc(120, 120, 100, b + .35, a + 24 - .35));
    tween("gap", shown, gap, (v) => { $("#gapH").textContent = Math.round(v); shown = v; });
    [o, c, d].forEach((i) => i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min)) * 100 + "%"));
  };
  [o, c, d].forEach((i) => i.addEventListener("input", upd)); upd(); }
}

// ---------- your numbers ----------
{
  let shown = 0;
  const calc = () => {
    const a = +$("#c1").value, v = +$("#c2").value, jobs = Math.round(a * 4.3 * .25), m = Math.round(a * 4.3 * .25 * v);
    $$(".money-card input[type=range]").forEach((i) => i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min)) * 100 + "%"));
    $("#c1v").textContent = a; $("#c2v").textContent = "AED " + fmt(v);
    tween("money", shown, m, (x) => { $("#money").textContent = fmt(x); shown = x; });
    $("#perDay").textContent = "≈ AED " + fmt(m / 30) + " a day · " + jobs + " jobs";
    $("#verdict").innerHTML = m >= 999 ? `That's more than the AED 999 plan, which is <b class="ok">about AED 33 a day.</b>` : "At these numbers it may not pay for itself yet. Message Noor for an honest answer.";
  };
  if ($("#c1")) { $$(".money-card input").forEach((i) => i.addEventListener("input", calc)); calc(); }
}

// ---------- steps line fills as you scroll; stats count up ----------
{
  const ol = $("#steps"), lis = $$("li", ol);
  const f = () => { const r = ol.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / (r.height || 1))); ol.style.setProperty("--prog", p); lis.forEach((li, i) => li.classList.toggle("lit", p >= i / (lis.length - 1) - .02)); };
  addEventListener("scroll", f, { passive: true }); f();
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { const el = e.target, n = +el.dataset.count; io.unobserve(el); tween(el, 0, n, (v) => (el.textContent = Math.round(v)), 1400); } }), { threshold: .5 });
  $$("[data-count]").forEach((el) => io.observe(el));
}

// ---------- chat widget: Noor's assistant ----------
// Rule-based on purpose (not an LLM). It answers ONLY questions it has a written answer for, taken from this
// website. Anything else (unclear, off-topic, or a detail the site doesn't state) goes to Noor on WhatsApp,
// so it never guesses a price or a promise. Keep the answers below in sync with the page.
const APP_URL = "https://ai-invoice-928b5.web.app";
const A = {
  hello: { a: "Hi! 👋 I'm Noor's assistant. I can tell you what we do, the prices and how it starts, or book you a free 10-minute call.", c: ["What do you do?", "Prices", "Book a free call"] },
  thanks: { a: "You're welcome! Anything else?", c: ["Prices", "Book a free call"] },
  what: { a: "We put an AI assistant on your WhatsApp and phone. It answers customers in seconds, in their language, books them in and hands the job to your team, even at 11 pm. We also automate office jobs like quotes, reminders and reports.", c: ["Prices", "How does it start?", "Who is Noor?"] },
  prices: { a: "<b>Pay monthly</b> (we look after it, 7 days free):<br>• <b>Starter</b>, your WhatsApp: AED 499/month + AED 499 to set up<br>• <b>Growth</b>, WhatsApp, Instagram, Facebook and website chat: AED 999/month + AED 799 to set up<br>• <b>Complete</b>, adds emails, phone calls and quotes: AED 1,999/month + AED 2,499 to set up<br>Or <b>pay once</b> and own it: from AED 2,999. Stop any month.", c: ["Which plan suits me?", "Pay once?", "Book a free call"] },
  chat: { a: "<b>Growth</b>: AED 999/month + AED 799 setup. It answers WhatsApp, Instagram, Facebook and website chat day and night from your own catalogue and prices, takes bookings and orders, and hands over to your team. Just WhatsApp? <b>Starter</b> is AED 499/month + AED 499 setup.", c: ["Calls plan", "Book a free call"] },
  calls: { a: "<b>Phone calls</b>: AED 799/month + AED 999 setup, about 500 call minutes a month, extra minutes AED 1 each. It picks up missed and after-hours calls. You keep your own du or e& number; if you need a new line, it is added at cost. Calls are included in <b>Complete</b> (AED 1,999/month).", c: ["Free 7 days?", "Book a free call"] },
  office: { a: "<b>Quotes and paperwork</b>: from AED 499/month + from AED 1,499 to set up, priced per job. For example quotes from enquiries (QuickBooks too), follow-ups, payment reminders, reports and data entry. One automation is included in <b>Complete</b>.", c: ["Book a free call"] },
  video: { a: "Right now Noor focuses on AI assistants and websites. For anything else, ask Noor directly.", c: ["Ask Noor on WhatsApp", "Book a free call"] },
  website: { a: "Yes, Noor builds websites like this one, made for phones:<br>• <b>Simple website</b> (1-5 pages): AED 2,499 + AED 199/month care<br>• <b>Business website</b> (English and Arabic): AED 4,499 + AED 299/month<br>• <b>Price list that updates itself</b>: AED 7,999 + AED 499/month<br>• <b>Online shop</b>: AED 8,999 + AED 799/month<br>20% off with Growth or Complete.", c: ["Book a free call", "Ask Noor on WhatsApp"] },
  spekly: { a: "Spekly is Noor's voice invoicing app: say a sale, an expense or a payment and it writes the invoice and tracks who owes what. You can try it free.", c: ["Try Spekly", "Prices"] },
  which: { a: "Mostly WhatsApp messages? <b>Starter</b>. Messages on WhatsApp, Instagram and your website? <b>Growth</b>. Missed calls and too many quotes too? <b>Complete</b>. Prefer to pay once and own it? Ask about <b>paying once</b>. Noor can advise on a free 10-minute call.", c: ["Book a free call"] },
  once: { a: "<b>Pay once</b>: Noor sets it up on your own WhatsApp and accounts, so it is yours, with no monthly fee to us.<br>• <b>Starter</b> (WhatsApp): AED 2,999<br>• <b>Growth</b> (WhatsApp, Instagram, Facebook and website chat): AED 5,999<br>• <b>Complete</b> (adds emails, phone calls and quotes): AED 11,999<br>Small running costs (AI, WhatsApp and call fees, usually AED 150-400 a month) go straight to those companies. Training and 14 days of free fixes included.", c: ["Prices", "Book a free call"] },
  trial: { a: "Every plan starts with <b>7 days free</b>. You only keep it if it helps. No contract, stop any month.", c: ["How does it start?", "Book a free call"] },
  how: { a: "Live in 5 days:<br><b>Day 1</b> a 10-minute call about your prices and hours<br><b>Day 2-3</b> Noor builds it<br><b>Day 4</b> you test it<br><b>Day 5</b> it goes live, free for 7 days", c: ["Book a free call"] },
  noor: { a: "Noor Zaman builds every assistant himself. He's based in Abu Dhabi and speaks English, Urdu and Hindi. It's a small, new business, not a big company, so you deal with him directly.", c: ["Book a free call", "Ask Noor on WhatsApp"] },
  clients: { a: "Honest answer: we're new, so no long client list yet. That's why the first 7 days are free: you see it work on your business before you pay.", c: ["Free 7 days?", "Book a free call"] },
  lang: { a: "English, Arabic, Urdu and Hindi. It replies in the language the customer writes in.", c: ["Prices"] },
  langOther: { a: "Right now it speaks English, Arabic, Urdu and Hindi. For any other language, please ask Noor.", c: ["Ask Noor on WhatsApp"] },
  number: { a: "Usually you keep your number: it connects to your existing WhatsApp Business. No new app to learn.", c: ["How does it start?"] },
  wrong: { a: "It answers only from your own prices, services and hours. If it isn't sure, it passes the question to your team. You test it before it goes live.", c: ["Book a free call"] },
  aiknow: { a: "Yes, if they ask. And anything personal goes to your team.", c: ["Prices"] },
  data: { a: "Conversations stay in your own accounts. The privacy policy is at the bottom of the page.", c: ["Book a free call"] },
  stop: { a: "No contract. Stop any month.", c: ["Prices"] },
  fit: { a: "Clinics, garages, salons, laundries, maintenance, real estate and trading offices: any business that gets enquiries on WhatsApp or by phone.", c: ["Prices", "Book a free call"] },
  where: { a: "Noor is based in Abu Dhabi and works with businesses across the UAE. He can call you or visit you.", c: ["Book a free call"] },
  contact: { a: `WhatsApp or call Noor on <a href="https://wa.me/971589358857" target="_blank" rel="noopener">058 935 8857</a>, or email <a href="mailto:imnoorzamn@gmail.com">imnoorzamn@gmail.com</a>.`, c: ["Book a free call"] },
  demo: { a: `You can try it on this page: <a href="#try" data-close>open the demo</a>, pick a business and ask anything.`, c: ["Book a free call"] },
};
const CHIP_Q = { "What do you do?": "what", "Prices": "prices", "How does it start?": "how", "Who is Noor?": "noor", "Which plan suits me?": "which", "Free 7 days?": "trial", "Calls plan": "calls", "Pay once?": "once", "Websites?": "website", "Websites?": "website" };

// --- understanding a question: topic (what it's about) + aspect (what they want to know) ---
const R = {
  offtopic: /\b(weather|temperature|recipe|cook|poem|story|joke|song|lyrics|news|football|cricket|movie|homework|essay|translate|capital of|who won|president|prime minister|bitcoin|crypto|stock|code|python|javascript|math|calculate|sum of|meaning of life|girlfriend|boyfriend|marry|religion|politics|horoscope|chatgpt|gpt|openai|claude|gemini)\b/i,
  book: /\b(book|booking|meeting|appointment|schedule|call me|call back|talk to (noor|someone|a person)|speak to (noor|someone)|i'?m interested|interested in|sign me up|get started|let'?s start|i want (it|this|to start))\b/i,
  hello: /^(hi|hey|hello|hiya|salam|assalam\w*|as-?salam\w*|marhaba|good (morning|evening|afternoon))[\s!.,]*(there|noor|team|sir|bro|everyone)?[\s!.,]*$|^(السلام|مرحبا|ہیلو|नमस्ते)/i,
  thanks: /^(thanks|thank you|thx|shukran|jazak\w*|ok(ay)?|great|perfect|cool|nice)[\s!.,]*(thanks|thank you)?[\s!.,]*$/i,
  // details the website doesn't state: never guess, send to Noor
  unstated: /\b(refund\w*|instal?l?ments?|discounts?|promo\w*|coupons?|deals?|payment methods?|pay (by|with|in)|credit card|cash|vat|tax|invoice me|integrat\w*|crm|api|zapier|seo|google ads|ads|marketing|social media management|hosting fees?|maintenance fee|guarantee|warranty|sla|contract terms)\b/i,
  // words that show the question is about our service (needed for the general price / setup answers)
  context: /\b(it|this|you|your|plans?|services?|assistant|setup|set up|monthly|month|package|ai|bot|chatbot|whatsapp|start|live|ready)\b/i,
  // topics
  website: /\b(websites?|web ?sites?|web ?design|landing pages?|online (store|shop)|e-?commerce|domain|hosting)\b/i,
  video: /\b(videos?|reels?|tiktok|youtube|shorts|filming|video editing)\b/i,
  spekly: /\b(spekly|speakly|invoic(e|ing) app|bookkeeping app|khata)\b/i,
  calls: /\b(calls? plan|phone calls?|missed calls?|answer(s|ing)? (my |the )?(calls?|phone)|call minutes?|minutes|voice (agent|assistant)|whatsapp \+ calls)\b/i,
  chat: /\b(chat plan|whatsapp (&|and) chat|instagram|website chat|dms?|whatsapp replies|messages?)\b/i,
  office: /\b(office automation|automation|automate|paperwork|quotations?|quotes|invoices|payment reminders?|reminders|reports?|data entry|follow-?ups?)\b/i,
  once: /\b(one[- ]?time|one[- ]?off|pay once|own it|buy (it )?outright|no monthly|lifetime)\b/i,
  // aspects
  price: /\b(price|prices|pricing|cost|costs|how much|fee|fees|charges?|rates?|aed|dhs?|dirhams?|budget|expensive|cheap|afford|pay|monthly|packages?|plans?)\b|كم|سعر|قیمت|کتن|कितन|कीमत/i,
  time: /\b(how long|how many days|how fast|how soon|when can|time ?line|time ?frame|deadline|turnaround|go live|ready by)\b/i,
  howWork: /\b(how (does|do|will|would) (it|this|you|the assistant|that) (work|start|begin)|how (do|can) i (start|begin|get started)|set ?up process|onboarding|steps|process)\b/i,
  whatIs: /\b(what (do|does) (you|your (company|business))|what (is|are) (this|you|it|noor ai concierge|your services)|what you (do|offer)|your services|services|what can (it|you|the assistant) do|explain|tell me about (it|this|you|your))\b/i,
  // fixed intents
  noor: /\b(who (are|is) (you|noor|behind|running)|who('?s| is) noor|about noor|founder|owner|big company|your company|who will (build|do)|who builds|team size|how many people)\b/i,
  clients: /\b(clients?|customers you have|references?|reviews?|portfolio|case stud(y|ies)|testimonials?|worked with)\b/i,
  which: /\b(which plan|what plan|suits? me|recommend|best plan|right plan|should i (get|choose|pick))\b/i,
  trial: /\b(free trial|trial|pilot|try (it )?(for )?free|7 days? free|seven days|first (7|seven) days|is it free)\b/i,
  langOther: /\b(french|german|spanish|chinese|mandarin|russian|tagalog|filipino|bengali|bangla|persian|farsi|malayalam|tamil|telugu|turkish|italian|portuguese|pashto|punjabi|sinhala|nepali)\b/i,
  lang: /\b(languages?|arabic|urdu|hindi|english|multilingual)\b|عربي|اردو|हिंदी/i,
  number: /\b(new (whatsapp )?number|same number|my (own )?number|whatsapp business|change (my )?number|new app|learn an app)\b/i,
  wrong: /\b(wrong answers?|mistakes?|accurate|accuracy|hallucinat\w*|make things up|reliable)\b/i,
  aiknow: /\b(know (it'?s|its) (an )?ai|bot or (a )?human|real person|pretend)\b/i,
  data: /\b(data|privacy|private|secure|security|gdpr)\b/i,
  stop: /\b(cancel|contract|lock.?in|commitment|unsubscribe|stop (it|anytime|any time|the service))\b/i,
  fit: /\b(do you work with|suitable for|good for|work for (a|my)|clinics?|garages?|workshops?|salons?|laundr(y|ies)|restaurants?|real estate|maintenance|trading)\b/i,
  where: /\b(where (are|is) (you|noor|your office)|located|location|based in|address|visit (me|us|my))\b/i,
  contact: /\b(contact|phone number|your number|email|reach (you|noor)|whatsapp number)\b/i,
  demo: /\b(demo|example|show me|see it working|try it out)\b/i,
};
const TABLE = { // topic -> what we can answer for each aspect; a missing aspect goes to Noor
  website: { what: "website", price: "website" },
  video: { what: "video", price: "video" },
  spekly: { what: "spekly", howWork: "spekly" },
  calls: { what: "calls", price: "calls", howWork: "calls" },
  chat: { what: "chat", price: "chat", howWork: "chat" },
  office: { what: "office", price: "office" },
  once: { what: "once", price: "once", howWork: "once" },
};
function think(raw) {
  const q = raw.trim(), words = q.split(/\s+/).length;
  if (!q || !/[\p{L}\p{N}]/u.test(q)) return { refer: "unclear" };
  if (R.offtopic.test(q)) return { refer: "offtopic" };
  if (R.hello.test(q)) return { id: "hello" };
  if (R.thanks.test(q)) return { id: "thanks" };
  if (R.book.test(q)) return { book: true };
  if (R.unstated.test(q)) return { refer: "detail" };
  const topic = ["once", "website", "video", "spekly", "calls", "chat", "office"].find((t) => R[t].test(q));
  const aspect = R.price.test(q) ? "price" : R.time.test(q) ? "time" : R.howWork.test(q) ? "howWork" : "what";
  if (topic) { const id = TABLE[topic][aspect]; return id ? { id } : { refer: "detail", topic }; }
  for (const id of ["noor", "clients", "which", "trial", "langOther", "lang", "number", "wrong", "aiknow", "data", "stop", "where", "contact", "demo", "fit"]) if (R[id].test(q)) return { id };
  if (R.price.test(q) && (words <= 3 || R.context.test(q))) return { id: "prices" };
  if ((R.time.test(q) || R.howWork.test(q)) && R.context.test(q)) return { id: "how" };
  if (R.whatIs.test(q)) return { id: "what" };
  return { refer: "unclear" };
}
const REFER = {
  offtopic: "Sorry, I can only help with Noor AI Concierge: what we do, prices and booking. You can ask Noor about anything else.",
  unclear: "Sorry, I don't have this information. You can ask Noor, he knows about this.",
  detail: "Sorry, I don't have this information. Noor knows about this, you can ask him directly.",
};
let lastQ = "";
const waLink = () => `https://wa.me/${WA}?text=${encodeURIComponent("Hi Noor, I saw your website")}`;

const STEPS = [
  { k: "name", q: "Great, let's book it. What's your name?", type: "text", ac: "name" },
  { k: "business", q: (a) => `Nice to meet you, ${a.name}. What's your business called?`, type: "text", ac: "organization" },
  { k: "type", q: "What kind of business is it?", opts: ["Garage / auto", "Clinic", "Salon / spa", "Laundry", "AC / maintenance", "Real estate", "Restaurant", "Office / other"] },
  { k: "need", q: "What should we take off your hands?", opts: ["WhatsApp replies", "Phone calls", "Quotes & follow-ups", "A website", "Videos", "Not sure yet"] },
  { k: "how", q: "A call, or should Noor visit you?", opts: ["Phone / WhatsApp call", "Visit my business"] },
  { k: "when", q: "When suits you?", opts: ["Today", "Tomorrow", "This weekend", "Next week"] },
  { k: "whatsapp", q: "Last one: your WhatsApp number, so Noor can confirm?", type: "tel", ac: "tel", ph: "05x xxx xxxx" },
];
const ans = {}; let step = -1, started = false;
const chat = $("#chat"), fab = $("#fab"), cl = $("#cl"), opts = $("#opts"), cf = $("#cf"), ci = $("#ci");
const bot = (cls, html) => { const d = document.createElement("div"); d.className = cls; d.dir = "auto"; d.innerHTML = html; cl.appendChild(d); cl.scrollTop = cl.scrollHeight; return d; };
async function botSay(html) { const t = bot("qq typing-dots", "<i></i><i></i><i></i>"); await wait(reduce ? 0 : 450 + Math.min(700, html.length * 3)); t.remove(); bot("qq", html); }
function chips(list) { opts.innerHTML = ""; list.forEach((o) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o; b.onclick = () => pick(o); opts.appendChild(b); }); }
function inputMode(s) { ci.type = s && s.type === "tel" ? "tel" : "text"; ci.autocomplete = (s && s.ac) || "off"; ci.placeholder = s ? s.ph || "Type here…" : "Ask a question…"; ci.value = ""; }
async function askStep() { const s = STEPS[step]; await botSay(esc(typeof s.q === "function" ? s.q(ans) : s.q)); if (s.opts) chips(s.opts); else opts.innerHTML = ""; inputMode(s); if (chat.classList.contains("open") && !s.opts && fine) ci.focus({ preventScroll: true }); }
function startBooking() { step = 0; askStep(); }
async function reply(r) {
  if (r.book) return startBooking();
  if (r.refer) {
    await botSay(`${esc(REFER[r.refer])}<br><a href="${waLink()}" target="_blank" rel="noopener">Noor on WhatsApp: 058 935 8857</a>`);
    return chips(["Ask Noor on WhatsApp", "Book a free call", "Prices"]);
  }
  const x = A[r.id]; await botSay(x.a); chips(x.c);
}
function pick(o) {
  if (step >= 0) return answer(o);
  bot("aa", esc(o));
  if (o === "Book a free call") return startBooking();
  if (o === "Ask Noor on WhatsApp") { window.open(waLink(), "_blank", "noopener"); return; }
  if (o === "Try Spekly") { window.open(APP_URL, "_blank", "noopener"); return; }
  if (o === "Order videos") { closeChat(); const b = $('[data-order="Business videos"]'); if (b) b.click(); return; }
  reply({ id: CHIP_Q[o] });
}
function answer(v) {
  const s = STEPS[step];
  if (s.type === "tel" && v.replace(/\D/g, "").length < 9) { bot("aa", esc(v)); botSay("That looks short. Please include the area code, like 050 123 4567."); return; }
  ans[s.k] = v; bot("aa", esc(v)); step++; step < STEPS.length ? askStep() : done();
}
cf.addEventListener("submit", (e) => {
  e.preventDefault(); const v = ci.value.trim(); if (!v) return; ci.value = "";
  if (step >= 0) {
    // a clear question in the middle of booking gets answered, then booking carries on
    const s = STEPS[step], r = /\?\s*$/.test(v) && s.type !== "tel" ? think(v) : null;
    if (r && r.id) { bot("aa", esc(v)); lastQ = v; reply(r).then(() => askStep()); return; }
    return answer(v);
  }
  bot("aa", esc(v)); lastQ = v; reply(think(v));
});
cl.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeChat(); });
const summary = () => `Booking request${ans.plan ? " (" + ans.plan + ")" : ""}\nName: ${ans.name}\nBusiness: ${ans.business} (${ans.type})\nNeeds: ${ans.need}\nHow: ${ans.how}\nWhen: ${ans.when}\nWhatsApp: ${ans.whatsapp}`;
async function done() {
  step = -1; inputMode(null); await wait(reduce ? 0 : 300);
  bot("qq", `Here's your request:<br><b>${esc(ans.business)}</b> · ${esc(ans.type)}<br>${esc(ans.need)}<br>${esc(ans.how)} · ${esc(ans.when)}<br>WhatsApp <bdi>${esc(ans.whatsapp)}</bdi>`);
  opts.innerHTML = "";
  const send = document.createElement("button"); send.type = "button"; send.className = "btn primary sm"; send.textContent = "Send to Noor";
  const again = document.createElement("button"); again.type = "button"; again.className = "chip"; again.textContent = "Start again";
  again.onclick = () => { for (const k in ans) if (k !== "plan") delete ans[k]; startBooking(); };
  send.onclick = async () => {
    send.disabled = true; send.textContent = "Sending…"; const wa = `https://wa.me/${WA}?text=${encodeURIComponent(summary())}`;
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `New booking: ${ans.business}`, _template: "table", _captcha: "false", ...ans }) });
      if (!r.ok) throw 0; opts.innerHTML = ""; bot("qq", `Sent ✅ Noor will confirm on WhatsApp soon, ${esc(ans.name)}.<br><a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp too</a> for a faster reply.`);
      chips(["Prices", "Who is Noor?"]);
    } catch (e) { send.disabled = false; send.textContent = "Send to Noor"; bot("qq", `That didn't go through. <a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp</a>, it's already written for you.`); }
  };
  opts.append(send, again);
}
function openChat(plan, book) {
  if (plan) ans.plan = plan;
  chat.classList.add("open"); fab.classList.add("open", "seen"); fab.setAttribute("aria-expanded", true); $("#teaser").classList.remove("show"); store.set("teased", "1");
  if (!started) {
    started = true;
    if (book) { bot("qq", plan ? `Hi! Let's book your free call about <b>${esc(plan)}</b>.` : "Hi! I'm Noor's assistant. Let's book your free 10-minute call."); startBooking(); }
    else { botSay("Hi! 👋 I'm Noor's assistant. Ask me what we do, the prices or how it starts, or book a free 10-minute call with Noor."); chips(["What do you do?", "Prices", "How does it start?", "Who is Noor?", "Book a free call"]); inputMode(null); }
  } else if (book && step < 0) { if (plan) bot("qq", `Booking a call about <b>${esc(plan)}</b>.`); startBooking(); }
  if (fine) ci.focus({ preventScroll: true });
}
function closeChat() { chat.classList.remove("open"); fab.classList.remove("open"); fab.setAttribute("aria-expanded", false); fab.focus({ preventScroll: true }); }
fab.addEventListener("click", () => (chat.classList.contains("open") ? closeChat() : openChat()));
$("#chatX").addEventListener("click", closeChat);
addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.classList.contains("open")) closeChat(); });
$$("[data-open-chat]").forEach((b) => b.addEventListener("click", () => openChat(b.dataset.plan, true)));
// a gentle teaser once per visit, after 10 seconds
// never on top of the demo chat or the prices (on phones it would cover them): wait until they're off screen
const busy = () => ["#try", "#prices"].some((q) => { const el = $(q); if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * .8 && r.bottom > innerHeight * .2; });
if (!store.get("teased") && !document.documentElement.classList.contains("embed")) setTimeout(function tease() {
  if (chat.classList.contains("open")) return;
  if (busy()) return setTimeout(tease, 3000);
  $("#teaser").classList.add("show");
}, 10000);
addEventListener("scroll", () => { if (busy()) $("#teaser").classList.remove("show"); }, { passive: true });
$("#teaser").addEventListener("click", (e) => { if (e.target.id !== "teaserX") openChat(); });
$("#teaser").addEventListener("keydown", (e) => { if (e.key === "Enter") openChat(); });
$("#teaserX").addEventListener("click", () => { $("#teaser").classList.remove("show"); fab.classList.add("seen"); store.set("teased", "1"); });
$$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));

// ---------- colour theme switcher (bottom-left): instant, remembered on this device ----------
{
  const box = $("#theme"), btn = $("#tBtn"), root = document.documentElement;
  const mark = () => $$("#tOpts button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.c === (root.dataset.c || "gold")));
  const toggle = (o) => { box.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); };
  btn.addEventListener("click", () => toggle(!box.classList.contains("open")));
  $$("#tOpts button").forEach((b) => b.addEventListener("click", () => {
    root.dataset.c = b.dataset.c; try { localStorage.setItem("nc-theme", b.dataset.c); } catch (e) {}
    mark(); dispatchEvent(new Event("themechange")); setTimeout(() => toggle(false), 350);
  }));
  addEventListener("click", (e) => { if (!box.contains(e.target)) toggle(false); });
  mark();
}

// ---------- reels play only while on screen ----------
{ const vs = $$(".reels video"); const card = $(".m-video"); if (card) new IntersectionObserver(([e]) => vs.forEach((v) => (e.isIntersecting && !reduce ? v.play().catch(() => {}) : v.pause())), { threshold: .3 }).observe(card); }

// ---------- websites card: the phone picture scrolls only while on screen ----------
{ const box = $("#devices"); if (box) new IntersectionObserver(([e]) => box.classList.toggle("play", e.isIntersecting && !reduce)).observe(box); }

// ---------- background light and animated borders pause when off screen (smoother scrolling) ----------
{ const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("off", !e.isIntersecting)), { rootMargin: "100px" }); $$(".hero, .closing, .plan.rec, #spekly, .wave").forEach((el) => io.observe(el)); }

// ---------- Spekly panel: what you say becomes an invoice ----------
{
  const said = $("#skSaid"), parts = $$("#skInv .sk-l, #skInv .sk-tot, #skInv .sk-owe"), panel = $("#spekly"); let on = false, id = 0;
  const T = "Sold 2 tyres for 400, customer paid 200 cash";
  const loop = async () => {
    const my = ++id;
    while (on && my === id) {
      parts.forEach((p) => p.classList.remove("show")); panel.classList.add("rec");
      for (let i = 0; i <= T.length; i++) { if (!on || my !== id) return; said.textContent = "“" + T.slice(0, i); await wait(reduce ? 0 : 38); }
      said.textContent = "“" + T + "”"; panel.classList.remove("rec");
      for (const p of parts) { await wait(reduce ? 0 : 320); p.classList.add("show"); }
      await wait(5000);
    }
  };
  new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) loop(); }, { threshold: .35 }).observe(panel);
}

// ---------- order sheet: name, company, WhatsApp, what they want -> Noor's email (WhatsApp as the other way) ----------
{
  const sh = $("#sheet"), bg = $("#sheetBg"), f = $("#orderForm"), msg = $("#shMsg"), base = msg.textContent; let item = "", price = "", last = null;
  const open = (b) => {
    item = b.dataset.order; price = b.dataset.price || ""; last = b;
    $("#shTitle").textContent = item === "A website" ? "Website quote" : item === "An app" ? "Your app idea" : "Order: " + item; $("#shSub").textContent = price;
    msg.textContent = base; sh.classList.add("open"); bg.classList.add("open");
    if (fine) setTimeout(() => f.name.focus(), 50);
  };
  const close = () => { sh.classList.remove("open"); bg.classList.remove("open"); if (last) last.focus({ preventScroll: true }); };
  $$("[data-order]").forEach((b) => b.addEventListener("click", () => open(b)));
  bg.addEventListener("click", close); $("#shX").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && sh.classList.contains("open")) close(); });
  const text = (d) => `Hi Noor, I'd like to order: ${item}${price ? " (" + price + ")" : ""}\nName: ${d.name}\nCompany: ${d.company}\nWhatsApp: ${d.whatsapp}${d.need ? "\nWhat I want: " + d.need : ""}`;
  $("#shWa").addEventListener("click", () => {
    const d = Object.fromEntries(new FormData(f));
    if (!d.name || !d.company) { f.reportValidity(); return; }
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text(d))}`, "_blank", "noopener");
  });
  f.addEventListener("submit", async (e) => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(f)), btn = $("button[type=submit]", f);
    if (d.whatsapp.replace(/\D/g, "").length < 9) { msg.textContent = "Please check the WhatsApp number, like 050 123 4567."; return; }
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `New order: ${item} (${d.company})`, _template: "table", _captcha: "false", item, price, ...d }) });
      if (!r.ok) throw 0;
      f.reset(); msg.innerHTML = `<span class="ok">Sent ✓ Noor will message you on WhatsApp today.</span>`;
    } catch (x) { msg.innerHTML = `That didn't go through. Tap the WhatsApp button, your order is already written.`; }
    btn.disabled = false; btn.textContent = "Send order";
  });
}

// ---------- closing ring on phones: the same segmented ring as the 3D one, drawn in SVG + CSS 3D (no WebGL) ----------
{
  const halo = $(".halo");
  const buildRing = () => {
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
    const S = [hex(css("--c1") || "#ffc56b"), hex(css("--c2") || "#ff8a4c"), hex(css("--c3") || "#7ef0c8")];
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const col = (t) => (t < .5 ? mix(S[0], S[1], t * 2) : mix(S[1], S[2], (t - .5) * 2));
    const P = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
    const arc = (r, a0, a1) => { const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1); return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
    let segs = "", lights = "", backs = "", ticks = "";
    for (let h = 0; h < 24; h++) {
      const a0 = h * 15 + 1.6, a1 = (h + 1) * 15 - 1.6, t = (1 - Math.cos((h / 24) * Math.PI * 2)) / 2, [r, g, b] = col(t);
      segs += `<path d="${arc(78, a0, a1)}" stroke="rgb(${r},${g},${b})"/>`;
      backs += `<path d="${arc(78, a0, a1)}" stroke="rgb(${r * .35 | 0},${g * .35 | 0},${b * .35 | 0})"/>`;
      lights += `<path d="${arc(82, a0 + 1, a1 - 1)}"/>`;
      const [x0, y0] = P(h % 6 ? 94 : 92, h * 15), [x1, y1] = P(99, h * 15);
      ticks += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"${h % 6 ? "" : ' class="big"'}/>`;
    }
    const div = document.createElement("div"); div.className = "r3d"; div.setAttribute("aria-hidden", "true");
    div.innerHTML = `<svg class="r-back" viewBox="0 0 200 200">${backs}</svg><svg class="r-front" viewBox="0 0 200 200"><g class="seg">${segs}</g><g class="lite">${lights}</g><g class="tk">${ticks}</g></svg>`;
    const old = halo.querySelector(".r3d"); if (old) old.remove();
    halo.prepend(div); halo.classList.add("css3d");
  };
  if (halo && !matchMedia("(min-width: 900px) and (hover: hover)").matches) { buildRing(); addEventListener("themechange", buildRing); }
}

// Prices: Monthly (default) / One-time setup switch. Opens One-time when the link ends in #one-time.
{
  const tabs = [["tabMonthly", "payMonthly"], ["tabOnce", "payOnce"]];
  const show = (id) => tabs.forEach(([t, p]) => {
    const on = t === id, tb = document.getElementById(t), pn = document.getElementById(p);
    if (!tb || !pn) return;
    tb.setAttribute("aria-selected", on); pn.hidden = !on;
    if (on) pn.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  });
  tabs.forEach(([t]) => { const b = document.getElementById(t); if (b) b.addEventListener("click", () => show(t)); });
  if (location.hash === "#one-time") { show("tabOnce"); document.getElementById("prices")?.scrollIntoView(); }
}
