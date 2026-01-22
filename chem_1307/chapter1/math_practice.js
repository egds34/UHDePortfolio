/**
 * Advanced Significant Figures Practice Engine
 * Handles Mathematical Operations (Section 2) and Multistep Calculations (Section 3)
 * with precise significant figure tracking.
 */

// --- 1. Core Engine: SigFigNumber Class ---

class SigFigNumber {
    constructor(value, precisionType, precisionParam) {
        this.value = Number(value);
        // lastSigPlace: The power of 10 of the last significant digit.
        // e.g. 12.3 -> -1 (tenths), 1200 (2 sigs) -> 2 (hundreds)
        this.lastSigPlace = 0;
        this.isExact = false;

        if (precisionType === 'isExact' && precisionParam === true) {
            this.isExact = true;
            this.lastSigPlace = -Infinity; // Infinite precision
            return;
        }

        if (precisionType === 'lastSigPlace') {
            this.lastSigPlace = precisionParam;
        } else if (precisionType === 'sigFigs') {
            // Derive lastSigPlace from value and sigFigs count
            if (this.value === 0) {
                this.lastSigPlace = 0; // standard 0
            } else {
                const magnitude = Math.floor(Math.log10(Math.abs(this.value)));
                this.lastSigPlace = magnitude - precisionParam + 1;
            }
        } else if (precisionType === 'string') {
            this.parseString(value); // Value passed as string
        }
    }

    parseString(str) {
        this.value = parseFloat(str);
        if (str.includes('e') || str.includes('E')) {
            // Scientific notation logic could be added here
            // For now, assume standard notation for parsing unless explicit
            // Simplifying for the generated problems which use standard formatting mostly
            // or handle sci-notation in text display separately.
            // But if we generated "3.0 x 10^2", that's 2 sig figs.
            // Let's rely on explicit sigFigs passed usually.
        }

        // Count sig figs manually from string to determine precision
        // This mirrors the logic in the 'count_sig_figs' logic but stores Place Value
        if (str.includes('.')) {
            // 12.30 -> last sig is the '0' at index 4 (0-based) -> hundredths -> -2
            const decimalIndex = str.indexOf('.');
            const len = str.length;
            this.lastSigPlace = -(len - 1 - decimalIndex);
        } else {
            // Integer without decimal: trailing zeros are NOT significant
            // 880040 -> strip trailing zeros -> 88004 -> last sig is '4' at ones place (0)
            // 65 -> no trailing zeros -> last sig is '5' at ones place (0)
            let temp = str.replace(/0+$/, ''); // Remove trailing zeros
            if (temp === '') temp = '0'; // Was all zeros

            // The last significant digit is at the ones place (0) if no trailing zeros
            // Or at a higher place if there were trailing zeros
            const trailingZeros = str.length - temp.length;
            this.lastSigPlace = trailingZeros; // 0 for no trailing zeros, 1 for tens, 2 for hundreds, etc.
        }
    }

    getSigFigs() {
        if (this.isExact) return Infinity;
        if (this.value === 0) return 1; // 0 has 1 sig fig by convention if just "0"
        const magnitude = Math.floor(Math.log10(Math.abs(this.value)));
        return Math.max(1, magnitude - this.lastSigPlace + 1);
    }

    // Formatting for HTML display tracking the significant digit
    toHTML(highlight = true) {
        if (this.isExact) return `<span class="exact">${this.value}</span>`;

        // Format string cleanly without arbitrary precision (NO padding)
        // Clean float artifacts first: 12 digit precision usually covers standard math without 0.9999999 artifacts
        let s = parseFloat(this.value.toPrecision(12)).toString();

        // Truncation Check: If long decimals, truncate for display
        let displayStr = s;
        if (s.includes('.') && s.split('.')[1].length > 6) {
            let parts = s.split('.');
            displayStr = `${parts[0]}.${parts[1].substring(0, 6)}...`;
        }

        if (!highlight) {
            return displayStr;
        }

        let decimalIdx = s.indexOf('.');
        if (decimalIdx === -1) decimalIdx = s.length;

        let sigIdx;
        if (this.lastSigPlace >= 0) {
            sigIdx = decimalIdx - 1 - this.lastSigPlace;
        } else {
            sigIdx = decimalIdx - this.lastSigPlace;
        }

        // Map underlining to truncated string if possible
        // We will iterate displayStr. If index matches sigIdx, underline.
        // If sigIdx > length of truncated string (in the ... part), we can't show it easily, 
        // but typically sig digit is earlier.

        let formatted = "";
        for (let i = 0; i < displayStr.length; i++) {
            let char = displayStr[i];
            // Skip logic for trailing '...'
            if (char === '.' && i > displayStr.length - 4 && displayStr.endsWith('...')) {
                formatted += char;
                continue;
            }

            if (i === sigIdx) {
                formatted += `<span style="border-bottom: 2px solid #d20f39; font-weight:bold;">${char}</span>`;
            } else {
                formatted += char;
            }
        }

        return formatted;
    }

    // --- Operations ---

    plus(other) {
        const resultVal = this.value + other.value;
        const resultPlace = Math.max(this.lastSigPlace, other.lastSigPlace);
        return new SigFigNumber(resultVal, 'lastSigPlace', resultPlace);
    }

    minus(other) {
        const resultVal = this.value - other.value;
        const resultPlace = Math.max(this.lastSigPlace, other.lastSigPlace);
        return new SigFigNumber(resultVal, 'lastSigPlace', resultPlace);
    }

    times(other) {
        const resultVal = this.value * other.value;
        const sigsA = this.getSigFigs();
        const sigsB = other.getSigFigs();
        const resultSigs = Math.min(sigsA, sigsB);
        return new SigFigNumber(resultVal, 'sigFigs', resultSigs);
    }

    div(other) {
        if (other.value === 0) throw new Error("Division by zero");
        const resultVal = this.value / other.value;
        const sigsA = this.getSigFigs();
        const sigsB = other.getSigFigs();
        const resultSigs = Math.min(sigsA, sigsB);
        return new SigFigNumber(resultVal, 'sigFigs', resultSigs);
    }
}


// --- 2. Mathematical Operations (Section 2) ---

let mathProblemState = {
    answer: null,
    explanation: "",
    num1: null,
    num2: null,
    op: ""
};

function generateMathProblem() {
    // Generate two random SigFigNumbers
    const isMult = Math.random() > 0.5;

    // Creating numbers with varied precision
    // Random value between 1 and 100
    // Random decimals between 0 and 3

    const makeNum = () => {
        let val = (Math.random() * 100).toFixed(Math.floor(Math.random() * 4));
        // Ensure no simply "0" or "0.0" usually
        if (parseFloat(val) === 0) val = "1.5";
        return new SigFigNumber(val, 'string', val);
    };

    const n1 = makeNum();
    const n2 = makeNum();

    mathProblemState.num1 = n1;
    mathProblemState.num2 = n2;

    const problemEl = document.getElementById('mathProblem');
    const explanationEl = document.getElementById('mathExplanation');
    const feedbackEl = document.getElementById('mathFeedback');
    const showBtn = document.getElementById('showMathAnswerBtn');

    explanationEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    showBtn.style.display = "none";
    document.getElementById('mathGuess').value = "";

    let res;
    if (isMult) {
        const isDiv = Math.random() > 0.5;
        if (isDiv) {
            mathProblemState.op = "÷";
            res = n1.div(n2);
        } else {
            mathProblemState.op = "×";
            res = n1.times(n2);
        }

        mathProblemState.explanation = `
            <strong>Rule:</strong> Multiplication/Division uses the <em>fewest significant figures</em>.<br>
            ${n1.value} has <strong>${n1.getSigFigs()}</strong> sig figs.<br>
            ${n2.value} has <strong>${n2.getSigFigs()}</strong> sig figs.<br>
            The result must have <strong>${res.getSigFigs()}</strong> sig figs.
        `;
    } else {
        const isSub = Math.random() > 0.5;
        if (isSub) {
            mathProblemState.op = "−";
            res = n1.minus(n2);
        } else {
            mathProblemState.op = "+";
            res = n1.plus(n2);
        }

        // Format place value description
        const placeDesc = (p) => {
            if (p === 0) return "ones place";
            if (p === 1) return "tens place";
            if (p === -1) return "tenths place";
            if (p === -2) return "hundredths place";
            if (p === -3) return "thousandths place";
            return `10^${p} place`;
        };

        mathProblemState.explanation = `
            <strong>Rule:</strong> Addition/Subtraction uses the <em>least precise decimal place</em>.<br>
            ${n1.value} ends at the <strong>${placeDesc(n1.lastSigPlace)}</strong>.<br>
            ${n2.value} ends at the <strong>${placeDesc(n2.lastSigPlace)}</strong>.<br>
            The result must define its last significant digit at the <strong>${placeDesc(res.lastSigPlace)}</strong>.
        `;
    }

    mathProblemState.answer = res;

    // Display
    problemEl.textContent = `${n1.value} ${mathProblemState.op} ${n2.value} = ?`;
}

function checkMathAnswer() {
    const guessStr = document.getElementById('mathGuess').value;
    const guess = parseFloat(guessStr);
    const feedbackEl = document.getElementById('mathFeedback');

    if (isNaN(guess)) {
        feedbackEl.textContent = "Please enter a valid number.";
        return;
    }

    // Calculate correct rounded value
    // To round to SigFigs or Decimals, we need logic.
    // The SFNum knows its lastSigPlace. We round to that.

    const correctVal = roundToPlace(mathProblemState.answer.value, mathProblemState.answer.lastSigPlace);

    // Allow small float error
    if (Math.abs(guess - correctVal) < Math.abs(correctVal * 0.0001) || Math.abs(guess - correctVal) < 1e-9) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "feedback correct";
        document.getElementById('showMathAnswerBtn').style.display = "none";
    } else {
        feedbackEl.textContent = "Incorrect.";
        feedbackEl.className = "feedback incorrect";
        document.getElementById('showMathAnswerBtn').style.display = "inline-block";
    }
}

function showMathAnswer() {
    const correctVal = roundToPlace(mathProblemState.answer.value, mathProblemState.answer.lastSigPlace);
    document.getElementById('mathExplanation').innerHTML =
        mathProblemState.explanation + `<br><br>Correct Answer: <strong>${correctVal}</strong>`;
    document.getElementById('mathFeedback').textContent = `Answer is ${correctVal}`;
}


// --- 3. Multistep Calculations (Section 3) ---

let multistepState = {
    steps: [], // Array of SFNums
    ops: [], // Array of strings (+, -, *, /)
    finalResult: null,
    solutionHTML: ""
};

// Helper: Convert Problem List to LaTeX String
function renderLaTeX(operandList, opList) {
    if (operandList.length === 1) return operandList[0].value;

    // Helper to get truncated/clean string for LaTeX
    const getVal = (item) => {
        let val = typeof item === 'object' ? item.value : item;
        // Clean float artifacts
        let s = parseFloat(Number(val).toPrecision(12)).toString();
        if (s.includes('.') && s.split('.')[1].length > 6) {
            let parts = s.split('.');
            return `${parts[0]}.${parts[1].substring(0, 6)}...`;
        }
        return s;
    };

    let currentStr = getVal(operandList[0]);

    for (let i = 0; i < opList.length; i++) {
        let nextVal = getVal(operandList[i + 1]);

        let op = opList[i];
        if (op === '/') {
            currentStr = `\\frac{${currentStr}}{${nextVal}}`;
        } else if (op === '*') {
            if (i > 0) currentStr = `(${currentStr}) \\times ${nextVal}`;
            else currentStr = `${currentStr} \\times ${nextVal}`;
        } else if (op === '^') {
            currentStr = `(${currentStr})^{${nextVal}}`;
        } else {
            let sym = op === '-' ? '-' : '+';
            currentStr = `${currentStr} ${sym} ${nextVal}`;
        }
    }
    return currentStr;
}

function generateMultistepProblem() {
    const diff = document.getElementById('difficultySlider').value;

    let numSteps = 2;
    if (diff >= 3) numSteps = 3;
    if (diff == 5) numSteps = 4;

    // Generate operands with scientific notation at higher difficulties
    let operands = [];
    for (let i = 0; i < numSteps; i++) {
        let useSciNotation = diff >= 4 && Math.random() > 0.5;

        if (useSciNotation) {
            // Generate scientific notation: a.bc x 10^n
            let base = (Math.random() * 9 + 1).toFixed(Math.floor(Math.random() * 2) + 1);
            let exp = Math.floor(Math.random() * 7) - 3; // -3 to 3
            let val = parseFloat(base) * Math.pow(10, exp);
            let valStr = `${base}e${exp}`;
            operands.push(new SigFigNumber(val, 'sigFigs', base.replace('.', '').length));
        } else {
            let val = (Math.random() * 10).toFixed(Math.floor(Math.random() * 3) + 1);
            operands.push(new SigFigNumber(val, 'string', val));
        }
    }

    let ops = [];
    let allowedOps = ['+', '-', '*', '/', '^'];
    if (diff == 1) allowedOps = ['+', '-'];
    if (diff == 2) allowedOps = ['*', '/'];
    if (diff >= 3 && diff < 5) allowedOps = ['+', '-', '*', '/'];
    // diff 5 (Extreme) allows all including powers

    for (let i = 0; i < numSteps - 1; i++) {
        const op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
        ops.push(op);
    }

    let currentResult = operands[0];

    // Add key legend to solution
    let solutionHTML = `<div style="text-align: left; margin-top:1rem;">
        <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px; font-size: 0.85em; display: inline-block;">
            <strong>Key:</strong> <span style="text-decoration: underline; text-decoration-color: #d20f39; text-decoration-thickness: 2px;">1.23</span>45 = The underline marks the last significant digit (the tracking digit).
        </div>
        <h5>Step-by-Step Solution:</h5>
    `;


    // Lists to track the "Remaining Problem" for Rewrites
    // [Res, Op3, Val3, Op4, Val4...]

    // Initial Full Problem String
    // Since we solve sequentially, the "Problem String" at step 0 is just standard render
    let fullProblemLaTeX = renderLaTeX(operands, ops); // This might be complex if we use strict L->R


    // We need to implement the Step Loop exactly as requested:
    // Show current operation highlight -> Show Rewrite next to it.

    solutionHTML += `<div style="overflow-x:auto; margin-bottom: 20px;"><strong>Start:</strong> $$ ${fullProblemLaTeX} $$</div>`;

    // Clone lists for iteration so we don't destroy originals (though we don't use them after)
    let currentOps = [...ops];
    let currentOperandsHTML = operands.map(o => o.toHTML()); // For highlighted display
    let currentOperandsRaw = operands.map(o => o.value);     // For math reconstruction (unused?)

    // We need a list of "Chunks" to rebuild the specific 'Rewrite' string
    // Let's store the sequence of "Term Strings" for the rewrite.
    // Initially: [ "4.5", "3.2", "1.1" ] with ops [ "+", "/" ]
    // Rewrite string fn: construct string from these lists.

    let rewriteTerms = operands.map(o => o.value);
    let rewriteOps = [...ops];

    for (let i = 0; i < ops.length; i++) {
        let op = ops[i];
        let nextOp = operands[i + 1];
        let stepRes;

        let opSymbol = op;
        if (op === '*') opSymbol = '×';
        if (op === '/') opSymbol = '÷';
        if (op === '-') opSymbol = '−';
        if (op === '^') opSymbol = '^';

        // Perform Calculation
        let explanation = "";
        if (op === '+') {
            stepRes = currentResult.plus(nextOp);
            explanation = `Add/Sub rule (decimal places).`;
        } else if (op === '-') {
            stepRes = currentResult.minus(nextOp);
            explanation = `Add/Sub rule (decimal places).`;
        } else if (op === '*') {
            stepRes = currentResult.times(nextOp);
            explanation = `Mult/Div rule (least sig figs).`;
        } else if (op === '/') {
            stepRes = currentResult.div(nextOp);
            explanation = `Mult/Div rule (least sig figs).`;
        } else if (op === '^') {
            // Power operation
            const resultVal = Math.pow(currentResult.value, nextOp.value);
            const resultSigs = currentResult.getSigFigs(); // Base determines sig figs
            stepRes = new SigFigNumber(resultVal, 'sigFigs', resultSigs);
            explanation = `Power rule (base sig figs).`;
        }

        // 1. Identify the active chunk for "Operation" column
        // User changed mind: underline all operands with their sig figs

        let operationDisplay = `${currentResult.toHTML()} ${opSymbol} ${nextOp.toHTML()}`;

        // 2. Construct the "Rewritten Problem"
        // Issue: We can't mix HTML <span> tags inside LaTeX $$ blocks
        // Solution: Build clean LaTeX for the math (no HTML)

        // Helper to get clean truncated values for LaTeX (no HTML)
        const getCleanVal = (val) => {
            let numVal = typeof val === 'object' ? val.value : val;
            let s = parseFloat(Number(numVal).toPrecision(12)).toString();
            if (s.includes('.') && s.split('.')[1].length > 6) {
                let parts = s.split('.');
                return `${parts[0]}.${parts[1].substring(0, 6)}...`;
            }
            return s;
        };

        // Build pure LaTeX string for rewrite
        let rewriteLaTeX = "";
        if (i === ops.length - 1) {
            // Final step - just show the result value
            rewriteLaTeX = getCleanVal(stepRes);
        } else {
            // Build expression with remaining operations
            let accumulator = getCleanVal(stepRes);
            for (let k = 0; k < ops.length - i - 1; k++) {
                let nextT = getCleanVal(rewriteTerms[i + 2 + k]);
                let nextO = ops[i + 1 + k];

                if (nextO === '/') {
                    accumulator = `\\frac{${accumulator}}{${nextT}}`;
                } else if (nextO === '*') {
                    accumulator = `(${accumulator}) \\times ${nextT}`;
                } else if (nextO === '^') {
                    accumulator = `(${accumulator})^{${nextT}}`;
                } else {
                    let sym = nextO === '-' ? '-' : '+';
                    accumulator = `${accumulator} ${sym} ${nextT}`;
                }
            }
            rewriteLaTeX = accumulator;
        }


        solutionHTML += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px; border-bottom: 1px solid #eee; align-items: center;">
                <div>
                   <div style="font-size: 0.85em; color: #666; margin-bottom: 4px;">STEP ${i + 1}: <span style="color:var(--secondary-color)">${explanation}</span></div>
                   <div style="background: #eef9ff; padding: 8px; border-radius: 4px; border-left: 3px solid #04a5e5;">
                       ${operationDisplay} 
                       <div><strong> = ${stepRes.toHTML()}</strong></div>
                   </div>
                </div>
                
                <div>
                    <div style="font-size: 0.85em; color: #666; margin-bottom: 4px;">REWRITTEN:</div>
                    <div style="font-size: 1.1em;">
                        $$ ${rewriteLaTeX} $$
                    </div>
                </div>
            </div>
        `;

        currentResult = stepRes;
    }

    // Final Rounding
    let finalRounded = roundToPlace(currentResult.value, currentResult.lastSigPlace);
    solutionHTML += `
        <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
            <div style="font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.05em; color: #166534; margin-bottom: 5px;">Final Answer</div>
            <div style="font-size: 1.2em;">
                 ${currentResult.toHTML()} &rarr; <strong>${finalRounded}</strong>
            </div>
        </div>`;

    multistepState.finalResult = currentResult;
    multistepState.solutionHTML = solutionHTML;

    // For the main display, use the nice LaTeX
    document.getElementById('multistepProblem').innerHTML = `$$ ${fullProblemLaTeX} = ? $$`;
    document.getElementById('multistepGuess').value = "";
    document.getElementById('multistepFeedback').textContent = "";
    document.getElementById('multistepFeedback').className = "feedback";
    document.getElementById('multistepExplanation').innerHTML = "";
    document.getElementById('showMultistepAnswerBtn').style.display = "none";

    // Render MathJax
    if (window.MathJax) {
        window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : window.MathJax.typeset();
    }
}

function checkMultistepAnswer() {
    const guessStr = document.getElementById('multistepGuess').value.trim();
    const feedbackEl = document.getElementById('multistepFeedback');

    if (!guessStr) {
        feedbackEl.textContent = "Enter a number.";
        return;
    }

    // Parse scientific notation (e.g., 4.5e-2, 3.2E5)
    const guess = parseFloat(guessStr);

    if (isNaN(guess)) {
        feedbackEl.textContent = "Invalid number format. You can use scientific notation like 4.5e-2";
        return;
    }

    const correctVal = roundToPlace(multistepState.finalResult.value, multistepState.finalResult.lastSigPlace);

    // Tolerance
    if (Math.abs(guess - correctVal) < Math.abs(correctVal * 0.0001) || Math.abs(guess - correctVal) < 1e-9) {
        feedbackEl.textContent = "Correct!";
        feedbackEl.className = "feedback correct";
        document.getElementById('showMultistepAnswerBtn').style.display = "none";
        // Show explanation immediately on correct
        document.getElementById('multistepExplanation').innerHTML = multistepState.solutionHTML;
        if (window.MathJax) window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : window.MathJax.typeset();
    } else {
        feedbackEl.textContent = "Incorrect.";
        feedbackEl.className = "feedback incorrect";
        document.getElementById('showMultistepAnswerBtn').style.display = "inline-block";
    }
}

function showMultistepAnswer() {
    document.getElementById('multistepExplanation').innerHTML = multistepState.solutionHTML;
    if (window.MathJax) window.MathJax.typesetPromise ? window.MathJax.typesetPromise() : window.MathJax.typeset();
}

// --- Utilities ---
function roundToPlace(val, place) {
    // Round 'val' to the power of 10 'place'
    // e.g. val=12.345, place=-1 (tenths) -> 12.3
    // val=1234, place=2 (hundreds) -> 1200

    if (!isFinite(place)) return val; // Exact?

    const factor = Math.pow(10, -place);
    const rounded = Math.round(val * factor) / factor;

    // formatting issue: 12.30 might iterate to 12.3
    // If we want to preserve trailing zeros for the string:
    if (place < 0) {
        return rounded.toFixed(-place);
    }
    return rounded;
}

// Initialization
window.onload = function () {
    // Initial calls
    // But since this script is loaded at end of body, we can just call them locally if we want
    // or rely on user interaction.
    // Let's not auto-generate to keep clean state or do initial generate?
    // Usually good to have one ready.
    generateMathProblem();
    generateMultistepProblem();
};

// --- Difficulty Slider Update ---
function updateDifficultyLabel() {
    const val = document.getElementById('difficultySlider').value;
    const labels = ["Easy", "Medium", "Hard", "Very Hard", "Extreme"];
    document.getElementById('difficultyLabel').textContent = labels[val - 1];
}

// Make functions global for HTML onclick access
window.generateMathProblem = generateMathProblem;
window.checkMathAnswer = checkMathAnswer;
window.showMathAnswer = showMathAnswer;
window.generateMultistepProblem = generateMultistepProblem;
window.checkMultistepAnswer = checkMultistepAnswer;
window.showMultistepAnswer = showMultistepAnswer;
window.updateDifficultyLabel = updateDifficultyLabel;
