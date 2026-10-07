// Noor AI Concierge v2. Everything on the page is something you can touch.
// No framework, no tracking. Forms go to Noor's Gmail through FormSubmit.
const WA = "971589358857", MAIL = "imnoorzamn@gmail.com";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

// ---------- liquid bubble switch ----------
function liquid(el, onChange) {
  const blob = $(".blob", el), btns = $$("button", el);
  const place = () => { const b = btns.find((x) => x.getAttribute("aria-pressed") === "true") || btns[0]; blob.style.left = b.offsetLeft + "px"; blob.style.width = b.offsetWidth + "px"; };
  btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => x.setAttribute("aria-pressed", x === b)); place(); onChange && onChange(b.dataset.v); }));
  addEventListener("resize", place); document.fonts && document.fonts.ready.then(place); place();
  return { set(v) { btns.forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === v)); place(); } };
}

// ---------- theme ----------
const saved = store.get("theme"); if (saved) document.documentElement.dataset.theme = saved;
$("#theme").addEventListener("click", () => {
  const dark = getComputedStyle(document.documentElement).colorScheme.includes("dark");
  const t = dark ? "light" : "dark"; document.documentElement.dataset.theme = t; store.set("theme", t);
});

// ---------- Abu Dhabi clock + status line ----------
let lang = "en";
const T = {
  en: { h1: "Someone just asked your price. <em>Who answered?</em>", lead: "Customers message two or three businesses and go with the first that replies. Your AI concierge answers in seconds, at any hour, in their language, and hands you the booking.",
    night: (t) => `It's ${t} in Abu Dhabi. Most shops are closed.`, morning: (t) => `It's ${t} in Abu Dhabi. The first messages of the day are arriving.`, day: (t) => `It's ${t} in Abu Dhabi. Your team is busy.`, eve: (t) => `It's ${t} in Abu Dhabi. Customers are still asking.`, ph: "Type a question as a customer…", online: "online", typing: "typing…" },
  ar: { h1: "شخص ما سأل عن سعرك للتو. <em>من أجاب؟</em>", lead: "العملاء يراسلون عدة محلات ويختارون أول من يرد. مساعدك الذكي يرد خلال ثوانٍ، في أي ساعة، وبلغة العميل، ثم يسلّمك الحجز.",
    night: (t) => `الساعة ${t} في أبوظبي. معظم المحلات مغلقة.`, morning: (t) => `الساعة ${t} في أبوظبي. أول رسائل اليوم تصل الآن.`, day: (t) => `الساعة ${t} في أبوظبي. فريقك مشغول.`, eve: (t) => `الساعة ${t} في أبوظبي. العملاء ما زالوا يسألون.`, ph: "اكتب سؤالك كعميل…", online: "متصل", typing: "يكتب…" },
  ur: { h1: "ابھی کسی نے آپ کا ریٹ پوچھا۔ <em>جواب کس نے دیا؟</em>", lead: "گاہک دو تین دکانوں کو میسج کرتے ہیں اور جو پہلے جواب دے، اسی کے پاس جاتے ہیں۔ آپ کا AI اسسٹنٹ چند سیکنڈ میں، کسی بھی وقت، گاہک کی زبان میں جواب دیتا ہے اور بکنگ آپ کو دے دیتا ہے۔",
    night: (t) => `ابوظہبی میں ${t} بجے ہیں۔ زیادہ تر دکانیں بند ہیں۔`, morning: (t) => `ابوظہبی میں ${t} بجے ہیں۔ دن کے پہلے میسج آ رہے ہیں۔`, day: (t) => `ابوظہبی میں ${t} بجے ہیں۔ آپ کی ٹیم مصروف ہے۔`, eve: (t) => `ابوظہبی میں ${t} بجے ہیں۔ گاہک اب بھی پوچھ رہے ہیں۔`, ph: "گاہک بن کر سوال لکھیں…", online: "آن لائن", typing: "لکھ رہا ہے…" },
  hi: { h1: "किसी ने अभी आपका रेट पूछा। <em>जवाब किसने दिया?</em>", lead: "ग्राहक दो-तीन दुकानों को मैसेज करते हैं और जो पहले जवाब दे, उसी के पास जाते हैं। आपका AI असिस्टेंट कुछ सेकंड में, किसी भी समय, ग्राहक की भाषा में जवाब देता है और बुकिंग आपको सौंप देता है।",
    night: (t) => `अबू धाबी में ${t} बजे हैं। ज़्यादातर दुकानें बंद हैं।`, morning: (t) => `अबू धाबी में ${t} बजे हैं। दिन के पहले मैसेज आ रहे हैं।`, day: (t) => `अबू धाबी में ${t} बजे हैं। आपकी टीम व्यस्त है।`, eve: (t) => `अबू धाबी में ${t} बजे हैं। ग्राहक अब भी पूछ रहे हैं।`, ph: "ग्राहक बनकर सवाल लिखिए…", online: "ऑनलाइन", typing: "टाइप कर रहा है…" },
};
const RTL = { ar: true, ur: true };
function uae() {
  const now = new Date();
  const t = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", hour: "numeric", minute: "2-digit" }).format(now);
  const h = +new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", hour: "numeric", hour12: false }).format(now) % 24;
  return { t, h };
}
function tick() {
  const { t, h } = uae();
  $("#clock").textContent = t;
  const L = T[lang], kind = h >= 22 || h < 6 ? "night" : h < 9 ? "morning" : h < 17 ? "day" : "eve";
  const st = $("#status"); st.textContent = L[kind](t); st.dir = RTL[lang] ? "rtl" : "ltr";
}
tick(); setInterval(tick, 20000);

// ---------- the live phone ----------
const BIZ = {
  garage: { name: "Your Garage", av: "YG" }, clinic: { name: "Your Clinic", av: "YC" }, salon: { name: "Your Salon", av: "YS" }, laundry: { name: "Your Laundry", av: "YL" },
};
const S = { // [from, text]: c = customer, a = assistant. Example prices.
  garage: {
    en: [["c", "Hi, my car AC is blowing hot air. Can you check it tomorrow?"], ["a", "Hello! Yes 👍 An AC check is AED 80. What car is it?"], ["c", "Camry 2019"], ["a", "We have 9:00 or 11:00 tomorrow. Which suits you?"], ["c", "9 please"], ["a", "Booked ✅ Tomorrow 9:00, AC check for your Camry. The workshop confirms by 8:30."]],
    ar: [["c", "مرحبا، مكيف السيارة يطلع هواء حار. ممكن تفحصونه بكرة؟"], ["a", "أهلاً! نعم 👍 فحص المكيف 80 درهم. ما نوع السيارة؟"], ["c", "كامري 2019"], ["a", "عندنا 9:00 أو 11:00 بكرة. أيهما يناسبك؟"], ["c", "9 لو سمحت"], ["a", "تم الحجز ✅ بكرة 9:00 فحص مكيف الكامري. الورشة تؤكد قبل 8:30."]],
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
    en: [["c", "Hi! Threading and a haircut on Saturday? How much?"], ["a", "Hi ✨ Threading is AED 30, haircut from AED 60. Saturday we have 2:00 or 5:00 pm."], ["c", "5 pm"], ["a", "Booked ✅ Saturday 5:00 pm, threading + haircut. See you then!"]],
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
  hours: { en: "We're open 8 am to 10 pm. I'm here 24/7 and can book you in right now.", ar: "نحن مفتوحون من 8 صباحاً حتى 10 مساءً. وأنا متاح 24/7 ويمكنني حجزك الآن.", ur: "ہم صبح 8 سے رات 10 بجے تک کھلے ہیں۔ میں 24 گھنٹے یہاں ہوں اور ابھی بکنگ کر سکتا ہوں۔", hi: "हम सुबह 8 से रात 10 बजे तक खुले हैं। मैं 24 घंटे यहाँ हूँ और अभी बुकिंग कर सकता हूँ।" },
  where: { en: "We're in Musaffah, Abu Dhabi (example). Shall I send you the location pin?", ar: "نحن في مصفح، أبوظبي (مثال). هل أرسل لك الموقع؟", ur: "ہم مصفح، ابوظہبی میں ہیں (مثال)۔ لوکیشن بھیج دوں؟", hi: "हम मुसफ्फह, अबू धाबी में हैं (उदाहरण)। लोकेशन भेज दूँ?" },
  book: { en: "Sure! Which day and time suit you? I'll hold the slot and the team confirms.", ar: "بالتأكيد! أي يوم ووقت يناسبك؟ سأحجز الموعد والفريق يؤكد.", ur: "ضرور! کون سا دن اور وقت ٹھیک ہے؟ میں وقت رکھ لیتا ہوں، ٹیم کنفرم کرے گی۔", hi: "ज़रूर! कौन सा दिन और समय ठीक रहेगा? मैं स्लॉट रख लेता हूँ, टीम कन्फर्म करेगी।" },
  other: { en: "Good question. I've passed it to the team and they'll reply first thing in the morning ✅ (This is how it handles what it doesn't know.)", ar: "سؤال جيد. حوّلته للفريق وسيردون أول شيء صباحاً ✅", ur: "اچھا سوال ہے۔ میں نے ٹیم کو بھیج دیا ہے، وہ صبح سب سے پہلے جواب دیں گے ✅", hi: "अच्छा सवाल है। मैंने टीम को भेज दिया है, वे सुबह सबसे पहले जवाब देंगे ✅" },
};
const INTENT = [
  ["price", /price|cost|how much|charge|rate|كم|سعر|قیمت|کتن|ریٹ|پیسے|कितन|रेट|दाम|कीमत/i],
  ["hours", /open|close|hour|timing|when|متى|ساعات|دوام|وقت|ٹائم|کب|खुल|समय|कब/i],
  ["where", /where|location|address|map|وين|أين|موقع|عنوان|کہاں|لوکیشن|पता|कहाँ|लोकेशन/i],
  ["book", /book|appointment|slot|tomorrow|today|حجز|موعد|بكرة|بکنگ|اپوائنٹ|کل|बुक|अपॉइंट|कल/i],
];
let biz = "garage", run = 0;
const chat = $("#chat");
function stamp() { return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", hour: "numeric", minute: "2-digit" }).format(new Date()); }
function bubble(from, text) {
  const d = document.createElement("div");
  d.className = "b " + (from === "c" ? "in" : "out"); d.dir = "auto";
  d.innerHTML = esc(text) + `<time>${stamp()}${from === "a" ? " ✓✓" : ""}</time>`;
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d;
}
async function typing(ms, id) {
  $("#presence").textContent = T[lang].typing;
  const d = document.createElement("div"); d.className = "b out typing"; d.innerHTML = "<i></i><i></i><i></i>";
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight; await wait(reduce ? 50 : ms); d.remove();
  if (id === run) $("#presence").textContent = T[lang].online;
}
async function play() {
  const id = ++run; chat.innerHTML = "";
  $("#bizName").textContent = BIZ[biz].name; $("#av").textContent = BIZ[biz].av; $("#presence").textContent = T[lang].online;
  for (const [from, text] of S[biz][lang]) {
    if (id !== run) return;
    if (from === "a") { await typing(900 + text.length * 12, id); if (id !== run) return; }
    else await wait(reduce ? 50 : 1100);
    if (id !== run) return;
    bubble(from, text);
  }
}
$("#ask").addEventListener("submit", async (e) => {
  e.preventDefault();
  const q = $("#askIn").value.trim(); if (!q) return;
  run++; $("#askIn").value = ""; bubble("c", q);
  const hit = INTENT.find(([, re]) => re.test(q)), k = hit ? hit[0] : "other", id = run;
  const msg = k === "price" ? REPLY.price[lang](PRICE[biz][lang]) : REPLY[k][lang];
  await typing(1000, id); bubble("a", msg);
});
function setLang(v) {
  lang = v; const ht = $("#heroText");
  ht.innerHTML = `<h1>${T[v].h1}</h1><p class="lead">${esc(T[v].lead)}</p>`; ht.dir = RTL[v] ? "rtl" : "ltr";
  $("#askIn").placeholder = T[v].ph; tick(); play();
}
liquid($("#biz"), (v) => { biz = v; play(); });
liquid($("#lang"), setLang);
new IntersectionObserver((es) => { if (es[0].isIntersecting && !chat.children.length) play(); }, { threshold: .3 }).observe($(".phone"));

// ---------- your numbers ----------
const fmt = (n) => "AED " + Math.round(n).toLocaleString("en-US");
const RATE = [0, 0.1, 0.25, 0.33, 0.5, 0.66, 0.75], RATE_L = ["", "1 in 10", "1 in 4", "1 in 3", "1 in 2", "2 in 3", "3 in 4"];
function calc() {
  const m1 = +$("#m1").value, m2 = +$("#m2").value, r = RATE[+$("#m3").value];
  $$("input[type=range]").forEach((i) => i.style.setProperty("--p", ((i.value - i.min) / (i.max - i.min)) * 100 + "%"));
  $("#m1v").textContent = m1; $("#m2v").textContent = m2.toLocaleString("en-US"); $("#m3v").textContent = RATE_L[+$("#m3").value];
  const gain = m1 * 4.3 * r * m2;
  $("#gain").textContent = fmt(gain);
  $("#gainNote").textContent = `${m1} a week × 4.3 weeks × ${RATE_L[+$("#m3").value]} won × AED ${m2.toLocaleString("en-US")}`;
  const jobs = Math.ceil(999 / m2);
  $("#verdict").textContent = gain >= 999 ? `Pays for itself after about ${jobs} won job${jobs > 1 ? "s" : ""} a month.` : "At these numbers it may not pay off yet. Talk to me before you spend anything.";
}
$$("#math input").forEach((i) => i.addEventListener("input", calc)); calc();

// ---------- 24-hour dial ----------
const EVENTS = [
  { h: 7, title: "Morning reminders go out", text: "Today's appointments get a WhatsApp reminder with the time and the location pin. Fewer no-shows.", chan: ["WhatsApp"] },
  { h: 9.5, title: "Quiet quotes get a follow-up", text: "\"Still interested? We can start Saturday.\" Sent to everyone who got a quote yesterday and went quiet.", chan: ["WhatsApp", "Email"] },
  { h: 13, title: "You're at Dhuhr. It answers.", text: "Prices, opening hours, the location pin: answered in seconds while you're away from the phone.", chan: ["WhatsApp", "Instagram"] },
  { h: 16.5, title: "An enquiry becomes a quotation", text: "A customer asks for 4 AC units serviced. The quote is made from your price list. You approve it with one tap and it's sent.", chan: ["Email", "WhatsApp"] },
  { h: 19, title: "Your day in one message", text: "How many chats, bookings and missed calls today, and who still needs a reply. On your phone.", chan: ["WhatsApp"] },
  { h: 23.07, title: "A WhatsApp after closing", text: "Answered in the customer's language and booked for 9 am. You wake up to a booking, not a lost customer.", chan: ["WhatsApp"] },
  { h: 2.17, title: "A call at 2 am", text: "The AI receptionist picks up. Urgent? It texts you. Not urgent? It's on your morning list.", chan: ["Phone"] },
];
const TAG = (h) => h < 6 ? "YOU'RE ASLEEP" : h < 8 ? "MORNING" : h < 12.5 ? "YOU'RE WITH CUSTOMERS" : h < 13.6 ? "PRAYER & LUNCH" : h < 17.5 ? "YOU'RE ON SITE" : h < 22 ? "EVENING" : "SHOP CLOSED";
const R = 170, NS = "http://www.w3.org/2000/svg";
const pt = (h, r) => { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * r, Math.sin(a) * r]; };
const g = $("#dialG");
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); g.appendChild(e); return e; };
el("circle", { r: 200, class: "face" });
{ const [x1, y1] = pt(22, R), [x2, y2] = pt(6, R); el("path", { d: `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`, class: "night" }); }
for (let h = 0; h < 24; h++) { const [a, b] = pt(h, 186), [c, d] = pt(h, h % 3 ? 192 : 196); el("line", { x1: a, y1: b, x2: c, y2: d, class: "tick" }); if (h % 3 === 0) { const [x, y] = pt(h, 140); el("text", { x, y, class: "hr" }).textContent = String(h).padStart(2, "0"); } }
const dots = EVENTS.map((ev, i) => { const [x, y] = pt(ev.h, R); const c = el("circle", { cx: x, cy: y, r: 9, class: "ev", tabindex: 0, role: "button", "aria-label": ev.title }); c.addEventListener("click", () => setHour(ev.h)); c.addEventListener("keydown", (k) => { if (k.key === "Enter") setHour(ev.h); }); return c; });
const hand = el("line", { x1: 0, y1: 0, class: "hand" }), knob = el("circle", { r: 15, class: "knob" });
let hour = 23.07;
function setHour(h) {
  hour = (h + 24) % 24;
  const [x, y] = pt(hour, R); hand.setAttribute("x2", x); hand.setAttribute("y2", y); knob.setAttribute("cx", x); knob.setAttribute("cy", y);
  const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60) % 60;
  $("#dialTime").textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; $("#dialTag").textContent = TAG(hour);
  const dist = (e) => Math.min(Math.abs(e.h - hour), 24 - Math.abs(e.h - hour));
  const ev = EVENTS.reduce((a, b) => (dist(b) < dist(a) ? b : a));
  dots.forEach((d, i) => d.setAttribute("r", EVENTS[i] === ev ? 13 : 9));
  const hh2 = Math.floor(ev.h), mm2 = Math.round((ev.h - hh2) * 60);
  $("#event").innerHTML = `<div class="when">${String(hh2).padStart(2, "0")}:${String(mm2).padStart(2, "0")}</div><h3>${esc(ev.title)}</h3><p>${esc(ev.text)}</p><div class="chan">${ev.chan.map((c) => `<span>${c}</span>`).join("")}</div>`;
}
setHour(hour);
{
  const dial = $("#dial"); let drag = false;
  const fromEvent = (e) => { const r = dial.getBoundingClientRect(); const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; let a = Math.atan2(y, x) + Math.PI / 2; if (a < 0) a += Math.PI * 2; setHour((a / (Math.PI * 2)) * 24); };
  dial.addEventListener("pointerdown", (e) => { drag = true; dial.setPointerCapture(e.pointerId); fromEvent(e); });
  dial.addEventListener("pointermove", (e) => drag && fromEvent(e));
  dial.addEventListener("pointerup", () => (drag = false));
  dial.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") setHour(hour + .5); if (e.key === "ArrowLeft") setHour(hour - .5); });
  dial.tabIndex = 0; dial.setAttribute("role", "slider"); dial.setAttribute("aria-label", "Time of day");
  // a slow sweep the first time it comes into view
  let swept = false;
  new IntersectionObserver((es) => { if (es[0].isIntersecting && !swept && !reduce) { swept = true; let h = 6; const step = () => { if (drag) return; h += .25; setHour(h); if (h < 23.07) requestAnimationFrame(step); }; requestAnimationFrame(step); } }, { threshold: .5 }).observe(dial);
}

// ---------- receipt ----------
const PLANS = {
  chat: { name: "CHAT", lines: [["WhatsApp + email assistant", "✓"], ["Website chat / Instagram DMs", "on request"], ["4 languages", "✓"], ["Monthly improvements", "✓"]], setup: "AED 500", month: "AED 999",
    list: ["Answers WhatsApp and email in seconds, day and night", "Prices, bookings, orders, location", "Sends anything uncertain to you", "English, Arabic, Urdu, Hindi"] },
  full: { name: "FULL", lines: [["Everything in Chat", "✓"], ["AI phone receptionist", "✓"], ["Call minutes included", "~500"], ["Extra minutes", "AED 1/min"]], setup: "AED 1,000", month: "AED 1,299",
    list: ["Everything in Chat", "Picks up calls you miss and calls after closing", "Books appointments, takes messages", "Texts you when something is urgent"] },
  office: { name: "OFFICE AUTOMATION", lines: [["Quotations from enquiries", "✓"], ["Follow-ups & reminders", "✓"], ["Reports & data entry", "✓"], ["Priced per job after a call", "*"]], setup: "from AED 1,500", month: "AED 500",
    list: ["Quotations made from your price list", "Payment and appointment reminders", "Daily reports and data entry", "Priced for your exact job after one call"] },
};
function receipt(v) {
  const p = PLANS[v], r = $("#receipt");
  const d = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  r.innerHTML = `<h4>NOOR AI CONCIERGE</h4><div class="meta">ABU DHABI · ${d.toUpperCase()}</div><div class="l"><span>PLAN</span><span>${p.name}</span></div><hr>` +
    p.lines.map(([a, b]) => `<div class="l sub"><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join("") +
    `<hr><div class="l"><span>Setup (one time)</span><span>${p.setup}</span></div><div class="l strike sub"><span>Receptionist + visa (approx.)</span><span>AED 3,000-5,000</span></div><hr>` +
    `<div class="tot"><span>${p.month}</span><small>/ MONTH</small></div><div class="l sub" style="margin-top:10px"><span>7-day setup refund</span><span>✓</span></div><div class="l sub"><span>Contract</span><span>none</span></div>` +
    `<div class="stamp">7-DAY PROMISE</div><div style="text-align:center;margin-top:16px;font-size:12px;opacity:.7">THANK YOU · nooraiconcierge.com</div>`;
  r.classList.remove("print"); void r.offsetWidth; r.classList.add("print");
  $("#planList").innerHTML = p.list.map((x) => `<li>${esc(x)}</li>`).join("");
}
liquid($("#plan"), receipt); receipt("chat");

// ---------- Spekly ----------
const SP = {
  en: { slogan: "Speak it. We'll handle the rest.", said: "Sold 2 tyres for 400, customer paid 200 cash" },
  ar: { slogan: "تكلّم، ونحن نتولى الباقي.", said: "بعت إطارين بـ 400، الزبون دفع 200 كاش" },
  hi: { slogan: "बोलिए, बाकी हम संभाल लेंगे।", said: "2 टायर 400 में बेचे, ग्राहक ने 200 कैश दिए" },
  ur: { slogan: "بولیں، باقی ہم سنبھال لیں گے۔", said: "2 ٹائر 400 میں بیچے، گاہک نے 200 کیش دیے" },
};
let spLang = "en", spRun = 0;
async function speak() {
  const id = ++spRun, said = $("#said"), mic = $("#mic"), rows = $$("#inv .row"), owe = $("#inv .owe");
  rows.forEach((r) => r.classList.remove("show")); owe.classList.remove("show");
  said.dir = RTL[spLang] ? "rtl" : "ltr"; mic.classList.add("on");
  const text = SP[spLang].said;
  for (let i = 0; i <= text.length; i++) { if (id !== spRun) return; said.innerHTML = "“" + esc(text.slice(0, i)) + '<span class="caret"></span>'; await wait(reduce ? 0 : 38); }
  said.innerHTML = "“" + esc(text) + "”"; mic.classList.remove("on");
  for (const r of rows) { if (id !== spRun) return; await wait(reduce ? 0 : 260); r.classList.add("show"); }
  await wait(reduce ? 0 : 300); owe.classList.add("show");
}
liquid($("#spLang"), (v) => { spLang = v; const s = $("#spSlogan"); s.textContent = SP[v].slogan; s.dir = RTL[v] ? "rtl" : "ltr"; speak(); });
$("#mic").addEventListener("click", speak);
new IntersectionObserver((es) => { if (es[0].isIntersecting && !spRun) speak(); }, { threshold: .4 }).observe($("#inv"));

// ---------- booking chat ----------
const STEPS = [
  { k: "name", q: "Hi! I'm Noor's booking assistant. What's your name?", type: "text", ph: "Your name", ac: "name" },
  { k: "business", q: (a) => `Nice to meet you, ${a.name}. What's your business called?`, type: "text", ph: "Business name", ac: "organization" },
  { k: "type", q: "What kind of business is it?", opts: ["Garage / auto", "Clinic", "Salon / spa", "Laundry", "AC / maintenance", "Real estate", "Restaurant", "Other"] },
  { k: "need", q: "What would help you most?", opts: ["WhatsApp answered", "Calls answered", "Quotes & follow-ups", "Not sure yet"] },
  { k: "how", q: "A call, or should Noor visit you?", opts: ["Phone / WhatsApp call", "Visit my business"] },
  { k: "when", q: "When suits you?", opts: ["Today", "Tomorrow", "This weekend", "Next week"] },
  { k: "time", q: "And what time of day?", opts: ["Morning", "Afternoon", "After 4 pm"] },
  { k: "whatsapp", q: "Last one: your WhatsApp number, so Noor can confirm?", type: "tel", ph: "05x xxx xxxx", ac: "tel" },
];
const ans = {}; let step = 0;
const blog = $("#blog"), bopts = $("#bopts"), bform = $("#bform"), bin = $("#bin");
function say(cls, html) { const d = document.createElement("div"); d.className = cls; d.dir = "auto"; d.innerHTML = html; blog.appendChild(d); d.scrollIntoView({ block: "nearest" }); return d; }
async function ask() {
  bopts.innerHTML = ""; const s = STEPS[step];
  await wait(reduce ? 0 : 450);
  say("q", esc(typeof s.q === "function" ? s.q(ans) : s.q));
  if (s.opts) { bform.hidden = true; s.opts.forEach((o) => { const b = document.createElement("button"); b.type = "button"; b.textContent = o; b.onclick = () => answer(o); bopts.appendChild(b); }); }
  else { bform.hidden = false; bin.type = s.type; bin.placeholder = s.ph; bin.autocomplete = s.ac || "off"; bin.value = ""; }
}
function answer(v) {
  const s = STEPS[step];
  if (s.type === "tel" && (v.replace(/\D/g, "").length < 9)) { say("q", "That number looks short. Please type it with the area code, like 050 123 4567."); return; }
  ans[s.k] = v; say("a", esc(v)); step++;
  if (step < STEPS.length) ask(); else summary();
}
bform.addEventListener("submit", (e) => { e.preventDefault(); const v = bin.value.trim(); if (v) answer(v); });
function text() { return `Booking request\nName: ${ans.name}\nBusiness: ${ans.business} (${ans.type})\nNeeds: ${ans.need}\nHow: ${ans.how}\nWhen: ${ans.when}, ${ans.time}\nWhatsApp: ${ans.whatsapp}`; }
async function summary() {
  bform.hidden = true; await wait(reduce ? 0 : 400);
  say("q", `Here's your request:<br><b>${esc(ans.business)}</b> · ${esc(ans.type)}<br>${esc(ans.how)} · ${esc(ans.when)}, ${esc(ans.time)}<br>WhatsApp ${esc(ans.whatsapp)}`);
  bopts.innerHTML = "";
  const send = document.createElement("button"); send.type = "button"; send.textContent = "Send booking ✅"; send.style.cssText = "background:var(--gold);color:var(--on-gold);border-color:transparent";
  const again = document.createElement("button"); again.type = "button"; again.textContent = "Start again";
  again.onclick = () => { blog.innerHTML = ""; step = 0; for (const k in ans) delete ans[k]; ask(); };
  send.onclick = async () => {
    send.disabled = true; send.textContent = "Sending…";
    const wa = `https://wa.me/${WA}?text=${encodeURIComponent(text())}`;
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: `New booking: ${ans.business}`, _template: "table", _captcha: "false", ...ans }) });
      if (!r.ok) throw 0;
      bopts.innerHTML = ""; say("q", `Booked, ${esc(ans.name)}! Noor will confirm on WhatsApp soon. Want it faster? <a href="${wa}" target="_blank" rel="noopener">Send it on WhatsApp too</a>.`);
    } catch (e) {
      send.disabled = false; send.textContent = "Send booking ✅";
      say("q", `It didn't go through. Please <a href="${wa}" target="_blank" rel="noopener">send it on WhatsApp</a> instead, it's already written for you.`);
    }
  };
  bopts.append(send, again);
}
let bookStarted = false;
const startBooking = () => { if (!bookStarted) { bookStarted = true; ask(); } };
new IntersectionObserver((es) => { if (es[0].isIntersecting) startBooking(); }, { threshold: .3 }).observe($(".booking"));
// floating chat sign: jump to the booking assistant, start it, and put the cursor in the answer box
$("#fab").addEventListener("click", (e) => {
  e.preventDefault();
  $(".booking").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  startBooking();
  setTimeout(() => { if (!bform.hidden) bin.focus({ preventScroll: true }); }, 900);
});
// hide the sign while the booking chat itself is on screen
new IntersectionObserver((es) => $("#fab").classList.toggle("hide", es[0].isIntersecting), { threshold: .25 }).observe($(".booking"));
if (location.hash === "#book") startBooking();

// ---------- mobile dock ----------
const dock = liquid($("#dock"), (v) => $("#" + v).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }));
const ids = ["try", "day", "price", "spekly", "book"];
new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) dock.set(e.target.id); }), { rootMargin: "-45% 0px -50% 0px" }).observe && ids.forEach((id) => {
  new IntersectionObserver((es) => { if (es[0].isIntersecting) dock.set(id); }, { rootMargin: "-45% 0px -50% 0px" }).observe($("#" + id));
});
$$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
