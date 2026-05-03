// ── render ───────────────────────────────────────────────────────────────────
function renderEmployeesTable() {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#employees-table tbody');

  let filtered = applyEmployeeFilters(employees);
  filtered = applySortEmployees(filtered, projects);

  renderFilterChips('employees-filter-chips', state.filterEmployees, key => {
    delete state.filterEmployees[key];
    renderEmployeesTable();
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">No employees for this period.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(e => employeeRow(e, projects)).join('');
  bindEmployeeEvents(tbody);
}

function applyEmployeeFilters(employees) {
  const f = state.filterEmployees;
  return employees.filter(e =>
    Object.entries(f).every(([k, v]) =>
      String(e[k] || '').toLowerCase().includes(v.toLowerCase())
    )
  );
}

function employeeRow(e, projects) {
  const age      = calcAge(e.dob);
  const payment  = calcEstimatedPayment(e);
  const income   = calcEmployeeIncome(e, projects);
  const totalCap = e.assignments.reduce((s, a) => s + a.capacity, 0);
  const incClass = colorClass(income);
  const assignDisabled = totalCap >= 1.5 ? 'disabled' : '';

  return `<tr data-eid="${e.id}">
    <td>${esc(e.name)}</td>
    <td>${esc(e.surname)}</td>
    <td>${age}</td>
    <td class="cell-position" data-eid="${e.id}">${esc(e.position)}</td>
    <td class="cell-salary"   data-eid="${e.id}">${fmt(e.salary)}</td>
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

function bindEmployeeEvents(tbody) {
  tbody.querySelectorAll('.btn-delete-employee').forEach(btn =>
    btn.addEventListener('click', () => deleteEmployee(btn.dataset.eid)));
  tbody.querySelectorAll('.btn-show-assignments').forEach(btn =>
    btn.addEventListener('click', () => openShowAssignmentsPopup(btn.dataset.eid)));
  tbody.querySelectorAll('.cell-position').forEach(cell =>
    cell.addEventListener('click', () => inlineEditPosition(cell)));
  tbody.querySelectorAll('.cell-salary').forEach(cell =>
    cell.addEventListener('click', () => inlineEditSalary(cell)));
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

  console.log('initAddEmployeePanel: btn=', btn, 'panel=', panel);

  btn.addEventListener('click', () => {
    console.log('add-employee-btn clicked');
    openPanel(panel);
  });
  panel.querySelector('.panel-close').addEventListener('click', () => closePanel(panel));
  initFormValidation(form, validateEmployeeField, data => {
    const md = getMonthData(state.currentYear, state.currentMonth);
    md.employees.push({
      id: uid(), name: data.name, surname: data.surname,
      dob: data.dob, position: data.position,
      salary: parseFloat(data.salary),
      assignments: [], vacationDays: [],
    });
    saveMonthData(state.currentYear, state.currentMonth, md);
    closePanel(panel);
    renderEmployeesTable();
  });
}

// openShowAssignmentsPopup → popups.js
// openAssignPopup          → assign.js
// openCalendarPopup        → calendar.js
