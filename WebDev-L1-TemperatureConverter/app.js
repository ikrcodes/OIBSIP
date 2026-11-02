const form = document.querySelector('#convert-form');
const input = document.querySelector('#temperature');
const unit = document.querySelector('#unit');
const error = document.querySelector('#error-message');
const cards = [...document.querySelectorAll('.result')];
const output = {
  C: document.querySelector('#result-C'),
  F: document.querySelector('#result-F'),
  K: document.querySelector('#result-K')
};
const ABSOLUTE_ZERO_C = -273.15;

function toCelsius(value, from) {
  if (from === 'C') return value;
  if (from === 'F') return (value - 32) * 5 / 9;
  return value - 273.15;
}

function format(value) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function clearResults() {
  Object.values(output).forEach((node) => { node.textContent = '—'; });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  error.textContent = '';
  clearResults();
  const raw = input.value.trim();
  if (raw === '') {
    error.textContent = 'Enter a temperature to convert.';
    input.focus();
    return;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    error.textContent = 'Enter a valid numeric temperature.';
    input.focus();
    return;
  }
  const celsius = toCelsius(value, unit.value);
  if (celsius < ABSOLUTE_ZERO_C - 1e-10) {
    error.textContent = 'That temperature is below absolute zero. Please enter a physically possible value.';
    input.focus();
    return;
  }
  const c = Math.max(celsius, ABSOLUTE_ZERO_C);
  const values = { C: c, F: c * 9 / 5 + 32, K: c + 273.15 };
  Object.entries(values).forEach(([key, result]) => { output[key].textContent = format(result); });
  cards.forEach((card) => card.classList.toggle('active', card.dataset.result === unit.value));
});
