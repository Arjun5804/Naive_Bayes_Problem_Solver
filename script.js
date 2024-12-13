let numAttributes;
let attributeNames = [];
let outputName = "output";
let possibleValues = {};
let outputValues = [];
let tableData = [];
let isTableLocked = false;

function setAttributes() {
    numAttributes = parseInt(document.getElementById('num-attributes').value);
    if (numAttributes > 0) {
        document.getElementById('step-1').classList.add('hidden');
        const container = document.getElementById('attribute-names-container');
        container.innerHTML = '';
        for (let i = 0; i < numAttributes; i++) {
            container.innerHTML += `
                <label>Attribute ${i + 1} Name:</label>
                <input type='text' id='attribute-${i}' placeholder='Attribute Name'>
                <label>Possible Values (comma-separated):</label>
                <input type='text' id='values-${i}' placeholder='value1,value2,...'><br>
            `;
        }
        document.getElementById('step-2').classList.remove('hidden');
    } else {
        alert('Please enter a valid number of attributes.');
    }
}

function confirmAttributes() {
    attributeNames = [];
    possibleValues = {};
    for (let i = 0; i < numAttributes; i++) {
        const name = document.getElementById(`attribute-${i}`).value.trim();
        const values = document.getElementById(`values-${i}`).value.split(',').map(v => v.trim());
        if (name === "" || values.length === 0) {
            alert('Attribute names and values cannot be empty.');
            return;
        }
        attributeNames.push(name);
        possibleValues[name] = values;
    }

    const outputInput = document.getElementById('output-name').value.trim();
    if (outputInput !== "") {
        outputName = outputInput;
    }

    const binaryValues = document.getElementById('binary-output-values').value.trim();
    if (binaryValues) {
        outputValues = binaryValues.split(',').map(v => v.trim());
    } else {
        alert('Please enter binary output values.');
        return;
    }

    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    setupRowInputs();
}

function setupRowInputs() {
    const container = document.getElementById('row-inputs-container');
    container.innerHTML = '';
    attributeNames.forEach(name => {
        const options = possibleValues[name].map(v => `<option value="${v}">${v}</option>`).join('');
        container.innerHTML += `
            <label>${name}:</label>
            <select class='row-input' data-name='${name}'>${options}</select><br>
        `;
    });
    container.innerHTML += `
        <label>${outputName}:</label>
        <select class='row-input' data-name='${outputName}'>
            <option value="${outputValues[0]}">${outputValues[0]}</option>
            <option value="${outputValues[1]}">${outputValues[1]}</option>
        </select><br>
    `;
}

function addRow() {
    const inputs = document.querySelectorAll('.row-input');
    const row = {};
    inputs.forEach(input => {
        const name = input.getAttribute('data-name');
        row[name] = input.value;
    });
    tableData.push(row);
    alert('Row added successfully.');
}

function generateTable() {
    const container = document.getElementById('table-container');
    container.innerHTML = createTableHTML();
    document.getElementById('step-3').classList.add('hidden');
    document.getElementById('step-4').classList.remove('hidden');
}

function createTableHTML() {
    let html = '<table><thead><tr>';
    attributeNames.forEach(name => {
        html += `<th>${name}</th>`;
    });
    html += `<th>${outputName}</th></tr></thead><tbody>`;
    tableData.forEach(row => {
        html += '<tr>';
        attributeNames.forEach(name => {
            html += `<td>${row[name]}</td>`;
        });
        html += `<td>${row[outputName]}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
}

function editTable() {
    document.getElementById('step-3').classList.remove('hidden');
    document.getElementById('step-4').classList.add('hidden');
}

function lockTable() {
    isTableLocked = true;
    document.getElementById('step-4').classList.add('hidden');
    document.getElementById('step-5').classList.remove('hidden');
    setupNewInstanceInputs();
}

function setupNewInstanceInputs() {
    const container = document.getElementById('new-instance-container');
    container.innerHTML = '';
    attributeNames.forEach(name => {
        const options = possibleValues[name].map(v => `<option value="${v}">${v}</option>`).join('');
        container.innerHTML += `
            <label>${name}:</label>
            <select class='instance-input' data-name='${name}'>${options}</select><br>
        `;
    });
}

function calculateProbabilities() {
    const instance = {};
    document.querySelectorAll('.instance-input').forEach(input => {
        const name = input.getAttribute('data-name');
        instance[name] = input.value;
    });

    const probabilities = calculateNaiveBayes(instance, tableData);
    displayResults(probabilities);
    document.getElementById('step-6').classList.remove('hidden');
}

function calculateNaiveBayes(instance, data) {
    const outcomes = [...new Set(data.map(row => row[outputName]))];
    const totalRows = data.length;

    const probabilities = outcomes.reduce((result, outcome) => {
        const subset = data.filter(row => row[outputName] === outcome);
        const prior = subset.length / totalRows;

        let likelihood = 1;
        attributeNames.forEach((attr, index) => {
            const matchingRows = subset.filter(row => row[attr] === instance[attr]);
            const conditionalProb = matchingRows.length / subset.length || 1 / totalRows; 
            likelihood *= conditionalProb;
        });

        result[outcome] = prior * likelihood;
        return result;
    }, {});

    const totalProbability = Object.values(probabilities).reduce((sum, prob) => sum + prob, 0);
    for (const outcome in probabilities) {
        probabilities[outcome] /= totalProbability; 
    }

    return probabilities;
}

function displayResults(probabilities) {
    const resultsDiv = document.getElementById("results-container");

    const highestProbOutcome = Object.entries(probabilities).reduce((max, current) => 
        current[1] > max[1] ? current : max
    );

    const classificationValue = highestProbOutcome[0];

    resultsDiv.innerHTML = `
        <h3>Results</h3>
        ${Object.entries(probabilities).map(([outcome, prob]) => `
            <p>Probability of ${outputName} = ${outcome}: ${(prob * 100).toFixed(2)}%</p>
        `).join("")}
        <p><strong>Classification: ${outputName} = ${classificationValue}</strong></p>
    `;
}

function resetTool() {
    location.reload();
}
