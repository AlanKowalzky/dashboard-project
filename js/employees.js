// filled in etap 2
function renderEmployeesTable() {
  const { employees } = getMonthData(state.currentYear, state.currentMonth);
  const tbody = document.querySelector('#employees-table tbody');
  if (!tbody) return;
  tbody.innerHTML = employees.length === 0
    ? '<tr><td colspan="9" class="empty">No employees for this period.</td></tr>'
    : employees.map(e => `<tr><td colspan="9">${e.name} ${e.surname}</td></tr>`).join('');
}
