const sessionList = document.getElementById("session-list");
const sessionCount = document.getElementById("session-count");
const detail = document.getElementById("detail");
let activeId = null;

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / 86400000);

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit",
  });

  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Yesterday at ${time}`;
  if (days < 7) {
    const day = d.toLocaleDateString(undefined, { weekday: "long" });
    return `${day} at ${time}`;
  }
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  }) + ` at ${time}`;
}

function selectSession(id) {
  if (activeId === id) return;
  activeId = id;

  document.querySelectorAll(".session-item").forEach(el => {
    el.classList.toggle("active", el.dataset.id === id);
  });

  detail.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = `/api/sessions/${id}`;
  detail.appendChild(iframe);
}

async function loadSessions() {
  const res = await fetch("/api/sessions");
  const sessions = await res.json();

  sessionCount.textContent = `${sessions.length} reviews`;
  sessionList.innerHTML = "";

  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];
    const li = document.createElement("li");
    li.className = "session-item";
    li.dataset.id = s.id;
    li.style.animationDelay = `${Math.min(i * 30, 600)}ms`;
    li.innerHTML = `
      <div class="session-date">${formatDate(s.timestamp)}</div>
      <div class="session-repo">${s.repo || "untitled"}</div>
      <div class="session-snippet">${s.snippet || ""}</div>
    `;
    li.addEventListener("click", () => selectSession(s.id));
    sessionList.appendChild(li);
  }

  if (sessions.length > 0) {
    selectSession(sessions[0].id);
  }
}

loadSessions();
