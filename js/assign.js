// ── assign popup ──────────────────────────────────────────────────────────────
function openAssignPopup(eid, triggerBtn) {
  const { employees, projects } = getMonthData(state.currentYear, state.currentMonth);
  const emp = employees.find(x => x.id === eid);
  const usedCap = emp.assignments.reduce((s, a) => s + a.capacity, 0);
  const available = +(1.5 - usedCap).toFixed(1);

  // remove existing
  document.getElementById('assign-popup')?.remove();

  const popup = document.createElement('div');
  popup.id = 'assign-popup';
  popup.className = 'assign-popup';

  const projectOptions = projects
    .filter(p => !emp.assignments.some(a => a.projectId === p.id))
    .map(p => {
      const { usedCap: pUsed } = calcProjectSummary(p, employees);
      return `<option value="${p.id}">${esc(p.projectName)} — ${esc(p.companyName)} (${pUsed.toFixed(1)}/${p.capacity})</option>`;
    }).join('');

  if (!projectOptions) {
    popup.innerHTML = `<div class="assign-popup-inner">
      <p>No available projects to assign.</p>
      <button class="btn-sm ap-cancel">Close</button>
    </div>`;
  } else {
    popup.innerHTML = `<div class="assign-popup-inner">
      <div class="ap-row"><span>Current capacity:</span><strong>${usedCap.toFixed(1)} / 1.5</strong></div>
      <div class="ap-row"><span>Available:</span><strong>${available}</strong></div>
      <div class="field">
        <label>Project</label>
        <select id="ap-project">${projectOptions}</select>
      </div>
      <div class="field">
        <label>Capacity: <span id="ap-cap-val">0.5</span></label>
        <input type="range" id="ap-cap" min="0" max="1.5" step="0.1" value="0.5" />
      </div>
      <div class="field">
        <label>Fit: <span id="ap-fit-val">1.0</span></label>
        <input type="range" id="ap-fit" min="0" max="1.0" step="0.1" value="1.0" />
      </div>
      <div class="ap-row"><span>Effective capacity:</span><strong id="ap-eff">0.500</strong></div>
      <div class="ap-row"><span>Capacity after:</span><strong id="ap-after">${(usedCap + 0.5).toFixed(1)} / 1.5</strong></div>
      <div id="ap-warn" class="ap-warn" hidden></div>
      <div id="ap-err"  class="ap-err"  hidden></div>
      <div class="ap-actions">
        <button class="btn-primary ap-confirm">Assign</button>
        <button class="btn-sm ap-cancel">Cancel</button>
      </div>
    </div>`;
  }

  document.body.appendChild(popup);
  positionPopup(popup, triggerBtn);

  // scroll/resize reposition
  const reposition = () => positionPopup(popup, triggerBtn);
  window.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition);

  function closePopup() {
    popup.remove();
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition);
    document.removeEventListener('mousedown', outsideClick);
  }

  function outsideClick(e) {
    if (!popup.contains(e.target) && e.target !== triggerBtn) closePopup();
  }
  setTimeout(() => document.addEventListener('mousedown', outsideClick), 0);

  popup.querySelector('.ap-cancel')?.addEventListener('click', closePopup);

  if (!projectOptions) return;

  const capSlider = popup.querySelector('#ap-cap');
  const fitSlider = popup.querySelector('#ap-fit');
  const capVal    = popup.querySelector('#ap-cap-val');
  const fitVal    = popup.querySelector('#ap-fit-val');
  const effEl     = popup.querySelector('#ap-eff');
  const afterEl   = popup.querySelector('#ap-after');
  const warnEl    = popup.querySelector('#ap-warn');
  const errEl     = popup.querySelector('#ap-err');
  const projSel   = popup.querySelector('#ap-project');

  function updateSliders() {
    const cap = +capSlider.value;
    const fit = +fitSlider.value;
    capVal.textContent = cap.toFixed(1);
    fitVal.textContent = fit.toFixed(1);
    effEl.textContent  = (cap * fit).toFixed(3);
    afterEl.textContent = `${(usedCap + cap).toFixed(1)} / 1.5`;

    // capacity error
    if (usedCap + cap > 1.5) {
      errEl.textContent = `Exceeds max capacity (1.5). Reduce by ${(usedCap + cap - 1.5).toFixed(1)}.`;
      errEl.hidden = false;
    } else {
      errEl.hidden = true;
    }

    // project over-capacity warning
    const pid = projSel.value;
    const { employees: allEmp, projects: allProj } = getMonthData(state.currentYear, state.currentMonth);
    const proj = allProj.find(x => x.id === pid);
    if (proj) {
      const { usedCap: pUsed } = calcProjectSummary(proj, allEmp);
      const vacCoef = getVacationCoefficient(state.currentYear, state.currentMonth, emp.vacationDays);
      const newEff  = cap * fit * vacCoef;
      if (pUsed + newEff > proj.capacity) {
        warnEl.textContent = `Warning: project capacity will be exceeded (${(pUsed + newEff).toFixed(2)}/${proj.capacity}).`;
        warnEl.hidden = false;
      } else {
        warnEl.hidden = true;
      }
    }
  }

  capSlider.addEventListener('input', updateSliders);
  fitSlider.addEventListener('input', updateSliders);
  projSel.addEventListener('change', updateSliders);
  updateSliders();

  popup.querySelector('.ap-confirm').addEventListener('click', () => {
    const cap = +capSlider.value;
    if (usedCap + cap > 1.5) return;
    const md = getMonthData(state.currentYear, state.currentMonth);
    const e  = md.employees.find(x => x.id === eid);
    e.assignments.push({ projectId: projSel.value, capacity: cap, fit: +fitSlider.value });
    saveMonthData(state.currentYear, state.currentMonth, md);
    closePopup();
    renderActiveView();
  });
}

// ── edit assignment popup ─────────────────────────────────────────────────────
function openEditAssignmentPopup(eid, pid, onSave) {
  const { employees } = getMonthData(state.currentYear, state.currentMonth);
  const emp  = employees.find(x => x.id === eid);
  const asgn = emp.assignments.find(a => a.projectId === pid);
  const otherCap = emp.assignments.filter(a => a.projectId !== pid).reduce((s, a) => s + a.capacity, 0);

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = `
    <div class="popup" style="min-width:300px">
      <button class="popup-close">×</button>
      <h2>Edit Assignment</h2>
      <div class="field">
        <label>Capacity: <span id="ea-cap-val">${asgn.capacity.toFixed(1)}</span></label>
        <input type="range" id="ea-cap" min="0" max="1.5" step="0.1" value="${asgn.capacity}" />
      </div>
      <div class="field">
        <label>Fit: <span id="ea-fit-val">${asgn.fit.toFixed(1)}</span></label>
        <input type="range" id="ea-fit" min="0" max="1.0" step="0.1" value="${asgn.fit}" />
      </div>
      <div class="ap-row"><span>Effective:</span><strong id="ea-eff">${(asgn.capacity * asgn.fit).toFixed(3)}</strong></div>
      <div id="ea-err" class="ap-err" hidden></div>
      <div class="ap-actions" style="margin-top:12px">
        <button class="btn-primary ea-save">Save</button>
        <button class="btn-sm ea-cancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const capSlider = overlay.querySelector('#ea-cap');
  const fitSlider = overlay.querySelector('#ea-fit');
  const capVal    = overlay.querySelector('#ea-cap-val');
  const fitVal    = overlay.querySelector('#ea-fit-val');
  const effEl     = overlay.querySelector('#ea-eff');
  const errEl     = overlay.querySelector('#ea-err');

  function update() {
    const cap = +capSlider.value, fit = +fitSlider.value;
    capVal.textContent = cap.toFixed(1);
    fitVal.textContent = fit.toFixed(1);
    effEl.textContent  = (cap * fit).toFixed(3);
    if (otherCap + cap > 1.5) {
      errEl.textContent = `Total capacity would exceed 1.5.`;
      errEl.hidden = false;
    } else { errEl.hidden = true; }
  }

  capSlider.addEventListener('input', update);
  fitSlider.addEventListener('input', update);

  const close = () => overlay.remove();
  overlay.querySelector('.popup-close').addEventListener('click', close);
  overlay.querySelector('.ea-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('.ea-save').addEventListener('click', () => {
    const cap = +capSlider.value;
    if (otherCap + cap > 1.5) return;
    const md   = getMonthData(state.currentYear, state.currentMonth);
    const emp2 = md.employees.find(x => x.id === eid);
    const a    = emp2.assignments.find(x => x.projectId === pid);
    a.capacity = cap;
    a.fit      = +fitSlider.value;
    saveMonthData(state.currentYear, state.currentMonth, md);
    close();
    onSave();
  });
}

// ── position popup near button ────────────────────────────────────────────────
function positionPopup(popup, btn) {
  const rect = btn.getBoundingClientRect();
  const pw   = popup.offsetWidth  || 280;
  const ph   = popup.offsetHeight || 320;
  let top  = rect.bottom + 6;
  let left = rect.left;
  if (left + pw > window.innerWidth  - 8) left = window.innerWidth  - pw - 8;
  if (top  + ph > window.innerHeight - 8) top  = rect.top - ph - 6;
  if (left < 8) left = 8;
  if (top  < 8) top  = 8;
  popup.style.position = 'fixed';
  popup.style.top  = top  + 'px';
  popup.style.left = left + 'px';
  popup.style.zIndex = 400;
}
