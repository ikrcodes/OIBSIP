const expressionEl = document.querySelector('#expression');
const displayEl = document.querySelector('#display');
const statusEl = document.querySelector('#status');
const keyButtons = document.querySelectorAll('.keys button');
let expression = '';
let finished = false;

function isOperator(char) { return ['+', '-', '*', '/'].includes(char); }
function currentNumber() { return expression.split(/[+\-*/]/).at(-1) ?? ''; }
function cleanNumber(value) {
  if (!Number.isFinite(value)) throw new Error('Result is outside the supported range.');
  return String(Number(value.toPrecision(12)));
}

function evaluate(source) {
  const tokens = source.match(/(?:\d+\.?\d*|\.\d+)|[+\-*/]/g) || [];
  if (tokens.join('') !== source || tokens.length % 2 === 0) throw new Error('Enter a complete calculation.');
  const numbers = [];
  const operators = [];
  tokens.forEach((token, index) => {
    if (index % 2 === 0) {
      const value = Number(token);
      if (!Number.isFinite(value)) throw new Error('Enter a valid number.');
      numbers.push(value);
    } else {
      if (!isOperator(token)) throw new Error('Check the operators.');
      operators.push(token);
    }
  });
  for (let i = 0; i < operators.length;) {
    if (operators[i] === '*' || operators[i] === '/') {
      const a = numbers[i], b = numbers[i + 1];
      if (operators[i] === '/' && b === 0) throw new Error('Cannot divide by zero.');
      numbers.splice(i, 2, operators[i] === '*' ? a * b : a / b);
      operators.splice(i, 1);
    } else i++;
  }
  let total = numbers[0];
  operators.forEach((operator, index) => {
    total = operator === '+' ? total + numbers[index + 1] : total - numbers[index + 1];
  });
  return total;
}

function render(preview = true) {
  expressionEl.textContent = expression ? expression.replaceAll('*', '×').replaceAll('/', '÷') : ' ';
  statusEl.textContent = '';
  if (!expression) { displayEl.textContent = '0'; return; }
  if (preview && !isOperator(expression.at(-1))) {
    try { displayEl.textContent = cleanNumber(evaluate(expression)); return; }
    catch (error) { if (error.message.includes('zero')) statusEl.textContent = error.message; }
  }
  displayEl.textContent = currentNumber() || '0';
}

function enterDigit(value) {
  if (finished) { expression = ''; finished = false; }
  const current = currentNumber();
  if (value === '.' && current === '') { expression += '0.'; render(); return; }
  if (current === '0' && value !== '.') expression = expression.slice(0, -1) + value;
  else if (value !== '.' || !current.includes('.')) expression += value;
  render();
}

function enterOperator(operator) {
  if (finished) finished = false;
  if (!expression) {
    if (operator === '-') expression = '0-';
    render(); return;
  }
  if (isOperator(expression.at(-1))) expression = expression.slice(0, -1) + operator;
  else expression += operator;
  render();
}

function solve() {
  if (!expression || isOperator(expression.at(-1))) return;
  try {
    const result = cleanNumber(evaluate(expression));
    expressionEl.textContent = expression.replaceAll('*', '×').replaceAll('/', '÷') + ' =';
    displayEl.textContent = result;
    expression = result;
    finished = true;
    statusEl.textContent = '';
  } catch (error) {
    statusEl.textContent = error.message;
  }
}

function act(value, action) {
  if (action === 'clear') { expression = ''; finished = false; statusEl.textContent = ''; render(false); return; }
  if (action === 'delete') { expression = expression.slice(0, -1); finished = false; render(); return; }
  if (action === 'equals') { solve(); return; }
  if (isOperator(value)) enterOperator(value);
  else enterDigit(value);
}

keyButtons.forEach((button) => button.addEventListener('click', () => act(button.dataset.value, button.dataset.action)));
document.addEventListener('keydown', (event) => {
  if (/^[0-9.]$/.test(event.key)) act(event.key);
  else if (['+', '-', '*', '/'].includes(event.key)) act(event.key);
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); act('', 'equals'); }
  else if (event.key === 'Backspace') act('', 'delete');
  else if (event.key === 'Escape') act('', 'clear');
});
render(false);
