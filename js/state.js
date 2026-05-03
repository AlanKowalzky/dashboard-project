const now = new Date();

const state = {
  currentYear:  now.getFullYear(),
  currentMonth: now.getMonth(),
  activeTab: 'projects',
  sortProjects:  { column: null, direction: null },
  sortEmployees: { column: null, direction: null },
  filterProjects:  {},
  filterEmployees: {},
};

function setCurrentPeriod(year, month) {
  state.currentYear  = parseInt(year);
  state.currentMonth = parseInt(month);
}

function setActiveTab(tab) {
  state.activeTab = tab;
}
