// Mathematical Operations Practice
let currentMathAnswer = 0;
let currentMathExplanation = "";
const exactColor = '#8839ef'; // Purple for exact numbers

function countSigFigs(numStr) {
    // Count significant figures in a number string
    numStr = numStr.toString().trim();

    if (numStr.startsWith('0.')) {
        let leadingPart = numStr.match(/^0\.0*/)[0];
        let remaining = numStr.substring(leadingPart.length);
        return remaining.replace('.', '').length;
    } else {
        return numStr.replace('.', '').length;
    }
}

function generateMathProblem() {
    const type = Math.random() < 0.5 ? 'mult' : 'add';

    if (type === 'mult') {
        // Multiplication/Division
        const a = (Math.random() * 9 + 1).toFixed(Math.floor(Math.random() * 3) + 1);
        const b = (Math.random() * 9 + 1).toFixed(Math.floor(Math.random() * 3) + 1);
        const op = Math.random() < 0.5 ? '×' : '÷';

        const result = op === '×' ? parseFloat(a) * parseFloat(b) : parseFloat(a) / parseFloat(b);
        const minSigs = Math.min(countSigFigs(a), countSigFigs(b));

        currentMathAnswer = parseFloat(result.toPrecision(minSigs));
        currentMathExplanation = `Both numbers have ${countSigFigs(a)} and ${countSigFigs(b)} sig figs respectively. The result must have ${minSigs} sig figs (the smaller of the two).`;

        document.getElementById('mathProblem').innerHTML = `${a} ${op} ${b} = ?`;
    } else {
        // Addition/Subtraction
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

// Multistep Practice
let currentMultistepAnswer = 0;
let currentMultistepSteps = [];

function updateDifficultyLabel() {
    const slider = document.getElementById('difficultySlider');
    const label = document.getElementById('difficultyLabel');
    const labels = ['Easy', 'Medium', 'Hard'];
    label.textContent = labels[slider.value - 1];
}

function generateMultistepProblem() {
    const difficulty = parseInt(document.getElementById('difficultySlider').value);
    const steps = difficulty + 1; // 2, 3, or 4 steps
    const maxNum = difficulty === 1 ? 10 : difficulty === 2 ? 100 : 1000;

    let expression = '';
    let values = [];
    let operations = [];

    // Generate random numbers and operations
    for (let i = 0; i < steps; i++) {
        const decimals = Math.floor(Math.random() * (difficulty + 1));
        const num = (Math.random() * maxNum + 1).toFixed(decimals);
        values.push(parseFloat(num));

        if (i < steps - 1) {
            const ops = ['+', '−', '×', '÷'];
            operations.push(ops[Math.floor(Math.random() * ops.length)]);
        }
    }

    // Build expression
    expression = values[0].toString();
    for (let i = 0; i < operations.length; i++) {
        expression += ` ${operations[i]} ${values[i + 1]}`;
    }

    // Calculate result (following order of operations)
    let result = values[0];
    let currentOp = null;
    let pendingMult = null;

    for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        const nextVal = values[i + 1];

        if (op === '×' || op === '÷') {
            if (pendingMult === null) {
                pendingMult = result;
                result = nextVal;
                currentOp = op;
            } else {
                result = currentOp === '×' ? result * nextVal : result / nextVal;
                currentOp = op;
            }
        } else {
            if (pendingMult !== null) {
                result = currentOp === '×' ? pendingMult * result : pendingMult / result;
                pendingMult = null;
            }
            result = op === '+' ? result + nextVal : result - nextVal;
        }
    }

    if (pendingMult !== null) {
        result = currentOp === '×' ? pendingMult * result : pendingMult / result;
    }

    // Determine sig figs (simplified - use minimum)
    const sigFigs = Math.min(...values.map(v => countSigFigs(v.toString())));
    currentMultistepAnswer = parseFloat(result.toPrecision(sigFigs));

    document.getElementById('multistepProblem').innerHTML = `${expression} = ?`;
    document.getElementById('multistepGuess').value = '';
    document.getElementById('multistepFeedback').textContent = '';
    document.getElementById('multistepExplanation').innerHTML = '';
    document.getElementById('showMultistepAnswerBtn').style.display = 'none';
}

function checkMultistepAnswer() {
    const userVal = parseFloat(document.getElementById('multistepGuess').value);
    const feedbackEl = document.getElementById('multistepFeedback');

    if (isNaN(userVal)) {
        feedbackEl.textContent = "Please enter a number.";
        feedbackEl.className = 'feedback';
        return;
    }

    if (Math.abs(userVal - currentMultistepAnswer) < 0.01) {
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
    document.getElementById('multistepFeedback').textContent = `The correct answer is ${currentMultistepAnswer}.`;
    document.getElementById('multistepFeedback').className = 'feedback incorrect';
    document.getElementById('multistepExplanation').innerHTML = "Remember: Do NOT round at intermediate steps. Track significant figures through each operation and round only at the end.";
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
