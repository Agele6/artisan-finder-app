(function () {
  var ICONS = {
    electrician: '<polygon points="13,2 5,14 11,14 9,22 19,10 12,10" fill="currentColor"/>',
    plumber: '<polygon points="12,2 19,14 5,14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="16" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    carpenter: '<rect x="3" y="14" width="14" height="4" rx="1" transform="rotate(-45 10 16)" fill="currentColor"/><rect x="13" y="3" width="8" height="6" rx="1" fill="currentColor"/>',
    welder: '<polygon points="12,2 16,10 12,14 8,10" fill="currentColor"/><polygon points="12,10 15,16 12,22 9,16" fill="currentColor" opacity="0.65"/>',
    tailor: '<circle cx="6" cy="6" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="8" x2="20" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="8" y1="16" x2="20" y2="4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    mechanic: '<rect x="4" y="10.5" width="16" height="3" rx="1.5" transform="rotate(35 12 12)" fill="currentColor"/><rect x="4" y="10.5" width="16" height="3" rx="1.5" transform="rotate(-35 12 12)" fill="currentColor" opacity="0.7"/>',
    ac_gen: '<circle cx="12" cy="12" r="2" fill="currentColor"/><ellipse cx="12" cy="6" rx="2.2" ry="4" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(0 12 12)"/><ellipse cx="12" cy="6" rx="2.2" ry="4" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(90 12 12)"/><ellipse cx="12" cy="6" rx="2.2" ry="4" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(180 12 12)"/><ellipse cx="12" cy="6" rx="2.2" ry="4" fill="none" stroke="currentColor" stroke-width="1.6" transform="rotate(270 12 12)"/>',
    painter: '<rect x="4" y="6" width="12" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="10" y1="12" x2="10" y2="17" stroke="currentColor" stroke-width="1.8"/><line x1="10" y1="17" x2="16" y2="17" stroke="currentColor" stroke-width="1.8"/><line x1="16" y1="17" x2="16" y2="21" stroke="currentColor" stroke-width="1.8"/>',
    mason: '<rect x="3" y="4" width="8" height="5" fill="currentColor"/><rect x="13" y="4" width="8" height="5" fill="currentColor" opacity="0.75"/><rect x="7" y="10.5" width="8" height="5" fill="currentColor" opacity="0.6"/><rect x="3" y="17" width="8" height="4" fill="currentColor" opacity="0.45"/><rect x="13" y="17" width="8" height="4" fill="currentColor" opacity="0.3"/>',
    electronics: '<rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><line x1="10" y1="18.5" x2="14" y2="18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
  };

  var CATEGORIES = [
    { id: 'electrician', label: 'Electrician' },
    { id: 'plumber', label: 'Plumber' },
    { id: 'carpenter', label: 'Carpenter' },
    { id: 'welder', label: 'Welder / Fabricator' },
    { id: 'tailor', label: 'Tailor / Fashion' },
    { id: 'mechanic', label: 'Auto Mechanic' },
    { id: 'ac_gen', label: 'AC & Generator' },
    { id: 'painter', label: 'Painter' },
    { id: 'mason', label: 'Mason / Bricklayer' },
    { id: 'electronics', label: 'Phone & Electronics' }
  ];

  var AREAS = ['Opolo', 'Amarata', 'Swali', 'Etegwe', 'Igbogene', 'Kpansia', 'Okaka', 'Tombia', 'Onopa', 'Ekeki', 'Biogbolo', 'Yenizue-Gene'];

  var state = { artisans: [], activeTrade: '', filterText: '', filterArea: '' };

  function catLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    return id;
  }
  function initials(name) {
    var parts = name.trim().split(/\s+/);
    return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '');
  }
  function waLink(num) {
    var digits = (num || '').replace(/[^0-9]/g, '');
    return 'https://wa.me/' + digits;
  }
  function telLink(num) { return 'tel:' + (num || '').replace(/\s+/g, ''); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  async function api(path, options) {
    var res = await fetch('/api' + path, Object.assign({
      headers: { 'Content-Type': 'application/json' }
    }, options || {}));
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ---------- select population ----------
  function populateSelects() {
    var tradeSelects = [document.getElementById('searchTrade'), document.getElementById('fTrade')];
    var areaSelects = [document.getElementById('searchArea'), document.getElementById('fArea')];
    CATEGORIES.forEach(function (c) {
      tradeSelects.forEach(function (sel) {
        var opt = document.createElement('option');
        opt.value = c.id; opt.textContent = c.label;
        sel.appendChild(opt);
      });
    });
    AREAS.forEach(function (a) {
      areaSelects.forEach(function (sel) {
        var opt = document.createElement('option');
        opt.value = a; opt.textContent = a;
        sel.appendChild(opt);
      });
    });
  }

  // ---------- categories ----------
  function renderCategories() {
    var grid = document.getElementById('catGrid');
    grid.innerHTML = '';
    CATEGORIES.forEach(function (c) {
      var count = state.artisans.filter(function (a) { return a.trade === c.id; }).length;
      var btn = document.createElement('button');
      btn.className = 'cat-btn' + (state.activeTrade === c.id ? ' active' : '');
      btn.innerHTML = '<div class="cat-icon"><svg viewBox="0 0 24 24">' + ICONS[c.id] + '</svg></div>' +
                       '<div class="cat-label">' + c.label + '</div>' +
                       '<div class="cat-count">' + count + ' listed</div>';
      btn.addEventListener('click', function () {
        state.activeTrade = state.activeTrade === c.id ? '' : c.id;
        document.getElementById('searchTrade').value = state.activeTrade;
        loadArtisans();
      });
      grid.appendChild(btn);
    });
  }

  // ---------- results ----------
  function renderResults() {
    var grid = document.getElementById('resultsGrid');
    var title = document.getElementById('resultsTitle');
    var clearBtn = document.getElementById('clearFiltersBtn');
    var list = state.artisans;

    var anyFilter = state.activeTrade || state.filterArea || state.filterText;
    clearBtn.style.display = anyFilter ? 'inline-block' : 'none';
    title.textContent = anyFilter ? (list.length + ' result' + (list.length === 1 ? '' : 's')) : 'All artisans';

    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = '<div class="empty"><b>No artisans match yet</b>Try a different trade or area, or check back soon.</div>';
      return;
    }

    list.forEach(function (a) {
      var card = document.createElement('div');
      card.className = 'ticket';
      card.innerHTML =
        '<div class="ticket-main">' +
          '<div class="ticket-top">' +
            '<div class="avatar">' + esc(initials(a.name)) + '</div>' +
            '<div class="ticket-id">' +
              '<p class="ticket-name">' + esc(a.name) + '</p>' +
              '<div class="ticket-trade">' + catLabel(a.trade) + '</div>' +
              '<div class="ticket-area">' + esc(a.area) + ', Yenagoa</div>' +
            '</div>' +
            '<div class="badge-exp">' + (a.years_experience ? a.years_experience + ' yrs' : 'New') + '</div>' +
          '</div>' +
          (a.bio ? '<p class="ticket-bio">' + esc(a.bio) + '</p>' : '') +
          '<div class="perforation"></div>' +
          '<div class="ticket-actions">' +
            '<a class="call-btn" href="' + telLink(a.phone) + '">Call</a>' +
            (a.whatsapp ? '<a class="wa-btn" href="' + waLink(a.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>' : '') +
            '<button class="book-btn" data-book="' + a.id + '">Book</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });

    grid.querySelectorAll('[data-book]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var artisan = state.artisans.find(function (x) { return String(x.id) === btn.getAttribute('data-book'); });
        openBookingModal(artisan);
      });
    });
  }

  function refreshStats() {
    document.getElementById('statCount').textContent = state.artisans.length;
    var trades = {};
    state.artisans.forEach(function (a) { trades[a.trade] = 1; });
    document.getElementById('statTrades').textContent = Object.keys(trades).length;
  }

  async function loadArtisans() {
    var grid = document.getElementById('resultsGrid');
    grid.innerHTML = '<div class="loading-row">Loading directory…</div>';
    try {
      var params = new URLSearchParams();
      if (state.activeTrade) params.set('trade', state.activeTrade);
      if (state.filterArea) params.set('area', state.filterArea);
      if (state.filterText) params.set('q', state.filterText);
      var data = await api('/artisans?' + params.toString());
      state.artisans = data;
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<div class="empty"><b>Could not load the directory</b>' + esc(e.message) + '</div>';
      return;
    }
    renderCategories();
    renderResults();
    refreshStats();
  }

  // ---------- tabs ----------
  var views = { find: 'view-find', register: 'view-register', manage: 'view-manage' };
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var tab = btn.getAttribute('data-tab');
      Object.keys(views).forEach(function (key) {
        document.getElementById(views[key]).style.display = key === tab ? '' : 'none';
      });
      document.getElementById('heroFind').style.display = tab === 'find' ? '' : 'none';
    });
  });

  // ---------- search ----------
  document.getElementById('searchBtn').addEventListener('click', function () {
    state.filterText = document.getElementById('searchText').value.trim();
    state.filterArea = document.getElementById('searchArea').value;
    state.activeTrade = document.getElementById('searchTrade').value;
    loadArtisans();
  });
  document.getElementById('searchText').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });
  document.getElementById('clearFiltersBtn').addEventListener('click', function () {
    state.activeTrade = ''; state.filterText = ''; state.filterArea = '';
    document.getElementById('searchText').value = '';
    document.getElementById('searchArea').value = '';
    document.getElementById('searchTrade').value = '';
    loadArtisans();
  });

  // ---------- register form ----------
  document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('formMsg');
    var payload = {
      name: document.getElementById('fName').value.trim(),
      trade: document.getElementById('fTrade').value,
      area: document.getElementById('fArea').value,
      phone: document.getElementById('fPhone').value.trim(),
      whatsapp: document.getElementById('fWhatsapp').value.trim(),
      years_experience: document.getElementById('fExp').value,
      bio: document.getElementById('fBio').value.trim()
    };
    try {
      await api('/artisans', { method: 'POST', body: JSON.stringify(payload) });
      msg.className = 'form-msg ok';
      msg.textContent = "You're listed! Customers searching " + catLabel(payload.trade) + ' in ' + payload.area + ' will now see you.';
      document.getElementById('registerForm').reset();
      loadArtisans();
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = err.message;
    }
  });

  // ---------- booking modal ----------
  var modal = document.getElementById('bookingModal');
  function openBookingModal(artisan) {
    if (!artisan) return;
    document.getElementById('modalArtisanName').textContent = artisan.name;
    document.getElementById('modalArtisanTrade').textContent = catLabel(artisan.trade) + ' · ' + artisan.area;
    document.getElementById('bArtisanId').value = artisan.id;
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingMsg').className = 'form-msg';
    document.getElementById('bookingMsg').textContent = '';
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('bDate').min = today;
    modal.classList.add('open');
  }
  function closeBookingModal() { modal.classList.remove('open'); }
  document.getElementById('closeModalBtn').addEventListener('click', closeBookingModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeBookingModal(); });

  document.getElementById('bookingForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    var msg = document.getElementById('bookingMsg');
    var payload = {
      artisan_id: Number(document.getElementById('bArtisanId').value),
      customer_name: document.getElementById('bName').value.trim(),
      customer_phone: document.getElementById('bPhone').value.trim(),
      preferred_date: document.getElementById('bDate').value,
      job_description: document.getElementById('bJob').value.trim()
    };
    try {
      var booking = await api('/bookings', { method: 'POST', body: JSON.stringify(payload) });
      msg.className = 'form-msg ok';
      msg.textContent = 'Request sent! Booking #' + booking.id + ' is pending — the artisan will confirm or decline it.';
      document.getElementById('bookingForm').reset();
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = err.message;
    }
  });

  // ---------- manage bookings (artisan dashboard) ----------
  document.getElementById('lookupBtn').addEventListener('click', async function () {
    var phone = document.getElementById('lookupPhone').value.trim();
    var msg = document.getElementById('lookupMsg');
    var list = document.getElementById('bookingsList');
    list.innerHTML = '';
    if (!phone) {
      msg.className = 'form-msg err'; msg.textContent = 'Enter your phone number.';
      return;
    }
    try {
      var data = await api('/bookings/mine?phone=' + encodeURIComponent(phone));
      msg.className = ''; msg.textContent = '';
      renderBookingsList(data.bookings);
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = err.message;
    }
  });

  function renderBookingsList(bookings) {
    var list = document.getElementById('bookingsList');
    if (!bookings.length) {
      list.innerHTML = '<div class="empty"><b>No booking requests yet</b>New requests will show up here.</div>';
      return;
    }
    list.innerHTML = '';
    bookings.forEach(function (b) {
      var row = document.createElement('div');
      row.className = 'booking-card';
      row.innerHTML =
        '<div class="booking-info">' +
          '<b>' + esc(b.customer_name) + '</b>' +
          '<div class="meta">' + esc(b.customer_phone) + ' · Preferred date: ' + esc(b.preferred_date) + '</div>' +
          (b.job_description ? '<div class="job">' + esc(b.job_description) + '</div>' : '') +
        '</div>' +
        '<div class="booking-actions">' +
          '<span class="status-pill status-' + b.status + '">' + b.status + '</span>' +
          (b.status === 'pending' ? '<button class="confirm-btn" data-act="confirmed" data-id="' + b.id + '">Confirm</button><button class="decline-btn" data-act="declined" data-id="' + b.id + '">Decline</button>' : '') +
          (b.status === 'confirmed' ? '<button class="complete-btn" data-act="completed" data-id="' + b.id + '">Mark done</button>' : '') +
        '</div>';
      list.appendChild(row);
    });

    list.querySelectorAll('button[data-act]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          await api('/bookings/' + btn.getAttribute('data-id'), {
            method: 'PATCH',
            body: JSON.stringify({ status: btn.getAttribute('data-act') })
          });
          document.getElementById('lookupBtn').click();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  }

  populateSelects();
  loadArtisans();
})();
