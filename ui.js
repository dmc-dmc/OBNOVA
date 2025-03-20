/**
 * Funkcie pre užívateľské rozhranie
 */

// Výsledky posledného výpočtu
let calculationResults = null;

// Inicializácia užívateľského rozhrania
function initUI() {
    // Inicializácia tlačidiel
    document.getElementById('calculate-button').addEventListener('click', calculateResults);
    document.getElementById('export-button').addEventListener('click', showExportModal);
    document.getElementById('reset-button').addEventListener('click', resetCalculator);
    document.getElementById('save-button').addEventListener('click', saveConfiguration);
    document.getElementById('load-button').addEventListener('click', loadConfigurationFromFile);
    document.getElementById('add-material-button').addEventListener('click', addMaterial);
    document.getElementById('import-csv-button').addEventListener('click', importMaterialsFromCSV);
    document.getElementById('csv-file-input').addEventListener('change', handleCSVFileSelect);
    
    // Inicializácia exportných tlačidiel v modálnom okne
    document.getElementById('export-print-button').addEventListener('click', printResults);
    document.getElementById('export-csv-button').addEventListener('click', exportMaterialsToCSV);
    document.getElementById('export-json-button').addEventListener('click', exportConfigurationToJSON);
    
    // Zatváranie modálneho okna
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModal);
    });
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('export-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Nastavenie poslucháča na zmenu typu konštrukcie
    document.getElementById('construction-type').addEventListener('change', onConstructionTypeChange);
    
    // Inicializácia materiálov podľa typu konštrukcie
    loadDefaultMaterials();
}

// Načítanie predvolených materiálov podľa typu konštrukcie
function loadDefaultMaterials() {
    const constructionType = document.getElementById('construction-type').value;
    currentMaterials = getMaterialsByType(constructionType);
    renderMaterialsTable();
}

// Zmena typu konštrukcie
function onConstructionTypeChange() {
    // Potvrdenie od užívateľa
    if (currentMaterials.length > 0) {
        if (!confirm("Zmenou typu konštrukcie sa odstránia všetky aktuálne materiály. Pokračovať?")) {
            // Obnovenie pôvodnej hodnoty
            const originalType = currentMaterials.length > 0 ? 
                Object.keys(normalizedValues).find(key => 
                    normalizedValues[key].description === document.getElementById('construction-type').options[document.getElementById('construction-type').selectedIndex].text
                ) : 'floor';
            
            document.getElementById('construction-type').value = originalType || 'floor';
            return;
        }
    }
    
    // Načítanie predvolených materiálov pre nový typ konštrukcie
    loadDefaultMaterials();
    
    // Resetovanie výsledkov
    resetResults();
}

// Vykreslenie tabuľky s materiálmi
function renderMaterialsTable() {
    const tbody = document.getElementById('material-rows');
    tbody.innerHTML = '';
    
    currentMaterials.forEach((material, index) => {
        const row = document.createElement('tr');
        row.dataset.index = index;
        
        // Stĺpec s poradovým číslom
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        row.appendChild(indexCell);
        
        // Názov materiálu
        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = material.name;
        nameInput.addEventListener('input', (e) => {
            currentMaterials[index].name = e.target.value;
        });
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);
        
        // Hrúbka
        const thicknessCell = document.createElement('td');
        const thicknessInput = document.createElement('input');
        thicknessInput.type = 'number';
        thicknessInput.value = material.thickness;
        thicknessInput.min = '0.0001';
        thicknessInput.step = '0.001';
        thicknessInput.addEventListener('input', (e) => {
            currentMaterials[index].thickness = parseFloat(e.target.value);
        });
        thicknessCell.appendChild(thicknessInput);
        row.appendChild(thicknessCell);
        
        // Objemová hmotnosť
        const densityCell = document.createElement('td');
        const densityInput = document.createElement('input');
        densityInput.type = 'number';
        densityInput.value = material.density;
        densityInput.min = '1';
        densityInput.step = '1';
        densityInput.addEventListener('input', (e) => {
            currentMaterials[index].density = parseFloat(e.target.value);
        });
        densityCell.appendChild(densityInput);
        row.appendChild(densityCell);
        
        // Súčiniteľ tepelnej vodivosti
        const conductivityCell = document.createElement('td');
        const conductivityInput = document.createElement('input');
        conductivityInput.type = 'number';
        conductivityInput.value = material.thermalConductivity;
        conductivityInput.min = '0.001';
        conductivityInput.step = '0.001';
        conductivityInput.addEventListener('input', (e) => {
            currentMaterials[index].thermalConductivity = parseFloat(e.target.value);
        });
        conductivityCell.appendChild(conductivityInput);
        row.appendChild(conductivityCell);
        
        // Merná tepelná kapacita
        const capacityCell = document.createElement('td');
        const capacityInput = document.createElement('input');
        capacityInput.type = 'number';
        capacityInput.value = material.heatCapacity;
        capacityInput.min = '1';
        capacityInput.step = '1';
        capacityInput.addEventListener('input', (e) => {
            currentMaterials[index].heatCapacity = parseFloat(e.target.value);
        });
        capacityCell.appendChild(capacityInput);
        row.appendChild(capacityCell);
        
        // Faktor difúzneho odporu
        const diffusionCell = document.createElement('td');
        const diffusionInput = document.createElement('input');
        diffusionInput.type = 'number';
        diffusionInput.value = material.diffusionFactor;
        diffusionInput.min = '1';
        diffusionInput.step = '0.1';
        diffusionInput.addEventListener('input', (e) => {
            currentMaterials[index].diffusionFactor = parseFloat(e.target.value);
        });
        diffusionCell.appendChild(diffusionInput);
        row.appendChild(diffusionCell);
        
        // Tlačidlá pre akcie
        const actionsCell = document.createElement('td');
        actionsCell.className = 'material-actions';
        
        // Tlačidlo pre posun hore
        if (index > 0) {
            const upButton = document.createElement('button');
            upButton.className = 'move-up';
            upButton.innerHTML = '&#9650;'; // Unicode trojuholník hore
            upButton.title = 'Posunúť hore';
            upButton.addEventListener('click', () => {
                moveMaterialUp(index);
            });
            actionsCell.appendChild(upButton);
        }
        
        // Tlačidlo pre posun dole
        if (index < currentMaterials.length - 1) {
            const downButton = document.createElement('button');
            downButton.className = 'move-down';
            downButton.innerHTML = '&#9660;'; // Unicode trojuholník dole
            downButton.title = 'Posunúť dole';
            downButton.addEventListener('click', () => {
                moveMaterialDown(index);
            });
            actionsCell.appendChild(downButton);
        }
        
        // Tlačidlo pre odstránenie
        const removeButton = document.createElement('button');
        removeButton.className = 'remove';
        removeButton.innerHTML = '&#10006;'; // Unicode X
        removeButton.title = 'Odstrániť';
        removeButton.addEventListener('click', () => {
            removeMaterial(index);
        });
        actionsCell.appendChild(removeButton);
        
        row.appendChild(actionsCell);
        tbody.appendChild(row);
    });
}

// Pridanie nového materiálu
function addMaterial() {
    currentMaterials.push(createEmptyMaterial());
    renderMaterialsTable();
    // Skrolovanie na koniec tabuľky
    const tbody = document.getElementById('material-rows');
    tbody.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Odstránenie materiálu
function removeMaterial(index) {
    if (currentMaterials.length <= 1) {
        alert("Konštrukcia musí obsahovať aspoň jeden materiál!");
        return;
    }
    
    currentMaterials.splice(index, 1);
    renderMaterialsTable();
}

// Posun materiálu hore
function moveMaterialUp(index) {
    if (index <= 0) return;
    
    const temp = currentMaterials[index];
    currentMaterials[index] = currentMaterials[index - 1];
    currentMaterials[index - 1] = temp;
    
    renderMaterialsTable();
}

// Posun materiálu dole
function moveMaterialDown(index) {
    if (index >= currentMaterials.length - 1) return;
    
    const temp = currentMaterials[index];
    currentMaterials[index] = currentMaterials[index + 1];
    currentMaterials[index + 1] = temp;
    
    renderMaterialsTable();
}

// Import materiálov z CSV
function importMaterialsFromCSV() {
    document.getElementById('csv-file-input').click();
}

// Spracovanie vybraného CSV súboru
function handleCSVFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            
            // Kontrola hlavičky
            const header = lines[0].trim().split(',');
            const requiredColumns = ['name', 'thickness', 'density', 'thermalConductivity', 'heatCapacity', 'diffusionFactor'];
            
            // Mapovanie stĺpcov
            const columnMap = {};
            requiredColumns.forEach(col => {
                const index = header.findIndex(h => h.toLowerCase().replace(/[ _-]/g, '') === col.toLowerCase());
                if (index !== -1) {
                    columnMap[col] = index;
                }
            });
            
            // Kontrola, či obsahuje všetky potrebné stĺpce
            const missingColumns = requiredColumns.filter(col => !(col in columnMap));
            if (missingColumns.length > 0) {
                alert(`CSV súbor neobsahuje potrebné stĺpce: ${missingColumns.join(', ')}`);
                return;
            }
            
            // Parsovanie dát
            const newMaterials = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(',');
                const material = {
                    name: values[columnMap.name] || "Neznámy materiál",
                    thickness: parseFloat(values[columnMap.thickness]) || 0.01,
                    density: parseFloat(values[columnMap.density]) || 1000,
                    thermalConductivity: parseFloat(values[columnMap.thermalConductivity]) || 0.5,
                    heatCapacity: parseFloat(values[columnMap.heatCapacity]) || 1000,
                    diffusionFactor: parseFloat(values[columnMap.diffusionFactor]) || 10
                };
                
                if (validateMaterial(material)) {
                    newMaterials.push(material);
                }
            }
            
            if (newMaterials.length === 0) {
                alert("Neboli nájdené žiadne platné materiály v CSV súbore.");
                return;
            }
            
            // Nahradiť alebo pridať?
            if (currentMaterials.length > 0) {
                const replace = confirm(`Nájdených ${newMaterials.length} materiálov. Chcete nahradiť existujúce materiály alebo pridať nové? Stlačte OK pre nahradenie, Zrušiť pre pridanie.`);
                if (replace) {
                    currentMaterials = newMaterials;
                } else {
                    currentMaterials = currentMaterials.concat(newMaterials);
                }
            } else {
                currentMaterials = newMaterials;
            }
            
            renderMaterialsTable();
            
        } catch (error) {
            console.error("Chyba pri parsovaní CSV:", error);
            alert("Nepodarilo sa načítať CSV súbor. Skontrolujte formát súboru.");
        }
    };
    
    reader.readAsText(file);
    // Reset input, aby fungoval opätovný výber toho istého súboru
    event.target.value = '';
}

// Výpočet výsledkov
function calculateResults() {
    // Kontrola platnosti vstupov
    if (!validateInputs()) {
        return;
    }
    
    // Získanie vstupných parametrov
    const params = {
        internalTemp: document.getElementById('internal-temp').value,
        internalHumidity: document.getElementById('internal-humidity').value,
        rsi: document.getElementById('internal-thermal-resistance').value,
        externalTemp: document.getElementById('external-temp').value,
        externalHumidity: document.getElementById('external-humidity').value,
        rse: document.getElementById('external-thermal-resistance').value,
        constructionType: document.getElementById('construction-type').value
    };
    
    // Výpočet
    calculationResults = performThermalCalculation(currentMaterials, params);
    
    // Zobrazenie výsledkov
    displayResults(calculationResults);
}

// Validácia vstupov
function validateInputs() {
    // Kontrola materiálov
    if (currentMaterials.length === 0) {
        alert("Nie sú zadané žiadne materiály!");
        return false;
    }
    
    // Kontrola platnosti každého materiálu
    for (let i = 0; i < currentMaterials.length; i++) {
        const material = currentMaterials[i];
        if (!validateMaterial(material)) {
            alert(`Materiál #${i+1} (${material.name}) obsahuje neplatné hodnoty!`);
            return false;
        }
    }
    
    // Kontrola okrajových podmienok
    const inputs = [
        { id: 'internal-temp', name: 'Vnútorná teplota', min: -50, max: 50 },
        { id: 'internal-humidity', name: 'Vnútorná vlhkosť', min: 0, max: 100 },
        { id: 'internal-thermal-resistance', name: 'Vnútorný tepelný odpor', min: 0, max: 10 },
        { id: 'external-temp', name: 'Vonkajšia teplota', min: -50, max: 50 },
        { id: 'external-humidity', name: 'Vonkajšia vlhkosť', min: 0, max: 100 },
        { id: 'external-thermal-resistance', name: 'Vonkajší tepelný odpor', min: 0, max: 10 }
    ];
    
    for (const input of inputs) {
        const element = document.getElementById(input.id);
        const value = parseFloat(element.value);
        
        if (isNaN(value)) {
            alert(`${input.name} musí byť číslo!`);
            element.focus();
            return false;
        }
        
        if (value < input.min || value > input.max) {
            alert(`${input.name} musí byť medzi ${input.min} a ${input.max}!`);
            element.focus();
            return false;
        }
    }
    
    return true;
}

// Zobrazenie výsledkov výpočtu
function displayResults(results) {
    // Tepelný odpor konštrukcie
    document.getElementById('thermal-resistance').textContent = 
        `${formatNumber(results.totalThermalResistance, 3)} m²·K/W`;
    
    // Difúzny odpor konštrukcie
    document.getElementById('diffusion-resistance').textContent = 
        `${formatNumber(results.totalDiffusionResistance / 1e9, 2)}·10⁹ m/s`;
    
    // Súčiniteľ prechodu tepla
    document.getElementById('heat-transfer-coefficient').textContent = 
        `${formatNumber(results.heatTransferCoefficient, 3)} W/(m²·K)`;
    
    // Vnútorná povrchová teplota
    document.getElementById('surface-temperature').textContent = 
        `${formatNumber(results.surfaceTemperature, 2)} °C`;
    
    // Vlhkostný režim
    document.getElementById('moisture-mode').textContent = results.moistureMode;
    
    // Tepelná prijímavosť podlahy
    document.getElementById('thermal-admittance').textContent = 
        `${formatNumber(results.thermalAdmittance, 2)} W·s¹/²/(m²·K)`;
    
    // Pokles dotykovej teploty podlahy
    document.getElementById('temperature-drop').textContent = 
        `${formatNumber(results.temperatureDrop, 2)} °C`;
    
    // Hodnotenie - Tepelný odpor
    document.getElementById('thermal-resistance-assessment').textContent = 
        `R = ${formatNumber(results.totalThermalResistance, 2)} m²·K/W ${results.assessment.thermalResistance ? '≥' : '<'} R₍ₙ₎ = ${results.normalizedValues.thermalResistance.toFixed(2)} m²·K/W`;
    
    const thermalResistanceResult = document.getElementById('thermal-resistance-result');
    thermalResistanceResult.textContent = results.assessment.thermalResistance ? 'vyhovuje' : 'nevyhovuje';
    thermalResistanceResult.className = `assessment-result ${results.assessment.thermalResistance ? 'positive' : 'negative'}`;
    
    // Hodnotenie - Súčiniteľ prechodu tepla
    document.getElementById('heat-transfer-coefficient-assessment').textContent = 
        `U = ${formatNumber(results.heatTransferCoefficient, 2)} W/(m²·K) ${results.assessment.heatTransferCoefficient ? '≤' : '>'} U₍ₙ₎ = ${results.normalizedValues.heatTransferCoefficient.toFixed(2)} W/(m²·K)`;
    
    const heatTransferCoefficientResult = document.getElementById('heat-transfer-coefficient-result');
    heatTransferCoefficientResult.textContent = results.assessment.heatTransferCoefficient ? 'vyhovuje' : 'nevyhovuje';
    heatTransferCoefficientResult.className = `assessment-result ${results.assessment.heatTransferCoefficient ? 'positive' : 'negative'}`;
    
    // Hodnotenie - Riziko vzniku plesní
    document.getElementById('mold-risk-assessment').textContent = 
        `θₛᵢ = ${formatNumber(results.surfaceTemperature, 2)} °C ${results.assessment.moldRisk ? '>' : '≤'} θₛᵢ₊₈₀ + Δθₛᵢ = ${formatNumber(results.moldRisk.criticalTemperature, 2)} °C`;
    
    const moldRiskResult = document.getElementById('mold-risk-result');
    moldRiskResult.textContent = results.assessment.moldRisk ? 'vyhovuje' : 'nevyhovuje';
    moldRiskResult.className = `assessment-result ${results.assessment.moldRisk ? 'positive' : 'negative'}`;
    
    // Hodnotenie - Tepelná prijímavosť
    document.getElementById('thermal-admittance-assessment').textContent = 
        `b = ${formatNumber(results.thermalAdmittance, 0)} W·s¹/²/(m²·K) - ${results.assessment.thermalAdmittanceDescription}`;
    
    const thermalAdmittanceResult = document.getElementById('thermal-admittance-result');
    thermalAdmittanceResult.textContent = results.assessment.thermalAdmittance ? 'vyhovuje' : 'nevyhovuje';
    thermalAdmittanceResult.className = `assessment-result ${results.assessment.thermalAdmittance ? 'positive' : 'negative'}`;
    
    // Zobraziť sekciu výsledkov
    document.getElementById('results-section').style.display = 'block';
}

// Resetovanie výsledkov
function resetResults() {
    calculationResults = null;
    
    // Vymazanie výsledkov
    document.getElementById('thermal-resistance').textContent = '-';
    document.getElementById('diffusion-resistance').textContent = '-';
    document.getElementById('heat-transfer-coefficient').textContent = '-';
    document.getElementById('surface-temperature').textContent = '-';
    document.getElementById('moisture-mode').textContent = '-';
    document.getElementById('thermal-admittance').textContent = '-';
    document.getElementById('temperature-drop').textContent = '-';
    
    // Vymazanie hodnotenia
    document.getElementById('thermal-resistance-assessment').textContent = '-';
    document.getElementById('heat-transfer-coefficient-assessment').textContent = '-';
    document.getElementById('mold-risk-assessment').textContent = '-';
    document.getElementById('thermal-admittance-assessment').textContent = '-';
    
    document.getElementById('thermal-resistance-result').textContent = '-';
    document.getElementById('heat-transfer-coefficient-result').textContent = '-';
    document.getElementById('mold-risk-result').textContent = '-';
    document.getElementById('thermal-admittance-result').textContent = '-';
    
    document.getElementById('thermal-resistance-result').className = 'assessment-result';
    document.getElementById('heat-transfer-coefficient-result').className = 'assessment-result';
    document.getElementById('mold-risk-result').className = 'assessment-result';
    document.getElementById('thermal-admittance-result').className = 'assessment-result';
}

// Resetovanie kalkulačky
function resetCalculator() {
    if (confirm("Naozaj chcete resetovať všetky hodnoty?")) {
        // Reset okrajových podmienok na predvolené hodnoty
        document.getElementById('internal-temp').value = '20';
        document.getElementById('internal-humidity').value = '50';
        document.getElementById('internal-thermal-resistance').value = '0.17';
        document.getElementById('external-temp').value = '2.5';
        document.getElementById('external-humidity').value = '80';
        document.getElementById('external-thermal-resistance').value = '0.17';
        
        // Reset typu konštrukcie
        document.getElementById('construction-type').value = 'floor';
        
        // Načítanie predvolených materiálov
        loadDefaultMaterials();
        
        // Reset výsledkov
        resetResults();
    }
}

// Zobrazenie modálneho okna pre export
function showExportModal() {
    // Kontrola, či boli vypočítané výsledky
    if (!calculationResults) {
        alert("Najprv vykonajte výpočet!");
        return;
    }
    
    document.getElementById('export-modal').style.display = 'block';
}

// Zatvorenie modálneho okna
function closeModal() {
    document.getElementById('export-modal').style.display = 'none';
}
