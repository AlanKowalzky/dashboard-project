// ── render ───────────────────────────────────────────────────────────────────
function renderProjectsTable() {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#projects-table tbody');

  let filtered = applyProjectFilters(projects);
  filtered = applySortProjects(filtered, employees);

  renderFilterChips('projects-filter-chips', state.filterProjects, key => {
    delete state.filterProjects[key];
    renderProjectsTable();
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">No projects for this period.</td></tr>';
    document.getElementById('total-income').textContent = '';
    return;
  }

  tbody.innerHTML = filtered.map(p => projectRow(p, employees)).join('');
  renderTotalIncome(projects, employees);
  bindProjectEvents(tbody);
}

function applyProjectFilters(projects) {
  const f = state.filterProjects;
  return projects.filter(p =>
    Object.entries(f).every(([k, v]) =>
      String(p[k] || '').toLowerCase().includes(v.toLowerCase())
    )
  );
}

function projectRow(p, employees) {
  const { usedCap, income } = calcProjectSummary(p, employees);
  const capClass      = usedCap > p.capacity ? 'over-capacity' : '';
  const incClass      = colorClass(income);
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
  el.className = 'total-income ' + colorClass(total);
  el.textContent = `Total Estimated Income: ${fmt(total)}`;
}

function bindProjectEvents(tbody) {
  tbody.querySelectorAll('.btn-delete-project').forEach(btn =>
    btn.addEventListener('click', () => deleteProject(btn.dataset.pid)));
  tbody.querySelectorAll('.btn-show-employees').forEach(btn =>
    btn.addEventListener('click', () => openShowEmployeesPopup(btn.dataset.pid)));
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
      budget:   parseFloat(data.budget),
      capacity: parseInt(data.capacity),
    });
    saveMonthData(state.currentYear, state.currentMonth, md);
    closePanel(panel);
    renderProjectsTable();
  });
}

// openShowEmployeesPopup → popups.js
