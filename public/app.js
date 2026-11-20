// Housekeeping Stock Count Application
(function () {
  let state = {
    minTotalStock: 500,
    minGuestAmenitiesStock: 500,
    items: [],
    deferredPrompt: null
  };

  const defaultItems = [
    { id: "broom", name: "Broom", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 20, lastCountedAt: null },
    { id: "mop", name: "Mop", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 20, lastCountedAt: null },
    { id: "gloves", name: "Gloves", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "room_freshener", name: "Room freshener", category: "Cleaning supplies", unit: "pcs", currentCount: null, minStock: 25, lastCountedAt: null },
    { id: "toilet_roll", name: "Toilet roll", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 100, lastCountedAt: null },
    { id: "restaurant_tissue", name: "Restaurant tissue", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "floor_cleaner", name: "Floor cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, minStock: 3, maxLimit: 5, lastCountedAt: null },
    { id: "glass_cleaner", name: "Glass cleaner", category: "Chemical supplies", unit: "pcs", currentCount: null, minStock: 3, maxLimit: 5, lastCountedAt: null },
    { id: "dental_kit", name: "Dental kit", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 60, lastCountedAt: null },
    { id: "shaving_kit", name: "Shaving kit", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "shower_cap", name: "Shower cap", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null },
    { id: "soap", name: "Soap", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "shampoo", name: "Shampoo", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 80, lastCountedAt: null },
    { id: "moisturiser", name: "Moisturiser", category: "Guest amenities", unit: "pcs", currentCount: null, minStock: 50, lastCountedAt: null }
  ];

  // DOM Elements
  const statItemsTracked = document.getElementById('statItemsTracked');
  const statToCountNow = document.getElementById('statToCountNow');
  const statTotalStock = document.getElementById('statTotalStock');
  const swipeSummaryTrack = document.getElementById('swipeSummaryTrack');
  const warningBox = document.getElementById('warningBox');
  const warningTitle = document.getElementById('warningTitle');
  const warningList = document.getElementById('warningList');
  const categoriesContainer = document.getElementById('categoriesContainer');
  const amenitiesAlertBanner = document.getElementById('amenitiesAlertBanner');
  const amenitiesCurrentTotal = document.getElementById('amenitiesCurrentTotal');
  const enableNotifyBtn = document.getElementById('enableNotifyBtn');
  const notifyBtnText = document.getElementById('notifyBtnText');
  const installPwaBtn = document.getElementById('installPwaBtn');
  
  // Zero Stock Modal Elements
  const zeroStockReportBtn = document.getElementById('zeroStockReportBtn');
  const zeroStockModal = document.getElementById('zeroStockModal');
  const closeZeroStockModal = document.getElementById('closeZeroStockModal');
  const backFromZeroModalBtn = document.getElementById('backFromZeroModalBtn');
  const backBottomZeroBtn = document.getElementById('backBottomZeroBtn');
  const zeroStockContent = document.getElementById('zeroStockContent');
  const downloadZeroCsvBtn = document.getElementById('downloadZeroCsvBtn');
  const shareZeroReportBtn = document.getElementById('shareZeroReportBtn');

  // Welcome Popup Elements
  const welcomeFirstTimeModal = document.getElementById('welcomeFirstTimeModal');
  const closeWelcomeModal = document.getElementById('closeWelcomeModal');
  const welcomeEnableAlertsBtn = document.getElementById('welcomeEnableAlertsBtn');
  const welcomeAddToPhoneBtn = document.getElementById('welcomeAddToPhoneBtn');
  const dismissWelcomeBtn = document.getElementById('dismissWelcomeBtn');

  const iosModal = document.getElementById('iosModal');
  const closeIosModal = document.getElementById('closeIosModal');

  let isFirstRender = true;

  function init() {
    registerServiceWorker();
    setupNotificationHandlers();
    setupPwaInstall();
    setupZeroStockReport();
    setupFirstTimeWelcomeModal();
    loadData();

    if (location.protocol.startsWith('http')) {
      setInterval(loadFromServer, 2500);
    }
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // First-time Welcome Popup
  function setupFirstTimeWelcomeModal() {
    const isFirstTime = !localStorage.getItem('hk_first_visit_completed');
    if (isFirstTime) {
      setTimeout(() => {
        welcomeFirstTimeModal.classList.add('open');
      }, 700);
    }

    const dismiss = () => {
      localStorage.setItem('hk_first_visit_completed', 'true');
      welcomeFirstTimeModal.classList.remove('open');
    };

    dismissWelcomeBtn.addEventListener('click', dismiss);
    closeWelcomeModal.addEventListener('click', dismiss);

    welcomeEnableAlertsBtn.addEventListener('click', async () => {
      await requestNotificationPermission();
      welcomeEnableAlertsBtn.textContent = 'Alerts Active ✓';
      welcomeEnableAlertsBtn.style.background = '#10b981';
    });

    welcomeAddToPhoneBtn.addEventListener('click', () => {
      triggerPwaInstall();
    });
  }

  function setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      installPwaBtn.style.display = 'inline-flex';
    });

    installPwaBtn.addEventListener('click', () => {
      triggerPwaInstall();
    });

    closeIosModal.addEventListener('click', () => {
      iosModal.classList.remove('open');
    });
  }

  function triggerPwaInstall() {
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      state.deferredPrompt.userChoice.then(() => {
        state.deferredPrompt = null;
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        iosModal.classList.add('open');
      } else {
        alert('To add to home screen, tap your browser menu (⋮) and tap "Add to Home screen".');
      }
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      updateNotifyBtnState(true);
      return true;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateNotifyBtnState(true);
      new Notification('Alerts Enabled', {
        body: 'You will receive notifications for low stock & guest amenities.',
        icon: 'icon.png'
      });
      checkAndSendStockNotifications();
      return true;
    }
    return false;
  }

  function setupNotificationHandlers() {
    if (!('Notification' in window)) {
      enableNotifyBtn.style.display = 'none';
      return;
    }

    if (Notification.permission === 'granted') {
      updateNotifyBtnState(true);
    }

    enableNotifyBtn.addEventListener('click', async () => {
      if (Notification.permission === 'granted') {
        alert('Stock alerts are already active!');
        checkAndSendStockNotifications();
        return;
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Notifications were blocked. Please enable notifications in your browser site settings.');
      }
    });
  }

  function updateNotifyBtnState(isActive) {
    if (isActive) {
      enableNotifyBtn.classList.add('active');
      notifyBtnText.textContent = 'Alerts Active ✓';
    } else {
      enableNotifyBtn.classList.remove('active');
      notifyBtnText.textContent = 'Turn On Alerts';
    }
  }

  function checkAndSendStockNotifications() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const guestItems = state.items.filter(i => i.category === 'Guest amenities');
    const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);

    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    const lastNotifKey = 'hk_last_notif_time';
    const lastNotifTime = parseInt(localStorage.getItem(lastNotifKey) || '0', 10);
    const shouldSend = (now - lastNotifTime) > (4 * 60 * 60 * 1000);

    if (guestTotal < state.minGuestAmenitiesStock && shouldSend) {
      new Notification('⚠️ Guest Amenities Warning (<500)', {
        body: `Total guest amenities stock is ${guestTotal} pcs (Below 500 threshold)!`,
        icon: 'icon.png'
      });
      localStorage.setItem(lastNotifKey, now.toString());
    }

    const lowOrDueItems = state.items.filter(item => {
      const isZeroOrLow = item.currentCount !== null && (item.currentCount === 0 || (item.minStock && item.currentCount < item.minStock));
      const notCountedFor2Days = !item.lastCountedAt || (now - new Date(item.lastCountedAt).getTime() > twoDaysMs);
      return isZeroOrLow || (item.currentCount === null && notCountedFor2Days);
    });

    if (lowOrDueItems.length > 0 && shouldSend) {
      const itemNames = lowOrDueItems.slice(0, 3).map(i => i.name).join(', ');
      new Notification('⚠️ 2-Day Stock Alert', {
        body: `Zero/low stock or count required: ${itemNames}`,
        icon: 'icon.png'
      });
      localStorage.setItem(lastNotifKey, now.toString());
    }
  }

  // Zero Stock Report Setup (with Back, Share, and Download)
  function setupZeroStockReport() {
    zeroStockReportBtn.addEventListener('click', openZeroStockReport);

    const closeReport = () => zeroStockModal.classList.remove('open');
    closeZeroStockModal.addEventListener('click', closeReport);
    backFromZeroModalBtn.addEventListener('click', closeReport);
    backBottomZeroBtn.addEventListener('click', closeReport);

    // Download CSV
    downloadZeroCsvBtn.addEventListener('click', () => {
      const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);
      let csv = "Item,Category,Count,Unit,Status\n";
      zeroItems.forEach(i => {
        const count = i.currentCount !== null ? i.currentCount : 0;
        const status = i.currentCount === 0 ? "Out of Stock (0)" : "Not Counted";
        csv += `"${i.name}","${i.category}",${count},"${i.unit}","${status}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `zero_stock_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });

    // Share Report (WhatsApp / Email / Clipboard)
    shareZeroReportBtn.addEventListener('click', async () => {
      const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);
      let shareText = `*Housekeeping Zero Stock Report*\nDate: ${new Date().toLocaleDateString()}\n\n`;
      if (zeroItems.length === 0) {
        shareText += "All items are in stock! No zero stock items.";
      } else {
        zeroItems.forEach((i, idx) => {
          const status = i.currentCount === 0 ? "0 " + i.unit : "Not counted yet";
          shareText += `${idx + 1}. ${i.name} (${i.category}): ${status}\n`;
        });
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Housekeeping Zero Stock Report',
            text: shareText
          });
        } catch (e) {}
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('✓ Report summary copied to clipboard! You can paste and send it on WhatsApp or Email.');
        }).catch(() => {
          prompt('Copy this report text:', shareText);
        });
      }
    });

    window.addEventListener('click', (e) => {
      if (e.target === zeroStockModal) zeroStockModal.classList.remove('open');
      if (e.target === welcomeFirstTimeModal) welcomeFirstTimeModal.classList.remove('open');
      if (e.target === iosModal) iosModal.classList.remove('open');
    });
  }

  function openZeroStockReport() {
    const zeroItems = state.items.filter(i => i.currentCount === 0 || i.currentCount === null);

    let rowsHtml = '';
    if (zeroItems.length === 0) {
      rowsHtml = `<tr><td colspan="4" style="text-align:center; padding: 24px; color: #34d399;">✓ Great! No items currently have 0 stock.</td></tr>`;
    } else {
      rowsHtml = zeroItems.map(item => {
        const countText = item.currentCount === 0 ? `0 ${item.unit}` : `Not counted yet`;
        const statusBadge = item.currentCount === 0 
          ? `<span class="zero-badge">Out of Stock (0)</span>` 
          : `<span class="zero-badge" style="background:#281b20; color:#fb7185;">Count needed</span>`;
        return `
          <tr>
            <td><strong>${escapeHtml(item.name)}</strong></td>
            <td>${escapeHtml(item.category)}</td>
            <td>${countText}</td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join('');
    }

    const html = `
      <div style="margin-bottom:14px; font-size:13px; color:var(--text-muted);">
        <strong>Report Date:</strong> ${new Date().toLocaleString()}<br/>
        <strong>Items with 0 or uncounted stock:</strong> <span style="color:#f87171; font-weight:700;">${zeroItems.length} items</span>
      </div>
      <table class="report-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Current Count</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    zeroStockContent.innerHTML = html;
    zeroStockModal.classList.add('open');
  }

  async function loadData() {
    if (location.protocol.startsWith('http')) {
      await loadFromServer();
    } else {
      const local = localStorage.getItem('hk_stock_items');
      state.items = local ? JSON.parse(local) : defaultItems;
      renderFull();
      checkAndSendStockNotifications();
    }
  }

  async function loadFromServer() {
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        state.items = data.items || defaultItems;
        if (isFirstRender) {
          renderFull();
          isFirstRender = false;
        } else {
          updateExistingDOM();
        }
        checkAndSendStockNotifications();
        return;
      }
    } catch (e) {}

    const local = localStorage.getItem('hk_stock_items');
    state.items = local ? JSON.parse(local) : defaultItems;
    if (isFirstRender) {
      renderFull();
      isFirstRender = false;
    } else {
      updateExistingDOM();
    }
  }

  function renderFull() {
    renderStatsAndWarnings();
    renderSwipeColumns();

    // 3 distinct categories in requested order
    const categories = ['Cleaning supplies', 'Chemical supplies', 'Guest amenities'];
    let html = '';

    categories.forEach(cat => {
      const catItems = state.items.filter(i => i.category === cat);
      if (catItems.length === 0) return;

      html += `
        <section class="category-section">
          <h2 class="category-title">${escapeHtml(cat)}</h2>
          <div class="items-list">
            ${catItems.map(item => `
              <div class="item-card" id="card-${item.id}">
                <div class="item-top">
                  <span class="item-name">${escapeHtml(item.name)}</span>
                  <span class="item-count-display ${item.currentCount !== null ? 'has-count' : ''}" id="display-${item.id}">
                    ${item.currentCount !== null ? `${item.currentCount} ${item.unit}` : `— ${item.unit}`}
                  </span>
                </div>
                <div class="item-status-row" id="status-${item.id}">
                  ${item.currentCount === null 
                    ? `<span class="status-badge badge-needed">Count needed</span><span class="status-subtext">Not counted yet</span>`
                    : `<span class="status-badge badge-done">Counted</span><span class="status-subtext">Counted</span>`
                  }
                </div>
                <div class="item-actions">
                  <div class="input-stepper-wrap">
                    <button type="button" class="step-btn minus-btn" data-id="${item.id}">−</button>
                    <input 
                      type="number" 
                      min="0" 
                      max="${item.category === 'Chemical supplies' ? 5 : 999}"
                      inputmode="numeric" 
                      pattern="[0-9]*" 
                      class="count-input" 
                      placeholder="0" 
                      id="input-${item.id}"
                      data-id="${item.id}" 
                      value="${item.currentCount !== null ? item.currentCount : ''}" 
                    />
                    <button type="button" class="step-btn plus-btn" data-id="${item.id}">+</button>
                  </div>
                  <button type="button" class="btn-save" id="save-btn-${item.id}" data-id="${item.id}">Save count</button>
                  <button type="button" class="btn-reset" data-id="${item.id}">Reset</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    });

    categoriesContainer.innerHTML = html;
    bindInputHandlers();
  }

  function updateExistingDOM() {
    renderStatsAndWarnings();
    renderSwipeColumns();

    state.items.forEach(item => {
      const disp = document.getElementById(`display-${item.id}`);
      if (disp) {
        disp.textContent = item.currentCount !== null ? `${item.currentCount} ${item.unit}` : `— ${item.unit}`;
        if (item.currentCount !== null) {
          disp.classList.add('has-count');
        } else {
          disp.classList.remove('has-count');
        }
      }

      const statusEl = document.getElementById(`status-${item.id}`);
      if (statusEl) {
        if (item.currentCount === null) {
          statusEl.innerHTML = `<span class="status-badge badge-needed">Count needed</span><span class="status-subtext">Not counted yet</span>`;
        } else {
          statusEl.innerHTML = `<span class="status-badge badge-done">Counted</span><span class="status-subtext">Counted</span>`;
        }
      }

      const input = document.getElementById(`input-${item.id}`);
      if (input && document.activeElement !== input) {
        if (item.currentCount !== null) {
          input.value = item.currentCount;
        } else if (input.value !== '' && !input.dataset.userEdited) {
          input.value = '';
        }
      }
    });
  }

  function renderStatsAndWarnings() {
    const totalItems = state.items.length;
    const toCount = state.items.filter(i => i.currentCount === null).length;
    const total = state.items.reduce((sum, i) => sum + (i.currentCount || 0), 0);
    
    statItemsTracked.textContent = totalItems;
    statToCountNow.textContent = toCount;
    statTotalStock.textContent = total;

    const guestItems = state.items.filter(i => i.category === 'Guest amenities');
    const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);

    if (guestTotal < state.minGuestAmenitiesStock) {
      amenitiesAlertBanner.style.display = 'flex';
      amenitiesCurrentTotal.textContent = `${guestTotal} pcs`;
    } else {
      amenitiesAlertBanner.style.display = 'none';
    }

    const warnings = [];
    if (total < state.minTotalStock) {
      warnings.push(`Total stock is <strong>${total}</strong>: below ${state.minTotalStock}, top up needed`);
    }
    if (guestTotal < state.minGuestAmenitiesStock) {
      warnings.push(`<strong>Guest amenities</strong> total is ${guestTotal}: below ${state.minGuestAmenitiesStock}, top up needed`);
    }

    state.items.forEach(i => {
      if (i.currentCount === null) {
        warnings.push(`<strong>${i.name}</strong>: count needed`);
      } else if (i.currentCount === 0) {
        warnings.push(`<strong>${i.name}</strong>: stock is 0 (Out of stock!)`);
      }
    });

    if (warnings.length === 0) {
      warningTitle.textContent = "0 warnings";
      warningList.innerHTML = `<li class="warning-empty">All supplies counted! Stock levels are sufficient.</li>`;
    } else {
      warningTitle.textContent = `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`;
      warningList.innerHTML = warnings.map(w => `<li>${w}</li>`).join('');
    }
  }

  function renderSwipeColumns() {
    if (!swipeSummaryTrack) return;
    let trackHtml = '';
    state.items.forEach(item => {
      const isCounted = item.currentCount !== null;
      const countText = isCounted ? `${item.currentCount} ${item.unit}` : `—`;
      trackHtml += `
        <div class="mini-stock-col ${isCounted ? 'has-count' : 'needs-count'}" data-scroll-to="card-${item.id}" title="Click to view ${escapeHtml(item.name)}">
          <span class="mini-stock-name">${escapeHtml(item.name)}</span>
          <span class="mini-stock-count">${countText}</span>
        </div>
      `;
    });
    swipeSummaryTrack.innerHTML = trackHtml;

    document.querySelectorAll('.mini-stock-col').forEach(col => {
      col.onclick = () => {
        const targetId = col.dataset.scrollTo;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.style.outline = '2px solid #38bdf8';
          setTimeout(() => { targetEl.style.outline = 'none'; }, 1500);
        }
      };
    });
  }

  function bindInputHandlers() {
    document.querySelectorAll('.count-input').forEach(input => {
      input.addEventListener('input', () => {
        input.dataset.userEdited = 'true';
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const id = input.dataset.id;
          saveCount(id, input.value);
        }
      });
    });

    document.querySelectorAll('.plus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = state.items.find(i => i.id === id);
        const input = document.getElementById(`input-${id}`);
        let current = parseInt(input.value, 10);
        if (isNaN(current)) current = 0;

        // Check 5 limit for Chemical supplies
        if (item && item.category === 'Chemical supplies' && current >= 5) {
          alert('⚠️ ERROR: Chemical supplies count cannot exceed 5! (മാക്സിമം 5 എണ്ണം മാത്രമെ നൽകാവൂ).');
          return;
        }

        if (current >= 999) {
          alert('⚠️ Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).\n\n⚠️ നിങ്ങൾ സ്റ്റോക്ക് കൃത്യമായി പരിശോധിക്കുക! എണ്ണം 1000 അല്ലെങ്കിൽ അതിൽ കൂടുതലോ നൽകാൻ കഴിയില്ല (പരമാവധി 999).');
          return;
        }
        input.value = current + 1;
        input.dataset.userEdited = 'true';
      });
    });

    document.querySelectorAll('.minus-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const input = document.getElementById(`input-${id}`);
        let current = parseInt(input.value, 10);
        if (isNaN(current) || current <= 0) current = 0;
        else current = current - 1;
        input.value = current;
        input.dataset.userEdited = 'true';
      });
    });

    document.querySelectorAll('.btn-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const input = document.getElementById(`input-${id}`);
        saveCount(id, input.value);
      });
    });

    document.querySelectorAll('.btn-reset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        resetCount(id);
      });
    });
  }

  async function saveCount(id, val) {
    if (val === '' || isNaN(val) || Number(val) < 0) {
      alert('Please enter a valid count number (0 or higher).');
      return;
    }
    const num = parseInt(val, 10);
    const item = state.items.find(i => i.id === id);

    // Validation 1: Chemical supplies count > 5
    if (item && item.category === 'Chemical supplies' && num > 5) {
      alert('⚠️ ERROR: Chemical supplies (Floor cleaner / Glass cleaner) count cannot exceed 5! (കെമിക്കലുകൾക്ക് 5-ൽ കൂടുതൽ എണ്ണം നൽകാൻ പാടില്ല).');
      return;
    }

    // Validation 2: Count >= 1000
    if (num >= 1000) {
      alert('⚠️ Please check your stock carefully! Count cannot be 1000 or more (Maximum allowed is 999).\n\n⚠️ നിങ്ങൾ സ്റ്റോക്ക് കൃത്യമായി പരിശോധിക്കുക! എണ്ണം 1000 അല്ലെങ്കിൽ അതിൽ കൂടുതലോ നൽകാൻ കഴിയില്ല (പരമാവധി 999).');
      return;
    }

    const saveBtn = document.getElementById(`save-btn-${id}`);
    if (saveBtn) {
      saveBtn.textContent = '✓ Saved!';
      saveBtn.classList.add('saved');
      setTimeout(() => {
        saveBtn.textContent = 'Save count';
        saveBtn.classList.remove('saved');
      }, 1400);
    }

    const input = document.getElementById(`input-${id}`);
    if (input) delete input.dataset.userEdited;

    if (location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, count: num })
        });
        if (res.ok) {
          return loadFromServer();
        } else {
          const errData = await res.json();
          alert(errData.error || 'Server error');
          return;
        }
      } catch(e) {}
    }

    if (item) {
      item.currentCount = num;
      item.lastCountedAt = new Date().toISOString();
      localStorage.setItem('hk_stock_items', JSON.stringify(state.items));
      updateExistingDOM();
      checkAndSendStockNotifications();
    }
  }

  async function resetCount(id) {
    const item = state.items.find(i => i.id === id);
    const itemName = item ? item.name : 'this item';

    const confirmed = confirm(`Are you sure you want to reset the count for "${itemName}"?\n\n"${itemName}" ന്റെ കൗണ്ട് റീസെറ്റ് ചെയ്യണമെന്ന് ഉറപ്പാണോ?`);
    if (!confirmed) return;

    const input = document.getElementById(`input-${id}`);
    if (input) {
      input.value = '';
      delete input.dataset.userEdited;
    }

    if (location.protocol.startsWith('http')) {
      try {
        await fetch('/api/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        return loadFromServer();
      } catch(e) {}
    }

    if (item) {
      item.currentCount = null;
      item.lastCountedAt = null;
      localStorage.setItem('hk_stock_items', JSON.stringify(state.items));
      updateExistingDOM();
      checkAndSendStockNotifications();
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  init();
})();
