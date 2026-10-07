// Noor AI Concierge v5 "After Hours". Framework-free, no tracking.
const WA = "971589358857", MAIL = "imnoorzamn@gmail.com";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const tz = { timeZone: "Asia/Dubai" };
const uaeTime = () => new Intl.DateTimeFormat("en-US", { ...tz, hour: "numeric", minute: "2-digit" }).format(new Date());
const uaeH = () => +new Intl.DateTimeFormat("en-GB", { ...tz, hour: "2-digit", hour12: false }).format(new Date()) % 24;
const store = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };

// ---------- real Abu Dhabi time decides night or day on the street (?night / ?day to preview) ----------
const night = /[?&]day\b/.test(location.search) ? false : /[?&]night\b/.test(location.search) ? true : (() => { const h = uaeH(); return h >= 19 || h < 7; })();
function clock() { $("#clock").textContent = "Abu Dhabi · " + uaeTime(); }
clock(); setInterval(clock, 20000);
if (!night) {
  $("#scene").classList.add("day"); $("#win").classList.add("day");
  $("#h1").innerHTML = "Your hands are full. <em>Your phone isn't.</em>";
  $("#note").innerHTML = "Back in 5 minutes.<br>With a customer. Message us, we answer.";
}

// ---------- the shutter rolls up as you scroll ----------
{
  const scene = $("#scene"), sh = $("#shutter"), neon = $("#neon"), win = $("#win"), sign = $("#openSign");
  let ticking = false;
  const update = () => {
    ticking = false;
    const span = scene.offsetHeight - innerHeight;
    const p = reduce ? 1 : Math.min(1, Math.max(0, (scrollY - scene.offsetTop) / (span * .8)));
    sh.style.transform = `translateY(${-p * 100}%)`;
    neon.classList.toggle("on", p > .55);
    win.classList.toggle("ring", p > .75 && p < 1);
    sign.textContent = p > .55 ? (night ? "AI ON" : "OPEN") : (night ? "CLOSED" : "BUSY");
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update); update();
}

// ---------- header and mobile menu ----------
{ const top = $("#top"); const f = () => top.classList.toggle("solid", scrollY > 20 || $("#drawer").classList.contains("open")); addEventListener("scroll", f, { passive: true }); f(); }
$("#menuBtn").addEventListener("click", () => { const d = $("#drawer"), o = d.classList.toggle("open"); $("#menuBtn").setAttribute("aria-expanded", o); $("#menuBtn").textContent = o ? "Close" : "Menu"; $("#top").classList.add("solid"); });
$$("#drawer a").forEach((a) => a.addEventListener("click", () => { $("#drawer").classList.remove("open"); $("#menuBtn").textContent = "Menu"; $("#menuBtn").setAttribute("aria-expanded", false); }));
{ const links = $$(".nav a[href^='#']"); const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) links.forEach((l) => l.classList.toggle("cur", l.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" }); links.forEach((l) => { const s = $(l.getAttribute("href")); if (s) spy.observe(s); }); }
{ const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 }); $$(".reveal").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el))); }
function group(el, onChange) { $$("button", el).forEach((b) => b.addEventListener("click", () => { $$("button", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); onChange(b.dataset.v); })); }

const NAME = { garage: ["Your Garage", "YG"], clinic: ["Your Clinic", "YC"], salon: ["Your Salon", "YS"], laundry: ["Your Laundry", "YL"] };
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
const PRICE = {
  garage: { en: "An AC check is AED 80, an oil change from AED 120", ar: "فحص المكيف 80 درهم، وتغيير الزيت من 120 درهم", ur: "AC چیک 80 درہم، آئل چینج 120 درہم سے", hi: "AC चेक 80 दिरहम, ऑयल चेंज 120 दिरहम से" },
  clinic: { en: "A consultation is AED 150, cleaning from AED 250", ar: "الاستشارة 150 درهم، والتنظيف من 250 درهم", ur: "مشورہ 150 درہم، صفائی 250 درہم سے", hi: "परामर्श 150 दिरहम, सफ़ाई 250 दिरहम से" },
  salon: { en: "Threading AED 30, haircut from AED 60", ar: "الخيط 30 درهم، وقص الشعر من 60 درهم", ur: "تھریڈنگ 30 درہم، ہیئر کٹ 60 درہم سے", hi: "थ्रेडिंग 30 दिरहम, हेयरकट 60 दिरहम से" },
  laundry: { en: "Shirts AED 5 each, carpets AED 15 per m², free pickup", ar: "القميص 5 دراهم، السجاد 15 درهم للمتر، والاستلام مجاني", ur: "شرٹ 5 درہم، قالین 15 درہم فی مربع میٹر، پک اپ فری", hi: "शर्ट 5 दिरहम, कालीन 15 दिरहम प्रति वर्ग मीटर, पिकअप फ्री" },
};
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
// ---------- the LED sign: text is drawn off-screen, sampled into a grid of dots and scrolled ----------
const LED = (() => {
  const cv = $("#led"), ctx = cv.getContext("2d"), off = document.createElement("canvas"), octx = off.getContext("2d", { willReadFrequently: true });
  const FONT = { en: '"Archivo", sans-serif', ar: '"Readex Pro", sans-serif', ur: '"Noto Nastaliq Urdu", serif', hi: '"Noto Sans Devanagari", sans-serif' };
  const COL = { c: [255, 122, 89], a: [255, 178, 46] };
  let P = 4, cols = 0, rows = 0, dpr = 1, mask = null, mw = 0, x = 0, from = 0, to = 0, t0 = 0, dur = 1, col = COL.a, token = 0, done = null, visible = true, raf = 0, rtl = false;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1); const w = cv.clientWidth, h = cv.clientHeight;
    P = w < 500 ? 4 : 5; cv.width = w * dpr; cv.height = h * dpr; cols = Math.floor(w / P); rows = Math.floor(h / P);
  }
  function bitmap(text, lang) {
    const fs = Math.round(rows * (lang === "ur" ? .5 : .74)), font = `700 ${fs}px ${FONT[lang]}`;
    octx.font = font; const w = Math.ceil(octx.measureText(text).width) + 4;
    off.width = w; off.height = rows; octx.font = font; octx.fillStyle = "#fff"; octx.textBaseline = "middle";
    octx.direction = rtl ? "rtl" : "ltr";
    if (rtl) { octx.textAlign = "right"; octx.fillText(text, w - 2, rows / 2 + (lang === "ur" ? rows * .08 : 1)); } else { octx.textAlign = "left"; octx.fillText(text, 2, rows / 2 + 1); }
    const d = octx.getImageData(0, 0, w, rows).data, m = new Uint8Array(w * rows);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    return [m, w];
  }
  function draw() {
    const r = P * dpr * .38, xi = Math.round(x), lit = `rgb(${col[0]},${col[1]},${col[2]})`;
    ctx.fillStyle = "#0a0705"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#24170b"; ctx.beginPath();
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) { const bx = gx - xi; if (!(mask && bx >= 0 && bx < mw && mask[gy * mw + bx])) { ctx.moveTo((gx + .5) * P * dpr + r, (gy + .5) * P * dpr); ctx.arc((gx + .5) * P * dpr, (gy + .5) * P * dpr, r, 0, 6.2832); } }
    ctx.fill();
    if (!mask) return;
    ctx.fillStyle = lit; ctx.shadowColor = lit; ctx.shadowBlur = 6 * dpr; ctx.beginPath();
    const R = r * 1.15;
    for (let gy = 0; gy < rows; gy++) for (let gx = Math.max(0, xi); gx < Math.min(cols, xi + mw); gx++) if (mask[gy * mw + gx - xi]) { ctx.moveTo((gx + .5) * P * dpr + R, (gy + .5) * P * dpr); ctx.arc((gx + .5) * P * dpr, (gy + .5) * P * dpr, R, 0, 6.2832); }
    ctx.fill(); ctx.shadowBlur = 0;
  }
  function frame(now) {
    raf = 0; const k = Math.min(1, (now - t0) / dur); x = from + (to - from) * k; if (visible) draw();
    if (k < 1) raf = requestAnimationFrame(frame); else if (done) { const d = done; done = null; d(); }
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) draw(); }).observe(cv);
  addEventListener("resize", () => { const old = cols; size(); if (cols !== old && mask) { to = mw < cols ? Math.floor((cols - mw) / 2) : (rtl ? 0 : cols - mw); if (!raf) x = to; } draw(); });
  // show one line; resolves when its end is on the sign (or when another line takes over)
  function show(who, text, lang) {
    if (done) { const d = done; done = null; d(); }
    text = text.replace(/\p{Extended_Pictographic}|️/gu, "").replace(/\s+/g, " ").trim();
    rtl = lang === "ar" || lang === "ur"; [mask, mw] = bitmap(text, lang); col = COL[who] || COL.a;
    from = rtl ? -mw : cols; to = mw < cols ? Math.floor((cols - mw) / 2) : (rtl ? 0 : cols - mw);
    dur = reduce ? 1 : (Math.abs(to - from) / 115) * 1000; t0 = performance.now(); x = from;
    const my = ++token;
    return new Promise((res) => { done = () => res(my === token); if (!raf) raf = requestAnimationFrame(frame); });
  }
  size(); draw();
  return { show };
})();

// ---------- the demo conversation on the sign ----------
let trade = "garage", lang = "en", run = 0;
const LBL = { c: { en: "Customer", ar: "العميل", ur: "کسٹمر", hi: "ग्राहक" }, a: { en: "AI assistant", ar: "المساعد", ur: "اسسٹنٹ", hi: "असिस्टेंट" } };
function logLine(who, text, l) {
  const p = document.createElement("p"); p.className = who + " " + l; p.dir = "auto";
  p.innerHTML = `<b>${who === "c" ? "CUSTOMER" : "AI"}</b>${esc(text)}`; const L = $("#logList"); L.appendChild(p); L.scrollTop = L.scrollHeight;
}
function say(who, text, l = lang) {
  $("#who").textContent = LBL[who][l] || LBL[who].en; $("#who").classList.toggle("c", who === "c"); logLine(who, text, l);
  return LED.show(who, text, l);
}
async function play() {
  const id = ++run; $("#logList").innerHTML = ""; $("#bizName").textContent = NAME[trade][0];
  $("#askIn").placeholder = PH4[lang]; $("#askIn").dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr";
  await document.fonts.ready;
  for (const [f, t] of S[trade][lang]) { if (id !== run) return; await say(f, t); if (id !== run) return; await wait(reduce ? 200 : 1100); }
}
const URDU = /[پچگکھیےٹڈڑ]/;
$("#askForm").addEventListener("submit", async (e) => {
  e.preventDefault(); const q = $("#askIn").value.trim(); if (!q) return; const id = ++run; $("#askIn").value = "";
  const ql = /[؀-ۿ]/.test(q) ? (URDU.test(q) ? "ur" : "ar") : /[ऀ-ॿ]/.test(q) ? "hi" : lang;
  await say("c", q, ql); if (id !== run) return; await wait(500); if (id !== run) return;
  const hit = INTENT.find(([, re]) => re.test(q)), k = hit ? hit[0] : "other";
  say("a", k === "price" ? REPLY.price[ql](PRICE[trade][ql]) : REPLY[k][ql], ql);
});
group($("#trade"), (v) => { trade = v; play(); });
group($("#lang"), (v) => { lang = v; play(); });
$("#replay").addEventListener("click", play);
{ let started = false; new IntersectionObserver(([e], o) => { if (e.isIntersecting && !started) { started = true; o.disconnect(); play(); } }, { threshold: .3 }).observe($("#led")); }

// ---------- the desk bell plays a real call; its words run on the sign ----------
{
  const aud = $("#aud"), bell = $("#bell"), st = $("#bellState");
  const CALL = [[0, "a", "Good evening, Your Clinic. How can I help you?"], [3.8, "c", "Hi, I have a toothache. Can I see a dentist tomorrow?"], [9.3, "a", "I'm sorry to hear that. We have 10 am or 4 pm tomorrow. Which is better for you?"], [15.7, "c", "Ten in the morning, please."], [18.5, "a", "Done. You're booked for 10 am tomorrow. Our team will confirm on WhatsApp in the morning."]];
  let next = 0;
  bell.addEventListener("click", () => {
    bell.classList.remove("hit"); void bell.offsetWidth; bell.classList.add("hit");
    if (!aud.paused) { aud.pause(); st.textContent = "Paused · tap to carry on"; return; }
    if (aud.ended || aud.currentTime === 0) { next = 0; aud.currentTime = 0; run++; $("#logList").innerHTML = ""; $("#bizName").textContent = "Your Clinic · phone call"; }
    aud.play().then(() => (st.textContent = "On the phone… tap to pause")).catch(() => (st.textContent = "Couldn't play the sound on this device"));
    $("#led").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  });
  aud.addEventListener("timeupdate", () => { while (next < CALL.length && aud.currentTime >= CALL[next][0]) { const [, w, t] = CALL[next++]; say(w, t, "en"); } });
  aud.addEventListener("ended", () => { st.textContent = "Booked. Ring again to replay"; });
}

// ---------- the meter: seven-segment digits ----------
const SEG = { a: "M4 1H22L19 4H7Z", b: "M22.5 2.5V21.5L19.5 19.5V5Z", c: "M22.5 24.5V43.5L19.5 41V26.5Z", d: "M4 45H22L19 42H7Z", e: "M3.5 24.5V43.5L6.5 41V26.5Z", f: "M3.5 2.5V21.5L6.5 19.5V5Z", g: "M5 23L7 21.5H19L21 23L19 24.5H7Z" };
const DIG = ["abcdef", "bc", "abged", "abgcd", "fgbc", "afgcd", "afgedc", "abc", "abcdefg", "abcdfg"];
function segs(el, n, len) {
  const s = String(n).padStart(len, " ").slice(-len);
  el.innerHTML = [...s].map((ch) => `<svg viewBox="0 0 26 46" style="transform:skewX(-6deg)">${Object.entries(SEG).map(([k, d]) => `<path d="${d}" class="${ch !== " " && DIG[+ch].includes(k) ? "on" : "off"}"/>`).join("")}</svg>`).join("");
  el.setAttribute("aria-label", String(n));
}
function calc() {
  const a = +$("#c1").value, v = +$("#c2").value, jobs = Math.round(a * 4.3 * .25), m = Math.round(a * 4.3 * .25 * v);
  $$(".sliders input[type=range]").forEach((i) => i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min)) * 100 + "%"));
  $("#c1v").textContent = a; $("#c2v").textContent = "AED " + v.toLocaleString("en-US");
  segs($("#segMoney"), Math.min(m, 999999), 6); segs($("#segJobs"), Math.min(jobs, 999), 3);
  $("#perDay").textContent = "≈ AED " + Math.round(m / 30).toLocaleString("en-US") + " a day";
  $("#verdict").textContent = m >= 999 ? "That's more than the AED 999 plan, which is about AED 33 a day." : "At these numbers it may not pay for itself yet. Message Noor for an honest answer.";
}
$$(".sliders input").forEach((i) => i.addEventListener("input", calc)); calc();

// ---------- the letter board: every letter pushed in by hand, a little crooked ----------
$$("#felt .ln span, #felt .ln.title").forEach((el) => {
  if (el.children.length) return;
  el.innerHTML = [...el.textContent].map((c) => (c === " " ? "&nbsp;" : `<span class="ch" style="transform:translateY(${(Math.random() * 2 - 1).toFixed(1)}px) rotate(${(Math.random() * 3 - 1.5).toFixed(1)}deg)">${esc(c)}</span>`)).join("");
});

// ---------- chat widget: the booking assistant ----------
const STEPS = [
  { k: "name", q: "Hi! I'm Noor's booking assistant. What's your name?", type: "text", ac: "name" },
  { k: "business", q: (a) => `Nice to meet you, ${a.name}. What's your business called?`, type: "text", ac: "organization" },
  { k: "type", q: "What kind of business is it?", opts: ["Garage / auto", "Clinic", "Salon / spa", "Laundry", "AC / maintenance", "Real estate", "Restaurant", "Other"] },
  { k: "need", q: "What should the assistant take off your hands?", opts: ["WhatsApp replies", "Phone calls", "Quotes & follow-ups", "Not sure yet"] },
  { k: "how", q: "A call, or should Noor visit you?", opts: ["Phone / WhatsApp call", "Visit my business"] },
  { k: "when", q: "When suits you?", opts: ["Today", "Tomorrow", "This weekend", "Next week"] },
  { k: "whatsapp", q: "Last one: your WhatsApp number, so Noor can confirm?", type: "tel", ac: "tel", ph: "05x xxx xxxx" },
];
const ans = {}; let step = 0, started = false;
const chat = $("#chat"), fab = $("#fab"), cl = $("#cl"), opts = $("#opts"), cf = $("#cf"), ci = $("#ci");
const bot = (cls, html) => { const d = document.createElement("div"); d.className = cls; d.dir = "auto"; d.innerHTML = html; cl.appendChild(d); cl.scrollTop = cl.scrollHeight; };
async function ask() {
  opts.innerHTML = ""; const s = STEPS[step]; await wait(reduce ? 0 : 320); bot("qq", esc(typeof s.q === "function" ? s.q(ans) : s.q));
  if (s.opts) { cf.hidden = true; s.opts.forEach((o) => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o; b.onclick = () => answer(o); opts.appendChild(b); }); }
  else { cf.hidden = false; ci.type = s.type; ci.autocomplete = s.ac; ci.placeholder = s.ph || "Type here…"; ci.value = ""; if (chat.classList.contains("open")) ci.focus({ preventScroll: true }); }
  cl.scrollTop = cl.scrollHeight;
}
function answer(v) {
  const s = STEPS[step];
  if (s.type === "tel" && v.replace(/\D/g, "").length < 9) { bot("qq", "That looks short. Please include the area code, like 050 123 4567."); return; }
  ans[s.k] = v; bot("aa", esc(v)); step++; step < STEPS.length ? ask() : done();
}
cf.addEventListener("submit", (e) => { e.preventDefault(); const v = ci.value.trim(); if (v) answer(v); });
const summary = () => `Booking request${ans.plan ? " (" + ans.plan + ")" : ""}\nName: ${ans.name}\nBusiness: ${ans.business} (${ans.type})\nNeeds: ${ans.need}\nHow: ${ans.how}\nWhen: ${ans.when}\nWhatsApp: ${ans.whatsapp}`;
async function done() {
  cf.hidden = true; await wait(reduce ? 0 : 300);
  bot("qq", `Here's your request:<br><b>${esc(ans.business)}</b> · ${esc(ans.type)}<br>${esc(ans.how)} · ${esc(ans.when)}<br>WhatsApp <bdi>${esc(ans.whatsapp)}</bdi>`);
  opts.innerHTML = "";
  const send = document.createElement("button"); send.type = "button"; send.className = "btn solid sm"; send.textContent = "Send to Noor";
  const again = document.createElement("button"); again.type = "button"; again.className = "chip"; again.textContent = "Start again";
  again.onclick = () => { cl.innerHTML = ""; step = 0; for (const k in ans) if (k !== "plan") delete ans[k]; ask(); };
  send.onclick = async () => {
    send.disabled = true; send.textContent = "Sending…"; const wa = `https://wa.me/${WA}?text=${encodeURIComponent(summary())}`;
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `New booking: ${ans.business}`, _template: "table", _captcha: "false", ...ans }) });
      if (!r.ok) throw 0; opts.innerHTML = ""; bot("qq", `Sent ✅ Noor will confirm on WhatsApp soon, ${esc(ans.name)}.<br><a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp too</a> for a faster reply.`);
    } catch (e) { send.disabled = false; send.textContent = "Send to Noor"; bot("qq", `That didn't go through. <a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp</a>, it's already written for you.`); }
  };
  opts.append(send, again);
}
function openChat(plan) {
  if (plan) ans.plan = plan;
  chat.classList.add("open"); fab.classList.add("open", "seen"); fab.setAttribute("aria-expanded", true); $("#teaser").classList.remove("show"); store.set("teased", "1");
  if (!started) { started = true; ask(); } else if (!cf.hidden) ci.focus({ preventScroll: true });
}
function closeChat() { chat.classList.remove("open"); fab.classList.remove("open"); fab.setAttribute("aria-expanded", false); fab.focus({ preventScroll: true }); }
fab.addEventListener("click", () => (chat.classList.contains("open") ? closeChat() : openChat()));
$("#chatX").addEventListener("click", closeChat);
addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.classList.contains("open")) closeChat(); });
$$("[data-open-chat]").forEach((b) => b.addEventListener("click", () => openChat(b.dataset.plan)));
// a gentle teaser once per visit, after 8 seconds
if (!store.get("teased")) setTimeout(() => { if (!chat.classList.contains("open")) $("#teaser").classList.add("show"); }, 8000);
$("#teaser").addEventListener("click", (e) => { if (e.target.id !== "teaserX") openChat(); });
$("#teaser").addEventListener("keydown", (e) => { if (e.key === "Enter") openChat(); });
$("#teaserX").addEventListener("click", () => { $("#teaser").classList.remove("show"); fab.classList.add("seen"); store.set("teased", "1"); });
$$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
