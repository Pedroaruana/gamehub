/* ── Toast notifications ──────────────────── */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .gh-toast {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(16px);
      background: #1e293b;
      color: #f1f5f9;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.25s, transform 0.25s;
      border-left: 4px solid #64748b;
      max-width: 90vw;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
      pointer-events: none;
    }
    .gh-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .gh-toast.error   { border-left-color: #ef4444; }
    .gh-toast.success { border-left-color: #22c55e; }
    .gh-toast.warning { border-left-color: #f59e0b; }
    .gh-toast.info    { border-left-color: #3b82f6; }
  `;
  document.head.appendChild(style);
})();

function showToast(msg, type = "info") {
  const prev = document.getElementById("gh-toast");
  if (prev) prev.remove();

  const toast = document.createElement("div");
  toast.id = "gh-toast";
  toast.className = `gh-toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.showToast = showToast;
