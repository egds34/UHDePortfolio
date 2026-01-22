// Mathematical Operations Practice
let currentMathAnswer = 0;
let currentMathExplanation = "";
const exactColor = '#8839ef'; // Purple for exact numbers

function countSigFigs(numStr) {
    numStr = numStr.toString().trim();

    if (numStr.startsWith('0.')) {
        let leadingPart = numStr.match(/^0\.0*/)[0];
        let remaining = numStr.substring(leadingPart.length);
        return remaining.replace('.', '').length;
    } else {
        return numStr.replace('.', '').replace('-', '').length;
    }
}

function toScientific(num, sigFigs) {
    return num.toExponential(sigFigs - 1);
}

function generateMathProblem() {
    const type = Math.random() < 0.5 ? 'mult' : 'add';

    if (type === 'mult') {
        const a = (Math.random() * 9 + 1).toFixed(Math.floor(Math.random() * 3) + 1);
        const b = (Math.random() * 9 + 1).toFixed(Math.floor(Math.random() * 3) + 1);
        const op = Math.random() < 0.5 ? '×' : '÷';

        const result = op === '×' ? parseFloat(a) * parseFloat(b) : parseFloat(a) / parseFloat(b);
        const minSigs = Math.min(countSigFigs(a), countSigFigs(b));

        currentMathAnswer = parseFloat(result.toPrecision(minSigs));
        currentMathExplanation = `Both numbers have ${countSigFigs(a)} and ${countSigFigs(b)} sig figs respectively. The result must have ${minSigs} sig figs (the smaller of the two).`;

        document.getElementById('mathProblem').innerHTML = `${a} ${op} ${b} = ?`;
    } else {
        const decimals1 = Math.floor(Math.random() * 3);
        const decimals2 = Math.floor(Math.random() * 3);
        const a = (Math.random() * 99 + 1).toFixed(decimals1);
        const b = (Math.random() * 99 + 1).toFixed(decimals2);
        const op = Math.random() < 0.5 ? '+' : '−';

        const result = op === '+' ? parseFloat(a) + parseFloat(b) : parseFloat(a) - parseFloat(b);
        const minDecimals = Math.min(decimals1, decimals2);

        currentMathAnswer = parseFloat(result.toFixed(minDecimals));
        currentMathExplanation = `The numbers have ${decimals1} and ${decimals2} decimal places. The result must have ${minDecimals} decimal places (the smaller of the two).`;

        document.getElementById('mathProblem').innerHTML = `${a} ${op} ${b} = ?`;
    }

    document.getElementById('mathGuess').value = '';
    document.getElementById('mathFeedback').textContent = '';
    document.getElementById('mathExplanation').innerHTML = '';
    document.getElementById('showMathAnswerBtn').style.display = 'none';
}

function checkMathAnswer() {
    const userVal = parseFloat(document.getElementById('mathGuess').value);
    const feedbackEl = document.getElementById('mathFeedback');

    if (isNaN(userVal)) {
        feedbackEl.textContent = "Please enter a number.";
        feedbackEl.className = 'feedback';
        return;
    }

    if (Math.abs(userVal - currentMathAnswer) < 0.01) {
        feedbackEl.textContent = "Correct! Great job.";
        feedbackEl.className = 'feedback correct';
        document.getElementById('showMathAnswerBtn').style.display = 'none';
        document.getElementById('mathExplanation').innerHTML = '';
    } else {
        feedbackEl.textContent = "Incorrect. Try again!";
        feedbackEl.className = 'feedback incorrect';
        document.getElementById('showMathAnswerBtn').style.display = 'inline-block';
    }
}

function showMathAnswer() {
    document.getElementById('mathFeedback').textContent = `The correct answer is ${currentMathAnswer}.`;
    document.getElementById('mathFeedback').className = 'feedback incorrect';
    document.getElementById('mathExplanation').innerHTML = currentMathExplanation;
    document.getElementById('showMathAnswerBtn').style.display = 'none';
}

// Multistep Practice with EXTREME difficulty
let currentMultistepAnswer = 0;
let currentMultistepAnswerSci = "";
let currentMultistepExpression = "";

function updateDifficultyLabel() {
    const slider = document.getElementById('difficultySlider');
    const label = document.getElementById('difficultyLabel');
    const labels = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme'];
    label.textContent = labels[slider.value - 1];
}

function generateNumber(difficulty, useSciNotation = false) {
    const maxNum = [10, 100, 1000, 10000, 100000][difficulty - 1];
    const maxDecimals = [1, 2, 3, 4, 5][difficulty - 1];
    const decimals = Math.floor(Math.random() * (maxDecimals + 1));
    let num = (Math.random() * maxNum + 0.1).toFixed(decimals);

    if (useSciNotation && difficulty >= 3) {
        const exponent = Math.floor(Math.random() * 6) - 3;
        const base = (Math.random() * 9 + 1).toFixed(decimals);
        return { value: parseFloat(base) * Math.pow(10, exponent), display: `${base} \\times 10^{${exponent}}`, sigFigs: countSigFigs(base) };
    }

    return { value: parseFloat(num), display: num, sigFigs: countSigFigs(num) };
}

function generateMultistepProblem() {
    const difficulty = parseInt(document.getElementById('difficultySlider').value);

    // Number of operations increases with difficulty
    const numOps = [2, 3, 4, 5, 6][difficulty - 1];
    const useParens = difficulty >= 3;
    const useExponents = difficulty >= 4;
    const useSciNotation = difficulty >= 3 && Math.random() < 0.3;

    let expression = '';
    let latexExpression = '';
    let result = 0;
    let minSigFigs = Infinity;

    if (difficulty === 1) {
        // Easy: Simple operations
        const a = generateNumber(difficulty);
        const b = generateNumber(difficulty);
        const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];

        if (op === '+') result = a.value + b.value;
        else if (op === '-') result = a.value - b.value;
        else result = a.value * b.value;

        minSigFigs = Math.min(a.sigFigs, b.sigFigs);
        latexExpression = `${a.display} ${op === '×' ? '\\times' : op} ${b.display}`;

    } else if (difficulty === 2) {
        // Medium: 3 operations
        const nums = [generateNumber(difficulty), generateNumber(difficulty), generateNumber(difficulty)];
        const ops = ['+', '-', '×', '÷'];
        const op1 = ops[Math.floor(Math.random() * ops.length)];
        const op2 = ops[Math.floor(Math.random() * ops.length)];

        // Calculate with order of operations
        let temp = nums[0].value;
        if (op1 === '×' || op1 === '÷') {
            temp = op1 === '×' ? nums[0].value * nums[1].value : nums[0].value / nums[1].value;
            result = op2 === '+' ? temp + nums[2].value :
                op2 === '-' ? temp - nums[2].value :
                    op2 === '×' ? temp * nums[2].value : temp / nums[2].value;
        } else {
            if (op2 === '×' || op2 === '÷') {
                temp = op2 === '×' ? nums[1].value * nums[2].value : nums[1].value / nums[2].value;
                result = op1 === '+' ? nums[0].value + temp : nums[0].value - temp;
            } else {
                temp = op1 === '+' ? nums[0].value + nums[1].value : nums[0].value - nums[1].value;
                result = op2 === '+' ? temp + nums[2].value : temp - nums[2].value;
            }
        }

        minSigFigs = Math.min(...nums.map(n => n.sigFigs));
        latexExpression = `${nums[0].display} ${op1 === '×' ? '\\times' : op1 === '÷' ? '\\div' : op1} ${nums[1].display} ${op2 === '×' ? '\\times' : op2 === '÷' ? '\\div' : op2} ${nums[2].display}`;

    } else if (difficulty === 3) {
        // Hard: Parentheses and fractions
        const a = generateNumber(difficulty, useSciNotation);
        const b = generateNumber(difficulty, useSciNotation);
        const c = generateNumber(difficulty);
        const d = generateNumber(difficulty);

        // (a + b) / (c + d)
        const numerator = a.value + b.value;
        const denominator = c.value + d.value;
        result = numerator / denominator;

        minSigFigs = Math.min(a.sigFigs, b.sigFigs, c.sigFigs, d.sigFigs);
        latexExpression = `\\frac{${a.display} + ${b.display}}{${c.display} + ${d.display}}`;

    } else if (difficulty === 4) {
        // Very Hard: Exponents and complex fractions
        const a = generateNumber(difficulty, useSciNotation);
        const b = generateNumber(difficulty);
        const c = generateNumber(difficulty);
        const d = generateNumber(difficulty);
        const e = generateNumber(difficulty);

        // (a(b + c)) / (d + e)
        const numerator = a.value * (b.value + c.value);
        const denominator = d.value + e.value;
        result = numerator / denominator;

        minSigFigs = Math.min(a.sigFigs, b.sigFigs, c.sigFigs, d.sigFigs, e.sigFigs);
        latexExpression = `\\frac{${a.display}(${b.display} + ${c.display})}{${d.display} + ${e.display}}`;

    } else {
        // Extreme: Everything including exponents
        const a = generateNumber(difficulty, useSciNotation);
        const b = generateNumber(difficulty);
        const c = generateNumber(difficulty);
        const d = generateNumber(difficulty);
        const e = generateNumber(difficulty);

        // ((a(b + c)) / (d + e))^2
        const numerator = a.value * (b.value + c.value);
        const denominator = d.value + e.value;
        result = Math.pow(numerator / denominator, 2);

        minSigFigs = Math.min(a.sigFigs, b.sigFigs, c.sigFigs, d.sigFigs, e.sigFigs);
        latexExpression = `\\left(\\frac{${a.display}(${b.display} + ${c.display})}{${d.display} + ${e.display}}\\right)^2`;
    }

    currentMultistepAnswer = parseFloat(result.toPrecision(minSigFigs));
    currentMultistepAnswerSci = toScientific(result, minSigFigs);
    currentMultistepExpression = latexExpression;

    // Display with MathJax
    document.getElementById('multistepProblem').innerHTML = `$$${latexExpression} = ?$$`;

    // Trigger MathJax rendering
    if (window.MathJax) {
        MathJax.typesetPromise([document.getElementById('multistepProblem')]).catch((err) => console.log(err));
    }

    document.getElementById('multistepGuess').value = '';
    document.getElementById('multistepFeedback').textContent = '';
    document.getElementById('multistepExplanation').innerHTML = '';
    document.getElementById('showMultistepAnswerBtn').style.display = 'none';
}

function checkMultistepAnswer() {
    const userInput = document.getElementById('multistepGuess').value.trim();
    const feedbackEl = document.getElementById('multistepFeedback');

    if (!userInput) {
        feedbackEl.textContent = "Please enter a number.";
        feedbackEl.className = 'feedback';
        return;
    }

    // Parse scientific notation (e.g., 1.23e-4 or 1.23×10^-4)
    let userVal = parseFloat(userInput.replace('×', 'e').replace('x', 'e'));

    if (isNaN(userVal)) {
        feedbackEl.textContent = "Please enter a valid number.";
        feedbackEl.className = 'feedback';
        return;
    }

    // Check both regular and scientific notation answers
    const tolerance = Math.abs(currentMultistepAnswer) * 0.01;
    if (Math.abs(userVal - currentMultistepAnswer) < tolerance) {
        feedbackEl.textContent = "Correct! Great job.";
        feedbackEl.className = 'feedback correct';
        document.getElementById('showMultistepAnswerBtn').style.display = 'none';
        document.getElementById('multistepExplanation').innerHTML = '';
    } else {
        feedbackEl.textContent = "Incorrect. Try again!";
        feedbackEl.className = 'feedback incorrect';
        document.getElementById('showMultistepAnswerBtn').style.display = 'inline-block';
    }
}

function showMultistepAnswer() {
    const feedbackEl = document.getElementById('multistepFeedback');
    const explanationEl = document.getElementById('multistepExplanation');

    // Show both regular and scientific notation
    let answerText = `The correct answer is ${currentMultistepAnswer}`;
    if (Math.abs(currentMultistepAnswer) < 0.01 || Math.abs(currentMultistepAnswer) > 10000) {
        answerText += ` (or ${currentMultistepAnswerSci} in scientific notation)`;
    }

    feedbackEl.textContent = answerText;
    feedbackEl.className = 'feedback incorrect';
    explanationEl.innerHTML = "Remember: Do NOT round at intermediate steps. Track significant figures through each operation and round only at the end.";
    document.getElementById('showMultistepAnswerBtn').style.display = 'none';
}

// Initialize all practice sections
window.onload = function () {
    generateProblem();
    generateMathProblem();
    generateMultistepProblem();
};

// Enter key support for all inputs
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('userGuess').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') checkAnswer();
    });
    document.getElementById('mathGuess').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') checkMathAnswer();
    });
    document.getElementById('multistepGuess').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') checkMultistepAnswer();
    });
});
