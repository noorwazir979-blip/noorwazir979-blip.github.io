// Spekly page: language switch, the mic example, early-access form.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const RTL = { ar: true, ur: true };
const SP = {
  en: { slogan: "Speak it. We'll handle the rest.", said: "Sold 2 tyres for 400, customer paid 200 cash" },
  ar: { slogan: "تكلّم، ونحن نتولى الباقي.", said: "بعت إطارين بـ 400، الزبون دفع 200 كاش" },
  hi: { slogan: "बोलिए, बाकी हम संभाल लेंगे।", said: "2 टायर 400 में बेचे, ग्राहक ने 200 कैश दिए" },
  ur: { slogan: "بولیں، باقی ہم سنبھال لیں گے۔", said: "2 ٹائر 400 میں بیچے، گاہک نے 200 کیش دیے" },
};
function liquid(el, onChange) {
  const blob = $(".blob", el), btns = $$("button", el);
  const place = () => { const b = btns.find((x) => x.getAttribute("aria-pressed") === "true") || btns[0]; blob.style.left = b.offsetLeft + "px"; blob.style.width = b.offsetWidth + "px"; };
  btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => x.setAttribute("aria-pressed", x === b)); place(); onChange(b.dataset.v); }));
  addEventListener("resize", place); document.fonts && document.fonts.ready.then(place); place();
}
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
$("#early-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, msg = $("#early-msg"), btn = $("button[type=submit]", f), data = Object.fromEntries(new FormData(f));
  btn.disabled = true; btn.textContent = "Sending…";
  const wa = `https://wa.me/971589358857?text=${encodeURIComponent("Hi Noor, I'd like Spekly early access. Business: " + (data.business || "") + ", " + (data.volume || "") + " invoices a month.")}`;
  try {
    const r = await fetch("https://formsubmit.co/ajax/imnoorzamn@gmail.com", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ _subject: "Spekly early access", _template: "table", _captcha: "false", ...data }) });
    if (!r.ok) throw 0;
    f.reset(); msg.innerHTML = '<span class="ok">You\'re on the list. Noor will message you on WhatsApp.</span>';
  } catch (x) { msg.innerHTML = `It didn't send. Please <a href="${wa}" target="_blank" rel="noopener">message Noor on WhatsApp</a> instead.`; }
  btn.disabled = false; btn.textContent = "Request early access";
});
$$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
