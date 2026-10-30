document.addEventListener("DOMContentLoaded", () => {
  // Check if data is loaded
  if (typeof TRIP_DATA === "undefined") {
    console.error("TRIP_DATA is not defined. Please load data.js before app.js.");
    // Show a user-visible error so the problem is diagnosable on mobile
    document.body.innerHTML = `
      <div style="
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 100vh; background: #0b0f19; color: #f3f4f6;
        font-family: 'Inter', sans-serif; text-align: center; padding: 2rem; gap: 1.5rem;
      ">
        <div style="font-size: 3rem;">⚠️</div>
        <h2 style="font-size: 1.4rem; font-family: 'Outfit', sans-serif; color: #ef4444;">Error al cargar los datos del viaje</h2>
        <p style="color: #9ca3af; max-width: 340px; line-height: 1.6; font-size: 0.95rem;">
          La aplicación tiene una versión antigua en caché. Pulsa el botón para recargar y obtener la versión más reciente.
        </p>
        <button onclick="
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
          }
          if ('caches' in window) {
            caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
          }
          setTimeout(() => location.reload(true), 500);
        " style="
          background: #1a9c5f; color: white; border: none; border-radius: 10px;
          padding: 0.85rem 2rem; font-size: 1rem; font-weight: 700; cursor: pointer;
          font-family: 'Outfit', sans-serif; box-shadow: 0 4px 20px rgba(26,156,95,0.4);
        ">🔄 Recargar App</button>
        <p style="font-size: 0.75rem; color: #6b7280;">Si el problema persiste, abre la app en Chrome y ve a Ajustes → Borrar datos del sitio.</p>
      </div>
    `;
    return;
  }

  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const menuToggle = document.getElementById("menuToggle");
  const themeToggle = document.getElementById("themeToggle");
  const mainSectionTitle = document.getElementById("mainSectionTitle");
  
  // Navigation
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".content-section");

  // Home Shortcuts
  const btnStartItinerary = document.getElementById("btnStartItinerary");
  const btnGoToLogistics = document.getElementById("btnGoToLogistics");

  // Itinerary Section
  const daySelectorBar = document.getElementById("daySelectorBar");
  const dayDetailContainer = document.getElementById("dayDetailContainer");

  // Gastronomy Section
  const gastronomyGrid = document.getElementById("gastronomyGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Souvenirs Section
  const souvenirsGrid = document.getElementById("souvenirsGrid");

  // Logistics Section
  const bookingsTableBody = document.getElementById("bookingsTableBody");
  const drivingRulesList = document.getElementById("drivingRulesList");
  const bookingProgressFill = document.getElementById("bookingProgressFill");
  const bookingProgressText = document.getElementById("bookingProgressText");

  // Recommended Apps Section
  const appsGrid = document.getElementById("appsGrid");

  const STORAGE_PREFIX = "paisvasco-"; // Shared origin with the other trip apps
  let activeDayNum = 1;
  let globalCachedWeatherData = {};
  let lastWeatherFetchTime = null;

  function getWeatherCodeInfo(code) {
    if (code === 0) return { icon: "☀️", text: "Soleado" };
    if ([1, 2].includes(code)) return { icon: "🌤️", text: "Parcialmente nublado" };
    if (code === 3) return { icon: "⛅", text: "Nublado" };
    if ([45, 48].includes(code)) return { icon: "🌫️", text: "Niebla" };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: "🌦️", text: "Llovizna" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "🌧️", text: "Lluvia" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "🌨️", text: "Nieve" };
    if ([95, 96, 99].includes(code)) return { icon: "⛈️", text: "Tormenta" };
    return { icon: "🌤️", text: "Variable" };
  }

  async function fetchGlobalWeatherData() {
    const weatherLastUpdatedText = document.getElementById("weatherLastUpdatedText");
    if (weatherLastUpdatedText) {
      weatherLastUpdatedText.textContent = "Obteniendo datos meteorológicos en tiempo real...";
    }

    let fetchedCount = 0;
    await Promise.all(
      TRIP_DATA.weatherDestinations.map(async (dest) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=Europe%2FMadrid`;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            globalCachedWeatherData[dest.id] = data.daily;
            fetchedCount++;
            return;
          } catch (err) {
            console.warn(`Weather fetch failed for ${dest.name} (attempt ${attempt})`, err);
          }
        }
      })
    );

    if (fetchedCount > 0) {
      lastWeatherFetchTime = new Date();
    }
    if (weatherLastUpdatedText) {
      weatherLastUpdatedText.textContent = fetchedCount > 0
        ? `Última actualización: hoy a las ${formatWeatherTime()} · Próximo auto-refresco en 30 min`
        : "Sin conexión: no se ha podido actualizar la previsión";
    }

    // Refresh weather section if open
    if (typeof window._refreshWeatherSection === "function") {
      window._refreshWeatherSection();
    }

    // Re-render currently active stage weather if rendered
    const activeDay = TRIP_DATA.days.find(d => d.dayNum === activeDayNum);
    if (activeDay) {
      const activeStageWeatherCard = document.getElementById(`stageWeatherCard-${activeDay.dayNum}`);
      if (activeStageWeatherCard) {
        activeStageWeatherCard.outerHTML = renderStageWeatherHTML(activeDay);
        bindStageWeatherRefresh(activeDay.dayNum);
      }
      const activeStagePills = document.getElementById(`stageWeatherPills-${activeDay.dayNum}`);
      if (activeStagePills) {
        activeStagePills.innerHTML = renderWeatherPillsHTML(activeDay);
      }
    }
  }

  function formatWeatherTime() {
    return lastWeatherFetchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function bindStageWeatherRefresh(dayNum) {
    const stageRefreshBtn = document.getElementById(`btnRefreshStageWeather-${dayNum}`);
    if (stageRefreshBtn) {
      stageRefreshBtn.addEventListener("click", async () => {
        stageRefreshBtn.innerHTML = "⌛ Actualizando...";
        await fetchGlobalWeatherData();
      });
    }
  }

  function renderForecastDaysHTML(dest) {
    const liveDaily = globalCachedWeatherData[dest.id];
    if (!liveDaily || !liveDaily.time || liveDaily.time.length < 3) {
      return `<div class="forecast-empty">Previsión no disponible. Comprobad la conexión y pulsad «Actualizar».</div>`;
    }

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    let daysHTML = "";
    for (let i = 0; i < 3; i++) {
      const dateObj = new Date(liveDaily.time[i]);
      const dayLabel = i === 0 ? "Hoy" : i === 1 ? "Mañana" : `${dayNames[dateObj.getDay()]} ${dateObj.getDate()}`;
      const info = getWeatherCodeInfo(liveDaily.weathercode[i]);
      const tMax = Math.round(liveDaily.temperature_2m_max[i]);
      const tMin = Math.round(liveDaily.temperature_2m_min[i]);
      const rain = (liveDaily.precipitation_sum[i] || 0).toFixed(1);
      const wind = Math.round(liveDaily.windspeed_10m_max[i] || 0);

      daysHTML += `
        <div style="background: rgba(var(--primary-rgb), 0.06); padding: 0.5rem 0.35rem; border-radius: 8px; text-align: center; border: 1px solid var(--border-card); flex: 1;">
          <div style="font-size: 0.7rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 0.15rem;">${dayLabel}</div>
          <div style="font-size: 1.4rem; line-height: 1.1; margin: 0.15rem 0;">${info.icon}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); line-height: 1.15; height: 1.9rem; display: flex; align-items: center; justify-content: center; margin-bottom: 0.15rem;">${info.text}</div>
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.1rem;">${tMax}° <span style="font-size:0.7rem; font-weight:400; color:var(--text-muted);">${tMin}°</span></div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">🌧️ ${rain} mm</div>
          <div style="font-size: 0.65rem; color: var(--text-muted);">💨 ${wind} km/h</div>
        </div>
      `;
    }
    return daysHTML;
  }

  function renderWeatherPillsHTML(day) {
    const destIds = day.weatherDestinationIds || ["bilbao"];
    const dests = TRIP_DATA.weatherDestinations.filter(d => destIds.includes(d.id));
    return dests.map(dest => {
      const live = globalCachedWeatherData[dest.id];
      if (live && live.temperature_2m_max && live.temperature_2m_max.length > 0) {
        const info = getWeatherCodeInfo(live.weathercode[0]);
        const tMax = Math.round(live.temperature_2m_max[0]);
        const tMin = Math.round(live.temperature_2m_min[0]);
        const rain = (live.precipitation_sum[0] || 0).toFixed(1);
        return `<span class="weather-pill">${info.icon} <strong>${dest.name}</strong>: ${tMax}°/${tMin}° <span style="color:var(--text-muted);">(${rain}mm)</span></span>`;
      }
      return `<span class="weather-pill"><strong>${dest.name}</strong>: <span style="color:var(--text-muted);">sin datos</span></span>`;
    }).join(" ");
  }

  function renderStageWeatherHTML(day) {
    const destIds = day.weatherDestinationIds || ["bilbao"];
    const dests = TRIP_DATA.weatherDestinations.filter(d => destIds.includes(d.id));
    if (dests.length === 0) return "";

    const destCardsHTML = dests.map(dest => `
        <div class="stage-weather-dest" style="border-radius: 10px; border: 1px solid var(--border-card); padding: 0.75rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.2rem;">
            <span style="font-weight: 700; font-size: 0.9rem; color: var(--primary); font-family: 'Outfit', sans-serif;">📍 ${dest.name}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${dest.region}</span>
          </div>
          <div style="display: flex; gap: 0.4rem; justify-content: space-between; margin-bottom: 0.6rem;">
            ${renderForecastDaysHTML(dest)}
          </div>
          <div style="background: rgba(var(--accent-rgb), 0.08); padding: 0.5rem 0.65rem; border-radius: 6px; border-left: 3px solid var(--accent); font-size: 0.78rem; color: var(--text-main); line-height: 1.35;">
            <strong>💡 Ropa sugerida:</strong> ${dest.clothingTip}
          </div>
        </div>
      `).join("");

    const updatedHTML = lastWeatherFetchTime
      ? `Actualización: ${formatWeatherTime()} · Open-Meteo`
      : "Open-Meteo · sin datos todavía";

    return `
      <div class="card card-glass stage-weather-card" id="stageWeatherCard-${day.dayNum}" style="border-left: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.4rem;">
          <div>
            <h3 class="card-title" style="margin: 0; font-size: 1.1rem;">🌤️ Previsión para los próximos días</h3>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${updatedHTML}</span>
          </div>
          <button id="btnRefreshStageWeather-${day.dayNum}" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem;" title="Actualizar previsión meteorológica">
            <span>🔄</span> <span>Actualizar</span>
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${destCardsHTML}
        </div>
      </div>
    `;
  }

  // Initialize
  initApp();

  function initApp() {
    setupNavigation();
    setupTheme();
    setupCountdown();
    setupItinerary();
    setupGastronomy("all");
    setupSouvenirs();
    setupLogistics();
    setupApps();
    setupQuickLinks();
    setupPhotoCredits();
    setupAccommodations();
    setupWeather();
    setupTranslator();
    setupGlobalSearch();
    updateBookingProgress();
    renderFixedSchedules();
  }

  /* --- SETUP NAVIGATION --- */
  function setupNavigation() {
    // Menu toggle for mobile
    menuToggle.addEventListener("click", () => {
      document.body.classList.toggle("sidebar-open");
    });

    sidebarOverlay.addEventListener("click", () => {
      document.body.classList.remove("sidebar-open");
    });

    // Sidebar navigation buttons
    navBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetSection = btn.getAttribute("data-section");
        switchSection(targetSection);
        document.body.classList.remove("sidebar-open");
      });
    });

    // Shortcut buttons on Home Screen
    btnStartItinerary.addEventListener("click", () => {
      switchSection("itinerary");
    });

    btnGoToLogistics.addEventListener("click", () => {
      switchSection("logistics");
    });
  }

  function switchSection(sectionId) {
    // Update active nav button
    navBtns.forEach(btn => {
      if (btn.getAttribute("data-section") === sectionId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update visible section
    sections.forEach(section => {
      if (section.id === `section-${sectionId}`) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });

    // Update Top Bar Title
    const activeNav = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (activeNav) {
      mainSectionTitle.textContent = activeNav.querySelector(".nav-label").textContent;
    }
    
    // Scroll content to top
    window.scrollTo(0, 0);
    document.querySelector(".content-body").scrollTop = 0;
  }

  /* --- SETUP THEME --- */
  function setupTheme() {
    // Load persisted theme
    const savedTheme = localStorage.getItem(`${STORAGE_PREFIX}theme`) || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
      themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", () => {
      if (themeToggle.checked) {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
        localStorage.setItem(`${STORAGE_PREFIX}theme`, "light");
      } else {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        localStorage.setItem(`${STORAGE_PREFIX}theme`, "dark");
      }
    });
  }

  /* --- SETUP COUNTDOWN --- */
  function setupCountdown() {
    const targetDate = new Date(TRIP_DATA.tripInfo.departure).getTime();
    
    function updateTimer() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        document.getElementById("cd-days").textContent = "00";
        document.getElementById("cd-hours").textContent = "00";
        document.getElementById("cd-mins").textContent = "00";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      document.getElementById("cd-days").textContent = String(days).padStart(2, "0");
      document.getElementById("cd-hours").textContent = String(hours).padStart(2, "0");
      document.getElementById("cd-mins").textContent = String(mins).padStart(2, "0");
    }

    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute
  }

  /* --- SETUP ITINERARY --- */

  function setupItinerary() {
    daySelectorBar.innerHTML = "";
    
    // Generate Day Buttons
    TRIP_DATA.days.forEach(day => {
      const btn = document.createElement("button");
      btn.className = `day-btn ${day.dayNum === activeDayNum ? "active" : ""}`;
      btn.textContent = `Día ${day.dayNum} · ${day.shortDate}`;
      btn.setAttribute("data-day", day.dayNum);
      btn.addEventListener("click", () => {
        // Toggle Day Button
        document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // Render Day details
        activeDayNum = day.dayNum;
        renderDayDetails(day);
      });
      daySelectorBar.appendChild(btn);
    });

    // Render initial active day
    const defaultDay = TRIP_DATA.days.find(d => d.dayNum === activeDayNum) || TRIP_DATA.days[0];
    renderDayDetails(defaultDay);
  }

  function renderDayDetails(day) {
    // Build Tramos Timeline Card (formatted in line with schedule timeline format)
    let tramosTimelineItems = "";
    if (day.travelTimes && day.travelTimes.length > 0) {
      const totalLegs = day.travelTimes.length;
      day.travelTimes.forEach((t, idx) => {
        const fromUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.from)}`;
        const toUrl = t.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.to)}`;
        const mapsBadge = t.mapsUrl ? ` <a href="${t.mapsUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-primary" style="margin-left:0.4rem; text-decoration:none; font-size:0.75rem;">🗺️ Ruta Directa ↗</a>` : "";
        
        const modeIcon = t.icon || "🚗";
        let legBadge = "";
        let dotStyle = "";
        if (idx === 0) {
          legBadge = `🚩 PUNTO INICIAL · ${modeIcon}`;
          dotStyle = `style="border-color:#2ecc71; background-color:rgba(46,204,113,0.3);"`;
        } else if (idx === totalLegs - 1) {
          legBadge = `🏁 TRAMO FINAL · ${modeIcon}`;
          dotStyle = `style="border-color:#e74c3c; background-color:rgba(231,76,60,0.3);"`;
        } else {
          legBadge = `${modeIcon} TRAMO ${idx + 1}`;
        }

        tramosTimelineItems += `
          <div class="timeline-item">
            <div class="timeline-dot" ${dotStyle}></div>
            <div class="timeline-time" style="display:flex; flex-wrap:wrap; align-items:baseline; gap:0.15rem 0.3rem;">${legBadge} <span style="color:var(--text-muted); font-size:0.85rem; font-weight:normal;">· ${t.desc}</span></div>
            <div class="timeline-content" style="word-break:break-word; overflow-wrap:anywhere;">
              De <a href="${fromUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline;"><strong>${t.from} ↗</strong></a> a <a href="${toUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline;"><strong>${t.to} ↗</strong></a>${mapsBadge}
            </div>
          </div>
        `;
      });
    }

    if (day.travelTimes2 && day.travelTimes2.length > 0) {
      const totalLegs2 = day.travelTimes2.length;
      tramosTimelineItems += `
        <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; margin: 1.25rem 0 0.75rem -0.5rem; border-top: 1px dashed rgba(var(--accent-rgb), 0.3); padding-top: 0.75rem;">${day.travelTimes2Label}</div>
      `;
      day.travelTimes2.forEach((t, idx) => {
        const fromUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.from)}`;
        const toUrl = t.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.to)}`;
        const mapsBadge = t.mapsUrl ? ` <a href="${t.mapsUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-primary" style="margin-left:0.4rem; text-decoration:none; font-size:0.75rem;">🗺️ Ruta Directa ↗</a>` : "";
        const modeIcon = t.icon || "🚗";
        const legBadge = idx === 0 ? `🚩 INICIO · ${modeIcon}` : (idx === totalLegs2 - 1 ? `🏁 FINAL · ${modeIcon}` : `${modeIcon} TRAMO ${idx + 1}`);
        const dotStyle = `style="border-color:var(--accent); background-color:rgba(var(--accent-rgb),0.3);"`;

        tramosTimelineItems += `
          <div class="timeline-item">
            <div class="timeline-dot" ${dotStyle}></div>
            <div class="timeline-time" style="display:flex; flex-wrap:wrap; align-items:baseline; gap:0.15rem 0.3rem;">${legBadge} <span style="color:var(--text-muted); font-size:0.85rem; font-weight:normal;">· ${t.desc}</span></div>
            <div class="timeline-content" style="word-break:break-word; overflow-wrap:anywhere;">
              De <a href="${fromUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline;"><strong>${t.from} ↗</strong></a> a <a href="${toUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:underline;"><strong>${t.to} ↗</strong></a>${mapsBadge}
            </div>
          </div>
        `;
      });
    }

    let tramosCardHTML = "";
    if (tramosTimelineItems) {
      // Group all legs by transport mode / icon
      const modeConfig = {
        "🚗": { label: "🚘 Total Coche", color: "var(--primary)" },
        "🚶": { label: "🚶 Total Paseo a Pie", color: "var(--primary)" },
        "🚡": { label: "🚡 Total Funicular", color: "var(--primary)" }
      };

      const allLegs = day.travelTimes || [];
      const modeTotals = {};

      allLegs.forEach(t => {
        const icon = t.icon || "🚗";
        if (!modeTotals[icon]) {
          modeTotals[icon] = { totalKm: 0, totalMins: 0, hasKm: false };
        }
        if (!t.desc) return;

        // Km matching
        const kmMatch = t.desc.match(/(\d+(?:[.,]\d+)?)\s*km/i);
        if (kmMatch) {
          modeTotals[icon].totalKm += parseFloat(kmMatch[1].replace(',', '.'));
          modeTotals[icon].hasKm = true;
        } else {
          const metersMatch = t.desc.match(/(\d+)\s*m\b/i);
          if (metersMatch && !t.desc.includes('min')) {
            modeTotals[icon].totalKm += parseInt(metersMatch[1], 10) / 1000;
            modeTotals[icon].hasKm = true;
          }
        }

        // Hours & Mins matching
        const hMatch = t.desc.match(/(\d+)\s*h/i);
        const mMatch = t.desc.match(/(\d+)\s*min/i);

        if (hMatch) modeTotals[icon].totalMins += parseInt(hMatch[1], 10) * 60;
        if (mMatch) modeTotals[icon].totalMins += parseInt(mMatch[1], 10);
      });

      let modeRowsHTML = "";
      Object.entries(modeTotals).forEach(([icon, data]) => {
        const config = modeConfig[icon] || { label: `${icon} Total`, color: "var(--primary)" };
        const hours = Math.floor(data.totalMins / 60);
        const mins = data.totalMins % 60;
        let timeStr = "";
        if (hours > 0 && mins > 0) timeStr = `${hours} h ${mins} min`;
        else if (hours > 0) timeStr = `${hours} h`;
        else if (mins > 0) timeStr = `${mins} min`;
        else timeStr = "--";

        const kmFormatted = data.hasKm ? (data.totalKm < 1 ? `${Math.round(data.totalKm * 1000)} m` : `${(Math.round(data.totalKm * 10) / 10)} km`) : "";
        const kmStr = kmFormatted ? `📏 ${kmFormatted} &nbsp;•&nbsp; ` : "";

        modeRowsHTML += `
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px dashed var(--border-card); padding-bottom: 0.4rem;">
            <span style="font-weight: 800; font-size: 0.85rem; color: ${config.color};">${config.label}:</span>
            <span style="font-weight: 800; font-size: 0.9rem; color: var(--accent); font-family: 'Outfit', sans-serif;">${kmStr}⏱️ ${timeStr}</span>
          </div>
        `;
      });

      const weatherPillsHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.3rem; padding-top: 0.35rem; border-top: 1px dashed var(--border-card); margin-top: 0.35rem;">
          <span style="font-weight: 700; font-size: 0.78rem; color: var(--primary);">🌤️ Hoy en la ruta:</span>
          <div id="stageWeatherPills-${day.dayNum}" style="display:flex; flex-wrap:wrap; gap:0.25rem; align-items:center;">${renderWeatherPillsHTML(day)}</div>
        </div>
      `;

      const summaryHeaderHTML = `
        <div class="tramos-summary-header" style="border: 1px solid rgba(var(--primary-rgb), 0.3); border-radius: 12px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          ${modeRowsHTML}
          ${weatherPillsHTML}
        </div>
      `;

      tramosCardHTML = `
        <div class="card card-glass timeline-card">
          <h3 class="card-title">🚘 Tiempos de Desplazamiento (Tramos)</h3>
          ${summaryHeaderHTML}
          <div class="timeline">
            ${tramosTimelineItems}
          </div>
        </div>
      `;
    }

    // Build schedule / timeline
    let timelineHTML = "";
    if (day.schedule && day.schedule.length > 0) {
      day.schedule.forEach(item => {
        const isFixed = item.isFixed || false;
        const itemClass = isFixed ? "timeline-item fixed-item" : "timeline-item";
        const dotClass = isFixed ? "timeline-dot fixed-dot" : "timeline-dot";
        const fixedBadge = isFixed ? ` <span class="badge-fixed-alert">${item.fixedLabel}</span>` : "";

        timelineHTML += `
          <div class="${itemClass}">
            <div class="${dotClass}"></div>
            <div class="timeline-time">${item.time}${fixedBadge}</div>
            <div class="timeline-content">${item.desc}</div>
          </div>
        `;
      });
    }

    // Build city guide contents (if present)
    let cityGuideHTML = "";
    if (day.cityGuide) {
      const guideKeys = {
        eating: "🍽️ Dónde comer",
        planB: "☔ Plan B"
      };

      let tabButtons = "";
      let tabContents = "";
      let isFirst = true;

      Object.entries(guideKeys).forEach(([key, label]) => {
        if (day.cityGuide[key]) {
          tabButtons += `
            <button class="nested-tab-btn ${isFirst ? 'active' : ''}" data-day="${day.dayNum}" data-tab="${key}">
              ${label}
            </button>
          `;
          tabContents += `
            <div class="nested-tab-content ${isFirst ? 'active' : ''}" id="tab-content-${day.dayNum}-${key}">
              ${day.cityGuide[key].startsWith('<p>') ? day.cityGuide[key] : `<p>${day.cityGuide[key]}</p>`}
            </div>
          `;
          isFirst = false;
        }
      });

      if (tabButtons) {
        const introHTML = day.cityGuide.intro ? `<p style="margin-bottom: 1rem; color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">${day.cityGuide.intro}</p>` : "";
        cityGuideHTML = `
          <div class="card card-glass">
            <h3 class="card-title">💡 Guía de la Zona</h3>
            ${introHTML}
            <div class="nested-tabs">${tabButtons}</div>
            <div class="nested-tabs-content">${tabContents}</div>
          </div>
        `;
      }
    }

    // Build Itinerary sub-items if present
    let customItineraryHTML = "";
    if (day.itinerary && day.itinerary.some(i => i.section)) {
      day.itinerary.forEach((sec, secIdx) => {
        if (sec.section) {
          const sectionImages = sec.items
            .filter(item => item.image)
            .map(item => ({ url: item.image, caption: item.name }));

          const carouselHolderId = `sec-carousel-${day.dayNum}-${secIdx}`;
          const carouselHeaderHTML = sectionImages.length > 1 ? `
            <div id="${carouselHolderId}" style="margin-top: 0.75rem; margin-bottom: 1rem;"></div>
          ` : '';

          customItineraryHTML += `
            <div class="card card-glass" style="margin-top: 1rem;">
              <h3 class="card-title">📌 ${sec.section}</h3>
              ${carouselHeaderHTML}
              <div style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.75rem;">
                ${sec.items.map(item => {
                  const placeUrl = item.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`;
                  const imageHTML = item.image ? `
                    <div style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin: 0.5rem 0 0.2rem 0;">
                      <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    ${item.imageCredit ? `<p class="photo-credit-text">${item.imageCredit}</p>` : ""}
                  ` : '';
                  return `
                    <div style="border-bottom: 1px solid var(--border-card); padding-bottom: 0.75rem;">
                      <h4 style="color: var(--primary); font-size: var(--text-md); margin-bottom: 0.2rem;">
                        <a href="${placeUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">📍 ${item.name} ↗</a>
                      </h4>
                      ${imageHTML}
                      <p style="font-size: var(--text-sm); color: var(--text-main); line-height: 1.55;">${item.desc}</p>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        }
      });
    }

    // Build Nature Section
    let natureHTML = "";
    if (day.nature) {
      natureHTML = `
        <div class="accordion" id="natureAccordion-${day.dayNum}">
          <div class="accordion-header" onclick="document.getElementById('natureAccordion-${day.dayNum}').classList.toggle('open')">
            <span>🌿 Fauna, Flora y Geología</span>
            <span class="accordion-icon">▼</span>
          </div>
          <div class="accordion-content">
            ${day.nature.fauna ? `<div class="nature-item"><strong>Fauna:</strong> ${day.nature.fauna}</div>` : ""}
            ${day.nature.flora ? `<div class="nature-item"><strong>Flora:</strong> ${day.nature.flora}</div>` : ""}
            ${day.nature.geology ? `<div class="nature-item"><strong>Geología:</strong> ${day.nature.geology}</div>` : ""}
          </div>
        </div>
      `;
    }

    // Accommodation Card
    let accommodationHTML = "";
    if (day.accommodation) {
      const mapsUrl = day.accommodation.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.accommodation.name + ', ' + day.accommodation.address)}`;
      accommodationHTML = `
        <div class="card card-glass">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h3 class="card-title" style="margin: 0;">🏠 Alojamiento</h3>
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-primary" style="text-decoration: none; font-size: 0.75rem;">🗺️ Google Maps ↗</a>
          </div>
          <h4 style="font-size: 1.1rem; color: var(--primary); margin-top: 0.25rem;">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${day.accommodation.name}</a>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            📍 <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">${day.accommodation.address}</a>
          </p>
          <p style="font-size: 0.85rem; line-height: 1.4;">${day.accommodation.details}</p>
        </div>
      `;
    }

    // Embedded Map
    let mapHTML = "";
    if (day.mapEmbed) {
      mapHTML = `
        <div class="card card-glass" style="padding: 0; overflow: hidden; border-radius: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1.1rem 0.6rem;">
            <h3 class="card-title" style="margin: 0;">🗺️ Mapa del día</h3>
            <a href="${day.mapLink}" target="_blank" rel="noopener noreferrer" class="badge badge-primary" style="text-decoration: none; font-size: 0.75rem;">Ver en Google Maps ↗</a>
          </div>
          <iframe
            src="${day.mapEmbed}"
            width="100%"
            height="320"
            style="border: 0; display: block;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      `;
    }

    // Tips Box
    let tipsHTML = "";
    if (day.tips && day.tips.length > 0) {
      tipsHTML = `
        <div class="day-tips">
          <h4>A tener en cuenta:</h4>
          <ul>
            ${day.tips.map(tip => `<li>${tip}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    // Column arrangements (All days have Map right after Resumen y Objetivo, followed by Tramos)
    const leftColHTML = `
      <div class="card card-glass">
        <h3 class="card-title">Resumen y Objetivo</h3>
        <p style="line-height: 1.5; font-size: 0.95rem; margin-bottom: 0.75rem;">${day.summary}</p>
        <p style="line-height: 1.5; font-size: 0.9rem; color: var(--text-muted); font-style: italic;">🎯 Objetivo: ${day.goal}</p>
      </div>

      ${mapHTML}

      ${tramosCardHTML}

      <div class="card card-glass timeline-card">
        <h3 class="card-title">🕐 Horario sugerido</h3>
        <div class="timeline">${timelineHTML}</div>
      </div>

      ${customItineraryHTML}
      ${day.detailsText ? `<div class="card card-glass"><p style="line-height:1.5; font-size:0.9rem;">${day.detailsText}</p></div>` : ""}
      ${tipsHTML}
    `;

    const stageWeatherHTML = renderStageWeatherHTML(day);

    const rightColHTML = `
      ${stageWeatherHTML}
      ${accommodationHTML}
      ${natureHTML}
      ${cityGuideHTML}
    `;

    // Final Assembly
    dayDetailContainer.innerHTML = `
      <div class="day-header">
        <img src="${day.image}" alt="${day.title}" class="day-header-img">
        <span class="photo-credit">${day.imageCredit}</span>
        <div class="day-header-info">
          <div class="day-header-date">${day.date} · ${day.subHeader}</div>
          <h2 class="day-header-title">${day.title}</h2>
        </div>
      </div>

      <div class="day-grid">
        <!-- Left Column -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${leftColHTML}
        </div>

        <!-- Right Column -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${rightColHTML}
        </div>
      </div>
    `;

    // Attach stage weather refresh listener
    bindStageWeatherRefresh(day.dayNum);

    // Hook up Day-Specific Tabs Click Listeners
    if (day.cityGuide) {
      const nestedTabs = dayDetailContainer.querySelectorAll(".nested-tab-btn");
      nestedTabs.forEach(tab => {
        tab.addEventListener("click", () => {
          const tabKey = tab.getAttribute("data-tab");
          const dayNum = tab.getAttribute("data-day");

          // Remove active from other buttons in the same day
          dayDetailContainer.querySelectorAll(`.nested-tab-btn[data-day="${dayNum}"]`).forEach(btn => {
            btn.classList.remove("active");
          });
          tab.classList.add("active");

          // Hide other contents
          dayDetailContainer.querySelectorAll(`.nested-tab-content`).forEach(c => {
            c.classList.remove("active");
          });
          const targetContent = dayDetailContainer.querySelector(`#tab-content-${dayNum}-${tabKey}`);
          if (targetContent) {
            targetContent.classList.add("active");
          }
        });
      });
    }

    // Initialize Section Carousels for Itinerary Attractions
    if (day.itinerary) {
      day.itinerary.forEach((sec, secIdx) => {
        if (sec.section) {
          const sectionImages = sec.items
            .filter(item => item.image)
            .map(item => ({ url: item.image, caption: item.name }));
          if (sectionImages.length > 1) {
            const holder = dayDetailContainer.querySelector(`#sec-carousel-${day.dayNum}-${secIdx}`);
            if (holder) {
              renderCarousel(holder, sectionImages);
            }
          }
        }
      });
    }
  }

  /* --- SETUP GASTRONOMY --- */
  function setupGastronomy(filterType) {
    if (!gastronomyGrid) return;
    gastronomyGrid.innerHTML = "";
    
    const gFilterBtns = document.querySelectorAll("#section-gastronomy .filter-btn");

    // Filter active tab buttons
    gFilterBtns.forEach(btn => {
      if (btn.getAttribute("data-filter") === filterType) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const gastronomyData = TRIP_DATA.gastronomy;
    const groups = [
      { key: "bilbao", badgeText: "Bilbao", veg: true },
      { key: "donostia", badgeText: "Donostia", veg: true },
      { key: "vitoria", badgeText: "Vitoria-Gasteiz", veg: true },
      { key: "traditional", badgeText: "Tradicional", veg: false },
      { key: "drinks", badgeText: "Bebidas y dulces", veg: false }
    ];

    groups.filter(group => filterType === "all" || filterType === group.key).forEach(group => {
      gastronomyData[group.key].forEach(item => {
        const card = document.createElement("div");
        card.className = "card card-glass item-card";
        const nameHTML = item.mapsUrl
          ? `<a href="${item.mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${item.name} ↗</a>`
          : item.name;
        const tagHTML = item.tag ? `<span class="badge badge-success-veg item-badge">🌱 ${item.tag}</span>` : "";
        const warningHTML = item.warning ? `<p class="item-warning">⚠️ ${item.warning}</p>` : "";
        card.innerHTML = `
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            <span class="badge ${group.veg ? "badge-primary" : "badge-accent"} item-badge">${group.badgeText}</span>
            ${tagHTML}
          </div>
          <h3 class="item-name">${nameHTML}</h3>
          <p class="item-desc">${item.desc}</p>
          ${warningHTML}
        `;
        gastronomyGrid.appendChild(card);
      });
    });

    // Re-bind click event safely
    gFilterBtns.forEach(btn => {
      btn.onclick = () => {
        const filter = btn.getAttribute("data-filter");
        setupGastronomy(filter);
      };
    });
  }

  /* --- SETUP SOUVENIRS --- */
  function setupSouvenirs() {
    souvenirsGrid.innerHTML = "";
    TRIP_DATA.souvenirs.forEach(souvenir => {
      const card = document.createElement("div");
      card.className = "card card-glass item-card";
      card.innerHTML = `
        <span style="font-size: 2.25rem; margin-bottom: 0.5rem;">${souvenir.icon}</span>
        <h3 class="item-name">${souvenir.name}</h3>
        <p class="item-desc">${souvenir.desc}</p>
      `;
      souvenirsGrid.appendChild(card);
    });
  }

  /* --- SETUP LOGISTICS --- */
  function setupLogistics() {
    // Populate driving rules
    drivingRulesList.innerHTML = "";
    TRIP_DATA.generalRules.driving.forEach(rule => {
      const li = document.createElement("li");
      li.textContent = rule;
      drivingRulesList.appendChild(li);
    });

    // Populate Parkings table
    const parkingsTableBody = document.getElementById("parkingsTableBody");
    if (parkingsTableBody && TRIP_DATA.generalRules.parkings) {
      parkingsTableBody.innerHTML = "";
      TRIP_DATA.generalRules.parkings.forEach(pkg => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="badge badge-accent">${pkg.day}</span></td>
          <td><strong style="color:var(--text-main); font-weight:600;">${pkg.name}</strong></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">📍 ${pkg.location}</span></td>
          <td><span style="font-size:0.8rem;">${pkg.notes}</span></td>
          <td><a href="${pkg.mapsUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-primary">Abrir Mapa ↗</a></td>
        `;
        parkingsTableBody.appendChild(tr);
      });
    }

    // Populate Bookings table
    bookingsTableBody.innerHTML = "";
    TRIP_DATA.generalRules.bookings.forEach((booking, idx) => {
      const tr = document.createElement("tr");
      const isChecked = localStorage.getItem(`${STORAGE_PREFIX}booking-${idx}`) === "true";
      const placeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.place)}`;
      const linkHTML = booking.url
        ? `<a href="${booking.url}" target="_blank" rel="noopener noreferrer" class="badge ${isChecked ? 'badge-primary' : 'badge-accent'}">${isChecked ? '✓ Reservado' : 'Reservar ↗'}</a>`
        : `<span class="badge ${isChecked ? 'badge-primary' : 'badge-accent'}">${isChecked ? '✓ Reservado' : 'Por reservar'}</span>`;
      tr.innerHTML = `
        <td>${booking.day}</td>
        <td>
          <strong style="color:var(--text-main); font-weight:600;">${booking.item}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">📍 <a href="${placeMapsUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:underline;">${booking.place} ↗</a></span>
        </td>
        <td>${booking.time}</td>
        <td>${booking.price}</td>
        <td>${linkHTML}</td>
        <td class="text-center">
          <input type="checkbox" class="custom-checkbox booking-checkbox" aria-label="Marcar ${booking.item} como reservado" data-index="${idx}" ${isChecked ? "checked" : ""}>
        </td>
      `;
      bookingsTableBody.appendChild(tr);
    });

    // Hook up checkboxes listeners
    document.querySelectorAll(".booking-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        localStorage.setItem(`${STORAGE_PREFIX}booking-${chk.getAttribute("data-index")}`, chk.checked);
        setupLogistics(); // Refresh table badge
      });
    });

    // Populate pre-departure checks
    const checksList = document.getElementById("checksList");
    checksList.innerHTML = "";
    TRIP_DATA.generalRules.checks.forEach((check, idx) => {
      const isChecked = localStorage.getItem(`${STORAGE_PREFIX}check-${idx}`) === "true";
      const label = document.createElement("label");
      label.className = "check-item";
      label.innerHTML = `
        <input type="checkbox" class="custom-checkbox check-checkbox" data-index="${idx}" ${isChecked ? "checked" : ""}>
        <span>${check}</span>
      `;
      checksList.appendChild(label);
    });

    document.querySelectorAll(".check-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        localStorage.setItem(`${STORAGE_PREFIX}check-${chk.getAttribute("data-index")}`, chk.checked);
        updateBookingProgress();
      });
    });

    updateBookingProgress();
  }

  function updateBookingProgress() {
    const { bookings, checks } = TRIP_DATA.generalRules;
    const total = bookings.length + checks.length;
    const doneBookings = bookings.filter((_, i) => localStorage.getItem(`${STORAGE_PREFIX}booking-${i}`) === "true").length;
    const doneChecks = checks.filter((_, i) => localStorage.getItem(`${STORAGE_PREFIX}check-${i}`) === "true").length;
    const done = doneBookings + doneChecks;

    // Update Home Widgets
    if (bookingProgressFill) {
      bookingProgressFill.style.width = `${(done / total) * 100}%`;
    }
    if (bookingProgressText) {
      bookingProgressText.textContent = `${done} de ${total} completados`;
    }
  }

  /* --- SETUP APPS --- */
  function setupApps() {
    appsGrid.innerHTML = "";
    TRIP_DATA.recommendedApps.forEach(app => {
      const card = document.createElement("div");
      card.className = "card card-glass item-card";
      card.innerHTML = `
        <span class="badge badge-accent item-badge">${app.category}</span>
        <h3 class="item-name">${app.name}</h3>
        <p class="item-desc">${app.desc}</p>
      `;
      appsGrid.appendChild(card);
    });
  }

  /* --- SETUP QUICK LINKS --- */
  function setupQuickLinks() {
    const quickLinksGrid = document.getElementById("quickLinksGrid");
    quickLinksGrid.innerHTML = TRIP_DATA.quickLinks.map(link => `
      <a class="quick-link" href="${link.url}" target="_blank" rel="noopener noreferrer">
        <span class="quick-link-icon">${link.icon}</span>
        <span>
          <strong>${link.name} ↗</strong>
          <small>${link.desc}</small>
        </span>
      </a>
    `).join("");
  }

  /* --- SETUP PHOTO CREDITS --- */
  function setupPhotoCredits() {
    const photoCreditsList = document.getElementById("photoCreditsList");
    photoCreditsList.innerHTML = TRIP_DATA.photoCredits.map(credit => `
      <li>${credit.place}: ${credit.author} · ${credit.license === "CC0"
        ? "CC0"
        : `<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener noreferrer" class="inline-link">${credit.license}</a>`} · Wikimedia Commons</li>
    `).join("");
  }

  /* --- SETUP ACCOMMODATIONS --- */
  function setupAccommodations() {
    const homeGrid = document.getElementById("homeAccommodationsGrid");
    const sectionGrid = document.getElementById("accommodationsSectionGrid");
    const tableBody = document.getElementById("accommodationsTableBody");

    if (!TRIP_DATA.accommodationsDetailed) return;

    // Populate Summary Table
    if (tableBody && TRIP_DATA.accommodationsSummary) {
      tableBody.innerHTML = "";
      TRIP_DATA.accommodationsSummary.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="badge badge-accent">${item.day}</span></td>
          <td><strong style="color:var(--text-main); font-weight:600;">${item.city}</strong></td>
          <td><strong style="color:var(--primary); font-weight:600;">${item.name}</strong></td>
          <td><span style="font-size:0.8rem; color:var(--text-muted);">${item.details}</span></td>
          <td>${item.mapsUrl ? `<a href="${item.mapsUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-primary">Abrir Mapa ↗</a>` : '—'}</td>
        `;
        tableBody.appendChild(tr);
      });
    }

    // Populate Card Grids (both Home screen & Dedicated Section screen)
    const targets = [homeGrid, sectionGrid].filter(Boolean);
    targets.forEach(grid => {
      grid.innerHTML = "";
      TRIP_DATA.accommodationsDetailed.forEach(acc => {
        const card = document.createElement("div");
        card.className = "card card-glass accommodation-home-card";
        card.style.cssText = "display: flex; flex-direction: column; overflow: hidden; padding: 0;";

        const amenitiesListHTML = acc.amenities.map(item => `
          <li style="font-size: 0.8rem; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.25rem;">
            ${item}
          </li>
        `).join("");

        // Build Carousel Header
        const carouselHeader = document.createElement("div");
        carouselHeader.style.cssText = "position: relative; width: 100%; overflow: hidden;";

        const carouselEl = document.createElement("div");
        const galleryImages = acc.gallery || [{ url: acc.image, caption: acc.name }];
        renderCarousel(carouselEl, galleryImages);

        const badgeDays = document.createElement("span");
        badgeDays.className = "badge badge-accent";
        badgeDays.style.cssText = "position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); color: #fff; z-index: 10;";
        badgeDays.textContent = acc.stayDays;

        const badgeLoc = document.createElement("span");
        badgeLoc.className = "badge badge-primary";
        badgeLoc.style.cssText = "position: absolute; top: 0.75rem; right: 0.75rem; background: rgb(var(--primary-rgb)); color: #fff; z-index: 10;";
        badgeLoc.innerHTML = `📍 ${acc.location}`;

        carouselHeader.appendChild(carouselEl);
        carouselHeader.appendChild(badgeDays);
        carouselHeader.appendChild(badgeLoc);
        card.appendChild(carouselHeader);

        const cardBody = document.createElement("div");
        cardBody.style.cssText = "padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1; gap: 0.75rem;";
        cardBody.innerHTML = `
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
              <a href="${acc.mapsUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${acc.name} ↗</a>
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.3;">📍 ${acc.address}</p>
          </div>

          <div style="background: rgba(var(--primary-rgb), 0.08); padding: 0.5rem 0.75rem; border-radius: 6px; border-left: 3px solid var(--primary);">
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">${acc.roomType}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">${acc.mealPlan}</div>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.45;">${acc.description}</p>

          <div style="border-top: 1px solid var(--border-card); padding-top: 0.75rem; margin-top: auto;">
            <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 0.5rem;">✨ Equipamiento y Servicios:</h4>
            <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0.2rem;">
              ${amenitiesListHTML}
            </ul>
          </div>

          <div style="margin-top: 0.5rem;">
            <a href="${acc.mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="width: 100%; text-decoration: none;">
              🗺️ Ver en Google Maps ↗
            </a>
          </div>
        `;
        card.appendChild(cardBody);
        grid.appendChild(card);
      });
    });
  }

  /* --- REUSABLE CAROUSEL HELPER --- */
  function renderCarousel(containerEl, images) {
    if (!containerEl || !images || images.length === 0) return;

    containerEl.className = "app-carousel";
    let currentIdx = 0;

    const slidesHTML = images.map((imgObj) => {
      const url = typeof imgObj === "string" ? imgObj : imgObj.url;
      const caption = typeof imgObj === "object" && imgObj.caption ? imgObj.caption : "";
      return `
        <div class="app-carousel-slide">
          <img src="${url}" alt="${caption || 'Foto'}" loading="lazy">
          ${caption ? `<div class="app-carousel-caption">${caption}</div>` : ''}
        </div>
      `;
    }).join("");

    const dotsHTML = images.length > 1 ? `
      <div class="app-carousel-dots">
        ${images.map((_, idx) => `<span class="app-carousel-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}"></span>`).join('')}
      </div>
    ` : '';

    const navBtnsHTML = images.length > 1 ? `
      <button class="app-carousel-btn prev" aria-label="Anterior">❮</button>
      <button class="app-carousel-btn next" aria-label="Siguiente">❯</button>
    ` : '';

    containerEl.innerHTML = `
      <div class="app-carousel-track" style="transform: translateX(0%);">
        ${slidesHTML}
      </div>
      ${navBtnsHTML}
      ${dotsHTML}
    `;

    const track = containerEl.querySelector(".app-carousel-track");
    const dots = containerEl.querySelectorAll(".app-carousel-dot");
    const prevBtn = containerEl.querySelector(".app-carousel-btn.prev");
    const nextBtn = containerEl.querySelector(".app-carousel-btn.next");

    function goToSlide(idx) {
      if (idx < 0) idx = images.length - 1;
      if (idx >= images.length) idx = 0;
      currentIdx = idx;
      track.style.transform = `translateX(-${currentIdx * 100}%)`;
      dots.forEach((d, i) => {
        d.classList.toggle("active", i === currentIdx);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(currentIdx - 1); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goToSlide(currentIdx + 1); });

    dots.forEach(d => {
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        goToSlide(parseInt(d.getAttribute("data-idx")));
      });
    });

    let touchStartX = 0;
    containerEl.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    containerEl.addEventListener("touchend", (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) goToSlide(currentIdx + 1);
      if (touchEndX > touchStartX + 40) goToSlide(currentIdx - 1);
    }, { passive: true });
  }

  /* --- SETUP WEATHER / METEOROLOGÍA --- */
  function setupWeather() {
    const weatherGrid = document.getElementById("weatherGrid");
    const weatherFilterBtns = document.querySelectorAll(".weather-filter-btn");
    const btnRefreshWeather = document.getElementById("btnRefreshWeather");
    const weatherLastUpdatedText = document.getElementById("weatherLastUpdatedText");

    if (!weatherGrid || !TRIP_DATA.weatherDestinations) return;

    let currentFilter = "all";

    window._refreshWeatherSection = function renderWeatherCards() {
      weatherGrid.innerHTML = "";
      
      const filteredDests = TRIP_DATA.weatherDestinations.filter(d => {
        if (currentFilter === "all") return true;
        return d.category === currentFilter;
      });

      filteredDests.forEach(dest => {
        const card = document.createElement("div");
        card.className = "card card-glass weather-card";
        card.style.cssText = "display: flex; flex-direction: column; overflow: hidden; padding: 0;";

        const headerMediaHTML = dest.image
          ? `<img src="${dest.image}" alt="${dest.name}" style="width: 100%; height: 100%; object-fit: cover;">`
          : `<div class="weather-card-placeholder"></div>`;

        card.innerHTML = `
          <div style="position: relative; height: 130px; width: 100%; overflow: hidden;">
            ${headerMediaHTML}
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(11,15,25,0.9), transparent 60%);"></div>
            <span class="badge badge-accent" style="position: absolute; top: 0.75rem; left: 0.75rem; background: rgba(11,15,25,0.85); backdrop-filter: blur(8px); color: #fff;">
              ${dest.days}
            </span>
            <div style="position: absolute; bottom: 0.6rem; left: 0.8rem; right: 0.8rem;">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0;">${dest.name}</h3>
              <span style="font-size: 0.75rem; color: rgba(255,255,255,0.8);">${dest.region}</span>
            </div>
          </div>

          <div style="padding: 1rem; display: flex; flex-direction: column; gap: 0.85rem; flex-grow: 1;">
            <div style="display: flex; gap: 0.5rem; justify-content: space-between;">
              ${renderForecastDaysHTML(dest)}
            </div>

            <div style="background: rgba(var(--accent-rgb), 0.08); padding: 0.6rem 0.75rem; border-radius: 6px; border-left: 3px solid var(--accent); font-size: 0.8rem; color: var(--text-main); line-height: 1.35;">
              <strong>💡 Consejo de Ropa:</strong> ${dest.clothingTip}
            </div>
          </div>
        `;
        weatherGrid.appendChild(card);
      });
    };

    // Filter listeners
    weatherFilterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        weatherFilterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-weather-filter");
        if (window._refreshWeatherSection) window._refreshWeatherSection();
      });
    });

    // Refresh button listener
    if (btnRefreshWeather) {
      btnRefreshWeather.addEventListener("click", () => {
        fetchGlobalWeatherData();
      });
    }

    // Initial fetch & set interval 30 min (1800000 ms)
    fetchGlobalWeatherData();
    setInterval(fetchGlobalWeatherData, 30 * 60 * 1000);
  }

  /* --- SETUP ONLINE TRANSLATOR --- */
  function setupTranslator() {
    const transSourceText = document.getElementById("transSourceText");
    const transTargetText = document.getElementById("transTargetText");
    const btnSwapLang = document.getElementById("btnSwapLang");
    const btnClearTrans = document.getElementById("btnClearTrans");
    const btnCopyTrans = document.getElementById("btnCopyTrans");
    const transSourceLangLabel = document.getElementById("transSourceLangLabel");
    const transTargetLangLabel = document.getElementById("transTargetLangLabel");
    const transChips = document.querySelectorAll(".trans-chip");
    const transPlaceholderHTML = `<span style="color: var(--text-muted); font-style: italic;">La traducción aparecerá aquí automáticamente...</span>`;

    if (!transSourceText || !transTargetText) return;

    let langPair = "eu|es"; // Default: Basque to Spanish
    let debounceTimer = null;
    let latestRequest = 0;

    const localDict = {
      "kaixo": "Hola",
      "agur": "Adiós",
      "egun on": "Buenos días",
      "arratsalde on": "Buenas tardes",
      "gabon": "Buenas noches",
      "eskerrik asko": "Muchas gracias",
      "mesedez": "Por favor",
      "barkatu": "Perdón",
      "bai": "Sí",
      "ez": "No",
      "ongi etorri": "Bienvenidos",
      "topa": "¡Salud!",
      "zenbat da?": "¿Cuánto es?",
      "non dago komuna?": "¿Dónde está el baño?",
      "kontua, mesedez": "La cuenta, por favor",
      "barazkijalea naiz": "Soy vegetariano/a",
      "haragirik ez dut jaten, ezta arrainik ere": "No como carne ni tampoco pescado",
      "ba al duzue aukera begetarianorik?": "¿Tenéis alguna opción vegetariana?",
      "irteera": "Salida",
      "sarrera": "Entrada",
      "itxita": "Cerrado",
      "irekita": "Abierto",
      "aparkalekua": "Aparcamiento",
      "hondartza": "Playa",
      "kalea": "Calle"
    };

    function googleTranslateUrl(text) {
      const [sl, tl] = langPair.split("|");
      return `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(text)}&op=translate`;
    }

    function showTranslation(text) {
      const strong = document.createElement("strong");
      strong.textContent = text;
      transTargetText.replaceChildren(strong);
    }

    function showTranslationFallback(message, query) {
      transTargetText.innerHTML = `<span style="color: var(--text-muted);">${message}</span> <a href="${googleTranslateUrl(query)}" target="_blank" rel="noopener noreferrer" class="inline-link">Abrir en Google Translate ↗</a>`;
    }

    async function performTranslation() {
      const query = transSourceText.value.trim();
      const requestId = ++latestRequest;
      if (!query) {
        transTargetText.innerHTML = transPlaceholderHTML;
        return;
      }

      const normQuery = query.toLowerCase();
      if (langPair === "eu|es" && localDict[normQuery]) {
        showTranslation(localDict[normQuery]);
        return;
      }

      transTargetText.innerHTML = `<span style="color: var(--primary);">Traduciendo... ⏳</span>`;

      try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=${langPair}`);
        if (!res.ok) throw new Error("API Network Error");
        const data = await res.json();
        if (requestId !== latestRequest) return;
        // The Basque corpus often returns an empty main result, with the text only in `matches`
        const match = (data.matches || []).find(m => m.translation && m.translation.trim());
        const translated = (data.responseData && data.responseData.translatedText) || (match && match.translation);
        if (translated && !data.quotaFinished) {
          showTranslation(translated);
        } else {
          showTranslationFallback("No hay traducción disponible.", query);
        }
      } catch (err) {
        console.warn("Translation API error", err);
        if (requestId !== latestRequest) return;
        showTranslationFallback("Sin conexión con el traductor.", query);
      }
    }

    transSourceText.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performTranslation, 350);
    });

    if (btnSwapLang) {
      btnSwapLang.addEventListener("click", () => {
        if (langPair === "eu|es") {
          langPair = "es|eu";
          transSourceLangLabel.textContent = "🇪🇸 Español";
          transTargetLangLabel.textContent = "Euskera";
          transSourceText.placeholder = "Escribe o pega texto en español... (ej. ¿Dónde podemos aparcar?)";
        } else {
          langPair = "eu|es";
          transSourceLangLabel.textContent = "Euskera";
          transTargetLangLabel.textContent = "🇪🇸 Español";
          transSourceText.placeholder = "Escribe o pega texto en euskera... (ej. Non dago komuna?)";
        }
        if (transSourceText.value.trim()) {
          performTranslation();
        }
      });
    }

    if (btnClearTrans) {
      btnClearTrans.addEventListener("click", () => {
        transSourceText.value = "";
        latestRequest++;
        transTargetText.innerHTML = transPlaceholderHTML;
      });
    }

    if (btnCopyTrans) {
      btnCopyTrans.addEventListener("click", () => {
        const strong = transTargetText.querySelector("strong");
        if (strong) {
          navigator.clipboard.writeText(strong.textContent).then(() => {
            const originalText = btnCopyTrans.textContent;
            btnCopyTrans.textContent = "✓ ¡Copiado!";
            setTimeout(() => { btnCopyTrans.textContent = originalText; }, 1500);
          });
        }
      });
    }

    transChips.forEach(chip => {
      chip.addEventListener("click", () => {
        if (langPair !== "eu|es" && btnSwapLang) {
          btnSwapLang.click();
        }
        transSourceText.value = chip.getAttribute("data-text");
        performTranslation();
      });
    });

    // Camera translation launcher
    const btnLaunchGoogleLens = document.getElementById("btnLaunchGoogleLens");
    if (btnLaunchGoogleLens) {
      btnLaunchGoogleLens.addEventListener("click", () => {
        window.open("https://translate.google.com/?sl=eu&tl=es&op=images", "_blank");
      });
    }
  }

  /* --- GLOBAL SEARCH ENGINE --- */
  function setupGlobalSearch() {
    const searchInput = document.getElementById("globalSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const resultsDropdown = document.getElementById("searchResultsDropdown");

    if (!searchInput || !resultsDropdown) return;

    // Shortcut "/" to focus search box, "Escape" to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInput.focus();
      } else if (e.key === "Escape") {
        closeSearchResults();
        searchInput.blur();
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (query.length > 0) {
        if (clearBtn) clearBtn.style.display = "flex";
        performSearch(query);
      } else {
        if (clearBtn) clearBtn.style.display = "none";
        closeSearchResults();
      }
    });

    searchInput.addEventListener("focus", () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        performSearch(query);
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.style.display = "none";
        closeSearchResults();
        searchInput.focus();
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        closeSearchResults();
      }
    });

    function closeSearchResults() {
      resultsDropdown.classList.remove("active");
      resultsDropdown.innerHTML = "";
    }

    function highlightText(text, query) {
      if (!text || !query) return text || "";
      const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function stripHtml(html) {
      if (!html) return "";
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
    }

    function normalizeText(text) {
      return (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function performSearch(query) {
      const q = normalizeText(query);
      const matches = text => normalizeText(text).includes(q);
      const results = [];

      // 1. Search Days & Itinerary Items & City Guide
      TRIP_DATA.days.forEach(day => {
        // Day Title & Summary
        if (matches(day.title) || matches(day.summary) || matches(day.subHeader)) {
          results.push({
            type: "itinerary",
            category: `📅 Día ${day.dayNum} — ${day.date}`,
            title: day.title,
            snippet: day.summary.substring(0, 120) + "...",
            dayNum: day.dayNum,
            icon: "🗓️"
          });
        }

        // Accommodation for this Day
        if (day.accommodation) {
          if (matches(`${day.accommodation.name} ${day.accommodation.address} ${day.accommodation.details}`)) {
            results.push({
              type: "accommodations",
              category: `🏨 Alojamiento (Día ${day.dayNum})`,
              title: day.accommodation.name,
              snippet: `${day.accommodation.address} — ${day.accommodation.details}`,
              dayNum: day.dayNum,
              icon: "🏨"
            });
          }
        }

        // Itinerary Items (handles both sections with items[] and flat time-based arrays)
        if (day.itinerary && Array.isArray(day.itinerary)) {
          day.itinerary.forEach(sec => {
            if (sec.section && Array.isArray(sec.items)) {
              sec.items.forEach(item => {
                if (!item.name) return;
                const plainDesc = stripHtml(item.desc);
                if (matches(`${item.name} ${plainDesc}`)) {
                  results.push({
                    type: "itinerary",
                    category: `📍 Día ${day.dayNum} (${sec.section})`,
                    title: item.name,
                    snippet: plainDesc.substring(0, 120),
                    dayNum: day.dayNum,
                    itemName: item.name,
                    icon: "📍"
                  });
                }
              });
            }
          });
        }

        // City Guide
        if (day.cityGuide) {
          const guideCategories = [
            { key: "eating", label: "🍽️ Dónde Comer" },
            { key: "planB", label: "☔ Plan B" }
          ];

          guideCategories.forEach(cat => {
            if (day.cityGuide[cat.key]) {
              const plainText = stripHtml(day.cityGuide[cat.key]);
              if (matches(plainText)) {
                results.push({
                  type: "cityGuide",
                  category: `${cat.label} (Día ${day.dayNum})`,
                  title: `${cat.label} — Día ${day.dayNum}`,
                  snippet: plainText.substring(0, 120),
                  dayNum: day.dayNum,
                  guideCategory: cat.key,
                  icon: "💡"
                });
              }
            }
          });
        }
      });

      // 2. Search Accommodations Summary
      TRIP_DATA.accommodationsSummary.forEach(acc => {
        if (matches(`${acc.name} ${acc.city} ${acc.details}`) && !results.some(r => r.type === "accommodations" && r.title === acc.name)) {
          results.push({
            type: "accommodations",
            category: "🏨 Alojamiento",
            title: acc.name,
            snippet: `${acc.city} — ${acc.details}`,
            icon: "🏨"
          });
        }
      });

      // 3. Search Gastronomy (all groups)
      Object.values(TRIP_DATA.gastronomy).flat().forEach(item => {
        if (matches(`${item.name} ${item.tag || ""} ${item.desc} ${item.warning || ""}`)) {
          results.push({
            type: "gastronomy",
            category: "🍲 Gastronomía",
            title: item.name,
            snippet: item.desc.substring(0, 120),
            icon: "🍲"
          });
        }
      });

      // 4. Search Souvenirs
      TRIP_DATA.souvenirs.forEach(item => {
        if (matches(`${item.name} ${item.desc}`)) {
          results.push({
            type: "souvenirs",
            category: "🎁 Recuerdos",
            title: item.name,
            snippet: item.desc.substring(0, 120),
            icon: "🎁"
          });
        }
      });

      // 5. Search Bookings & Parkings
      TRIP_DATA.generalRules.bookings.forEach(b => {
        if (matches(`${b.item} ${b.place}`)) {
          results.push({
            type: "logistics",
            category: "🎟️ Reservas",
            title: b.item,
            snippet: `${b.place} (${b.date})`,
            icon: "🎫"
          });
        }
      });

      TRIP_DATA.generalRules.parkings.forEach(p => {
        if (matches(`${p.name} ${p.location} ${p.notes}`)) {
          results.push({
            type: "logistics",
            category: "🅿️ Aparcamientos",
            title: p.name,
            snippet: `${p.location} — ${p.notes}`,
            icon: "🅿️"
          });
        }
      });

      // 6. Search Departures
      window.FIXED_SCHEDULES_DATA.forEach(s => {
        if (matches(`${s.title} ${s.details}`)) {
          results.push({
            type: "fixed-schedules",
            category: `⏰ Horarios (${s.date})`,
            title: s.title,
            snippet: s.details.substring(0, 120),
            icon: "⏰"
          });
        }
      });

      renderSearchResults(results, query);
    }

    function renderSearchResults(results, query) {
      if (results.length === 0) {
        resultsDropdown.innerHTML = `<div class="search-no-results">No se encontraron resultados para "<strong></strong>"</div>`;
        resultsDropdown.querySelector("strong").textContent = query;
        resultsDropdown.classList.add("active");
        return;
      }

      resultsDropdown.innerHTML = "";
      const maxDisplay = 15;
      const displayResults = results.slice(0, maxDisplay);

      displayResults.forEach(res => {
        const itemEl = document.createElement("div");
        itemEl.className = "search-result-item";
        itemEl.innerHTML = `
          <span class="search-result-icon">${res.icon || '🔍'}</span>
          <div class="search-result-content">
            <div class="search-result-title">${highlightText(res.title, query)}</div>
            <div class="search-result-snippet">${highlightText(res.snippet, query)}</div>
            <div class="search-result-meta">${res.category}</div>
          </div>
        `;

        itemEl.addEventListener("click", () => {
          navigateToResult(res);
          closeSearchResults();
          searchInput.value = "";
          if (clearBtn) clearBtn.style.display = "none";
        });

        resultsDropdown.appendChild(itemEl);
      });

      if (results.length > maxDisplay) {
        const moreEl = document.createElement("div");
        moreEl.className = "search-no-results";
        moreEl.style.fontSize = "0.78rem";
        moreEl.style.padding = "0.5rem";
        moreEl.style.color = "var(--accent)";
        moreEl.textContent = `+${results.length - maxDisplay} resultados más...`;
        resultsDropdown.appendChild(moreEl);
      }

      resultsDropdown.classList.add("active");
    }

    function navigateToResult(res) {
      // Map result types to section IDs
      const sectionMap = {
        "itinerary": "itinerary",
        "cityGuide": "itinerary"
      };

      const targetSection = sectionMap[res.type] || res.type;
      switchSection(targetSection);

      if ((res.type === "itinerary" || res.type === "cityGuide") && res.dayNum) {
        activeDayNum = res.dayNum;

        // Find and click the correct day button
        const dayBtn = document.querySelector(`.day-btn[data-day="${res.dayNum}"]`);
        if (dayBtn) dayBtn.click();

        setTimeout(() => {
          if (res.type === "itinerary" && res.itemName) {
            // Scroll to and highlight the matching itinerary item
            const allH4 = document.querySelectorAll("h4");
            for (let h of allH4) {
              if (h.textContent.includes(res.itemName.substring(0, 30))) {
                const parent = h.closest("[style]") || h.parentElement;
                parent.scrollIntoView({ behavior: "smooth", block: "center" });
                const prevShadow = parent.style.boxShadow;
                const prevBorder = parent.style.outline;
                parent.style.transition = "box-shadow 0.3s ease, outline 0.3s ease";
                parent.style.boxShadow = "0 0 22px 4px rgba(var(--primary-rgb), 0.7)";
                parent.style.outline = "2px solid var(--primary)";
                setTimeout(() => {
                  parent.style.boxShadow = prevShadow;
                  parent.style.outline = prevBorder;
                }, 2500);
                break;
              }
            }
          } else if (res.type === "cityGuide" && res.guideCategory) {
            // Activate the correct city guide tab
            const tabBtn = document.querySelector(`.nested-tab-btn[data-day="${res.dayNum}"][data-tab="${res.guideCategory}"]`);
            if (tabBtn) {
              tabBtn.click();
              tabBtn.scrollIntoView({ behavior: "smooth", block: "center" });
              tabBtn.style.transition = "box-shadow 0.3s ease";
              tabBtn.style.boxShadow = "0 0 16px rgba(var(--primary-rgb), 0.8)";
              setTimeout(() => { tabBtn.style.boxShadow = ""; }, 2500);
            }
          }
        }, 350);
      }
    }
  }

  /* --- RENDER HORARIOS FIJOS SECTION --- */
  function renderFixedSchedules(activeFilter = 'all') {
    const container = document.getElementById("fixedSchedulesGrid");
    if (!container) return;

    const data = window.FIXED_SCHEDULES_DATA || [];

    // Keep the counters in sync with the data
    document.querySelectorAll(".fixed-filter-btn").forEach(btn => {
      const filter = btn.getAttribute("data-filter");
      const count = filter === "all" ? data.length : data.filter(item => item.category === filter).length;
      btn.querySelector(".fixed-filter-count").textContent = count;
    });

    const filtered = activeFilter === 'all' 
      ? data 
      : data.filter(item => item.category === activeFilter);

    let html = "";
    filtered.forEach(item => {
      let timeHTML = "";
      if (item.departure && item.arrival) {
        timeHTML = `
          <div class="fixed-time-row">
            <span class="fixed-time-label">🚗 Salida:</span>
            <span class="fixed-time-val">${item.departure}</span>
          </div>
          <div class="fixed-time-row">
            <span class="fixed-time-label">🏁 Llegada:</span>
            <span class="fixed-time-val">${item.arrival}</span>
          </div>
        `;
      } else if (item.time) {
        timeHTML = `
          <div class="fixed-time-row">
            <span class="fixed-time-label">⏰ Hora:</span>
            <span class="fixed-time-val">${item.time}</span>
          </div>
        `;
      }

      let extraInfo = "";
      if (item.location) extraInfo += `<div><strong>Lugar:</strong> ${item.location}</div>`;

      html += `
        <div class="fixed-card" data-category="${item.category}">
          <div class="fixed-card-header">
            <div class="fixed-card-type">
              <span class="fixed-card-icon">${item.icon}</span>
              <span class="fixed-card-tag">${item.tag}</span>
            </div>
            <span class="fixed-card-date">📅 ${item.date}</span>
          </div>

          <h3 class="fixed-card-title">${item.title}</h3>

          <div class="fixed-card-time-box">
            ${timeHTML}
          </div>

          ${extraInfo ? `<div class="fixed-card-details">${extraInfo}</div>` : ''}

          <div class="fixed-card-details" style="font-size: 0.82rem; font-style: italic;">
            📌 ${item.details}
          </div>

          <div class="fixed-card-footer">
            <span class="badge fixed-card-status">${item.status}</span>
            <button class="btn btn-secondary btn-sm btn-go-day" data-day="${item.dayNum}">Ver en Día ${item.dayNum} →</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach click listeners to day jump buttons
    container.querySelectorAll(".btn-go-day").forEach(btn => {
      btn.addEventListener("click", () => {
        const dayNum = parseInt(btn.getAttribute("data-day"), 10);
        switchSection("itinerary");
        const dayBtn = document.querySelector(`.day-btn[data-day="${dayNum}"]`);
        if (dayBtn) dayBtn.click();
      });
    });

    // Attach click listeners to filter buttons
    const filterBtns = document.querySelectorAll(".fixed-filter-btn");
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.getAttribute("data-filter");
        renderFixedSchedules(filter);
      };
    });
  }

});
