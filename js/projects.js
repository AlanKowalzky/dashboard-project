// filled in etap 2
function renderProjectsTable() {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#projects-table tbody');
  if (!tbody) return;
  tbody.innerHTML = projects.length === 0
    ? '<tr><td colspan="7" class="empty">No projects for this period.</td></tr>'
    : projects.map(p => `<tr><td colspan="7">${p.companyName} — ${p.projectName}</td></tr>`).join('');
}
