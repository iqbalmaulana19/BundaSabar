const defaultFoods = [
  { id: 1, name: "Wortel", emoji: "🥕", count: 4, target: 12 },
  { id: 2, name: "Brokoli", emoji: "🥦", count: 7, target: 12 },
  { id: 3, name: "Ikan", emoji: "🐟", count: 2, target: 10 }
];

const defaultChains = [
  ["French Fries", "Kroket Kentang", "Wortel Kukus"],
  ["Nugget", "Ayam Panggang", "Ayam Kukus"]
];

const schedule = [
  { time: "07:00", name: "Sarapan", icon: "🍳" },
  { time: "10:00", name: "Camilan pagi", icon: "🍎" },
  { time: "12:00", name: "Makan siang", icon: "🍚" },
  { time: "15:00", name: "Camilan sore", icon: "🍌" },
  { time: "18:00", name: "Makan malam", icon: "🍲" }
];

let foods = JSON.parse(localStorage.getItem("bundasabar_foods")) || defaultFoods;
let chains = JSON.parse(localStorage.getItem("bundasabar_chains")) || defaultChains;

const pages = {
  dashboard: ["Dashboard", "Selamat datang, Bunda! 👋"],
  tracker: ["Exposure Tracker", "Catat perjalanan si kecil"],
  chaining: ["Food Chaining", "Bangun jembatan makanan"],
  rules: ["Feeding Rules", "Jadwal yang konsisten"]
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function saveData() {
  localStorage.setItem("bundasabar_foods", JSON.stringify(foods));
  localStorage.setItem("bundasabar_chains", JSON.stringify(chains));
}

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

$("#todayDate").textContent = formatDate();

function navigate(page) {
  $$(".page").forEach(el => el.classList.remove("active"));
  $(`#${page}`).classList.add("active");

  $$(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  $("#pageEyebrow").textContent = pages[page][0];
  $("#pageTitle").textContent = pages[page][1];

  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  renderAll();
}

$$(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.page));
});

$$("[data-page-link]").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.pageLink));
});

$("#mobileMenu").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

function renderDashboardFoods() {
  const container = $("#dashboardFoods");
  container.innerHTML = foods.slice(0, 4).map(food => {
    const percent = Math.min(100, Math.round((food.count / food.target) * 100));
    return `
      <div class="food-row">
        <div class="food-emoji">${food.emoji}</div>
        <div class="food-info">
          <strong>${food.name}</strong>
          <small>${percent >= 100 ? "Target tercapai 🎉" : "Masih dalam proses belajar"}</small>
          <div class="progress"><div style="width:${percent}%"></div></div>
        </div>
        <span class="food-count">${food.count}/${food.target}</span>
      </div>
    `;
  }).join("");

  $("#foodCount").textContent = foods.length;
  $("#weeklyCount").textContent = foods.reduce((sum, food) => sum + food.count, 0);
}

function renderSchedule(target) {
  target.innerHTML = schedule.map(item => `
    <div class="schedule-item">
      <span class="schedule-time">${item.time}</span>
      <span class="schedule-dot"></span>
      <strong>${item.icon} &nbsp;${item.name}</strong>
    </div>
  `).join("");
}

function renderTracker() {
  $("#trackerList").innerHTML = foods.map(food => {
    const percent = Math.min(100, Math.round((food.count / food.target) * 100));
    return `
      <article class="tracker-card">
        <div class="tracker-card-head">
          <div class="tracker-food">
            <div class="food-emoji">${food.emoji}</div>
            <div>
              <strong>${food.name}</strong>
              <small>${percent >= 100 ? "Target paparan tercapai" : "Sedang diperkenalkan"}</small>
            </div>
          </div>
          <span class="percent">${percent}%</span>
        </div>
        <div class="progress tracker-progress"><div style="width:${percent}%"></div></div>
        <div class="tracker-actions">
          <small>Percobaan ke-${food.count} dari ${food.target}</small>
          <div class="tracker-action-buttons">
            <button class="remove-attempt-btn" data-remove-attempt="${food.id}" ${food.count === 0 ? "disabled" : ""}>− Hapus percobaan</button>
            <button class="add-btn" data-food-id="${food.id}">+ Catat percobaan</button>
            <button class="delete-food-btn" data-delete-food="${food.id}">Hapus makanan</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $$(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const food = foods.find(item => item.id === Number(btn.dataset.foodId));
      if (!food) return;
      if (food.count < food.target) food.count++;
      saveData();
      renderAll();
    });
  });

  $$("[data-remove-attempt]").forEach(btn => {
    btn.addEventListener("click", () => {
      const food = foods.find(item => item.id === Number(btn.dataset.removeAttempt));
      if (!food || food.count <= 0) return;
      food.count--;
      saveData();
      renderAll();
    });
  });

  $$("[data-delete-food]").forEach(btn => {
    btn.addEventListener("click", () => {
      const foodId = Number(btn.dataset.deleteFood);
      const food = foods.find(item => item.id === foodId);
      if (!food) return;

      const confirmed = confirm(`Hapus makanan "${food.name}" beserta seluruh catatan percobaannya?`);
      if (!confirmed) return;

      foods = foods.filter(item => item.id !== foodId);
      saveData();
      renderAll();
    });
  });
}

function renderChains() {
  $("#chainList").innerHTML = chains.map((chain, index) => `
    <div class="custom-chain">
      <div class="custom-chain-step"><small>LANGKAH 1</small><strong>🍽️ ${chain[0]}</strong></div>
      <span class="arrow">→</span>
      <div class="custom-chain-step"><small>LANGKAH 2</small><strong>🥣 ${chain[1]}</strong></div>
      <span class="arrow">→</span>
      <div class="custom-chain-step"><small>TARGET</small><strong>🥕 ${chain[2]}</strong></div>
      <button class="icon-btn" title="Hapus" data-delete-chain="${index}">×</button>
    </div>
  `).join("");

  $$("[data-delete-chain]").forEach(btn => {
    btn.addEventListener("click", () => {
      chains.splice(Number(btn.dataset.deleteChain), 1);
      saveData();
      renderChains();
    });
  });
}

function renderAll() {
  renderDashboardFoods();
  renderSchedule($("#dashboardSchedule"));
  renderTracker();
  renderChains();
  renderSchedule($("#fullSchedule"));
}

function openModal(id) {
  $(`#${id}`).classList.add("open");
}

function closeModal(id) {
  $(`#${id}`).classList.remove("open");
}

$$("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

$$(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });
});

$("#panicHero").addEventListener("click", () => {
  openModal("panicModal");
  resetPanic();
});

$("#addFoodBtn").addEventListener("click", () => {
  $("#foodForm").reset();
  $("#foodEmoji").value = "🥦";
  openModal("foodModal");
});

$("#foodForm").addEventListener("submit", (e) => {
  e.preventDefault();

  foods.push({
    id: Date.now(),
    name: $("#foodName").value.trim(),
    emoji: $("#foodEmoji").value.trim() || "🍽️",
    count: 0,
    target: Number($("#foodTarget").value)
  });

  saveData();
  closeModal("foodModal");
  renderAll();
});

$("#addChainBtn").addEventListener("click", () => openModal("chainModal"));

$("#chainForm").addEventListener("submit", (e) => {
  e.preventDefault();

  chains.push([
    $("#chainStart").value.trim(),
    $("#chainMiddle").value.trim(),
    $("#chainTarget").value.trim()
  ]);

  saveData();
  closeModal("chainModal");
  $("#chainForm").reset();
  renderChains();
});

$("#addScheduleBtn").addEventListener("click", () => {
  alert("Pada versi MVP ini jadwal mengikuti pola 3× makan utama + 2× camilan dari rancangan BundaSabar.");
});

/* PANIC BUTTON */
let panicStep = 0;
let timer = 300;
let timerInterval = null;

const panicSteps = $$(".panic-step");

function updatePanic() {
  panicSteps.forEach((step, index) => {
    step.classList.toggle("active", index === panicStep);
    step.classList.toggle("done", index < panicStep);
  });

  $("#prevStep").disabled = panicStep === 0;
  $("#nextStep").textContent = panicStep === panicSteps.length - 1 ? "Selesai ✓" : "Langkah berikutnya →";
}

function updateTimer() {
  const min = String(Math.floor(timer / 60)).padStart(2, "0");
  const sec = String(timer % 60).padStart(2, "0");
  $("#timerDisplay").textContent = `${min}:${sec}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 300;
  updateTimer();

  timerInterval = setInterval(() => {
    if (timer <= 0) {
      clearInterval(timerInterval);
      return;
    }
    timer--;
    updateTimer();
  }, 1000);
}

function resetPanic() {
  clearInterval(timerInterval);
  panicStep = 0;
  updatePanic();
  startTimer();
}

$("#nextStep").addEventListener("click", () => {
  if (panicStep < panicSteps.length - 1) {
    panicStep++;
    updatePanic();
  } else {
    clearInterval(timerInterval);
    closeModal("panicModal");
    alert("Bagus, Bunda. Tetap tenang dan coba lagi pada kesempatan berikutnya. ❤️");
  }
});

$("#prevStep").addEventListener("click", () => {
  if (panicStep > 0) {
    panicStep--;
    updatePanic();
  }
});

renderAll();
