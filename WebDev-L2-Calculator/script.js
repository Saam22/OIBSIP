const displayExpression = document.getElementById("displayExpression");
const displayResult = document.getElementById("displayResult");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const equalsButton = document.querySelector("[data-equals]");
const clearButton = document.querySelector("[data-clear]");
const backspaceButton = document.querySelector("[data-backspace]");

const MAX_DIGITS = 12;

let currentOperand = "";
let previousOperand = "";
let operator = null;
let shouldResetDisplay = false;
let hasError = false;

const OPERATOR_SYMBOLS = {
  "+": "+",
  "-": "\u2212",
  "*": "\u00d7",
  "/": "\u00f7",
};

function formatNumber(value) {
  const rounded = parseFloat(value.toFixed(10));
  return String(rounded);
}

function updateDisplay() {
  if (hasError) {
    displayResult.textContent = "Cannot divide by zero";
    displayResult.classList.add("error");
    displayExpression.textContent = "";
    return;
  }

  displayResult.classList.remove("error");
  displayResult.textContent =
    currentOperand === "" ? "0" : currentOperand;

  if (operator && previousOperand !== "") {
    displayExpression.textContent =
      previousOperand + " " + OPERATOR_SYMBOLS[operator];
  } else {
    displayExpression.textContent = "";
  }
}

function clearAll() {
  currentOperand = "";
  previousOperand = "";
  operator = null;
  shouldResetDisplay = false;
  hasError = false;
  updateDisplay();
}

function appendDigit(digit) {
  if (hasError) {
    clearAll();
  }

  if (shouldResetDisplay) {
    currentOperand = "";
    shouldResetDisplay = false;
  }

  if (digit === ".") {
    if (currentOperand.includes(".")) {
      return;
    }
    currentOperand = currentOperand === "" ? "0." : currentOperand + ".";
  } else if (currentOperand === "0") {
    currentOperand = digit;
  } else {
    currentOperand += digit;
  }

  if (currentOperand.length > MAX_DIGITS) {
    currentOperand = currentOperand.slice(0, MAX_DIGITS);
  }

  updateDisplay();
}

function compute() {
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);

  if (isNaN(prev) || isNaN(curr)) {
    return currentOperand;
  }

  let result;
  switch (operator) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      if (curr === 0) {
        hasError = true;
        return "Cannot divide by zero";
      }
      result = prev / curr;
      break;
    default:
      return currentOperand;
  }

  return formatNumber(result);
}

function chooseOperator(nextOperator) {
  if (hasError) {
    return;
  }

  if (operator !== null && currentOperand !== "" && !shouldResetDisplay) {
    currentOperand = compute();
    if (hasError) {
      updateDisplay();
      return;
    }
  }

  previousOperand = currentOperand === "" ? "0" : currentOperand;
  operator = nextOperator;
  shouldResetDisplay = true;
  updateDisplay();
}

function evaluate() {
  if (hasError || operator === null || currentOperand === "") {
    return;
  }
  if (shouldResetDisplay) {
    return;
  }

  displayExpression.textContent =
    previousOperand +
    " " +
    OPERATOR_SYMBOLS[operator] +
    " " +
    currentOperand +
    " =";

  currentOperand = compute();
  operator = null;
  previousOperand = "";
  shouldResetDisplay = true;
  updateDisplay();
}

function backspace() {
  if (hasError) {
    clearAll();
    return;
  }
  if (shouldResetDisplay) {
    return;
  }

  currentOperand = currentOperand.slice(0, -1);
  updateDisplay();
}

numberButtons.forEach((button) => {
  button.addEventListener("click", () => appendDigit(button.dataset.number));
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () =>
    chooseOperator(button.dataset.operator)
  );
});

equalsButton.addEventListener("click", evaluate);
clearButton.addEventListener("click", clearAll);
backspaceButton.addEventListener("click", backspace);