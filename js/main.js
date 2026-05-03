// ── bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initSampleData();
  initPeriodSelectors();
  initSidebarToggle();
  initTabNav();
  initSeedData();
  renderActiveView();
});

// ── period selectors ────────────────────────────────────────────────────────
function initPeriodSelectors() {
  const monthSel = document.getElementById('month-select');
  const yearSel  = document.getElementById('year-select');

  monthSel.value = state.currentMonth;
  yearSel.value  = state.currentYear;

  monthSel.addEventListener('change', () => {
    setCurrentPeriod(yearSel.value, monthSel.value);
    renderActiveView();
  });
  yearSel.addEventListener('change', () => {
    setCurrentPeriod(yearSel.value, monthSel.value);
    renderActiveView();
  });
}

// ── sidebar toggle ──────────────────────────────────────────────────────────
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const btn     = document.getElementById('sidebar-toggle');
  btn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    btn.textContent = sidebar.classList.contains('collapsed') ? '→' : '☰';
  });
}

// ── tab navigation ──────────────────────────────────────────────────────────
function initTabNav() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.dataset.tab);
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActiveView();
    });
  });
  // set initial active
  document.querySelector(`[data-tab="${state.activeTab}"]`).classList.add('active');
}

// ── seed data ───────────────────────────────────────────────────────────────
function initSeedData() {
  document.getElementById('seed-data-btn').addEventListener('click', openSeedPopup);
}

function openSeedPopup() {
  const data = getData();
  const currentKey = `${state.currentYear}-${state.currentMonth}`;
  const months = Object.keys(data).filter(k => k !== currentKey);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  if (months.length === 0) {
    overlay.innerHTML = `
      <div class="popup seed-popup">
        <button class="popup-close">×</button>
        <h2>Seed Data</h2>
        <p>No other months with data available.</p>
      </div>`;
  } else {
    const rows = months.map(key => {
      const [y, m] = key.split('-');
      const d = data[key];
      return `
        <tr>
          <td>${monthName(+m)} ${y}</td>
          <td>${d.projects.length} projects</td>
          <td>${d.employees.length} employees</td>
          <td>
            <button class="btn-seed" data-year="${y}" data-month="${m}">Seed</button>
          </td>
        </tr>`;
    }).join('');

    overlay.innerHTML = `
      <div class="popup seed-popup">
        <button class="popup-close">×</button>
        <h2>Seed Data</h2>
        <table><thead><tr><th>Period</th><th>Projects</th><th>Employees</th><th></th></tr></thead>
        <tbody>${rows}</tbody></table>
      </div>`;
  }

  document.body.appendChild(overlay);

  overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelectorAll('.btn-seed').forEach(btn => {
    btn.addEventListener('click', () => {
      const fy = btn.dataset.year, fm = btn.dataset.month;
      const fromName = `${monthName(+fm)} ${fy}`;
      const toName   = `${monthName(state.currentMonth)} ${state.currentYear}`;
      if (!confirm(`Copy data from ${fromName} to ${toName}?\nVacation days will be cleared.`)) return;
      seedData(+fy, +fm, state.currentYear, state.currentMonth);
      overlay.remove();
      renderActiveView();
    });
  });
}

// ── render ──────────────────────────────────────────────────────────────────
function renderActiveView() {
  const pv = document.getElementById('projects-view');
  const ev = document.getElementById('employees-view');
  if (state.activeTab === 'projects') {
    pv.hidden = false;
    ev.hidden = true;
    renderProjectsTable();
  } else {
    pv.hidden = true;
    ev.hidden = false;
    renderEmployeesTable();
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function monthName(m) {
  return ['January','February','March','April','May','June',
          'July','August','September','October','November','December'][m];
}
