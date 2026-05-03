// ── render ───────────────────────────────────────────────────────────────────
function renderProjectsTable() {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#projects-table tbody');

  if (projects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">No projects for this period.</td></tr>';
    document.getElementById('total-income').textContent = '';
    return;
  }

  tbody.innerHTML = projects.map(p => projectRow(p, employees)).join('');
  renderTotalIncome(projects, employees);
  bindProjectEvents(tbody, projects, employees);
}

function projectRow(p, employees) {
  const { usedCap, income } = calcProjectSummary(p, employees);
  const capClass = usedCap > p.capacity ? 'over-capacity' : '';
  const incClass = income >= 0 ? 'positive' : 'negative';
  const assignedCount = employees.filter(e => e.assignments.some(a => a.projectId === p.id)).length;

  return `<tr data-pid="${p.id}">
    <td>${esc(p.companyName)}</td>
    <td>${esc(p.projectName)}</td>
    <td>${fmt(p.budget)}</td>
    <td class="${capClass}">${usedCap.toFixed(2)}/${p.capacity}</td>
    <td><button class="btn-sm btn-show-employees" data-pid="${p.id}">Show Employees (${assignedCount})</button></td>
    <td class="${incClass}">${fmt(income)}</td>
    <td><button class="btn-danger btn-delete-project" data-pid="${p.id}">Delete</button></td>
  </tr>`;
}

function renderTotalIncome(projects, employees) {
  const total = calcTotalIncome(projects, employees);
  const el = document.getElementById('total-income');
  el.className = 'total-income ' + (total >= 0 ? 'positive' : 'negative');
  el.textContent = `Total Estimated Income: ${fmt(total)}`;
}

function bindProjectEvents(tbody, projects, employees) {
  tbody.querySelectorAll('.btn-delete-project').forEach(btn => {
    btn.addEventListener('click', () => deleteProject(btn.dataset.pid));
  });
  tbody.querySelectorAll('.btn-show-employees').forEach(btn => {
    btn.addEventListener('click', () => openShowEmployeesPopup(btn.dataset.pid));
  });
}

// ── delete ───────────────────────────────────────────────────────────────────
function deleteProject(pid) {
  const md = getMonthData(state.currentYear, state.currentMonth);
  const p  = md.projects.find(x => x.id === pid);
  if (!p) return;
  if (!confirm(`Delete project "${p.projectName}"?\nAll employee assignments will be removed.`)) return;

  md.employees.forEach(e => { e.assignments = e.assignments.filter(a => a.projectId !== pid); });
  md.projects = md.projects.filter(x => x.id !== pid);
  saveMonthData(state.currentYear, state.currentMonth, md);
  renderActiveView();
}

// ── add project panel ────────────────────────────────────────────────────────
function initAddProjectPanel() {
  const btn   = document.getElementById('add-project-btn');
  const panel = document.getElementById('add-project-panel');
  const form  = document.getElementById('add-project-form');

  btn.addEventListener('click', () => openPanel(panel));
  panel.querySelector('.panel-close').addEventListener('click', () => closePanel(panel));

  initFormValidation(form, validateProjectField, data => {
    const md = getMonthData(state.currentYear, state.currentMonth);
    md.projects.push({
      id: uid(),
      projectName: data.projectName,
      companyName: data.companyName,
      budget: parseFloat(data.budget),
      capacity: parseInt(data.capacity),
    });
    saveMonthData(state.currentYear, state.currentMonth, md);
    closePanel(panel);
    renderProjectsTable();
  });
}

// ── show employees popup (stub — filled etap 3) ──────────────────────────────
function openShowEmployeesPopup(pid) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const p = projects.find(x => x.id === pid);
  const assigned = employees.filter(e => e.assignments.some(a => a.projectId === pid));

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="popup details-popup">
      <button class="popup-close">×</button>
      <h2>Employees on: ${esc(p.projectName)}</h2>
      ${assigned.length === 0
        ? '<p class="empty">No employees assigned.</p>'
        : `<table><thead><tr><th>Name</th><th>Capacity</th><th>Fit</th></tr></thead>
           <tbody>${assigned.map(e => {
             const a = e.assignments.find(x => x.projectId === pid);
             return `<tr><td>${esc(e.name)} ${esc(e.surname)}</td><td>${a.capacity.toFixed(2)}</td><td>${a.fit.toFixed(2)}</td></tr>`;
           }).join('')}</tbody></table>`
      }
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── calculations (used here, full version in etap 4) ─────────────────────────
function calcProjectSummary(p, employees) {
  const year = state.currentYear, month = state.currentMonth;
  let usedCap = 0, totalCost = 0;

  employees.forEach(e => {
    const a = e.assignments.find(x => x.projectId === p.id);
    if (!a) return;
    const vacCoef = getVacationCoefficient(year, month, e.vacationDays);
    usedCap   += a.capacity * a.fit * vacCoef;
    totalCost += e.salary * Math.max(0.5, a.capacity);
  });

  const capForRev = Math.max(p.capacity, usedCap);
  const revPerUnit = capForRev > 0 ? p.budget / capForRev : 0;
  const totalRev = revPerUnit * usedCap;
  return { usedCap, income: totalRev - totalCost };
}

function calcTotalIncome(projects, employees) {
  const projectsIncome = projects.reduce((s, p) => s + calcProjectSummary(p, employees).income, 0);
  const bench = employees
    .filter(e => e.assignments.length === 0)
    .reduce((s, e) => s + e.salary * 0.5, 0);
  return projectsIncome - bench;
}

function getVacationCoefficient(year, month, vacationDays = []) {
  let working = 0, vacWorking = 0;
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) continue;
    working++;
    if (vacationDays.includes(d)) vacWorking++;
  }
  return working === 0 ? 1 : (working - vacWorking) / working;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(n) { return Number(n).toFixed(2); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
