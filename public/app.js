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
    { id: "garbage_cover_small", name: "Garbage cover small", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 2, maxLimit: 5, lastCountedAt: null },
    { id: "garbage_cover_big", name: "Garbage cover big", category: "Cleaning supplies", unit: "boxes", currentCount: null, minStock: 2, maxLimit: 5, lastCountedAt: null },
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

  // Alerts & Settings Modal Elements
  const alertsSettingsModal = document.getElementById('alertsSettingsModal');
  const closeAlertsSettingsModal = document.getElementById('closeAlertsSettingsModal');
  const closeSettingsBottomBtn = document.getElementById('closeSettingsBottomBtn');
  const notifStatusBadge = document.getElementById('notifStatusBadge');
  const settingsRequestPermissionBtn = document.getElementById('settingsRequestPermissionBtn');
  const testAlertBtn = document.getElementById('testAlertBtn');
  const soundAlertToggle = document.getElementById('soundAlertToggle');

  // Settings Device Tabs
  const tabAndroidBtn = document.getElementById('tabAndroidBtn');
  const tabIosBtn = document.getElementById('tabIosBtn');
  const tabPcBtn = document.getElementById('tabPcBtn');
  const androidGuideView = document.getElementById('androidGuideView');
  const iosGuideView = document.getElementById('iosGuideView');
  const pcGuideView = document.getElementById('pcGuideView');

  // Add to Phone Modal Elements
  const addToPhoneModal = document.getElementById('addToPhoneModal');
  const closeAddToPhoneModal = document.getElementById('closeAddToPhoneModal');
  const closeInstallBottomBtn = document.getElementById('closeInstallBottomBtn');
  const nativeInstallPromptSection = document.getElementById('nativeInstallPromptSection');
  const directInstallBtn = document.getElementById('directInstallBtn');

  const tabInstallAndroid = document.getElementById('tabInstallAndroid');
  const tabInstallIos = document.getElementById('tabInstallIos');
  const tabInstallPc = document.getElementById('tabInstallPc');
  const installAndroidView = document.getElementById('installAndroidView');
  const installIosView = document.getElementById('installIosView');
  const installPcView = document.getElementById('installPcView');

  // Toast Box
  const appToast = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  let isFirstRender = true;

  function init() {
    registerServiceWorker();
    setupNotificationHandlers();
    setupPwaInstall();
    setupZeroStockReport();
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

  // Web Audio Synthesizer Chime
  function playAlertChime() {
    if (localStorage.getItem('hk_sound_enabled') === 'false') return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not allowed or blocked", e);
    }
  }

  // Floating Toast
  function showToast(msg, icon = '🔔') {
    if (!appToast) return;
    toastMsg.textContent = msg;
    toastIcon.textContent = icon;
    appToast.classList.add('show');
    setTimeout(() => {
      appToast.classList.remove('show');
    }, 3500);
  }

  // Device Auto-Detection
  function detectDeviceAndSelectTab() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isIos) {
      switchInstallTab('ios');
      switchSettingsTab('ios');
    } else if (isAndroid) {
      switchInstallTab('android');
      switchSettingsTab('android');
    } else {
      switchInstallTab('pc');
      switchSettingsTab('pc');
    }
  }

  function openAlertsSettingsModal() {
    updateNotificationStatusUI();
    detectDeviceAndSelectTab();
    alertsSettingsModal.classList.add('open');
  }

  function openAddToPhoneModal() {
    detectDeviceAndSelectTab();
    if (state.deferredPrompt && nativeInstallPromptSection) {
      nativeInstallPromptSection.style.display = 'block';
    } else if (nativeInstallPromptSection) {
      nativeInstallPromptSection.style.display = 'none';
    }
    addToPhoneModal.classList.add('open');
  }

  function switchSettingsTab(tab) {
    if (!tabAndroidBtn) return;
    tabAndroidBtn.classList.toggle('active', tab === 'android');
    tabIosBtn.classList.toggle('active', tab === 'ios');
    tabPcBtn.classList.toggle('active', tab === 'pc');
    androidGuideView.style.display = tab === 'android' ? 'block' : 'none';
    iosGuideView.style.display = tab === 'ios' ? 'block' : 'none';
    pcGuideView.style.display = tab === 'pc' ? 'block' : 'none';
  }

  function switchInstallTab(tab) {
    if (!tabInstallAndroid) return;
    tabInstallAndroid.classList.toggle('active', tab === 'android');
    tabInstallIos.classList.toggle('active', tab === 'ios');
    tabInstallPc.classList.toggle('active', tab === 'pc');
    installAndroidView.style.display = tab === 'android' ? 'block' : 'none';
    installIosView.style.display = tab === 'ios' ? 'block' : 'none';
    installPcView.style.display = tab === 'pc' ? 'block' : 'none';
  }

  function updateNotificationStatusUI() {
    if (!notifStatusBadge) return;
    if (!('Notification' in window)) {
      notifStatusBadge.textContent = '● Not Supported';
      notifStatusBadge.className = 'status-pill status-denied';
      if (settingsRequestPermissionBtn) settingsRequestPermissionBtn.style.display = 'none';
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') {
      notifStatusBadge.textContent = '● Active ✓';
      notifStatusBadge.className = 'status-pill status-granted';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Browser Alerts Active ✓';
        settingsRequestPermissionBtn.style.background = '#10b981';
      }
      enableNotifyBtn.classList.add('active');
      notifyBtnText.textContent = '🔔 Alerts: Active ✓';
    } else if (perm === 'denied') {
      notifStatusBadge.textContent = '● Blocked in Settings';
      notifStatusBadge.className = 'status-pill status-denied';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Enable in Settings Below ⬇';
        settingsRequestPermissionBtn.style.background = '#dc2626';
      }
      enableNotifyBtn.classList.remove('active');
      notifyBtnText.textContent = '🔔 Alerts: Blocked ⚠️';
    } else {
      notifStatusBadge.textContent = '● Not Enabled';
      notifStatusBadge.className = 'status-pill status-default';
      if (settingsRequestPermissionBtn) {
        settingsRequestPermissionBtn.textContent = 'Turn On Browser Alerts';
        settingsRequestPermissionBtn.style.background = 'var(--btn-save-bg)';
        settingsRequestPermissionBtn.style.color = 'var(--btn-save-text)';
      }
      enableNotifyBtn.classList.remove('active');
      notifyBtnText.textContent = '🔔 Alerts & Settings';
    }
  }

  function setupPwaInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      installPwaBtn.style.display = 'inline-flex';
      if (nativeInstallPromptSection) nativeInstallPromptSection.style.display = 'block';
    });

    installPwaBtn.addEventListener('click', openAddToPhoneModal);
    closeAddToPhoneModal.addEventListener('click', () => addToPhoneModal.classList.remove('open'));
    closeInstallBottomBtn.addEventListener('click', () => addToPhoneModal.classList.remove('open'));

    if (directInstallBtn) {
      directInstallBtn.addEventListener('click', () => {
        if (state.deferredPrompt) {
          state.deferredPrompt.prompt();
          state.deferredPrompt.userChoice.then(() => {
            state.deferredPrompt = null;
            if (nativeInstallPromptSection) nativeInstallPromptSection.style.display = 'none';
          });
        }
      });
    }

    tabInstallAndroid.addEventListener('click', () => switchInstallTab('android'));
    tabInstallIos.addEventListener('click', () => switchInstallTab('ios'));
    tabInstallPc.addEventListener('click', () => switchInstallTab('pc'));
  }

  function setupNotificationHandlers() {
    updateNotificationStatusUI();

    enableNotifyBtn.addEventListener('click', openAlertsSettingsModal);
    closeAlertsSettingsModal.addEventListener('click', () => alertsSettingsModal.classList.remove('open'));
    closeSettingsBottomBtn.addEventListener('click', () => alertsSettingsModal.classList.remove('open'));

    // Sound toggle
    const soundPref = localStorage.getItem('hk_sound_enabled');
    if (soundPref !== null) {
      soundAlertToggle.checked = soundPref !== 'false';
    }
    soundAlertToggle.addEventListener('change', (e) => {
      localStorage.setItem('hk_sound_enabled', e.target.checked);
      showToast(e.target.checked ? '🔊 In-app warning sound enabled' : '🔇 In-app warning sound muted', '🔊');
      if (e.target.checked) playAlertChime();
    });

    // Request Notification Permission
    settingsRequestPermissionBtn.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('Notifications not supported in this browser.', '⚠️');
        return;
      }
      if (Notification.permission === 'denied') {
        showToast('⚠️ Blocked! Please follow the steps below to enable.', '⚠️');
        detectDeviceAndSelectTab();
        return;
      }
      try {
        const perm = await Notification.requestPermission();
        updateNotificationStatusUI();
        if (perm === 'granted') {
          playAlertChime();
          showToast('✓ Stock alerts turned ON successfully!', '✅');
          new Notification('Housekeeping Stock Count', {
            body: '✓ Stock alerts are now active!',
            icon: 'icon.png'
          });
        } else {
          showToast('⚠️ Alerts not allowed. Follow the steps below.', '⚠️');
          detectDeviceAndSelectTab();
        }
      } catch (e) {
        console.log(e);
      }
    });

    // Test Alert Button
    testAlertBtn.addEventListener('click', () => {
      playAlertChime();
      const guestItems = state.items.filter(i => i.category === 'Guest amenities');
      const guestTotal = guestItems.reduce((sum, i) => sum + (i.currentCount || 0), 0);
      const zeroCount = state.items.filter(i => i.currentCount === 0 || i.currentCount === null).length;
      
      showToast(`🔔 Test Alert! Amenities: ${guestTotal} pcs | Need count: ${zeroCount}`, '🔔');

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Housekeeping Stock Alert', {
          body: `Stock Alert Working! Amenities: ${guestTotal} pcs | Items to count: ${zeroCount}`,
          icon: 'icon.png'
        });
      }
    });

    // Tab switching for settings guide
    tabAndroidBtn.addEventListener('click', () => switchSettingsTab('android'));
    tabIosBtn.addEventListener('click', () => switchSettingsTab('ios'));
    tabPcBtn.addEventListener('click', () => switchSettingsTab('pc'));
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
      if (e.target === alertsSettingsModal) alertsSettingsModal.classList.remove('open');
      if (e.target === addToPhoneModal) addToPhoneModal.classList.remove('open');
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
                      max="${item.maxLimit || (item.category === 'Chemical supplies' ? 5 : 999)}"
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

        // Check 5 limit for Chemical supplies or items with maxLimit
        const maxLimit = item ? (item.maxLimit || (item.category === 'Chemical supplies' ? 5 : null)) : null;
        if (maxLimit && current >= maxLimit) {
          alert(`⚠️ ERROR: ${item.name} count cannot exceed ${maxLimit}! (മാക്സിമം ${maxLimit} ${item.unit} മാത്രമെ നൽകാവൂ).`);
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

    // Validation 1: Chemical supplies or maxLimit count > 5
    const maxAllowed = item ? (item.maxLimit || (item.category === 'Chemical supplies' ? 5 : null)) : null;
    if (maxAllowed && num > maxAllowed) {
      alert(`⚠️ ERROR: ${item.name} count cannot exceed ${maxAllowed}! (${item.name} ന് ${maxAllowed} ${item.unit}-ൽ കൂടുതൽ എണ്ണം നൽകാൻ പാടില്ല).`);
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


  // Rooming sheet OCR and reviewed stock deduction
  const roomImageInput = document.getElementById('roomSheetImage');
  const roomPreview = document.getElementById('roomSheetPreview');
  const roomOcrStatus = document.getElementById('roomOcrStatus');
  const roomReview = document.getElementById('roomOcrReview');
  const roomOcrBtn = document.getElementById('runRoomOcrBtn');
  const confirmRoomBtn = document.getElementById('confirmRoomDeductionBtn');
  let ocrRows = [];
  const roomGalleryInput = document.getElementById('roomSheetGalleryImage');
  const roomCameraBtn = document.getElementById('roomOcrCameraBtn');
  const roomUploadBtn = document.getElementById('roomOcrUploadBtn');
  if (roomCameraBtn && roomImageInput) roomCameraBtn.addEventListener('click', () => roomImageInput.click());
  if (roomUploadBtn && roomGalleryInput) roomUploadBtn.addEventListener('click', () => roomGalleryInput.click());

  const validRoomNumbers = new Set([
    '101','102','103','104','105','106','107','108','109','110','111','112',
    '114','115','116','117','118','119','120','121','122','123','124','125',
    '126','127','128','129','131','132','133','134','135','136',
    'A1','A2','D1','D2','TREEHOUSE','CLUBVILLA'
  ]);
  const roomTokenPattern = '(?:101|102|103|104|105|106|107|108|109|110|111|112|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|131|132|133|134|135|136|A1|A2|D1|D2|TREE\\s*HOUSE|TREEHOUSE|CLUB\\s*VILLA|CLUBVILLA)';
  const roomGroupPattern = new RegExp('\\b' + roomTokenPattern + '(?:\\s*[-–/]\\s*' + roomTokenPattern + ')*', 'gi');

  function expandRoomGroup(raw) {
    const normalized = raw.toUpperCase()
      .replace(/TREE\\s*HOUSE/g, 'TREEHOUSE')
      .replace(/CLUB\\s*VILLA/g, 'CLUBVILLA')
      .replace(/[–—]/g, '-');
    const expanded = [];
    normalized.split('/').forEach(part => {
      const value = part.trim();
      const range = value.match(/^([A-Z]?\\d+)\\s*-\\s*([A-Z]?\\d+)$/);
      if (range && /^\\d+$/.test(range[1]) && /^\\d+$/.test(range[2])) {
        const from = Number(range[1]);
        const to = Number(range[2]);
        const step = from <= to ? 1 : -1;
        for (let n = from; n !== to + step; n += step) {
          const room = String(n);
          if (validRoomNumbers.has(room)) expanded.push(room);
        }
      } else if (range && range[1].startsWith('A') && range[2].startsWith('A')) {
        expanded.push('A1', 'A2');
      } else if (range && range[1].startsWith('D') && range[2].startsWith('D')) {
        expanded.push('D1', 'D2');
      } else if (validRoomNumbers.has(value)) {
        expanded.push(value);
      }
    });
    return [...new Set(expanded)].map(room =>
      room === 'TREEHOUSE' ? 'Treehouse' : room === 'CLUBVILLA' ? 'Clubvilla' : room
    );
  }

  function handleRoomImageChange(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    roomPreview.src = URL.createObjectURL(file);
    roomPreview.style.display = 'block';
    roomReview.innerHTML = '';
    confirmRoomBtn.disabled = true;
    ocrRows = [];
    roomOcrStatus.textContent = 'Image ready. Tap Read Image (OCR).';
    roomImageInput.selectedRoomFile = file;
  }
  if (roomImageInput) roomImageInput.addEventListener('change', () => handleRoomImageChange(roomImageInput));
  if (roomGalleryInput) roomGalleryInput.addEventListener('change', () => handleRoomImageChange(roomGalleryInput));

  function renderOcrRows() {
    const opts = ['CK OUT','STAY','STAY BACK','CK IN','NOT CLEAR'];
    roomReview.innerHTML = '<h3 style="margin:14px 0 8px;">Review extracted rooms</h3>' +
      ocrRows.map((r,i) => {
        const countText = Number.isInteger(r.expectedRoomCount)
          ? 'ROOMS column: ' + r.expectedRoomCount + ' | Detected: ' + r.expandedRoomCount + ' ' +
            (r.expectedRoomCount === r.expandedRoomCount ? '✓ Count matches' : '⚠ COUNT MISMATCH — check room numbers')
          : 'Detected rooms: ' + r.expandedRoomCount;
        return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:8px 0;padding:10px;background:#131e2c;border:1px solid ' +
          (Number.isInteger(r.expectedRoomCount) && r.expectedRoomCount !== r.expandedRoomCount ? '#b45309' : '#1d2c3e') +
          ';border-radius:8px;">' +
          '<label>Room(s) <input data-ocr-room="' + i + '" value="' + escapeHtml(r.roomNumber) +
          '" style="width:100%;padding:8px;background:#0b121c;color:white;border:1px solid #23364c;border-radius:5px;"></label>' +
          '<label>Status <select data-ocr-status="' + i + '" style="width:100%;padding:8px;background:#0b121c;color:white;border:1px solid #23364c;border-radius:5px;">' +
          opts.map(o => '<option ' + (r.status === o ? 'selected' : '') + '>' + o + '</option>').join('') +
          '</select></label><div style="padding:8px;color:#cbd5e1;">ETA / Check-in: <strong>' +
          escapeHtml(r.arrivalTime || 'No time found') + '</strong><br>' + escapeHtml(countText) + '</div></div>';
      }).join('');
    roomReview.querySelectorAll('[data-ocr-room]').forEach(el => el.addEventListener('change', () => {
      const row = ocrRows[Number(el.dataset.ocrRoom)];
      row.roomNumber = el.value.trim();
      row.roomNumbers = expandRoomGroup(row.roomNumber);
      row.expandedRoomCount = row.roomNumbers.length;
      row.countMismatch = Number.isInteger(row.expectedRoomCount) && row.expectedRoomCount !== row.expandedRoomCount;
      renderOcrRows();
    }));
    roomReview.querySelectorAll('[data-ocr-status]').forEach(el => el.addEventListener('change', () => {
      ocrRows[Number(el.dataset.ocrStatus)].status = el.value;
      updateConfirmState();
    }));
    updateConfirmState();
  }

  function updateConfirmState() {
    confirmRoomBtn.disabled = !ocrRows.length || ocrRows.some(r =>
      r.status === 'NOT CLEAR' || !r.roomNumber || r.countMismatch
    );
  }

  if (roomOcrBtn) roomOcrBtn.addEventListener('click', async () => {
    const file = roomImageInput.selectedRoomFile || (roomImageInput.files && roomImageInput.files[0]);
    if (!file) {
      roomOcrStatus.textContent = 'Please select a rooming-sheet image.';
      return;
    }
    if (!window.Tesseract) {
      roomOcrStatus.textContent = 'OCR library did not load. Check internet and try again.';
      return;
    }
    roomOcrBtn.disabled = true;
    roomOcrStatus.textContent = 'Reading image… please wait.';
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const lines = result.data.text.split(/\\n/).map(line => line.trim()).filter(Boolean);
      const found = [];

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const matches = [...line.toUpperCase().matchAll(new RegExp(roomGroupPattern.source, 'gi'))];
        if (!matches.length) continue;

        matches.forEach(match => {
          const roomNumbers = expandRoomGroup(match[0]);
          if (!roomNumbers.length) return;

          // ROOMS is the numeric column immediately before Room Num.
          // Only accept a count when a standalone number directly precedes
          // the room-list cell; Adult/Kid/meal counts occur after Room Num.
          const prefix = line.slice(Math.max(0, match.index - 24), match.index);
          const countMatch = prefix.match(/(?:^|\\s)(\\d{1,2})\\s*$/);
          const expectedRoomCount = countMatch ? Number(countMatch[1]) : null;

          // OCR can split a row into multiple lines. Read the ETA/status only
          // from the same row continuation, stopping at the next room group.
          let rowText = line;
          for (let j = index + 1; j < Math.min(lines.length, index + 4); j++) {
            if (new RegExp(roomGroupPattern.source, 'i').test(lines[j])) break;
            rowText += ' ' + lines[j];
          }
          const rowUpper = rowText.toUpperCase();
          const checkoutTime = /CHECK\\s*OUT\\s*[:=-]?\\s*\\d{1,2}(?:[:.]\\d{2})?\\s*(?:AM|PM)?/.test(rowUpper) ||
            /CHECKOUT\\s*\\d{1,2}/.test(rowUpper);
          const timeMatch = rowUpper.match(/\\b(\\d{1,2})(?:[:.](\\d{2})\\s*(AM|PM)?|(\\s*)(AM|PM))\\b/i);
          const arrivalTime = timeMatch && !checkoutTime
            ? timeMatch[1] + (timeMatch[2] ? ':' + timeMatch[2] : '') +
              ((timeMatch[3] || timeMatch[5]) ? ' ' + (timeMatch[3] || timeMatch[5]) : '')
            : '';
          const status = /STAY\\s*BACK/.test(rowUpper) ? 'STAY BACK' :
            arrivalTime ? 'CK IN' :
            /CK\\s*OUT|CHECK\\s*OUT/.test(rowUpper) ? 'CK OUT' :
            /\\bSTAY\\b/.test(rowUpper) ? 'STAY' :
            /CK\\s*IN|CHECK\\s*IN/.test(rowUpper) ? 'CK IN' : 'NOT CLEAR';

          const expected = Number.isInteger(expectedRoomCount) ? expectedRoomCount : null;
          found.push({
            roomNumber: roomNumbers.join('/'),
            roomNumbers,
            expectedRoomCount: expected,
            expandedRoomCount: roomNumbers.length,
            countMismatch: expected !== null && expected !== roomNumbers.length,
            status,
            arrivalTime
          });
        });
      }

      // Merge duplicate OCR detections without duplicating a room in stock deduction.
      const byRoom = new Map();
      found.forEach(row => {
        row.roomNumbers.forEach(roomNumber => {
          const key = roomNumber.toUpperCase();
          if (!byRoom.has(key)) {
            byRoom.set(key, {
              roomNumber,
              expectedRoomCount: null,
              expandedRoomCount: 1,
              countMismatch: false,
              status: row.status,
              arrivalTime: row.arrivalTime
            });
          } else {
            const existing = byRoom.get(key);
            if (existing.status === 'NOT CLEAR' && row.status !== 'NOT CLEAR') existing.status = row.status;
            if (!existing.arrivalTime && row.arrivalTime) existing.arrivalTime = row.arrivalTime;
          }
        });
      });

      // Keep grouped rows for count verification and review, while removing
      // rooms that appear again in another OCR row from the final batch.
      const seenRooms = new Set();
      ocrRows = found.map(row => {
        const uniqueRooms = row.roomNumbers.filter(room => {
          const key = room.toUpperCase();
          if (seenRooms.has(key)) return false;
          seenRooms.add(key);
          return true;
        });
        return {
          ...row,
          roomNumbers: uniqueRooms,
          roomNumber: uniqueRooms.join('/'),
          expandedRoomCount: uniqueRooms.length,
          countMismatch: Number.isInteger(row.expectedRoomCount) && row.expectedRoomCount !== uniqueRooms.length
        };
      }).filter(row => row.roomNumbers.length);

      roomOcrStatus.textContent = ocrRows.length
        ? 'OCR found ' + ocrRows.reduce((sum, row) => sum + row.expandedRoomCount, 0) +
          ' unique room entries. Check each ROOMS count before confirming.'
        : 'No rooms could be confidently identified. Please check the image or enter rooms manually.';
      renderOcrRows();
    } catch (e) {
      roomOcrStatus.textContent = 'OCR failed: ' + e.message;
    } finally {
      roomOcrBtn.disabled = false;
    }
  });

  if (confirmRoomBtn) confirmRoomBtn.addEventListener('click', async () => {
    if (!ocrRows.length || ocrRows.some(r => r.status === 'NOT CLEAR' || !r.roomNumber || r.countMismatch)) {
      alert('Resolve unclear rows and ROOMS count mismatches before confirming.');
      return;
    }
    const eligible = ocrRows.filter(r =>
      r.status === 'CK OUT' || r.status === 'STAY BACK' ||
      (r.status === 'CK IN' && !!r.arrivalTime)
    );
    if (!eligible.length) {
      alert('No eligible rooms found. A CK IN room must have an ETA time.');
      return;
    }
    if (!confirm('Confirm supply deduction for ' + eligible.reduce((sum, row) => sum + row.roomNumbers.length, 0) + ' rooms?')) return;

    confirmRoomBtn.disabled = true;
    confirmRoomBtn.textContent = 'Processing…';
    roomOcrStatus.textContent = 'Checking stock and processing deduction…';
    try {
      const roomsToDeduct = eligible.flatMap(row => row.roomNumbers.map(roomNumber => ({
        roomNumber,
        status: row.status,
        arrivalTime: row.arrivalTime || ''
      })));
      const batchId = 'ocr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      const res = await fetch('/api/housekeeping/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          rooms: roomsToDeduct,
          staffName: document.getElementById('roomOcrStaff').value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deduction failed');

      if (Array.isArray(data.items)) {
        state.items = data.items;
        updateExistingDOM();
      } else {
        await loadFromServer();
      }

      const itemNames = Object.keys(data.totals || {}).map(id => {
        const item = state.items.find(entry => entry.id === id);
        return (item ? item.name : id) + ': -' + data.totals[id];
      });
      roomOcrStatus.textContent = 'SUCCESSFULLY DEDUCTED: Stock deducted for ' + data.rooms.length + ' rooms. Stock count has been updated.';
      const roomReport = (data.roomDetails || []).map(room =>
        '<div style="padding:8px;margin:6px 0;background:#0b1722;border-radius:6px;"><strong>' +
        escapeHtml(room.roomNumber) + ' — ' + escapeHtml(room.status) +
        (room.arrivalTime ? ' (' + escapeHtml(room.arrivalTime) + ')' : '') + '</strong><div>' +
        Object.entries(room.items || {}).map(([id, qty]) => {
          const item = state.items.find(entry => entry.id === id);
          return escapeHtml(item ? item.name : id) + ': ' + qty;
        }).join(' · ') + '</div></div>'
      ).join('');
      roomReview.innerHTML = '<div style="color:#34d399;margin-top:12px;padding:12px;border:1px solid #237a55;border-radius:8px;"><strong>SUCCESSFULLY DEDUCTED</strong><p>Rooms: ' +
        escapeHtml(data.rooms.join(', ')) + '</p>' + roomReport + '<p><strong>Total deducted:</strong> ' +
        itemNames.map(escapeHtml).join('<br>') + '</p></div>';
      confirmRoomBtn.textContent = 'Deducted ✓';
    } catch (e) {
      roomOcrStatus.textContent = (/NO STOCK/i.test(e.message) ? 'NO STOCK: ' : 'DEDUCTION FAILED: ') + e.message;
      confirmRoomBtn.disabled = false;
      confirmRoomBtn.textContent = 'Confirm & Deduct Stock';
      alert('Stock was NOT deducted.\n\n' + e.message + '\n\nPlease check and save the required stock counts, then try again.');
    }
  });
  init();
})();
