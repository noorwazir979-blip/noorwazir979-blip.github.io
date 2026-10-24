// Noor AI Concierge site behaviour (Oct 2026 redesign). Every page loads this; each part runs only if its
// elements are on the page. Text in English or Arabic from <html lang>. The AI lives in chat-worker/
// (https://noor-chat.silicon-sailboat.workers.dev): /chat, /plan, /lead. Chats are saved without names
// (see privacy.html); the email to Noor goes through formsubmit.co like before.
(() => {
"use strict";
const AR = document.documentElement.lang === "ar";
const API = "https://noor-chat.silicon-sailboat.workers.dev", MAIL = "noor@nooraiconcierge.com", WA = "971589358857";
const PAGE = document.body.dataset.page || (AR ? "ar" : "en");
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
let visitor;
try { visitor = localStorage.getItem("nc-v") || (localStorage.setItem("nc-v", Math.random().toString(36).slice(2, 12)), localStorage.getItem("nc-v")); } catch { visitor = Math.random().toString(36).slice(2, 12); }
const post = (path, body, ms = 15000) => {
  const ctl = new AbortController(); setTimeout(() => ctl.abort(), ms);
  return fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, visitor, page: PAGE, log: true }), signal: ctl.signal })
    .then((r) => r.json().then((j) => { if (!r.ok) throw j; return j; }));
};
const mail = (subject, fields) => fetch(`https://formsubmit.co/ajax/${MAIL}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ _subject: subject, _template: "table", _captcha: "false", page: PAGE, ...fields }) }).then((r) => { if (!r.ok) throw 0; });

const T = AR ? {
  hi: "مرحباً! أنا مساعد نور. اسألني عن أي شيء: ماذا نفعل، الأسعار، أو كيف يمكن للذكاء الاصطناعي أن يأخذ عملاً متكرراً عن فريقك.",
  chatTitle: "مساعد نور", chatSub: "يردّ خلال ثوانٍ · بالعربية والإنجليزية", typing: "يكتب…", placeholder: "اكتب سؤالك…",
  fail: "الجواب السريع: نرفع الأعمال المكتبية المتكررة عن فريقك (عروض الأسعار، والمتابعات، وتذكيرات الدفع، وإدخال البيانات، والتقارير)، ونبني مساعدين بالذكاء الاصطناعي يردّون على عملائك على واتساب ومحادثة الموقع والبريد الإلكتروني. يبدأ المساعد من 499 درهماً شهرياً، وتحصل أتمتة المكاتب على عرض سعر ثابت ومكتوب خلال 48 ساعة بعد فحص مجاني لمدة 20 دقيقة. للرد الشخصي السريع، راسل نور على واتساب: ", note: "تُحفظ المحادثات بدون اسمك لتحسين الردود.",
  menuChat: "تحدّث مع مساعدنا الذكي", menuChatSub: "إجابات فورية، ليلاً ونهاراً", menuWa: "راسل نور على واتساب", menuWaSub: "يرد في نفس اليوم",
  bookTitle: "اترك بياناتك وسيتواصل معك نور:", name: "اسمك", biz: "اسم نشاطك التجاري", wa: "رقم واتساب", send: "إرسال", sent: "تم. سيراسلك نور على واتساب خلال يوم.",
  waText: "مرحباً نور، رأيت موقعك وأريد أن أسأل عن", thinking: "نفكر في عملك…", hintNext: "مرّر لرؤية الخطوة التالية", hintEnd: "هذا كل شيء. نحن جاهزون متى شئت.",
  stepOf: (n) => `الخطوة ${n} من 3`, waBad: "اكتب رقم واتساب، مثل 050 123 4567.", leadOk: "تم. سيراسلك نور على واتساب خلال يوم.", sending: "جارٍ الإرسال…", sentTitle: "تم إرسال طلبك", sentTo: (n) => `سيراسلك نور على واتساب على الرقم ${n} خلال يوم.`, sendFail: "لم يُرسل الطلب. جرّب مرة أخرى أو راسل نور مباشرة على واتساب.", faster: "تريد رداً أسرع؟ راسل نور الآن",
  copied: "تم النسخ", play: "شغّل المكالمة", pause: "إيقاف", cantPlay: "تعذّر التشغيل هنا",
  checkText: "مرحباً نور، أريد فحصاً مجانياً لمدة 20 دقيقة.",
} : {
  hi: "Hi! I'm Noor's assistant. Ask me anything: what we do, prices, or how AI could take a repeated job off your team.",
  chatTitle: "Noor's assistant", chatSub: "Replies in seconds · English, Arabic, Urdu", typing: "Typing…", placeholder: "Type your question…",
  fail: "Quick answer: we take repeated office jobs off your team (quotes, follow-ups, payment reminders, data entry, reports) and build AI assistants that answer your customers on WhatsApp, website chat and email. The assistant starts at AED 499 a month; office automation gets a fixed written quote within 48 hours after a free 20-minute check. For a fast personal reply, WhatsApp Noor: ", note: "Chats are saved without your name to improve our answers.",
  menuChat: "Chat with our AI", menuChatSub: "Instant answers, day and night", menuWa: "WhatsApp Noor", menuWaSub: "Replies the same day",
  bookTitle: "Leave your details and Noor will get back to you:", name: "Your name", biz: "Business name", wa: "WhatsApp number", send: "Send", sent: "Done. Noor will message you on WhatsApp within a day.",
  waText: "Hi Noor, I saw your website and want to ask about", thinking: "Thinking about your job…", hintNext: "Scroll to see the next step", hintEnd: "That's it. Ready when you are.",
  stepOf: (n) => `Step ${n} of 3`, waBad: "Please type your WhatsApp number, for example 050 123 4567.", leadOk: "Got it. Noor will message you on WhatsApp within a day.", sending: "Sending…", sentTitle: "Request sent!", sentTo: (n) => `Noor will message you on WhatsApp at ${n} within a day.`, sendFail: "That didn't go through. Please try again, or WhatsApp Noor directly.", faster: "Want a faster reply? WhatsApp Noor now",
  copied: "Copied", play: "Play the call", pause: "Pause", cantPlay: "Can't play here",
  checkText: "Hi Noor, I'd like a free 20-minute check.",
};
const ICON = {
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.8 2 11.5c0 2.4 1.2 4.6 3.1 6.1L4 21.5l4.4-2.2c1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.3S17.5 3 12 3Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4M12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.7-.2-.4A9.9 9.9 0 1 1 12 21.8m8.4-18.3A11.8 11.8 0 0 0 .2 11.9c0 2.1.5 4.1 1.6 6L.1 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.5 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4"/></svg>',
  send: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z"/></svg>',
};
const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text || T.waText)}`;
/* "sent" card: a big tick that draws itself, so people see the request went through and don't press again */
function sentCard(number, small) {
  const d = document.createElement("div");
  d.className = "sent" + (small ? " small" : ""); d.setAttribute("role", "status");
  d.innerHTML = `<svg class="tick" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>
<div><b></b><p></p><a target="_blank" rel="noopener"></a></div>`;
  $("b", d).textContent = T.sentTitle;
  const p = $("p", d); p.textContent = T.sentTo(number);
  const a = $("a", d); a.href = waLink(); a.textContent = T.faster;
  return d;
}
/* while sending: the button shows a spinner and cannot be pressed twice */
function busy(btn, on) {
  if (on) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.classList.add("busy"); btn.innerHTML = `<i class="spin" aria-hidden="true"></i>${T.sending}`; }
  else { btn.disabled = false; btn.classList.remove("busy"); btn.textContent = btn.dataset.label; }
}

/* top bar border once scrolled */
const topBar = $(".top");
if (topBar) addEventListener("scroll", () => topBar.classList.toggle("scrolled", scrollY > 8), { passive: true });

/* ---------- corner button: one button, two choices ---------- */
const fab = document.createElement("div");
fab.className = "fab";
fab.innerHTML = `<div class="fab-menu" role="menu">
  <button type="button" data-chat role="menuitem"><span class="ic">${ICON.chat}</span><span>${T.menuChat}<small>${T.menuChatSub}</small></span></button>
  <a href="${waLink()}" target="_blank" rel="noopener" role="menuitem"><span class="ic wa">${ICON.wa}</span><span>${T.menuWa}<small>${T.menuWaSub}</small></span></a>
</div><button class="fab-btn" type="button" aria-expanded="false" aria-label="${T.menuChat} / ${T.menuWa}"><span class="c">${ICON.chat}</span><span class="x">${ICON.x}</span></button>`;
document.body.appendChild(fab);
const fabBtn = $(".fab-btn", fab);
const closeFab = () => { fab.classList.remove("open"); fabBtn.setAttribute("aria-expanded", "false"); };
fabBtn.addEventListener("click", () => {
  if (!chat.hidden) { chat.hidden = true; closeFab(); return; }
  const open = fab.classList.toggle("open"); fabBtn.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", (e) => { if (!fab.contains(e.target) && !chat.contains(e.target)) closeFab(); });
$$("[data-open-chat]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openChat(); }));

/* ---------- chat panel ---------- */
const chat = document.createElement("section");
chat.className = "chat"; chat.hidden = true; chat.setAttribute("aria-label", T.chatTitle);
chat.innerHTML = `<div class="chat-head"><span class="dot"></span><div><b>${T.chatTitle}</b><small>${T.chatSub}</small></div><button type="button" aria-label="Close">×</button></div>
<div class="chat-log" aria-live="polite"></div>
<div><form class="chat-form"><input id="chatIn" autocomplete="off" maxlength="600" placeholder="${T.placeholder}" aria-label="${T.placeholder}"><button type="submit" aria-label="${T.send}">${ICON.send}</button></form><p class="chat-note">${T.note}</p></div>`;
document.body.appendChild(chat);
const logEl = $(".chat-log", chat), hist = [];
const bubble = (who, text) => { const d = document.createElement("div"); d.className = "msg " + who; d.textContent = text; logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight; return d; };
function openChat() {
  closeFab(); chat.hidden = false; fab.classList.add("open"); fabBtn.setAttribute("aria-expanded", "true");
  $(".fab-menu", fab).style.display = "none";
  if (!logEl.children.length) bubble("bot", T.hi);
  setTimeout(() => $("#chatIn").focus(), 50);
}
$(".chat-head button", chat).addEventListener("click", () => { chat.hidden = true; $(".fab-menu", fab).style.display = ""; closeFab(); });
$("[data-chat]", fab).addEventListener("click", openChat);
fabBtn.addEventListener("click", () => { if (chat.hidden) $(".fab-menu", fab).style.display = ""; });
$(".chat-form", chat).addEventListener("submit", async (e) => {
  e.preventDefault();
  const inp = $("#chatIn"), q = inp.value.trim(); if (!q) return;
  inp.value = ""; bubble("me", q); hist.push({ role: "user", content: q });
  const t = bubble("bot typing", T.typing);
  try {
    const r = await post("/chat", { messages: hist.slice(-20) }, 25000);
    t.remove(); bubble("bot", r.reply); hist.push({ role: "assistant", content: r.reply });
    if (r.action === "book") bookForm();
  } catch {
    t.remove(); const d = bubble("bot", T.fail);
    const a = document.createElement("a"); a.href = waLink(q); a.target = "_blank"; a.rel = "noopener"; a.textContent = "058 935 8857"; a.dir = "ltr"; d.appendChild(a);
  }
});
function bookForm() {
  const f = document.createElement("form"); f.className = "bookf";
  f.innerHTML = `<b>${T.bookTitle}</b><input name="name" placeholder="${T.name}" required><input name="business" placeholder="${T.biz}"><input name="whatsapp" type="tel" inputmode="tel" placeholder="${T.wa}" required><button class="btn" type="submit">${T.send}</button>`;
  logEl.appendChild(f); logEl.scrollTop = logEl.scrollHeight;
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("button", f); if (btn.disabled) return;
    const d = Object.fromEntries(new FormData(f));
    if (String(d.whatsapp).replace(/\D/g, "").length < 9) { f.whatsapp.focus(); return; }
    const chatText = hist.map((m) => (m.role === "user" ? "Visitor: " : "AI: ") + m.content).join("\n").slice(-3000);
    busy(btn, true);
    post("/lead", { job: "Booking from chat: " + (d.business || ""), plan: "chat booking" }).catch(() => {});
    try { await mail(`New booking from the website chat: ${d.business || d.name}`, { ...d, chat: chatText }); }
    catch { busy(btn, false); bubble("bot", T.sendFail); return; }
    f.replaceWith(sentCard(d.whatsapp, true)); logEl.scrollTop = logEl.scrollHeight;
  });
}

/* ---------- the job box -> AI plan ---------- */
const askForm = $("#askForm");
if (askForm) {
  const job = $("#job");
  const EX = job.dataset.examples ? job.dataset.examples.split("|") : AR ? ["كل مساء ندخل فواتير الموردين يدوياً في إكسل", "نجهّز 20 عرض سعر يومياً باليد", "نلاحق العملاء الذين لم يدفعوا", "نردّ على نفس أسئلة واتساب طوال اليوم", "نجهّز تقرير المبيعات الأسبوعي", "تفوتنا المكالمات عندما ينشغل الفريق"]
    : ["Every evening someone types supplier invoices into Excel", "We make 20 price quotes a day by hand", "Chasing customers who haven't paid", "Answering the same WhatsApp questions all day", "Putting together the weekly sales report", "Missing calls when the team is busy"];
  if (!calm) (function () { // the examples type themselves inside the box, and stop once the visitor starts
    let i = 0, c = 0, del = false; const pre = AR ? "مثال: " : "e.g. ";
    (function tick() {
      if (document.activeElement === job || job.value) { setTimeout(tick, 600); return; }
      const t = EX[i]; c += del ? -1 : 1; job.placeholder = pre + t.slice(0, c);
      let wait = del ? 18 : 42;
      if (!del && c === t.length) { del = true; wait = 2200; } else if (del && c === 0) { del = false; i = (i + 1) % EX.length; wait = 350; }
      setTimeout(tick, wait);
    })();
  })();

  // ready-made plans: used when the AI can't be reached
  const P = AR ? [
    [/سعر|أسعار|عرض|تسعير|تقدير|مقاس|متر|كمية/, "عروض أسعار في ثوانٍ", "6 إلى 10 ساعات", [["يرسل العميل التفاصيل", "المقاسات أو الكميات أو الصور أو رسالة صوتية، على واتساب أو البريد."], ["يحسب الذكاء الاصطناعي السعر", "من قائمة أسعارك وقواعدك أنت، ثم يجهّز عرض سعر PDF بشعارك."], ["تراجعه وترسله", "بضغطة واحدة. وأي حالة غير عادية تصلك أولاً."]]],
    [/دفع|يدفع|متأخر|تذكير|ملاحقة|تحصيل|مستحق/, "متابعة لا تنسى أحداً", "3 إلى 6 ساعات", [["يعرف من لم يرد أو لم يدفع", "من فواتيرك أو ملف إكسل أو نظام الحسابات."], ["يرسل تذكيرات مهذبة في وقتها", "على واتساب أو البريد، بأسلوبك، وعلى فترات مناسبة."], ["ترى من دفع ومن لم يدفع", "قائمة قصيرة كل صباح. والحالات الصعبة تصلك أنت."]]],
    [/فاتور|إكسل|اكسل|إدخال|بيانات|نسخ|إيصال/, "فواتير تُدخَل وحدها", "5 إلى 8 ساعات", [["تصل الفواتير كالمعتاد", "بالبريد أو صورة على واتساب أو PDF. لا شيء يتغير لمورديك."], ["يقرأها الذكاء الاصطناعي", "يستخرج التاريخ والمورد والأصناف والضريبة والإجمالي ويملأ ملفك أو نظامك."], ["فريقك يراجع فقط", "ما لا يكون متأكداً منه يُعلَّم لشخص ينظر فيه."]]],
    [/تقرير|تقارير|مبيعات|أسبوعي|يومي|شهري|مخزون/, "تقارير تُكتب وحدها", "2 إلى 4 ساعات", [["يجمع الأرقام", "من جداولك أو برنامج المبيعات أو البريد، كل يوم."], ["يكتب تقريراً قصيراً وواضحاً", "الإجماليات والتغيّرات وما يبدو غير صحيح، بكلمات بسيطة."], ["يصل إلى هاتفك", "كل صباح أو كل أحد، على واتساب أو البريد."]]],
    [/مكالم|اتصال|هاتف|تفوت/, "كل مكالمة يُرد عليها", "كل مكالمة فائتة", [["يرد الذكاء الاصطناعي عندما لا تستطيع", "بعد الدوام أو في أوقات الضغط أو عندما يكون الخط مشغولاً."], ["يجيب ويأخذ التفاصيل", "الأسعار والمواعيد والحجوزات، بالعربية والإنجليزية."], ["تصلك ملاحظة قصيرة", "من اتصل، وماذا يريد، وما تم الاتفاق عليه."]]],
    [/واتساب|رسائل|أسئلة|نفس|إنستغرام|استفسار/, "أسئلة يُرد عليها ليلاً ونهاراً", "1 إلى 3 ساعات يومياً", [["يسأل العميل سؤالاً", "عن الأسعار والمواعيد والموقع والتوفر، على أي تطبيق."], ["يرد الذكاء الاصطناعي خلال ثوانٍ", "من معلوماتك الحقيقية، وبلغة العميل."], ["العملاء الجادون يصلونك", "مع الاسم وما يحتاجونه، جاهزين للإغلاق."]]],
    [/حجز|موعد|مواعيد|جدول/, "حجوزات بلا أخذ ورد", "3 إلى 5 ساعات", [["يطلب العميل موعداً", "على واتساب أو الموقع أو بالهاتف."], ["يعرض الأوقات المتاحة ويحجز", "يتحقق من تقويمك ويرسل تذكيراً قبل يوم."], ["ترى يومك مسبقاً", "قائمة واضحة كل صباح."]]],
  ] : [
    [/quot|estimat|price|pricing|tender|boq|measur|met(er|re)|size|cost/i, "Quotes made in seconds", "6 to 10 hours", [["The customer sends the details", "Sizes, amounts, photos or a voice note, on WhatsApp or email."], ["The AI works out the price", "It uses your own price list and your rules, then makes a neat PDF quote with your logo."], ["You check and send", "One tap to send. Anything unusual comes to you first."]]],
    [/chas|follow|remind|unpaid|overdue|collect|payment|owe|paid/i, "Follow-ups that never forget", "3 to 6 hours", [["It knows who hasn't replied or paid", "From your invoices, Excel sheet or accounts system."], ["It sends polite reminders on time", "On WhatsApp or email, in your tone, at the right gaps."], ["You see who paid and who didn't", "A short list every morning. Hard cases come to you."]]],
    [/typ|enter|excel|sheet|data|copy|invoice|receipt|bill|record|entry/i, "Invoices that type themselves", "5 to 8 hours", [["Invoices arrive as usual", "Email, WhatsApp photo or PDF. Nothing changes for your suppliers."], ["The AI reads them", "It picks out the date, supplier, items, VAT and total, and fills your Excel or system."], ["Your team only checks", "Anything it isn't sure about is marked for a person to look at."]]],
    [/report|summar|daily|weekly|monthly|numbers|sales|stock/i, "Reports that write themselves", "2 to 4 hours", [["It collects the numbers", "From your sheets, sales app or emails, every day."], ["It writes a short, clear report", "Totals, changes and anything that looks wrong, in plain words."], ["It lands on your phone", "Every morning or every Sunday, on WhatsApp or email."]]],
    [/call|phone|ring|miss/i, "Every call answered", "Every missed call", [["The AI picks up when you can't", "After hours, busy times or when the line is full."], ["It answers and takes the details", "Prices, timings, bookings, in English or Arabic."], ["You get a short note", "Who called, what they want, and what was agreed."]]],
    [/whatsapp|message|question|repl|answer|enquir|inquir|instagram|chat|dm|same/i, "Questions answered day and night", "1 to 3 hours a day", [["A customer asks a question", "Prices, timings, location, availability, on any app."], ["The AI answers in seconds", "From your real information, in their language."], ["Serious customers come to you", "With their name and what they need, ready to close."]]],
    [/book|appoint|schedul|calendar|slot/i, "Bookings without the back and forth", "3 to 5 hours", [["The customer asks for a time", "On WhatsApp, the website or by phone."], ["The AI offers free slots and books it", "It checks your calendar and sends a reminder the day before."], ["You see the day ahead", "A clean list every morning."]]],
  ];
  const GEN = AR ? ["عملك، يُنجز بنفس الطريقة كل مرة", "ساعات كل أسبوع", [["نتعلم كيف يؤديه فريقك الآن", "خطوة بخطوة، من أمثلتك الحقيقية."], ["الذكاء الاصطناعي يؤدي الجزء المتكرر", "بنفس الطريقة كل مرة، ليلاً ونهاراً."], ["فريقك يراجع ويقرر فقط", "وأي شيء غير واضح يذهب إلى شخص."]]]
    : ["Your job, done the same way every time", "Hours every week", [["We learn how your team does it now", "Step by step, from your real examples."], ["The AI does the repeated part", "The same way every time, day or night."], ["Your team only checks and decides", "Anything unclear goes to a person."]]];
  const local = (text) => { const m = P.find((p) => p[0].test(text)); const [title, hours, steps] = m ? m.slice(1) : GEN; return { title, hours, steps, lang: AR ? "ar" : "en" }; };

  let lastJob = "", lastPlan = null;
  const show = (text, p, example) => {
    lastPlan = p;
    $("#said").textContent = (AR ? "«" : "“") + text + (AR ? "»" : "”");
    $("#tag").hidden = !example;
    $("#planTitle").textContent = p.title; $("#hours").textContent = p.hours;
    ($(".plan") || $("#planTitle").parentElement).dir = p.lang === "ar" || p.lang === "ur" ? "rtl" : "ltr";
    const ol = $("#steps"); ol.classList.remove("reveal"); void ol.offsetWidth;
    ol.innerHTML = p.steps.map(([b, s]) => `<li><div><b>${esc(b)}</b><span>${esc(s)}</span></div></li>`).join("");
    ol.classList.add("reveal");
  };
  show(EX[0], local(EX[0]), true);
  async function ask(text) {
    text = text.trim(); if (!text) { job.focus(); return; }
    lastJob = text;
    $("#bench").scrollIntoView({ behavior: calm ? "auto" : "smooth" });
    $("#steps").innerHTML = `<li class="thinking">${T.thinking}</li>`;
    const t0 = Date.now();
    let p;
    try { p = await post("/plan", { job: text }); if (!p.steps) throw 0; } catch { p = local(text); }
    setTimeout(() => show(text, p, false), Math.max(0, 600 - (Date.now() - t0)));
  }
  askForm.addEventListener("submit", (e) => { e.preventDefault(); ask(job.value); });
  job.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(job.value); } });

  $("#leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget, btn = $("button", form); if (btn.disabled) return;
    const wa = $("#wa").value.trim(), note = $("#leadNote");
    if (wa.replace(/\D/g, "").length < 9) { note.textContent = T.waBad; $("#wa").focus(); return; }
    const planText = lastPlan ? lastPlan.title + " | " + lastPlan.steps.map((s) => s[0]).join(" > ") : $("#planTitle").textContent;
    busy(btn, true);
    post("/lead", { job: lastJob || "(example plan)", plan: planText }).catch(() => {});
    try { await mail("New job from the website box", { whatsapp: wa, job: lastJob || "(example plan)", plan: planText }); }
    catch { busy(btn, false); note.textContent = ""; const a = document.createElement("a"); a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; a.textContent = T.sendFail; note.appendChild(a); return; }
    form.replaceChildren(sentCard(wa));
  });
}

/* ---------- scroll story: the step crossing the middle of the screen is active ---------- */
const beats = $$(".beat");
if (beats.length) {
  const scenes = $$(".scene"), cap = $(".caption"), whoEl = $("#stageWho"); let cur = "1";
  const setStep = (n) => {
    if (n !== cur) {
      cur = n; const b = beats[n - 1];
      cap.classList.add("swap");
      setTimeout(() => {
        $("#capTitle").textContent = $("h3", b).textContent; $("#capText").textContent = $("p", b).textContent;
        $("#capCount").textContent = T.stepOf(n); $("#capHint").textContent = n === "3" ? T.hintEnd : T.hintNext;
        cap.classList.remove("swap");
      }, 220);
      $$(".dots i").forEach((d, i) => d.classList.toggle("on", i < +n));
    }
    beats.forEach((b) => b.classList.toggle("on", b.dataset.step === n));
    scenes.forEach((s) => s.classList.toggle("on", s.dataset.scene === n));
    if (whoEl) whoEl.innerHTML = whoEl.dataset["w" + n] || whoEl.innerHTML;
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setStep(e.target.dataset.step)), { rootMargin: "-45% 0px -45% 0px" });
  beats.forEach((b) => io.observe(b));
  const rail = $(".beats");
  const prog = () => { const r = rail.getBoundingClientRect(); rail.style.setProperty("--prog", Math.max(0, Math.min(100, (innerHeight / 2 - r.top) / r.height * 100)) + "%"); };
  addEventListener("scroll", prog, { passive: true }); prog();
}

/* ---------- free 20-minute check: WhatsApp number -> email to Noor ---------- */
const checkF = $("#check");
if (checkF) checkF.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("button", checkF); if (btn.disabled) return;
  const inp = $("#checkWa"), wa = inp.value.trim(), note = $("#checkNote");
  if (wa.replace(/D/g, "").length < 9) { note.textContent = T.waBad; inp.focus(); return; }
  busy(btn, true);
  post("/lead", { job: "Free 20-minute check (prices section)", plan: "free check" }).catch(() => {});
  try { await mail("New request: free 20-minute check", { whatsapp: wa, from: "prices section" }); }
  catch { busy(btn, false); note.textContent = ""; const l = document.createElement("a"); l.href = waLink(T.checkText); l.target = "_blank"; l.rel = "noopener"; l.textContent = T.sendFail; note.appendChild(l); return; }
  checkF.replaceChildren(sentCard(wa, true));
});

/* ---------- recorded call + copy number ---------- */
const call = $("#call"), callBtn = $("#callBtn");
if (call && callBtn) {
  const lab = $("span", callBtn);
  callBtn.addEventListener("click", () => { if (call.paused) call.play().catch(() => { lab.textContent = T.cantPlay; }); else call.pause(); });
  call.addEventListener("play", () => { callBtn.classList.add("playing"); lab.textContent = T.pause; });
  call.addEventListener("pause", () => { callBtn.classList.remove("playing"); lab.textContent = T.play; });
  call.addEventListener("timeupdate", () => { $("#callBar").style.width = (call.currentTime / (call.duration || 1) * 100) + "%"; });
}
const copy = $("#copy");
if (copy) copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("0589358857"); copy.textContent = T.copied; }
  catch { const r = document.createRange(); r.selectNodeContents($("#phone")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
});
})();
