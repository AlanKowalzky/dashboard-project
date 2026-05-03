// ── calendar popup ────────────────────────────────────────────────────────────
function openCalendarPopup(eid) {
  const { employees } = getMonthData(state.currentYear, state.currentMonth);
  const emp  = employees.find(x => x.id === eid);
  const year = state.currentYear, month = state.currentMonth;
  const selected = new Set(emp.vacationDays);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  function render() {
    const totalWorking = countWorkingDays(year, month);
    const vacWorking   = [...selected].filter(d => !isWeekend(year, month, d)).length;
    const workingLeft  = totalWorking - vacWorking;
    const ranges       = formatVacationRanges([...selected].sort((a,b) => a-b), month);

    overlay.innerHTML = `
      <div class="popup calendar-popup" style="min-width:340px">
        <button class="popup-close">×</button>
        <h2>${monthName(month)} ${year}</h2>
        <div class="cal-working">Working Days: <strong>${workingLeft}/${totalWorking}</strong></div>
        <div class="cal-grid">
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div class="cal-head">${d}</div>`).join('')}
          ${buildCalendarCells(year, month, selected)}
        </div>
        <div class="cal-ranges">${ranges || '<em>No vacation days selected</em>'}</div>
        <div class="ap-actions" style="margin-top:12px">
          <button class="btn-primary cal-save">Set Vacation</button>
          <button class="btn-sm cal-cancel">Cancel</button>
        </div>
      </div>`;

    overlay.querySelector('.popup-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.cal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.popup')?.addEventListener('click', e => e.stopPropagation());

    overlay.querySelectorAll('.cal-day').forEach(cell => {
      cell.addEventListener('click', () => {
        const d = +cell.dataset.day;
        selected.has(d) ? selected.delete(d) : selected.add(d);
        render();
      });
    });

    overlay.querySelector('.cal-save').addEventListener('click', () => {
      const md  = getMonthData(year, month);
      const emp2 = md.employees.find(x => x.id === eid);
      emp2.vacationDays = [...selected].sort((a,b) => a-b);
      saveMonthData(year, month, md);
      overlay.remove();
      renderActiveView();
    });
  }

  render();
}

// ── calendar helpers ──────────────────────────────────────────────────────────
function buildCalendarCells(year, month, selected) {
  const firstDow = new Date(year, month, 1).getDay();
  const lastDay  = new Date(year, month + 1, 0).getDate();
  const today    = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  let html = '';

  // empty cells before first day
  for (let i = 0; i < firstDow; i++) html += '<div class="cal-empty"></div>';

  for (let d = 1; d <= lastDay; d++) {
    const dow      = new Date(year, month, d).getDay();
    const weekend  = dow === 0 || dow === 6;
    const isToday  = isCurrentMonth && today.getDate() === d;
    const vacation = selected.has(d);
    const classes  = ['cal-day',
      weekend  ? 'cal-weekend'  : '',
      isToday  ? 'cal-today'    : '',
      vacation ? 'cal-vacation' : '',
    ].filter(Boolean).join(' ');
    html += `<div class="${classes}" data-day="${d}">${d}</div>`;
  }
  return html;
}

function countWorkingDays(year, month) {
  const last = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= last; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function isWeekend(year, month, day) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

// ── format vacation ranges ────────────────────────────────────────────────────
function formatVacationRanges(days, month) {
  if (!days.length) return '';
  const mm = String(month + 1).padStart(2, '0');
  const fmt2 = d => String(d).padStart(2, '0') + '.' + mm;

  const ranges = [];
  let start = days[0], end = days[0];

  for (let i = 1; i < days.length; i++) {
    // consecutive including weekends between
    if (days[i] - end <= 3 && hasOnlyWeekendsBetween(end, days[i], month, new Date().getFullYear())) {
      end = days[i];
    } else {
      ranges.push(start === end ? fmt2(start) : `${fmt2(start)}-${fmt2(end)}`);
      start = end = days[i];
    }
  }
  ranges.push(start === end ? fmt2(start) : `${fmt2(start)}-${fmt2(end)}`);
  return ranges.join(', ');
}

function hasOnlyWeekendsBetween(a, b, month, year) {
  for (let d = a + 1; d < b; d++) {
    if (!isWeekend(year, month, d)) return false;
  }
  return true;
}
