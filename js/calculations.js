// ── core calculation functions ────────────────────────────────────────────────

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

function getEffectiveCapacity(capacity, fit, vacCoef) {
  return capacity * fit * vacCoef;
}

function getEmployeeCost(salary, capacity) {
  return salary * Math.max(0.5, capacity);
}

function getBenchCost(salary) {
  return salary * 0.5;
}

function getProfit(revenue, cost) {
  return revenue - cost;
}

// Returns { usedCap, revenuePerUnit, totalRevenue, totalCost, income }
function calcProjectSummaryFull(p, employees) {
  const year = state.currentYear, month = state.currentMonth;
  let usedCap = 0, totalCost = 0;
  employees.forEach(e => {
    const a = e.assignments.find(x => x.projectId === p.id);
    if (!a) return;
    const vc = getVacationCoefficient(year, month, e.vacationDays || []);
    usedCap   += getEffectiveCapacity(a.capacity, a.fit, vc);
    totalCost += getEmployeeCost(e.salary, a.capacity);
  });
  const capForRev      = Math.max(p.capacity, usedCap);
  const revenuePerUnit = capForRev > 0 ? p.budget / capForRev : 0;
  const totalRevenue   = revenuePerUnit * usedCap;
  return { usedCap, revenuePerUnit, totalRevenue, totalCost, income: totalRevenue - totalCost };
}

// Alias used by projects.js
function calcProjectSummary(p, employees) {
  const { usedCap, income } = calcProjectSummaryFull(p, employees);
  return { usedCap, income };
}

function calcTotalIncome(projects, employees) {
  const projectsIncome = projects.reduce((s, p) => s + calcProjectSummaryFull(p, employees).income, 0);
  const bench = employees
    .filter(e => e.assignments.length === 0)
    .reduce((s, e) => s + getBenchCost(e.salary), 0);
  return projectsIncome - bench;
}

function calcEstimatedPayment(e) {
  if (e.assignments.length === 0) return getBenchCost(e.salary);
  return e.assignments.reduce((s, a) => s + getEmployeeCost(e.salary, a.capacity), 0);
}

function calcEmployeeIncome(e, projects) {
  if (e.assignments.length === 0) return 0;
  const year = state.currentYear, month = state.currentMonth;
  const vacCoef = getVacationCoefficient(year, month, e.vacationDays);
  const { employees: allEmp } = getMonthData(year, month);

  return e.assignments.reduce((sum, a) => {
    const p = projects.find(x => x.id === a.projectId);
    if (!p) return sum;
    const { revenuePerUnit } = calcProjectSummaryFull(p, allEmp);
    const effCap = getEffectiveCapacity(a.capacity, a.fit, vacCoef);
    const rev    = revenuePerUnit * effCap;
    const cost   = getEmployeeCost(e.salary, a.capacity);
    return sum + getProfit(rev, cost);
  }, 0);
}

function calcAge(dob) {
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
}

// ── display helpers ───────────────────────────────────────────────────────────
function colorClass(value) {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return '';
}

function fmt(n)  { return Number(n).toFixed(2); }
function esc(s)  { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
