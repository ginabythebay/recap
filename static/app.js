const sessionList = document.getElementById("session-list");
const detail = document.getElementById("detail");
let activeId = null;

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
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

  sessionList.innerHTML = "";
  for (const s of sessions) {
    const li = document.createElement("li");
    li.className = "session-item";
    li.dataset.id = s.id;
    li.innerHTML = `
      <div class="session-date">${formatDate(s.timestamp)}</div>
      <div class="session-repo">${s.repo || "unknown"}</div>
      <div class="session-snippet">${s.snippet || ""}</div>
    `;
    li.addEventListener("click", () => selectSession(s.id));
    sessionList.appendChild(li);
  }
}

loadSessions();
