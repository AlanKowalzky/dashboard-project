// ── bootstrap ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard: DOMContentLoaded fired');

  initSampleData();
  initPeriodSelectors();
  initSidebarToggle();
  initTabNav();
  initSeedData();

  console.log('Dashboard: initializing panels...');
  initAddProjectPanel();
  initAddEmployeePanel();

  initTableHeaders();
  renderActiveView();
  console.log('Dashboard: init complete');
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
      // tymczasowo podmień state żeby obliczenia używały właściwego okresu
      const savedYear = state.currentYear, savedMonth = state.currentMonth;
      state.currentYear = +y; state.currentMonth = +m;
      const total = calcTotalIncome(d.projects, d.employees);
      state.currentYear = savedYear; state.currentMonth = savedMonth;
      const tClass = colorClass(total);
      return `
        <tr>
          <td>${monthName(+m)} ${y}</td>
          <td>${d.projects.length} projects</td>
          <td>${d.employees.length} employees</td>
          <td class="${tClass}">${fmt(total)}</td>
          <td><button class="btn-seed" data-year="${y}" data-month="${m}">Seed</button></td>
        </tr>`;
    }).join('');

    overlay.innerHTML = `
      <div class="popup seed-popup">
        <button class="popup-close">×</button>
        <h2>Seed Data</h2>
        <table><thead><tr><th>Period</th><th>Projects</th><th>Employees</th><th>Est. Income</th><th></th></tr></thead>
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
    pv.removeAttribute('hidden');
    ev.setAttribute('hidden', '');
    renderProjectsTable();
  } else {
    pv.setAttribute('hidden', '');
    ev.removeAttribute('hidden');
    renderEmployeesTable();
  }
  restoreSortIcons();
  const lbl = document.getElementById('current-period-label');
  if (lbl) lbl.textContent = `${monthName(state.currentMonth)} ${state.currentYear}`;
}

function restoreSortIcons() {
  const tables = [
    { id: 'projects-table',  st: state.sortProjects },
    { id: 'employees-table', st: state.sortEmployees },
  ];
  tables.forEach(({ id, st }) => {
    document.querySelectorAll(`#${id} .sort-icon`).forEach(i => {
      i.classList.remove('active');
      i.textContent = '\u21c5';
    });
    if (st.column && st.direction) {
      const active = document.querySelector(`#${id} .sort-icon[data-col="${st.column}"]`);
      if (active) {
        active.classList.add('active');
        active.textContent = st.direction === 'asc' ? '\u2191' : '\u2193';
      }
    }
  });
}

// ── filter chips ────────────────────────────────────────────────────────────
function renderFilterChips(containerId, filters, onRemove) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const entries = Object.entries(filters);
  if (entries.length === 0) { container.innerHTML = ''; return; }

  const labels = {
    companyName: 'Company', projectName: 'Project',
    name: 'Name', surname: 'Surname', position: 'Position',
  };

  let html = entries.map(([k, v]) =>
    `<span class="chip">${labels[k] || k}: ${esc(v)}
      <button data-key="${k}">×</button>
    </span>`
  ).join('');

  if (entries.length >= 2) {
    html += `<span class="chip clear-all">Clear Filters <button data-key="__all__">×</button></span>`;
  }

  container.innerHTML = html;
  container.querySelectorAll('button[data-key]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.key === '__all__') {
        Object.keys(filters).forEach(k => delete filters[k]);
        onRemove('__all__');
      } else {
        onRemove(btn.dataset.key);
      }
    });
  });
}

// ── column sort & filter headers ─────────────────────────────────────────────
function initTableHeaders() {
  // sort icons
  document.querySelectorAll('.sort-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const col   = icon.dataset.col;
      const table = icon.closest('table').id;
      const st    = table === 'projects-table' ? state.sortProjects : state.sortEmployees;

      if (st.column === col) {
        st.direction = st.direction === 'asc' ? 'desc' : st.direction === 'desc' ? null : 'asc';
        if (st.direction === null) st.column = null;
      } else {
        st.column = col; st.direction = 'asc';
      }

      document.querySelectorAll(`#${table} .sort-icon`).forEach(i => {
        i.classList.remove('active');
        i.textContent = '⇅';
      });
      if (st.column) {
        icon.classList.add('active');
        icon.textContent = st.direction === 'asc' ? '↑' : '↓';
      }
      renderActiveView();
    });
  });

  // filter icons
  document.querySelectorAll('.filter-icon').forEach(icon => {
    icon.addEventListener('click', e => {
      e.stopPropagation();
      openFilterPopup(icon);
    });
  });
}

function openFilterPopup(icon) {
  document.getElementById('filter-popup')?.remove();
  const col   = icon.dataset.col;
  const table = icon.closest('table').id;
  const filters = table === 'projects-table' ? state.filterProjects : state.filterEmployees;
  const current = filters[col] || '';

  const popup = document.createElement('div');
  popup.id = 'filter-popup';
  popup.className = 'filter-popup';

  if (col === 'position') {
    popup.innerHTML = `
      <select id="fp-input">
        <option value="">— all —</option>
        ${['Junior','Middle','Senior','Lead','Architect','BO']
          .map(p => `<option ${p === current ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
      <div class="fp-actions"><button class="btn-sm fp-cancel">Cancel</button></div>`;
  } else {
    popup.innerHTML = `
      <input id="fp-input" type="text" value="${esc(current)}" placeholder="Filter..." />
      <div class="fp-actions">
        <button class="btn-primary fp-apply">Apply</button>
        <button class="btn-sm fp-cancel">Cancel</button>
      </div>`;
  }

  document.body.appendChild(popup);
  positionPopup(popup, icon);

  const input = popup.querySelector('#fp-input');
  input.focus();
  if (input.select) input.select();

  const apply = () => {
    const val = input.value.trim();
    if (val) filters[col] = val; else delete filters[col];
    popup.remove();
    renderActiveView();
  };
  const cancel = () => popup.remove();

  popup.querySelector('.fp-apply')?.addEventListener('click', apply);
  popup.querySelector('.fp-cancel').addEventListener('click', cancel);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') apply();
    if (e.key === 'Escape') cancel();
  });
  if (col === 'position') input.addEventListener('change', apply);

  setTimeout(() => {
    document.addEventListener('mousedown', function h(e) {
      if (!popup.contains(e.target) && e.target !== icon) {
        popup.remove(); document.removeEventListener('mousedown', h);
      }
    });
  }, 0);
}

// ── sort data ─────────────────────────────────────────────────────────────────
function applySortProjects(projects, employees) {
  const { column, direction } = state.sortProjects;
  if (!column || !direction) return projects;
  return [...projects].sort((a, b) => {
    let va, vb;
    if (column === 'income') {
      va = calcProjectSummary(a, employees).income;
      vb = calcProjectSummary(b, employees).income;
    } else if (column === 'capacity') {
      va = calcProjectSummary(a, employees).usedCap;
      vb = calcProjectSummary(b, employees).usedCap;
    } else {
      va = a[column]; vb = b[column];
    }
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return direction === 'asc' ? cmp : -cmp;
  });
}

function applySortEmployees(employees, projects) {
  const { column, direction } = state.sortEmployees;
  if (!column || !direction) return employees;
  return [...employees].sort((a, b) => {
    let va, vb;
    if (column === 'age')        { va = calcAge(a.dob);                    vb = calcAge(b.dob); }
    else if (column === 'payment')    { va = calcEstimatedPayment(a);           vb = calcEstimatedPayment(b); }
    else if (column === 'projIncome') { va = calcEmployeeIncome(a, projects);   vb = calcEmployeeIncome(b, projects); }
    else                              { va = a[column]; vb = b[column]; }
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return direction === 'asc' ? cmp : -cmp;
  });
}

// ── panel helpers ────────────────────────────────────────────────────────────
function openPanel(panel) {
  panel.classList.add('open');
  panel.style.display = 'flex'; // explicit fallback
  const overlay = document.getElementById('panel-overlay');
  overlay.classList.add('open');
  overlay.onclick = () => closePanel(panel);
}

function closePanel(panel) {
  panel.classList.remove('open');
  panel.style.display = '';
  document.getElementById('panel-overlay').classList.remove('open');
}

// ── helpers ───────────────────────────────────────────────────────────────────
function monthName(m) {
  return ['January','February','March','April','May','June',
          'July','August','September','October','November','December'][m];
}
