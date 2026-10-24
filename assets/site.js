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
  copied: "تم النسخ",
  checkText: "مرحباً نور، أريد فحصاً مجانياً لمدة 20 دقيقة.",
} : {
  hi: "Hi! I'm Noor's assistant. Ask me anything: what we do, prices, or how AI could take a repeated job off your team.",
  chatTitle: "Noor's assistant", chatSub: "Replies in seconds · English, Arabic, Urdu", typing: "Typing…", placeholder: "Type your question…",
  fail: "Quick answer: we take repeated office jobs off your team (quotes, follow-ups, payment reminders, data entry, reports) and build AI assistants that answer your customers on WhatsApp, website chat and email. The assistant starts at AED 499 a month; office automation gets a fixed written quote within 48 hours after a free 20-minute check. For a fast personal reply, WhatsApp Noor: ", note: "Chats are saved without your name to improve our answers.",
  menuChat: "Chat with our AI", menuChatSub: "Instant answers, day and night", menuWa: "WhatsApp Noor", menuWaSub: "Replies the same day",
  bookTitle: "Leave your details and Noor will get back to you:", name: "Your name", biz: "Business name", wa: "WhatsApp number", send: "Send", sent: "Done. Noor will message you on WhatsApp within a day.",
  waText: "Hi Noor, I saw your website and want to ask about", thinking: "Thinking about your job…", hintNext: "Scroll to see the next step", hintEnd: "That's it. Ready when you are.",
  stepOf: (n) => `Step ${n} of 3`, waBad: "Please type your WhatsApp number, for example 050 123 4567.", leadOk: "Got it. Noor will message you on WhatsApp within a day.", sending: "Sending…", sentTitle: "Request sent!", sentTo: (n) => `Noor will message you on WhatsApp at ${n} within a day.`, sendFail: "That didn't go through. Please try again, or WhatsApp Noor directly.", faster: "Want a faster reply? WhatsApp Noor now",
  copied: "Copied",
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

/* ---------- "See it on an example": the visitor's kind of job, in 3 steps (comes in, we do, you get) ----------
   Made-up example companies. Plays once when it scrolls into view; "Play again" replays it. Reduced motion shows
   the end state straight away. #demo=<kind> (e.g. #demo=compare) opens a kind directly, handy for sharing. */
const demoBox = $("#demo");
const demoSet = demoBox ? (() => {
  const doc = (head, rows, total, badge) => `<div class="obj paper"><b>${head}</b>${rows.map(([k, v]) => `<p><span>${k}</span><span>${v}</span></p>`).join("")}${total ? `<p class="tot"><span>${total[0]}</span><span>${total[1]}</span></p>` : ""}${badge ? `<span class="pill g">${badge}</span>` : ""}</div>`;
  const msg = (text, meta, ours) => `<div class="obj bubble${ours ? " me" : ""}"><p>${text}</p><small>${meta}</small></div>`;
  const files = (list) => `<ul class="obj files">${list.map(([k, v]) => `<li><i>${k}</i>${v}</li>`).join("")}</ul>`;
  const table = (head, rows, hi = -1) => `<table class="obj tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr class="a${i === hi ? " hi" : ""}" style="--i:${i}">${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const bars = (days, note) => { const max = Math.max(...days.map((d) => d[1]));
    return `<div class="obj chart"><div class="bars">${days.map(([d, v], i) => `<div class="bar${v === max ? " hi" : ""}" style="--h:${(v / max).toFixed(2)};--i:${i}"><em>${v.toLocaleString("en-US")}</em><i></i><small>${d}</small></div>`).join("")}</div><p>${note}</p></div>`; };
  const note = (t) => `<p class="dnote a" style="--i:4">${t}</p>`;
  const pill = (t, c = "") => ` <span class="pill ${c}">${t}</span>`, ltr = (t) => `<bdi dir="ltr">${t}</bdi>`;
  const D = AR ? {
    invoice: { t: "فاتورة مورد تدخل ملف إكسل وحدها", i: doc("فاتورة ضريبية · الواحة لمواد البناء", [["التاريخ", "21 أكتوبر 2026"], ["إسمنت، 40 كيساً × 18.00", "720.00"], ["ضريبة القيمة المضافة 5%", "36.00"]], ["الإجمالي", "756.00 درهم"]),
      d: ["يقرأ اسم المورد والتاريخ والأصناف", "يتأكد من صحة ضريبة 5%", "يضيف سطراً جديداً إلى ملفك"],
      o: table(["التاريخ", "المورد", "الضريبة", "الإجمالي"], [["19 أكتوبر", "الخليج للحديد", "210.00", "4,410.00"], ["20 أكتوبر", "صحارى للدهانات", "24.50", "514.50"], ["21 أكتوبر", "الواحة" + pill("جديد"), "36.00", "756.00"]], 2) },
    quotes: { t: "يسأل العميل عن السعر، فيجهز العرض", i: msg("السلام عليكم، كم سعر صيانة 3 مكيفات وتعبئة غاز لمكيف واحد؟ الفيلا في مدينة خليفة.", "واتساب · 10:14 ص"),
      d: ["يجد كل خدمة في قائمة أسعارك", "يضيف ضريبة 5%", "يجهز عرض سعر مرتباً بشعارك"],
      o: doc("عرض سعر Q-1042 · النسيم لخدمات التكييف", [["صيانة مكيف (" + ltr("3 × 150") + ")", "450.00"], ["تعبئة غاز (" + ltr("1 × 200") + ")", "200.00"], ["ضريبة القيمة المضافة 5%", "32.50"]], ["الإجمالي", "682.50 درهم"], "جاهز للإرسال") },
    compare: { t: "ثلاثة عروض من الموردين، ومقارنة جاهزة", i: files([["PDF", "عرض الإمارات للأنابيب"], ["بريد", "أسعار دلتا للتجارة"], ["صورة", "رويال للتوريدات، على واتساب"]]),
      d: ["يقرأ العروض الثلاثة مهما كان شكلها", "يضع السعر ومدة التسليم جنباً إلى جنب", "يعلّم الأرخص"],
      o: table(["المورد", "الإجمالي مع الضريبة", "التسليم"], [["الإمارات للأنابيب", "12,400 درهم", "5 أيام"], ["دلتا للتجارة" + pill("الأرخص", "g"), "11,850 درهم", "3 أيام"], ["رويال للتوريدات", "12,900 درهم", "يومان"]], 1) },
    remind: { t: "من عليه مبالغ لك، وتذكير مهذب يُرسل", i: table(["العميل", "الفاتورة", "متأخرة"], [["مقهى الموجة الزرقاء", "3,150 درهم", "12 يوماً"], ["صالون وردة الصحراء", "1,890 درهم", "30 يوماً"], ["نادي المارينا", "4,200 درهم", "5 أيام"]]),
      d: ["يجد الفواتير غير المدفوعة", "يكتب رسالة مهذبة بأسلوبك", "يرسلها الساعة 9 صباحاً ويخبرك من دفع"],
      o: msg("مرحباً فريق مقهى الموجة الزرقاء، نذكّركم بلطف بأن الفاتورة INV-0318 بمبلغ 3,150 درهماً كانت مستحقة في 12 أكتوبر. يمكنكم الدفع بالتحويل البنكي أو بالبطاقة. شكراً لكم!", "أُرسلت على واتساب · 9:00 ص ✓✓", true) + note("أُرسلت 3 تذكيرات من 3. سترى من دفع صباح الغد.") },
    estimate: { t: "مقاسات تصل، وتقدير كامل يخرج", i: msg("السلام عليكم، أبغى سقف جبس لغرفتين: " + ltr("4.5 × 4") + " م و" + ltr("3.5 × 3") + " م. كم السعر؟", "واتساب · 6:40 م"),
      d: ["يحسب المساحة: " + ltr("18 + 10.5 = 28.5") + " م²", "يستخدم سعرك: 45 درهماً للمتر المربع", "يضيف ضريبة 5%"],
      o: table(["البند", "م²", "درهم"], [["غرفة 1 (" + ltr("4.5 × 4") + ")", "18.0", "810.00"], ["غرفة 2 (" + ltr("3.5 × 3") + ")", "10.5", "472.50"], ["ضريبة 5%", "", "64.13"], ["الإجمالي", "28.5", "1,346.63"]], 3) },
    report: { t: "أسبوعك في رسم بياني صغير", i: table(["اليوم", "الفرع", "المبيعات"], [["الخميس", "مصفح", "5,600 درهم"], ["الخميس", "الخالدية", "3,800 درهم"], ["الأربعاء", "مصفح", "3,500 درهم"]]) + `<p class="dnote">و40 سطراً آخر</p>`,
      d: ["يجمع الأرقام كل مساء", "يجمعها حسب اليوم", "يرسل لك الرسم صباح الأحد"],
      o: bars([["الأحد", 5200], ["الإثنين", 4800], ["الثلاثاء", 6100], ["الأربعاء", 5900], ["الخميس", 9400]], "إجمالي الأسبوع 31,400 درهم، بزيادة 8% عن الأسبوع الماضي. الخميس كان أفضل يوم.") },
    docs: { t: "كل تاريخ انتهاء، مع الأيام المتبقية", i: files([["PDF", "الرخصة التجارية"], ["صورة", "تأشيرة · أحمد"], ["PDF", "تأمين سيارة التوصيل"]]),
      d: ["يقرأ تواريخ الانتهاء", "يحسب الأيام المتبقية", "يذكّرك قبل 90 و60 و30 يوماً"],
      o: table(["الوثيقة", "تنتهي في", "الأيام المتبقية"], [["الرخصة التجارية", "12 نوفمبر 2026", pill("19", "r")], ["تأشيرة · أحمد", "5 يناير 2027", pill("73", "y")], ["تأمين سيارة التوصيل", "30 يونيو 2027", pill("249", "g")]], 0) + note("الرخصة التجارية: أُرسل لك تذكير. جدّدها هذا الأسبوع.") },
    time: { t: "كشوف الدوام تصل، وساعات الرواتب جاهزة", i: doc("كشف الدوام · موقع B · الأسبوع 43", [["رافي", "6 أيام، 52 ساعة"], ["عمران", "6 أيام، 58 ساعة"], ["جوزيف", "5 أيام، 45 ساعة"]]),
      d: ["يقرأ الساعات من الصورة", "يفصل الساعات العادية عن الإضافية (فوق 48 أسبوعياً)", "يملأ جدول الرواتب لمحاسبك"],
      o: table(["الاسم", "عادية", "إضافية", "المجموع"], [["رافي", "48", "4", "52"], ["عمران", "48", "10", "58"], ["جوزيف", "45", "0", "45"]]) + note("جاهز لملف الرواتب (WPS).") },
    book: { t: "حجز يتم وأنت مشغول", i: msg("مرحبا، ممكن أحجز قص شعر بكرة بعد الساعة 5؟", "واتساب · 11:20 ص"),
      d: ["يتحقق من الأوقات المتاحة", "يحجز الساعة 5:30 م ويؤكد للعميل", "يرسل تذكيراً قبل يوم"],
      o: table(["غداً", "العميل", "الخدمة"], [["4:30 م", "ليلى", "صبغة"], ["5:30 م", "مريم" + pill("جديد"), "قص شعر"], ["6:30 م", "متاح", ""]], 1) },
    ask: { t: "سؤال عميل يُجاب عنه في منتصف الليل", i: msg("توصلون مصفح؟ كم سعر 20 كرتون ورق A4؟", "واتساب · 11:48 م"),
      d: ["يوضح أنه مساعد آلي", "يجيب من أسعارك الحقيقية", "يحوّل الطلب إلى فريقك"],
      o: msg("مرحباً، معك المساعد الآلي لشركة ستار للوازم المكتبية. نعم، نوصل إلى مصفح في اليوم التالي. سعر 20 كرتوناً 1,050 درهماً شاملاً ضريبة 5%. هل أحوّل طلبك إلى فريقنا؟", "أُرسلت · 11:48 م", true) + note("يصل فريقك: طلب جديد، 20 كرتوناً، مصفح.") },
    other: { t: "رسالة مبعثرة تصبح قائمة مهام مرتبة", i: msg("أرسل قائمة الأسعار الجديدة لعلي، شيّك على مخزون أنابيب 10 مم، واتصل بعميل فيلا الجميرا بكرة", "واتساب · 8:05 ص"),
      d: ["يقرأ الرسالة", "يقسمها إلى مهام منفصلة", "يحدد لكل مهمة شخصاً ويوماً"],
      o: table(["المهمة", "المسؤول", "الموعد"], [["إرسال قائمة الأسعار لعلي", "المبيعات", "اليوم"], ["فحص مخزون أنابيب 10 مم", "المخزن", "اليوم"], ["الاتصال بعميل فيلا الجميرا", "المبيعات", "غداً"]]) },
  } : {
    invoice: { t: "A supplier invoice goes into your Excel by itself", i: doc("Tax invoice · Al Waha Building Supplies", [["Date", "21 Oct 2026"], ["Cement, 40 bags × 18.00", "720.00"], ["VAT 5%", "36.00"]], ["Total", "AED 756.00"]),
      d: ["Reads the supplier, date and items", "Checks the 5% VAT adds up", "Adds a new row to your sheet"],
      o: table(["Date", "Supplier", "VAT", "Total"], [["19 Oct", "Gulf Steel", "210.00", "4,410.00"], ["20 Oct", "Sahara Paints", "24.50", "514.50"], ["21 Oct", "Al Waha" + pill("New"), "36.00", "756.00"]], 2) },
    quotes: { t: "A customer asks for a price, the quote is ready", i: msg("Hi, how much to service 3 AC units and one gas top-up? Villa in Khalifa City.", "WhatsApp · 10:14 am"),
      d: ["Finds each job in your price list", "Adds 5% VAT", "Makes a neat quote with your logo"],
      o: doc("Quote Q-1042 · Cool Breeze AC Services", [["AC service (3 × 150)", "450.00"], ["Gas top-up (1 × 200)", "200.00"], ["VAT 5%", "32.50"]], ["Total", "AED 682.50"], "Ready to send") },
    compare: { t: "Three supplier quotes, compared for you", i: files([["PDF", "Emirates Pipes quote"], ["Email", "Delta Trading prices"], ["Photo", "Royal Supply, on WhatsApp"]]),
      d: ["Reads all three, whatever the layout", "Puts price and delivery side by side", "Marks the cheapest"],
      o: table(["Supplier", "Total incl. VAT", "Delivery"], [["Emirates Pipes", "AED 12,400", "5 days"], ["Delta Trading" + pill("Cheapest", "g"), "AED 11,850", "3 days"], ["Royal Supply", "AED 12,900", "2 days"]], 1) },
    remind: { t: "Who owes you, and a polite reminder sent", i: table(["Customer", "Invoice", "Late"], [["Bluewave Café", "AED 3,150", "12 days"], ["Desert Rose Salon", "AED 1,890", "30 days"], ["Marina Gym", "AED 4,200", "5 days"]]),
      d: ["Finds the unpaid invoices", "Writes a polite message in your tone", "Sends it at 9 am and tells you who paid"],
      o: msg("Hello Bluewave Café team, a friendly reminder that invoice INV-0318 for AED 3,150 was due on 12 Oct. You can pay by bank transfer or card. Thank you!", "Sent on WhatsApp · 9:00 am ✓✓", true) + note("3 of 3 reminders sent. You see who paid tomorrow morning.") },
    estimate: { t: "Sizes in, a full estimate out", i: msg("Salam, I need a gypsum ceiling for 2 rooms: 4.5 × 4 m and 3.5 × 3 m. Price?", "WhatsApp · 6:40 pm"),
      d: ["Works out the area: 18 + 10.5 = 28.5 m²", "Uses your rate: AED 45 per m²", "Adds 5% VAT"],
      o: table(["Item", "m²", "AED"], [["Room 1 (4.5 × 4)", "18.0", "810.00"], ["Room 2 (3.5 × 3)", "10.5", "472.50"], ["VAT 5%", "", "64.13"], ["Total", "28.5", "1,346.63"]], 3) },
    report: { t: "Your week on one small chart", i: table(["Day", "Branch", "Sales"], [["Thu", "Mussafah", "AED 5,600"], ["Thu", "Khalidiya", "AED 3,800"], ["Wed", "Mussafah", "AED 3,500"]]) + `<p class="dnote">…and 40 more rows</p>`,
      d: ["Collects the numbers every evening", "Adds them up by day", "Sends you the chart on Sunday morning"],
      o: bars([["Sun", 5200], ["Mon", 4800], ["Tue", 6100], ["Wed", 5900], ["Thu", 9400]], "Week total AED 31,400, up 8% on last week. Thursday was your best day.") },
    docs: { t: "Every expiry date, with the days left", i: files([["PDF", "Trade licence"], ["Photo", "Visa · Ahmed"], ["PDF", "Delivery van insurance"]]),
      d: ["Reads the expiry dates", "Counts the days left", "Reminds you 90, 60 and 30 days before"],
      o: table(["Document", "Expires", "Days left"], [["Trade licence", "12 Nov 2026", pill("19", "r")], ["Visa · Ahmed", "5 Jan 2027", pill("73", "y")], ["Van insurance", "30 Jun 2027", pill("249", "g")]], 0) + note("Trade licence: reminder sent to you. Renew this week.") },
    time: { t: "Timesheets in, payroll hours out", i: doc("Timesheet · Site B · week 43", [["Ravi", "6 days, 52 h"], ["Imran", "6 days, 58 h"], ["Joseph", "5 days, 45 h"]]),
      d: ["Reads the hours from the photo", "Splits normal hours and overtime (over 48 a week)", "Fills the payroll sheet for your accountant"],
      o: table(["Name", "Normal", "Overtime", "Total"], [["Ravi", "48", "4", "52 h"], ["Imran", "48", "10", "58 h"], ["Joseph", "45", "0", "45 h"]]) + note("Ready for the salary (WPS) file.") },
    book: { t: "A booking made while you work", i: msg("Hi, can I book a haircut tomorrow after 5?", "WhatsApp · 11:20 am"),
      d: ["Checks your free slots", "Books 5:30 pm and confirms", "Sends a reminder the day before"],
      o: table(["Tomorrow", "Customer", "Service"], [["4:30 pm", "Layla", "Colour"], ["5:30 pm", "Mariam" + pill("New"), "Haircut"], ["6:30 pm", "Free", ""]], 1) },
    ask: { t: "A customer question answered at midnight", i: msg("Do you deliver to Mussafah? How much for 20 cartons of A4 paper?", "WhatsApp · 11:48 pm"),
      d: ["Says it is an automated assistant", "Answers from your real prices", "Passes the order to your team"],
      o: msg("Hello, this is the automated assistant of Star Office Supplies. Yes, we deliver to Mussafah the next day. 20 cartons are AED 1,050 including 5% VAT. Shall I pass your order to our team?", "Sent · 11:48 pm", true) + note("Your team gets: new order, 20 cartons, Mussafah.") },
    other: { t: "A messy message becomes a tidy task list", i: msg("pls send new price list to Ali, check stock of 10mm pipes, call back the Jumeirah villa client tmrw", "WhatsApp · 8:05 am"),
      d: ["Reads the message", "Splits it into separate tasks", "Gives each one a person and a day"],
      o: table(["Task", "Who", "When"], [["Send price list to Ali", "Sales", "Today"], ["Check stock: 10 mm pipes", "Store", "Today"], ["Call back Jumeirah villa client", "Sales", "Tomorrow"]]) },
  };
  D.calls = D.ask;
  let kind = "", seen = false, armed = true, timers = [];
  const play = () => {
    timers.forEach(clearTimeout); timers = [];
    const parts = [$(".s1", demoBox), ...$$("#dDo li"), $(".s3", demoBox)];
    parts.forEach((el) => el.classList.remove("on")); void demoBox.offsetWidth;
    parts.forEach((el, i) => { if (calm) el.classList.add("on"); else timers.push(setTimeout(() => el.classList.add("on"), 150 + i * 600)); });
  };
  const set = (k) => {
    if (!D[k]) k = "other";
    if (k === kind) return; kind = k; const d = D[k];
    $("#demoTitle").textContent = d.t; $("#dIn").innerHTML = d.i; $("#dOut").innerHTML = d.o;
    $("#dDo").innerHTML = d.d.map((t) => `<li>${t}</li>`).join("");
    armed = true; if (seen) { armed = false; play(); } // otherwise it plays when it scrolls into view
  };
  $("#demoPlay").addEventListener("click", play);
  const h = (location.hash.match(/^#demo=(\w+)$/) || [])[1];
  demoBox.hidden = false; set(h || "invoice");
  new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; if (seen && armed) { armed = false; play(); } }, { threshold: 0.25 }).observe($(".demo-card", demoBox));
  if (h) setTimeout(() => demoBox.scrollIntoView({ block: "start" }), 0);
  return set;
})() : () => {};

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

  // ready-made plans: used when the AI can't be reached. jobKind() is the one detector: the plan and the
  // example demo below both use it. Order matters (first match wins). Words in English, Arabic and Roman Urdu.
  const KINDS = [
    ["docs", /expir|renew|licen[cs]e|visa|emirates ?id|passport|insurance|document|permit|mulkiya|انتهاء|تجديد|رخص|تأشير|إقام|اقام|هوية|هويات|تأمين|وثائق|مستند/i],
    ["time", /timesheet|time sheet|attendance|overtime|payroll|salar|wps|shifts?\b|hours worked|hazri|tankh|كشوف الدوام|كشف الدوام|ساعات الدوام|حضور|إضافي|رواتب|راتب/i],
    ["compare", /compar|cheapest|(supplier|vendor)s?'? (quot|price|offer|rate)|best (price|rate|offer)|rfq|tender|three quotes|3 quotes|\blpo\b|purchase order|procure|مقارن|قارن|أرخص|ارخص|مناقص|عروض (أسعار )?الموردين|أمر شراء/i],
    ["estimate", /estimat|measur|\bmet(er|re)s?\b|sqm|sq\.? ?ft|\bm2\b|square|boq|calculat|take-?off|dimension|naap|مقاس|متر|أمتار|مساحة|احسب|نحسب|كمية|كميات|تقدير/i],
    ["quotes", /quot|price|pricing|cost|proposal|rate (card|list)|qeemat|keemat|سعر|أسعار|اسعار|عرض|تسعير/i],
    ["remind", /chas|follow|remind|unpaid|overdue|collect|payment|owe|paid|\bdue\b|debt|receivabl|udh(aa|a)r|دفع|يدفع|متأخر|تذكير|ملاحق|تحصيل|مستحق|ديون/i],
    ["report", /report|summar|dashboard|kpi|numbers|figures|تقرير|تقارير|ملخص|أرقام/i],
    ["invoice", /typ|enter|excel|sheet|data|copy|invoice|receipt|bill|record|entry|accounting|zoho|quickbooks|tally|bookkeep|expense|hisab|فاتور|فواتير|إكسل|اكسل|إدخال|بيانات|نسخ|إيصال|محاسب/i],
    ["report", /daily|weekly|monthly|sales|stock|مبيعات|مخزون|أسبوعي|يومي|شهري/i],
    ["book", /book|appoint|schedul|calendar|slot|reserv|حجز|موعد|مواعيد|جدول/i],
    ["calls", /call|phone|ring|miss|مكالم|اتصال|هاتف|تفوت/i],
    ["ask", /whatsapp|message|question|repl|answer|enquir|inquir|instagram|chat|\bdm\b|same|ask|sawal|واتساب|رسائل|أسئلة|نفس|إنستغرام|استفسار/i],
  ];
  const jobKind = (text) => (KINDS.find((k) => k[1].test(text)) || ["other"])[0];
  const P = AR ? {
    docs: ["تواريخ انتهاء لا تفوتك", "2 إلى 4 ساعات", [["يحفظ قائمة واحدة بوثائقك", "الرخصة التجارية والتأشيرات والهويات الإماراتية والتأمين والعقود، من ملفاتك أو صورها."], ["يحسب الأيام المتبقية", "ويذكّر الشخص المسؤول قبل 90 و60 و30 يوماً."], ["تجدّد في الوقت المناسب", "بلا غرامات ولا عجلة في آخر لحظة. ترى كل شيء في صفحة واحدة."]]],
    time: ["من كشوف الدوام إلى الرواتب بلا كتابة", "4 إلى 8 ساعات", [["تصل كشوف الدوام كالمعتاد", "صور ورقية أو ملف إكسل أو رسالة واتساب من كل موقع."], ["يجمع الذكاء الاصطناعي الساعات", "الساعات العادية والإضافية، حسب قواعدك أنت."], ["يستلم محاسبك جدولاً جاهزاً", "جاهزاً لملف الرواتب (WPS). وأي شيء غريب يُعلَّم للمراجعة."]]],
    compare: ["مقارنة أسعار الموردين عنك", "6 إلى 10 ساعات", [["تصل عروض أسعار الموردين", "PDF أو بريد أو صورة على واتساب، بأي شكل."], ["يضعها الذكاء الاصطناعي جنباً إلى جنب", "السعر والضريبة ومدة التسليم وشروط الدفع، في جدول واحد."], ["تختار وتطلب", "يُعلَّم الأرخص وأي صنف ناقص. وأمر الشراء بضغطة واحدة."]]],
    estimate: ["تقديرات تُحسب في ثوانٍ", "5 إلى 8 ساعات", [["يرسل العميل المقاسات أو الكميات", "الأمتار أو الغرف أو الوحدات أو رسماً، على واتساب أو البريد."], ["يقوم الذكاء الاصطناعي بالحساب", "المساحة في سعرك، والإضافات وضريبة 5%، من قائمة أسعارك أنت."], ["تراجعه وترسله", "تقدير مرتب بشعارك. والأعمال غير العادية تصلك أولاً."]]],
    quotes: ["عروض أسعار في ثوانٍ", "6 إلى 10 ساعات", [["يرسل العميل التفاصيل", "المقاسات أو الكميات أو الصور أو رسالة صوتية، على واتساب أو البريد."], ["يحسب الذكاء الاصطناعي السعر", "من قائمة أسعارك وقواعدك أنت، ثم يجهّز عرض سعر PDF بشعارك."], ["تراجعه وترسله", "بضغطة واحدة. وأي حالة غير عادية تصلك أولاً."]]],
    remind: ["متابعة لا تنسى أحداً", "3 إلى 6 ساعات", [["يعرف من لم يرد أو لم يدفع", "من فواتيرك أو ملف إكسل أو نظام الحسابات."], ["يرسل تذكيرات مهذبة في وقتها", "على واتساب أو البريد، بأسلوبك، وعلى فترات مناسبة."], ["ترى من دفع ومن لم يدفع", "قائمة قصيرة كل صباح. والحالات الصعبة تصلك أنت."]]],
    invoice: ["فواتير تُدخَل وحدها", "5 إلى 8 ساعات", [["تصل الفواتير كالمعتاد", "بالبريد أو صورة على واتساب أو PDF. لا شيء يتغير لمورديك."], ["يقرأها الذكاء الاصطناعي", "يستخرج التاريخ والمورد والأصناف والضريبة والإجمالي ويملأ ملفك أو نظامك."], ["فريقك يراجع فقط", "ما لا يكون متأكداً منه يُعلَّم لشخص ينظر فيه."]]],
    report: ["تقارير تُكتب وحدها", "2 إلى 4 ساعات", [["يجمع الأرقام", "من جداولك أو برنامج المبيعات أو البريد، كل يوم."], ["يكتب تقريراً قصيراً وواضحاً", "الإجماليات والتغيّرات وما يبدو غير صحيح، بكلمات بسيطة."], ["يصل إلى هاتفك", "كل صباح أو كل أحد، على واتساب أو البريد."]]],
    calls: ["كل مكالمة يُرد عليها", "كل مكالمة فائتة", [["يرد الذكاء الاصطناعي عندما لا تستطيع", "بعد الدوام أو في أوقات الضغط أو عندما يكون الخط مشغولاً."], ["يجيب ويأخذ التفاصيل", "الأسعار والمواعيد والحجوزات، بالعربية والإنجليزية."], ["تصلك ملاحظة قصيرة", "من اتصل، وماذا يريد، وما تم الاتفاق عليه."]]],
    ask: ["أسئلة يُرد عليها ليلاً ونهاراً", "1 إلى 3 ساعات يومياً", [["يسأل العميل سؤالاً", "عن الأسعار والمواعيد والموقع والتوفر، على أي تطبيق."], ["يرد الذكاء الاصطناعي خلال ثوانٍ", "من معلوماتك الحقيقية، وبلغة العميل."], ["العملاء الجادون يصلونك", "مع الاسم وما يحتاجونه، جاهزين للإغلاق."]]],
    book: ["حجوزات بلا أخذ ورد", "3 إلى 5 ساعات", [["يطلب العميل موعداً", "على واتساب أو الموقع أو بالهاتف."], ["يعرض الأوقات المتاحة ويحجز", "يتحقق من تقويمك ويرسل تذكيراً قبل يوم."], ["ترى يومك مسبقاً", "قائمة واضحة كل صباح."]]],
  } : {
    docs: ["Expiry dates that never slip", "2 to 4 hours", [["It keeps one list of your documents", "Trade licence, visas, Emirates IDs, insurance and contracts, from your files or photos."], ["It counts the days left", "And reminds the right person 90, 60 and 30 days before."], ["You renew on time", "No fines, no last-minute rush. You see everything on one page."]]],
    time: ["Timesheets to payroll, without the typing", "4 to 8 hours", [["Timesheets come in as usual", "Paper photos, Excel or a WhatsApp message from each site."], ["The AI adds up the hours", "Normal hours and overtime, using your own rules."], ["Your accountant gets a ready sheet", "Ready for the salary (WPS) file. Anything odd is marked for a check."]]],
    compare: ["Supplier prices compared for you", "6 to 10 hours", [["Supplier quotes arrive", "PDF, email or a WhatsApp photo, in any layout."], ["The AI puts them side by side", "Price, VAT, delivery time and payment terms, in one table."], ["You pick and order", "The cheapest and any missing items are marked. One tap to make the order."]]],
    estimate: ["Estimates worked out in seconds", "5 to 8 hours", [["The customer sends sizes or quantities", "Metres, rooms, units or a drawing, on WhatsApp or email."], ["The AI does the maths", "Size times your rate, extras and 5% VAT, from your own price list."], ["You check and send", "A neat estimate with your logo. Unusual jobs come to you first."]]],
    quotes: ["Quotes made in seconds", "6 to 10 hours", [["The customer sends the details", "Sizes, amounts, photos or a voice note, on WhatsApp or email."], ["The AI works out the price", "It uses your own price list and your rules, then makes a neat PDF quote with your logo."], ["You check and send", "One tap to send. Anything unusual comes to you first."]]],
    remind: ["Follow-ups that never forget", "3 to 6 hours", [["It knows who hasn't replied or paid", "From your invoices, Excel sheet or accounts system."], ["It sends polite reminders on time", "On WhatsApp or email, in your tone, at the right gaps."], ["You see who paid and who didn't", "A short list every morning. Hard cases come to you."]]],
    invoice: ["Invoices that type themselves", "5 to 8 hours", [["Invoices arrive as usual", "Email, WhatsApp photo or PDF. Nothing changes for your suppliers."], ["The AI reads them", "It picks out the date, supplier, items, VAT and total, and fills your Excel or system."], ["Your team only checks", "Anything it isn't sure about is marked for a person to look at."]]],
    report: ["Reports that write themselves", "2 to 4 hours", [["It collects the numbers", "From your sheets, sales app or emails, every day."], ["It writes a short, clear report", "Totals, changes and anything that looks wrong, in plain words."], ["It lands on your phone", "Every morning or every Sunday, on WhatsApp or email."]]],
    calls: ["Every call answered", "Every missed call", [["The AI picks up when you can't", "After hours, busy times or when the line is full."], ["It answers and takes the details", "Prices, timings, bookings, in English or Arabic."], ["You get a short note", "Who called, what they want, and what was agreed."]]],
    ask: ["Questions answered day and night", "1 to 3 hours a day", [["A customer asks a question", "Prices, timings, location, availability, on any app."], ["The AI answers in seconds", "From your real information, in their language."], ["Serious customers come to you", "With their name and what they need, ready to close."]]],
    book: ["Bookings without the back and forth", "3 to 5 hours", [["The customer asks for a time", "On WhatsApp, the website or by phone."], ["The AI offers free slots and books it", "It checks your calendar and sends a reminder the day before."], ["You see the day ahead", "A clean list every morning."]]],
  };
  const GEN = AR ? ["عملك، يُنجز بنفس الطريقة كل مرة", "ساعات كل أسبوع", [["نتعلم كيف يؤديه فريقك الآن", "خطوة بخطوة، من أمثلتك الحقيقية."], ["الذكاء الاصطناعي يؤدي الجزء المتكرر", "بنفس الطريقة كل مرة، ليلاً ونهاراً."], ["فريقك يراجع ويقرر فقط", "وأي شيء غير واضح يذهب إلى شخص."]]]
    : ["Your job, done the same way every time", "Hours every week", [["We learn how your team does it now", "Step by step, from your real examples."], ["The AI does the repeated part", "The same way every time, day or night."], ["Your team only checks and decides", "Anything unclear goes to a person."]]];
  const local = (text) => { const [title, hours, steps] = P[jobKind(text)] || GEN; return { title, hours, steps, lang: AR ? "ar" : "en" }; };

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
    setTimeout(() => { show(text, p, false); demoSet(jobKind(text)); }, Math.max(0, 600 - (Date.now() - t0)));
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

/* ---------- copy number ---------- */
const copy = $("#copy");
if (copy) copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("0589358857"); copy.textContent = T.copied; }
  catch { const r = document.createRange(); r.selectNodeContents($("#phone")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
});
})();
