// ── show employees popup (project → employees) ────────────────────────────────
function openShowEmployeesPopup(pid) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const p        = projects.find(x => x.id === pid);
  const assigned = employees
    .filter(e => e.assignments.some(a => a.projectId === pid))
    .sort((a, b) => a.surname.localeCompare(b.surname));

  let { usedCap, revenuePerUnit } = calcProjectSummaryFull(p, employees);

  function buildRows() {
    if (assigned.length === 0) return '<tr><td colspan="9" class="empty">No employees assigned.</td></tr>';
    return assigned.map(e => {
      const a       = e.assignments.find(x => x.projectId === pid);
      const vacCoef = getVacationCoefficient(state.currentYear, state.currentMonth, e.vacationDays);
      const effCap  = a.capacity * a.fit * vacCoef;
      const rev     = revenuePerUnit * effCap;
      const cost    = e.salary * Math.max(0.5, a.capacity);
      const profit  = rev - cost;
      const pClass  = colorClass(profit);
      return `<tr>
        <td><a class="action-link" data-eid="${e.id}" href="#">${esc(e.name)} ${esc(e.surname)}</a></td>
        <td>${a.capacity.toFixed(2)}</td>
        <td>${a.fit.toFixed(2)}</td>
        <td>${e.vacationDays.length}</td>
        <td>${effCap.toFixed(3)}</td>
        <td>${fmt(rev)}</td>
        <td>${fmt(cost)}</td>
        <td class="${pClass}">${fmt(profit)}</td>
        <td>
          <button class="btn-sm btn-edit-asgn" data-eid="${e.id}" data-pid="${pid}">Edit</button>
          <button class="btn-sm btn-unassign"  data-eid="${e.id}" data-pid="${pid}">Unassign</button>
        </td>
      </tr>`;
    }).join('');
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  function render() {
    overlay.innerHTML = `
      <div class="popup details-popup" style="min-width:700px;max-width:95vw">
        <button class="popup-close">×</button>
        <h2>Employees on: ${esc(p.projectName)}</h2>
        <div class="table-wrapper" style="margin-top:12px">
          <table>
            <thead><tr>
              <th>Name</th><th>Capacity</th><th>Fit</th><th>Vac Days</th>
              <th>Eff. Cap</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Actions</th>
            </tr></thead>
            <tbody>${buildRows()}</tbody>
          </table>
        </div>
      </div>`;

    overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.popup')?.addEventListener('click', e => e.stopPropagation());

    overlay.querySelectorAll('.btn-edit-asgn').forEach(btn => {
      btn.addEventListener('click', () =>
        openEditAssignmentPopup(btn.dataset.eid, btn.dataset.pid, () => {
          refreshPopupData(); render();
        })
      );
    });

    overlay.querySelectorAll('.btn-unassign').forEach(btn => {
      btn.addEventListener('click', () =>
        openUnassignConfirm(btn.dataset.eid, btn.dataset.pid, () => {
          refreshPopupData(); render();
        })
      );
    });

    overlay.querySelectorAll('.action-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        openActionMenu(link, link.dataset.eid, null, overlay);
      });
    });
  }

  function refreshPopupData() {
    const fresh = getMonthData(state.currentYear, state.currentMonth);
    assigned.length = 0;
    fresh.employees
      .filter(e => e.assignments.some(a => a.projectId === pid))
      .sort((a, b) => a.surname.localeCompare(b.surname))
      .forEach(e => assigned.push(e));
    Object.assign(p, fresh.projects.find(x => x.id === pid));
    const r = calcProjectSummaryFull(p, fresh.employees);
    revenuePerUnit = r.revenuePerUnit;
    renderActiveView();
  }

  document.body.appendChild(overlay);
  render();
}

// ── show assignments popup (employee → projects) ──────────────────────────────
function openShowAssignmentsPopup(eid) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const emp = employees.find(x => x.id === eid);

  function buildRows() {
    if (emp.assignments.length === 0) return '<tr><td colspan="9" class="empty">No assignments.</td></tr>';
    const vacCoef = getVacationCoefficient(state.currentYear, state.currentMonth, emp.vacationDays);
    return emp.assignments.map(a => {
      const p      = projects.find(x => x.id === a.projectId);
      if (!p) return '';
      const { revenuePerUnit } = calcProjectSummaryFull(p, employees);
      const effCap = a.capacity * a.fit * vacCoef;
      const rev    = revenuePerUnit * effCap;
      const cost   = emp.salary * Math.max(0.5, a.capacity);
      const profit = rev - cost;
      const pClass = profit >= 0 ? 'positive' : 'negative';
      return `<tr>
        <td><a class="action-link" data-pid="${p.id}" href="#">${esc(p.projectName)}</a></td>
        <td>${a.capacity.toFixed(2)}</td>
        <td>${a.fit.toFixed(2)}</td>
        <td>${emp.vacationDays.length}</td>
        <td>${effCap.toFixed(3)}</td>
        <td>${fmt(rev)}</td>
        <td>${fmt(cost)}</td>
        <td class="${pClass}">${fmt(profit)}</td>
        <td>
          <button class="btn-sm btn-edit-asgn" data-eid="${eid}" data-pid="${p.id}">Edit</button>
          <button class="btn-sm btn-unassign"  data-eid="${eid}" data-pid="${p.id}">Unassign</button>
        </td>
      </tr>`;
    }).join('');
  }

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  function render() {
    const fresh = getMonthData(state.currentYear, state.currentMonth);
    const freshEmp = fresh.employees.find(x => x.id === eid);
    emp.assignments = freshEmp.assignments;
    emp.vacationDays = freshEmp.vacationDays;

    overlay.innerHTML = `
      <div class="popup details-popup" style="min-width:700px;max-width:95vw">
        <button class="popup-close">×</button>
        <h2>Assignments: ${esc(emp.name)} ${esc(emp.surname)}</h2>
        <div class="table-wrapper" style="margin-top:12px">
          <table>
            <thead><tr>
              <th>Project</th><th>Capacity</th><th>Fit</th><th>Vac Days</th>
              <th>Eff. Cap</th><th>Revenue</th><th>Cost</th><th>Profit</th><th>Actions</th>
            </tr></thead>
            <tbody>${buildRows()}</tbody>
          </table>
        </div>
      </div>`;

    overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.popup')?.addEventListener('click', e => e.stopPropagation());

    overlay.querySelectorAll('.btn-edit-asgn').forEach(btn => {
      btn.addEventListener('click', () =>
        openEditAssignmentPopup(btn.dataset.eid, btn.dataset.pid, () => { render(); renderActiveView(); })
      );
    });

    overlay.querySelectorAll('.btn-unassign').forEach(btn => {
      btn.addEventListener('click', () =>
        openUnassignConfirm(btn.dataset.eid, btn.dataset.pid, () => { render(); renderActiveView(); })
      );
    });

    overlay.querySelectorAll('.action-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        openActionMenu(link, null, link.dataset.pid, overlay);
      });
    });
  }

  document.body.appendChild(overlay);
  render();
}

// ── unassign confirm popup ────────────────────────────────────────────────────
function openUnassignConfirm(eid, pid, onConfirm) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const emp  = employees.find(x => x.id === eid);
  const p    = projects.find(x => x.id === pid);
  const asgn = emp.assignments.find(a => a.projectId === pid);

  const vacCoef = getVacationCoefficient(state.currentYear, state.currentMonth, emp.vacationDays);
  const effCap  = asgn.capacity * asgn.fit * vacCoef;
  const { revenuePerUnit, usedCap, income: incBefore } = calcProjectSummaryFull(p, employees);
  const rev     = revenuePerUnit * effCap;
  const cost    = emp.salary * Math.max(0.5, asgn.capacity);
  const profit  = rev - cost;

  // income after unassign
  const empWithout = employees.map(e =>
    e.id === eid ? { ...e, assignments: e.assignments.filter(a => a.projectId !== pid) } : e
  );
  const { income: incAfter } = calcProjectSummaryFull(p, empWithout);
  const capAfter = usedCap - effCap;

  const pc = v => `<span class="${v >= 0 ? 'positive' : 'negative'}">${fmt(v)}</span>`;

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="popup" style="min-width:320px">
      <button class="popup-close">×</button>
      <h2>Unassign Confirmation</h2>
      <table class="confirm-table">
        <tr><td>Employee</td><td><strong>${esc(emp.name)} ${esc(emp.surname)}</strong></td></tr>
        <tr><td>Project</td><td><strong>${esc(p.projectName)}</strong></td></tr>
        <tr><td>Assigned Capacity</td><td>${asgn.capacity.toFixed(2)}</td></tr>
        <tr><td>Salary Share</td><td>${fmt(emp.salary * asgn.capacity)}</td></tr>
        <tr><td>Budget Share</td><td>${fmt(p.budget * (asgn.capacity / p.capacity))}</td></tr>
        <tr><td>Employee Income</td><td>${pc(profit)}</td></tr>
        <tr><td>Project Capacity Before</td><td>${usedCap.toFixed(2)} / ${p.capacity}</td></tr>
        <tr><td>Project Capacity After</td><td>${capAfter.toFixed(2)} / ${p.capacity}</td></tr>
        <tr><td>Project Income Before</td><td>${pc(incBefore)}</td></tr>
        <tr><td>Project Income After</td><td>${pc(incAfter)}</td></tr>
      </table>
      <div class="ap-actions" style="margin-top:16px">
        <button class="btn-danger btn-confirm-unassign">Confirm Unassign</button>
        <button class="btn-sm btn-cancel-unassign">Cancel</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.popup-close').addEventListener('click', close);
  overlay.querySelector('.btn-cancel-unassign').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('.popup')?.addEventListener('click', e => e.stopPropagation());

  overlay.querySelector('.btn-confirm-unassign').addEventListener('click', () => {
    const md  = getMonthData(state.currentYear, state.currentMonth);
    const emp2 = md.employees.find(x => x.id === eid);
    emp2.assignments = emp2.assignments.filter(a => a.projectId !== pid);
    saveMonthData(state.currentYear, state.currentMonth, md);
    close();
    onConfirm();
  });
}

// ── action menu (link inside detail popup) ────────────────────────────────────
function openActionMenu(link, eid, pid, parentOverlay) {
  document.getElementById('action-menu')?.remove();
  const menu = document.createElement('div');
  menu.id = 'action-menu';
  menu.className = 'action-menu';

  if (eid) {
    const { employees } = getMonthData(state.currentYear, state.currentMonth);
    const e = employees.find(x => x.id === eid);
    menu.innerHTML = `
      <button class="am-see">See at Employees</button>
      <button class="am-unassign">Unassign</button>`;
    menu.querySelector('.am-see').addEventListener('click', () => {
      menu.remove();
      parentOverlay?.remove();
      navigateTo('employees', { name: e.name, surname: e.surname });
    });
    menu.querySelector('.am-unassign').addEventListener('click', () => {
      menu.remove();
      const pidFromParent = link.closest('tr')?.querySelector('[data-pid]')?.dataset.pid
        || parentOverlay?.querySelector('[data-pid]')?.dataset.pid;
      // find pid from row
      const row = link.closest('tr');
      const unassignBtn = row?.querySelector('.btn-unassign');
      if (unassignBtn) {
        openUnassignConfirm(eid, unassignBtn.dataset.pid, () => renderActiveView());
      }
    });
  } else if (pid) {
    const { projects } = getMonthData(state.currentYear, state.currentMonth);
    const p = projects.find(x => x.id === pid);
    menu.innerHTML = `
      <button class="am-see">See at Projects</button>
      <button class="am-unassign">Unassign</button>`;
    menu.querySelector('.am-see').addEventListener('click', () => {
      menu.remove();
      parentOverlay?.remove();
      navigateTo('projects', { projectName: p.projectName });
    });
    menu.querySelector('.am-unassign').addEventListener('click', () => {
      menu.remove();
      const row = link.closest('tr');
      const unassignBtn = row?.querySelector('.btn-unassign');
      if (unassignBtn) {
        openUnassignConfirm(unassignBtn.dataset.eid, pid, () => renderActiveView());
      }
    });
  }

  document.body.appendChild(menu);
  const rect = link.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = rect.left + 'px';
  menu.style.zIndex = 500;

  setTimeout(() => {
    document.addEventListener('mousedown', function handler(e) {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('mousedown', handler); }
    });
  }, 0);
}

// ── navigate to tab with filter ───────────────────────────────────────────────
function navigateTo(tab, filters) {
  setActiveTab(tab);
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  if (tab === 'projects') {
    state.filterProjects = filters;
    state.filterEmployees = {};
  } else {
    state.filterEmployees = filters;
    state.filterProjects = {};
  }
  renderActiveView();
}

// calcProjectSummaryFull, calcTotalIncome, getVacationCoefficient → calculations.js
