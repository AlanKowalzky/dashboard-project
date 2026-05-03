// ── render ───────────────────────────────────────────────────────────────────
function renderEmployeesTable() {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#employees-table tbody');

  if (employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">No employees for this period.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map(e => employeeRow(e, projects)).join('');
  bindEmployeeEvents(tbody, employees, projects);
}

function employeeRow(e, projects) {
  const age      = calcAge(e.dob);
  const payment  = calcEstimatedPayment(e);
  const income   = calcEmployeeIncome(e, projects);
  const totalCap = e.assignments.reduce((s, a) => s + a.capacity, 0);
  const incClass = income >= 0 ? 'positive' : 'negative';
  const assignDisabled = totalCap >= 1.5 ? 'disabled' : '';

  return `<tr data-eid="${e.id}">
    <td>${esc(e.name)}</td>
    <td>${esc(e.surname)}</td>
    <td>${age}</td>
    <td class="cell-position" data-eid="${e.id}">${esc(e.position)}</td>
    <td class="cell-salary" data-eid="${e.id}">${fmt(e.salary)}</td>
    <td>${fmt(payment)}</td>
    <td><button class="btn-sm btn-show-assignments" data-eid="${e.id}">
      Show Assignments (${e.assignments.length}) ${totalCap.toFixed(1)}/1.5
    </button></td>
    <td class="${incClass}">${fmt(income)}</td>
    <td class="actions">
      <button class="btn-sm btn-availability" data-eid="${e.id}">📅</button>
      <button class="btn-sm btn-assign" data-eid="${e.id}" ${assignDisabled}>Assign</button>
      <button class="btn-danger btn-delete-employee" data-eid="${e.id}">Delete</button>
    </td>
  </tr>`;
}

function bindEmployeeEvents(tbody, employees, projects) {
  tbody.querySelectorAll('.btn-delete-employee').forEach(btn =>
    btn.addEventListener('click', () => deleteEmployee(btn.dataset.eid)));

  tbody.querySelectorAll('.btn-show-assignments').forEach(btn =>
    btn.addEventListener('click', () => openShowAssignmentsPopup(btn.dataset.eid)));

  tbody.querySelectorAll('.cell-position').forEach(cell =>
    cell.addEventListener('click', () => inlineEditPosition(cell)));

  tbody.querySelectorAll('.cell-salary').forEach(cell =>
    cell.addEventListener('click', () => inlineEditSalary(cell)));

  // btn-assign and btn-availability — stubs filled in etap 3
  tbody.querySelectorAll('.btn-assign').forEach(btn =>
    btn.addEventListener('click', () => openAssignPopup(btn.dataset.eid, btn)));

  tbody.querySelectorAll('.btn-availability').forEach(btn =>
    btn.addEventListener('click', () => openCalendarPopup(btn.dataset.eid)));
}

// ── delete ────────────────────────────────────────────────────────────────────
function deleteEmployee(eid) {
  const md = getMonthData(state.currentYear, state.currentMonth);
  const e  = md.employees.find(x => x.id === eid);
  if (!e) return;
  if (!confirm(`Delete employee "${e.name} ${e.surname}"?\nAll assignments will be removed.`)) return;

  md.employees = md.employees.filter(x => x.id !== eid);
  saveMonthData(state.currentYear, state.currentMonth, md);
  renderActiveView();
}

// ── inline edit: position ─────────────────────────────────────────────────────
function inlineEditPosition(cell) {
  if (cell.querySelector('select')) return;
  const eid = cell.dataset.eid;
  const current = cell.textContent.trim();

  const sel = document.createElement('select');
  ['Junior','Middle','Senior','Lead','Architect','BO'].forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    if (p === current) opt.selected = true;
    sel.appendChild(opt);
  });

  cell.textContent = '';
  cell.appendChild(sel);
  sel.focus();

  function save() {
    const md = getMonthData(state.currentYear, state.currentMonth);
    const emp = md.employees.find(x => x.id === eid);
    if (emp) { emp.position = sel.value; saveMonthData(state.currentYear, state.currentMonth, md); }
    renderEmployeesTable();
  }

  sel.addEventListener('change', save);
  sel.addEventListener('blur', save);
}

// ── inline edit: salary ───────────────────────────────────────────────────────
function inlineEditSalary(cell) {
  if (cell.querySelector('input')) return;
  const eid = cell.dataset.eid;
  const original = cell.textContent.trim();

  const inp = document.createElement('input');
  inp.type = 'number'; inp.min = '0'; inp.step = '0.01';
  inp.value = original;
  inp.style.cssText = 'width:90px;padding:2px 4px;font-size:13px;';

  cell.textContent = '';
  cell.appendChild(inp);
  inp.focus(); inp.select();

  function save() {
    const val = parseFloat(inp.value);
    if (!isNaN(val) && val > 0) {
      const md = getMonthData(state.currentYear, state.currentMonth);
      const emp = md.employees.find(x => x.id === eid);
      if (emp) { emp.salary = val; saveMonthData(state.currentYear, state.currentMonth, md); }
    }
    renderEmployeesTable();
  }

  inp.addEventListener('blur', save);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { inp.blur(); }
    if (e.key === 'Escape') { cell.textContent = original; }
  });
}

// ── add employee panel ────────────────────────────────────────────────────────
function initAddEmployeePanel() {
  const btn   = document.getElementById('add-employee-btn');
  const panel = document.getElementById('add-employee-panel');
  const form  = document.getElementById('add-employee-form');

  btn.addEventListener('click', () => openPanel(panel));
  panel.querySelector('.panel-close').addEventListener('click', () => closePanel(panel));

  initFormValidation(form, validateEmployeeField, data => {
    const md = getMonthData(state.currentYear, state.currentMonth);
    md.employees.push({
      id: uid(),
      name:     data.name,
      surname:  data.surname,
      dob:      data.dob,
      position: data.position,
      salary:   parseFloat(data.salary),
      assignments: [],
      vacationDays: [],
    });
    saveMonthData(state.currentYear, state.currentMonth, md);
    closePanel(panel);
    renderEmployeesTable();
  });
}

// ── show assignments popup (stub — filled etap 3) ─────────────────────────────
function openShowAssignmentsPopup(eid) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const e = employees.find(x => x.id === eid);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="popup details-popup">
      <button class="popup-close">×</button>
      <h2>Assignments: ${esc(e.name)} ${esc(e.surname)}</h2>
      ${e.assignments.length === 0
        ? '<p class="empty">No assignments.</p>'
        : `<table><thead><tr><th>Project</th><th>Capacity</th><th>Fit</th></tr></thead>
           <tbody>${e.assignments.map(a => {
             const p = projects.find(x => x.id === a.projectId);
             return `<tr><td>${p ? esc(p.projectName) : '?'}</td><td>${a.capacity.toFixed(2)}</td><td>${a.fit.toFixed(2)}</td></tr>`;
           }).join('')}</tbody></table>`
      }
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── stubs for etap 3 ──────────────────────────────────────────────────────────
function openAssignPopup(eid, btn) { /* etap 3 */ }
function openCalendarPopup(eid)    { /* etap 3 */ }

// ── calculations ──────────────────────────────────────────────────────────────
function calcAge(dob) {
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
}

function calcEstimatedPayment(e) {
  if (e.assignments.length === 0) return e.salary * 0.5;
  return e.assignments.reduce((s, a) => s + e.salary * Math.max(0.5, a.capacity), 0);
}

function calcEmployeeIncome(e, projects) {
  if (e.assignments.length === 0) return 0;
  const year = state.currentYear, month = state.currentMonth;
  const vacCoef = getVacationCoefficient(year, month, e.vacationDays);

  return e.assignments.reduce((sum, a) => {
    const p = projects.find(x => x.id === a.projectId);
    if (!p) return sum;
    const { employees: allEmp } = getMonthData(year, month);
    const effCap = a.capacity * a.fit * vacCoef;
    const usedCap = allEmp.reduce((s, emp) => {
      const ea = emp.assignments.find(x => x.projectId === p.id);
      if (!ea) return s;
      const vc = getVacationCoefficient(year, month, emp.vacationDays);
      return s + ea.capacity * ea.fit * vc;
    }, 0);
    const capForRev  = Math.max(p.capacity, usedCap);
    const revPerUnit = capForRev > 0 ? p.budget / capForRev : 0;
    const rev  = revPerUnit * effCap;
    const cost = e.salary * Math.max(0.5, a.capacity);
    return sum + rev - cost;
  }, 0);
}
