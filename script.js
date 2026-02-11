const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const state = {
  name: "",
  message: "",
  date: "",
};

function setActiveView(id) {
  qsa(".view").forEach(v => v.classList.remove("active"));
  qs(`#${id}`).classList.add("active");
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function createHearts(count = 28) {
  const container = qs("#hearts");
  const palette = ["#ff4d88", "#ff6fa6", "#ff85b3", "#ff3f7d", "#ff9ec2"];
  for (let i = 0; i < count; i++) {
    const h = document.createElement("div");
    h.className = "heart";
    const left = Math.random() * 100;
    const delay = Math.random() * 6;
    const duration = 8 + Math.random() * 8;
    const size = 12 + Math.random() * 16;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const opacity = 0.55 + Math.random() * 0.45;
    h.style.setProperty("--left", `${left}%`);
    h.style.setProperty("--delay", `${delay}s`);
    h.style.setProperty("--duration", `${duration}s`);
    h.style.setProperty("--size", `${size}px`);
    h.style.setProperty("--color", color);
    h.style.setProperty("--opacity", opacity.toFixed(2));
    container.appendChild(h);
  }
}

function toViewMode(params) {
  const encoded = params.get("data");
  if (!encoded) return;
  try {
    const decoded = atob(encoded);
    const { name, message, date } = JSON.parse(decoded);
    qs("#view-name").textContent = name || "";
    qs("#view-date").textContent = formatDate(date || "");
    qs("#view-message").textContent = message || "";
    setActiveView("message-view");
  } catch (e) {
    // Invalid base64 or JSON, remain on the form view
  }
}

function toConfirm() {
  const name = qs("#senderName").value.trim();
  const message = qs("#message").value.trim();
  const date = qs("#date").value;
  if (!name || !message || !date) {
    return;
  }
  state.name = name;
  state.message = message;
  state.date = date;
  qs("#confirm-name").textContent = name;
  qs("#confirm-date").textContent = formatDate(date);
  qs("#confirm-message").textContent = message;
  qs("#share").classList.add("hidden");
  setActiveView("confirm-view");
}

function toEdit() {
  qs("#senderName").value = state.name;
  qs("#message").value = state.message;
  qs("#date").value = state.date;
  setActiveView("form-view");
}

function generateLink() {
  const data = { name: state.name, message: state.message, date: state.date };
  const encoded = btoa(JSON.stringify(data));
  const url = new URL("index.html", location.href);
  url.searchParams.set("data", encoded);
  const href = url.toString();
  qs("#share-url").value = href;
  qs("#open-link").setAttribute("href", href);
  qs("#share").classList.remove("hidden");
}

async function copyLink() {
  const val = qs("#share-url").value;
  try {
    await navigator.clipboard.writeText(val);
  } catch (e) {
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createHearts(32);
  const params = new URLSearchParams(location.search);
  if (params.has("data")) {
    toViewMode(params);
  } else {
    setActiveView("form-view");
  }
  qs("#to-confirm").addEventListener("click", toConfirm);
  qs("#edit").addEventListener("click", toEdit);
  qs("#confirm").addEventListener("click", generateLink);
  qs("#copy").addEventListener("click", copyLink);
});
