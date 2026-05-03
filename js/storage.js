const STORAGE_KEY = 'monthlyData';

function getData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getMonthData(year, month) {
  const data = getData();
  const key = `${year}-${month}`;
  if (!data[key]) data[key] = { employees: [], projects: [] };
  return data[key];
}

function saveMonthData(year, month, monthData) {
  const data = getData();
  data[`${year}-${month}`] = monthData;
  saveData(data);
}

function seedData(fromYear, fromMonth, toYear, toMonth) {
  const source = getMonthData(fromYear, fromMonth);
  const copy = JSON.parse(JSON.stringify(source));
  copy.employees.forEach(e => { e.vacationDays = []; });
  saveMonthData(toYear, toMonth, copy);
}

function initSampleData() {
  const data = getData();
  if (Object.keys(data).length > 0) return;

  const pid1 = uid(), pid2 = uid(), pid3 = uid();
  const sample = {
    employees: [
      { id: uid(), name: 'Anna',   surname: 'Nowak',     dob: '1990-03-12', position: 'Senior',    salary: 9000,  assignments: [{ projectId: pid1, capacity: 0.8, fit: 0.9 }], vacationDays: [] },
      { id: uid(), name: 'Piotr',  surname: 'Kowalski',  dob: '1988-07-24', position: 'Lead',      salary: 12000, assignments: [{ projectId: pid1, capacity: 0.5, fit: 1.0 }, { projectId: pid2, capacity: 0.5, fit: 0.8 }], vacationDays: [] },
      { id: uid(), name: 'Maria',  surname: 'Wiśniewska',dob: '1995-11-05', position: 'Middle',    salary: 7000,  assignments: [{ projectId: pid2, capacity: 1.0, fit: 0.7 }], vacationDays: [] },
      { id: uid(), name: 'Tomasz', surname: 'Zając',     dob: '1992-01-30', position: 'Junior',    salary: 5000,  assignments: [], vacationDays: [] },
      { id: uid(), name: 'Ewa',    surname: 'Dąbrowska', dob: '1985-09-18', position: 'Architect', salary: 15000, assignments: [{ projectId: pid3, capacity: 0.6, fit: 0.95 }], vacationDays: [] },
    ],
    projects: [
      { id: pid1, projectName: 'Phoenix',  companyName: 'Acme Corp',    budget: 80000, capacity: 2 },
      { id: pid2, projectName: 'Horizon',  companyName: 'TechSoft',     budget: 60000, capacity: 3 },
      { id: pid3, projectName: 'Catalyst', companyName: 'InnovateLab',  budget: 45000, capacity: 1 },
    ]
  };

  const now = new Date();
  saveMonthData(now.getFullYear(), now.getMonth(), sample);
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
