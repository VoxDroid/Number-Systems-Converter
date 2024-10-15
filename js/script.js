const inputValidation = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^\d+$/,
    16: /^[0-9A-Fa-f]+$/
};

let autoConvertEnabled = false;
let soundEffectsEnabled = false;

function validateInput(input, base) {
    if (base === 'custom') {
        const customBase = parseInt(document.getElementById('customBase').value);
        const regex = new RegExp(`^[0-${Math.min(customBase - 1, 9)}${customBase > 10 ? 'A-' + String.fromCharCode(54 + customBase) : ''}]+$`, 'i');
        return regex.test(input);
    }
    return inputValidation[base].test(input);
}

function convertNumber() {
    const input = document.getElementById('inputNumber').value;
    const inputBase = document.getElementById('inputBase').value;
    const outputDiv = document.getElementById('conversionOutput');
    const errorDiv = document.getElementById('conversionError');
    const historyDiv = document.getElementById('conversionHistory');
    const explanationDiv = document.getElementById('explanationContent');
    
    outputDiv.innerHTML = '';
    errorDiv.innerHTML = '';
    explanationDiv.innerHTML = '';
    outputDiv.classList.remove('show');
    
    try {
        if (!validateInput(input, inputBase)) {
            throw new Error('Invalid input for the selected base');
        }

        let decimal;
        if (inputBase === 'custom') {
            const customBase = parseInt(document.getElementById('customBase').value);
            if (customBase < 2 || customBase > 36) {
                throw new Error('Custom base must be between 2 and 36');
            }
            decimal = parseInt(input, customBase);
        } else {
            decimal = parseInt(input, parseInt(inputBase));
        }
        
        if (isNaN(decimal)) {
            throw new Error('Invalid input for the selected base');
        }
        
        const binary = decimal.toString(2);
        const octal = decimal.toString(8);
        const hex = decimal.toString(16).toUpperCase();
        const base32 = decimal.toString(32).toUpperCase();
        const base36 = decimal.toString(36).toUpperCase();
        
        const result = `
            <strong>Binary:</strong> ${binary}<br>
            <strong>Octal:</strong> ${octal}<br>
            <strong>Decimal:</strong> ${decimal}<br>
            <strong>Hexadecimal:</strong> ${hex}<br>
            <strong>Base32:</strong> ${base32}<br>
            <strong>Base36:</strong> ${base36}
        `;
        
        outputDiv.innerHTML = result;
        outputDiv.classList.add('show');
        
        // Add to history
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `<strong>${input}</strong> (Base ${inputBase}) = ${result}`;
        historyDiv.insertBefore(historyItem, historyDiv.firstChild);
        
        // Generate explanation
        generateExplanation(input, inputBase, decimal, binary, octal, hex);

        // Update conversion table
        updateConversionTable(decimal);
        
        // Save to local storage
        saveToLocalStorage('conversionHistory', { input, inputBase, result });

        if (soundEffectsEnabled) {
            playSound('success');
        }
        
    } catch (error) {
        errorDiv.textContent = error.message;
        if (soundEffectsEnabled) {
            playSound('error');
        }
    }
}

function performBitwiseOperation() {
    const input1 = document.getElementById('binaryInput1').value;
    const input2 = document.getElementById('binaryInput2').value;
    const operation = document.getElementById('operation').value;
    const outputDiv = document.getElementById('bitwiseOutput');
    const errorDiv = document.getElementById('bitwiseError');
    const historyDiv = document.getElementById('bitwiseHistory');
    const explanationDiv = document.getElementById('explanationContent');
    
    outputDiv.innerHTML = '';
    errorDiv.innerHTML = '';
    explanationDiv.innerHTML = '';
    outputDiv.classList.remove('show');
    
    try {
        if (!validateInput(input1, '2') || (operation !== 'not' && !validateInput(input2, '2'))) {
            throw new Error('Invalid binary input');
        }
        
        const num1 = parseInt(input1, 2);
        const num2 = operation !== 'not' ? parseInt(input2, 2) : null;
        let result;
        
        switch (operation) {
            case 'add':
                result = num1 + num2;
                break;
            case 'subtract':
                result = num1 - num2;
                break;
            case 'multiply':
                result = num1 * num2;
                break;
            case 'divide':
                if (num2 === 0) throw new Error('Division by zero');
                result = Math.floor(num1 / num2);
                break;
            case 'and':
                result = num1 & num2;
                break;
            case 'or':
                result = num1 | num2;
                break;
            case 'xor':
                result = num1 ^ num2;
                break;
            case 'not':
                result = ~num1;
                break;
            case 'leftShift':
                result = num1 << num2;
                break;
            case 'rightShift':
                result = num1 >> num2;
                break;
        }
        
        const binaryResult = result.toString(2);
        const onesComplement = (~result >>> 0).toString(2);
        const twosComplement = (result === 0) ? '0' : (result >>> 0).toString(2);
        
        const output = `
            <strong>Result:</strong> ${binaryResult}<br>
            <strong>Decimal:</strong> ${result}<br>
            <strong>1's Complement:</strong> ${onesComplement}<br>
            <strong>2's Complement:</strong> ${twosComplement}
        `;
        
        outputDiv.innerHTML = output;
        outputDiv.classList.add('show');
        
        // Add to history
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `<strong>${input1} ${operation} ${input2 || ''}</strong> = ${output}`;
        historyDiv.insertBefore(historyItem, historyDiv.firstChild);
        
        // Generate explanation
        generateBitwiseExplanation(input1, input2, operation, result, binaryResult);
        
        // Save to local storage
        saveToLocalStorage('bitwiseHistory', { input1, input2, operation, output });

        if (soundEffectsEnabled) {
            playSound('success');
        }
        
    } catch (error) {
        errorDiv.textContent = error.message;
        if (soundEffectsEnabled) {
            playSound('error');
        }
    }
}

function clearInputNumber() {
    document.getElementById('inputNumber').value = '';
}

// Show/hide custom base input
document.getElementById('inputBase').addEventListener('change', function() {
    const customBaseInput = document.getElementById('customBaseInput');
    customBaseInput.style.display = this.value === 'custom' ? 'block' : 'none';
});

function generateExplanation(input, inputBase, decimal, binary, octal, hex) {
    const explanationDiv = document.getElementById('explanationContent');
    let explanation = '<h3>Conversion Explanation:</h3>';

    explanation += `<div class="step">1. Input: ${input} (Base ${inputBase})</div>`;
    explanation += `<div class="step">2. Convert to Decimal:
        <ul>
            <li>Decimal value: ${decimal}</li>
            <li>Process: ${getConversionProcess(input, inputBase, decimal)}</li>
        </ul>
    </div>`;
    explanation += `<div class="step">3. Convert Decimal to Binary:
        <ul>
            <li>Binary: ${binary}</li>
            <li>Process: ${getDecimalToBinaryProcess(decimal)}</li>
        </ul>
    </div>`;
    explanation += `<div class="step">4. Convert Decimal to Octal:
        <ul>
            <li>Octal: ${octal}</li>
            <li>Process: ${getDecimalToOctalProcess(decimal)}</li>
        </ul>
    </div>`;
    explanation += `<div class="step">5. Convert Decimal to Hexadecimal:
        <ul>
            <li>Hexadecimal: ${hex}</li>
            <li>Process: ${getDecimalToHexProcess(decimal)}</li>
        </ul>
    </div>`;

    explanationDiv.innerHTML = explanation;
}

function getConversionProcess(input, inputBase, decimal) {
    let process = '';
    const base = parseInt(inputBase);
    for (let i = 0; i < input.length; i++) {
        const digit = parseInt(input[i], base);
        process += `(${digit} * ${base}<sup>${input.length - i - 1}</sup>) + `;
    }
    process = process.slice(0, -3); // Remove the last ' + '
    process += ` = ${decimal}`;
    return process;
}

function getDecimalToBinaryProcess(decimal) {
    let process = '';
    let temp = decimal;
    while (temp > 0) {
        process = (temp % 2) + process;
        temp = Math.floor(temp / 2);
    }
    return `${decimal} ÷ 2 repeatedly, reading remainders from bottom to top: ${process}`;
}

function getDecimalToOctalProcess(decimal) {
    let process = '';
    let temp = decimal;
    while (temp > 0) {
        process = (temp % 8) + process;
        temp = Math.floor(temp / 8);
    }
    return `${decimal} ÷ 8 repeatedly, reading remainders from bottom to top: ${process}`;
}

function getDecimalToHexProcess(decimal) {
    let process = '';
    let temp = decimal;
    const hexChars = '0123456789ABCDEF';
    while (temp > 0) {
        process = hexChars[temp % 16] + process;
        temp = Math.floor(temp / 16);
    }
    return `${decimal} ÷ 16 repeatedly, reading remainders from bottom to top: ${process}`;
}

function generateBitwiseExplanation(input1, input2, operation, result, binaryResult) {
    const explanationDiv = document.getElementById('explanationContent');
    let explanation = '<h3>Bitwise Operation Explanation:</h3>';

    explanation += `<div class="step">1. Input 1: ${input1} (Decimal: ${parseInt(input1, 2)})</div>`;
    if (operation !== 'not') {
        explanation += `<div class="step">2. Input 2: ${input2} (Decimal: ${parseInt(input2, 2)})</div>`;
    }
    explanation += `<div class="step">3. Operation: ${operation.toUpperCase()}</div>`;
    explanation += `<div class="step">4. Process: ${getBitwiseOperationProcess(input1, input2, operation)}</div>`;
    explanation += `<div class="step">5. Result: ${binaryResult} (Binary)</div>`;
    explanation += `<div class="step">6. Decimal Result: ${result}</div>`;

    explanationDiv.innerHTML = explanation;
}

function getBitwiseOperationProcess(input1, input2, operation) {
    const num1 = parseInt(input1, 2);
    const num2 = operation !== 'not' ? parseInt(input2, 2) : null;
    let process = '';

    switch (operation) {
        case 'add':
            process = `${num1} + ${num2} = ${num1 + num2}`;
            break;
        case 'subtract':
            process = `${num1} - ${num2} = ${num1 - num2}`;
            break;
        case 'multiply':
            process = `${num1} * ${num2} = ${num1 * num2}`;
            break;
        case 'divide':
            process = `${num1} / ${num2} = ${Math.floor(num1 / num2)}`;
            break;
        case 'and':
            process = `${input1}<br>&nbsp;&nbsp;&nbsp;&nbsp;AND<br>${input2}<br>= ${(num1 & num2).toString(2)}`;
            break;
        case 'or':
            process = `${input1}<br>&nbsp;&nbsp;&nbsp;&nbsp;OR<br>${input2}<br>= ${(num1 | num2).toString(2)}`;
            break;
        case 'xor':
            process = `${input1}<br>&nbsp;&nbsp;&nbsp;&nbsp;XOR<br>${input2}<br>= ${(num1 ^ num2).toString(2)}`;
            break;
        case 'not':
            process = `NOT ${input1} = ${(~num1 >>> 0).toString(2)}`;
            break;
        case 'leftShift':
            process = `${input1} << ${num2} = ${(num1 << num2).toString(2)}`;
            break;
        case 'rightShift':
            process = `${input1} >> ${num2} = ${(num1 >> num2).toString(2)}`;
            break;
    }

    return process;
}

function updateConversionTable(decimal) {
    const tableDiv = document.getElementById('conversionTableContent');
    let tableHTML = '<table><tr><th>Base</th><th>Value</th></tr>';

    for (let base = 2; base <= 36; base++) {
        tableHTML += `<tr><td>Base ${base}</td><td>${decimal.toString(base).toUpperCase()}</td></tr>`;
    }

    tableHTML += '</table>';
    tableDiv.innerHTML = tableHTML;
}

// Input validation for binary inputs
document.getElementById('binaryInput1').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^01]/g, '');
});

document.getElementById('binaryInput2').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^01]/g, '');
});

// Input validation for number input based on selected base
document.getElementById('inputNumber').addEventListener('input', function(e) {
    const base = document.getElementById('inputBase').value;
    if (base === 'custom') return; // Allow any input for custom base

    let regex;
    switch (base) {
        case '2':
            regex = /[^01]/g;
            break;
        case '8':
            regex = /[^0-7]/g;
            break;
        case '10':
            regex = /[^0-9]/g;
            break;
        case '16':
            regex = /[^0-9A-Fa-f]/g;
            break;
    }
    this.value = this.value.replace(regex, '');

    if (autoConvertEnabled) {
        convertNumber();
    }
});

function saveToLocalStorage(key, data) {
    let history = JSON.parse(localStorage.getItem(key) || '[]');
    history.unshift(data);
    if (history.length > 10) history.pop(); // Keep only the last 10 items
    localStorage.setItem(key, JSON.stringify(history));
}

function loadFromLocalStorage() {
    const conversionHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    const bitwiseHistory = JSON.parse(localStorage.getItem('bitwiseHistory') || '[]');

    const conversionHistoryDiv = document.getElementById('conversionHistory');
    const bitwiseHistoryDiv = document.getElementById('bitwiseHistory');

    conversionHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `<strong>${item.input}</strong> (Base ${item.inputBase}) = ${item.result}`;
        conversionHistoryDiv.appendChild(historyItem);
    });

    bitwiseHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `<strong>${item.input1} ${item.operation} ${item.input2 || ''}</strong> = ${item.output}`;
        bitwiseHistoryDiv.appendChild(historyItem);
    });
}

// Matrix background animation
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const columns = Math.floor(canvas.width / 20);
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

let matrixInterval;

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('closed');
    const mainContent = document.querySelector('.main-content');
    mainContent.style.marginLeft = sidebar.classList.contains('closed') ? '60px' : '250px';
}

// Show/hide sections with transition
function showSection(sectionId) {
    const sections = ['numberSystem', 'bitwiseOperation', 'conversionTable', 'explanationSystem', 'historySection'];
    const pageTransition = document.querySelector('.page-transition');
    const pageTransitionText = document.querySelector('.page-transition-text');

    pageTransitionText.textContent = sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    pageTransition.classList.add('show');

    setTimeout(() => {
        sections.forEach(id => {
            const element = document.getElementById(id);
            if (id === sectionId) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });

        setTimeout(() => {
            pageTransition.classList.remove('show');
        }, 500);
    }, 500);
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

// Settings panel toggle
function toggleSettings() {
    document.querySelector('.settings-panel').classList.toggle('open');
}

// Matrix animation toggle
function toggleMatrixAnimation() {
    const matrixCanvas = document.getElementById('matrixCanvas');
    if (matrixCanvas.classList.contains('hidden')) {
        matrixCanvas.classList.remove('hidden');
        matrixInterval = setInterval(drawMatrix, 50);
    } else {
        matrixCanvas.classList.add('hidden');
        clearInterval(matrixInterval);
    }
}

// Change theme color
function changeThemeColor(color) {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--secondary-color', adjustColor(color, -20));
}

// Adjust color brightness
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// Toggle auto convert
function toggleAutoConvert() {
    autoConvertEnabled = !autoConvertEnabled;
    showNotification(`Auto Convert ${autoConvertEnabled ? 'Enabled' : 'Disabled'}`);
}

// Toggle sound effects
function toggleSoundEffects() {
    soundEffectsEnabled = !soundEffectsEnabled;
    showNotification(`Sound Effects ${soundEffectsEnabled ? 'Enabled' : 'Disabled'}`);
}

// Play sound effect
function playSound(type) {
    const audio = new Audio(`hellnaw`);
    audio.play();
}

// Show floating notification
function showNotification(message) {
    const notification = document.getElementById('floatingNotification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show tab content
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Initialize
window.onload = function() {
    loadFromLocalStorage();
    showSection('numberSystem');
};

// Responsive sidebar
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (window.innerWidth <= 768) {
        sidebar.classList.add('closed');
        mainContent.style.marginLeft = '0';
    } else {
        sidebar.classList.remove('closed');
        mainContent.style.marginLeft = '250px';
    }
});
