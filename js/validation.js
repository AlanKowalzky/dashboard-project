// ── validation rules ────────────────────────────────────────────────────────
const POSITIONS = ['Junior', 'Middle', 'Senior', 'Lead', 'Architect', 'BO'];

function validateProjectField(name, value) {
  switch (name) {
    case 'projectName':
      if (!value) return 'Project name is required.';
      if (value.length < 3) return 'Min 3 characters.';
      if (!/^[a-zA-Z0-9 _-]+$/.test(value)) return 'Alphanumeric characters only.';
      return '';
    case 'companyName':
      if (!value) return 'Company name is required.';
      if (value.length < 2) return 'Min 2 characters.';
      if (!/^[a-zA-Z0-9 _-]+$/.test(value)) return 'Alphanumeric characters only.';
      return '';
    case 'budget':
      if (value === '' || value === null) return 'Budget is required.';
      if (isNaN(value) || +value <= 0) return 'Must be a positive number.';
      return '';
    case 'capacity':
      if (value === '' || value === null) return 'Capacity is required.';
      if (!Number.isInteger(+value) || +value < 1) return 'Must be an integer ≥ 1.';
      return '';
    default: return '';
  }
}

function validateEmployeeField(name, value) {
  switch (name) {
    case 'name':
    case 'surname':
      if (!value) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
      if (value.length < 3) return 'Min 3 characters.';
      if (!/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ -]+$/.test(value)) return 'Letters only.';
      return '';
    case 'dob': {
      if (!value) return 'Date of birth is required.';
      const age = Math.floor((Date.now() - new Date(value)) / (365.25 * 24 * 3600 * 1000));
      if (age < 18) return 'Employee must be at least 18 years old.';
      return '';
    }
    case 'position':
      if (!value || !POSITIONS.includes(value)) return 'Please select a position.';
      return '';
    case 'salary':
      if (value === '' || value === null) return 'Salary is required.';
      if (isNaN(value) || +value <= 0) return 'Must be a positive number.';
      return '';
    default: return '';
  }
}

// ── generic form validator ───────────────────────────────────────────────────
function initFormValidation(form, validateFn, onValid) {
  const submit = form.querySelector('[type="submit"]');

  function checkField(input) {
    const err = validateFn(input.name, input.value.trim());
    const span = input.closest('.field').querySelector('.field-error');
    span.textContent = err;
    input.classList.toggle('invalid', !!err);
    return !err;
  }

  function checkAll() {
    const inputs = [...form.querySelectorAll('[name]')];
    const allOk = inputs.every(inp => !validateFn(inp.name, inp.value.trim()));
    submit.disabled = !allOk;
  }

  form.querySelectorAll('[name]').forEach(inp => {
    inp.addEventListener('input', () => { checkField(inp); checkAll(); });
    inp.addEventListener('blur',  () => { checkField(inp); checkAll(); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll('[name]')];
    const allOk = inputs.every(inp => checkField(inp));
    if (!allOk) return;
    const data = Object.fromEntries(inputs.map(i => [i.name, i.value.trim()]));
    onValid(data);
    form.reset();
    inputs.forEach(i => { i.classList.remove('invalid'); i.closest('.field').querySelector('.field-error').textContent = ''; });
    submit.disabled = true;
  });
}
