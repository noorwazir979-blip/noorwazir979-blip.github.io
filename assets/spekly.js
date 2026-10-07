// Spekly intro page: language switch, the voice example building an invoice, the "help me set it up" form.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SP = {
  en: { slogan: "Speak it.<br><span>We'll handle the rest.</span>", said: "Sold 2 tyres for 400, customer paid 200 cash" },
  ar: { slogan: "تكلّم،<br><span>ونحن نتولى الباقي.</span>", said: "بعت إطارين بـ 400، الزبون دفع 200 كاش" },
  ur: { slogan: "بولیں،<br><span>باقی ہم سنبھال لیں گے۔</span>", said: "2 ٹائر 400 میں بیچے، گاہک نے 200 کیش دیے" },
  hi: { slogan: "बोलिए,<br><span>बाकी हम संभाल लेंगे।</span>", said: "2 टायर 400 में बेचे, ग्राहक ने 200 कैश दिए" },
};
let lang = "en", run = 0;
async function speak() {
  const id = ++run, said = $("#said"), mic = $("#mic"), parts = $$("#inv .l, #inv .tot, #inv .owes");
  parts.forEach((p) => p.classList.remove("show"));
  said.dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr"; said.className = "said " + lang; mic.classList.add("on");
  const t = SP[lang].said;
  for (let i = 0; i <= t.length; i++) { if (id !== run) return; said.textContent = "“" + t.slice(0, i); await wait(reduce ? 0 : 38); }
  said.textContent = "“" + t + "”"; mic.classList.remove("on");
  for (const p of parts) { if (id !== run) return; await wait(reduce ? 0 : 300); p.classList.add("show"); }
}
$$("#lang button").forEach((b) => b.addEventListener("click", () => {
  $$("#lang button").forEach((x) => x.setAttribute("aria-pressed", x === b)); lang = b.dataset.v;
  const s = $("#slogan"); s.innerHTML = SP[lang].slogan; s.dir = lang === "ar" || lang === "ur" ? "rtl" : "ltr"; s.className = lang === "ur" || lang === "hi" ? lang : "";
  speak();
}));
$("#mic").addEventListener("click", speak);
new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { speak(); o.disconnect(); } }, { threshold: .4 }).observe($("#inv"));
$("#early-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, msg = $("#early-msg"), btn = $("button[type=submit]", f), data = Object.fromEntries(new FormData(f));
  btn.disabled = true; btn.textContent = "Sending…";
  const wa = `https://wa.me/971589358857?text=${encodeURIComponent("Hi Noor, I'd like help setting up Spekly. Name: " + (data.name || "") + ". Business: " + (data.business || ""))}`;
  try {
    const r = await fetch("https://formsubmit.co/ajax/imnoorzamn@gmail.com", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: "Spekly: help setting up", _template: "table", _captcha: "false", ...data }) });
    if (!r.ok) throw 0; f.reset(); msg.innerHTML = '<span class="ok">Sent ✓ Noor will message you on WhatsApp.</span>';
  } catch (x) { msg.innerHTML = `It didn't send. Please <a href="${wa}" target="_blank" rel="noopener">message Noor on WhatsApp</a> instead.`; }
  btn.disabled = false; btn.textContent = "Message me";
});
