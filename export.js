/**
 * Funkcie pre export a tlač výsledkov
 */

// Export materiálov do CSV
function exportMaterialsToCSV() {
    // Kontrola, či existujú materiály
    if (currentMaterials.length === 0) {
        alert("Nie sú zadané žiadne materiály na export!");
        return;
    }
    
    // Hlavička CSV
    let csvContent = "index,name,thickness,density,thermalConductivity,heatCapacity,diffusionFactor\n";
    
    // Pridanie riadkov s materiálmi
    currentMaterials.forEach((material, index) => {
        const row = [
            index + 1,
            material.name.replace(/,/g, ';'), // Nahradenie čiarok, aby sa nepokazil formát CSV
            material.thickness,
            material.density,
            material.thermalConductivity,
            material.heatCapacity,
            material.diffusionFactor
        ];
        csvContent += row.join(',') + "\n";
    });
    
    // Vytvorenie a stiahnutie súboru
    downloadFile(csvContent, 'materialy.csv', 'text/csv');
}

// Export konfigurácie do JSON
function exportConfigurationToJSON() {
    // Kontrola, či existujú materiály
    if (currentMaterials.length === 0) {
        alert("Nie sú zadané žiadne materiály na export!");
        return;
    }
    
    // Získanie okrajových podmienok
    const configData = {
        constructionType: document.getElementById('construction-type').value,
        conditions: {
            internalTemp: document.getElementById('internal-temp').value,
            internalHumidity: document.getElementById('internal-humidity').value,
            internalThermalResistance: document.getElementById('internal-thermal-resistance').value,
            externalTemp: document.getElementById('external-temp').value,
            externalHumidity: document.getElementById('external-humidity').value,
            externalThermalResistance: document.getElementById('external-thermal-resistance').value
        },
        materials: currentMaterials,
        results: calculationResults
    };
    
    // Konverzia na JSON
    const jsonContent = JSON.stringify(configData, null, 2);
    
    // Vytvorenie a stiahnutie súboru
    downloadFile(jsonContent, 'konfiguracia.json', 'application/json');
}

// Pomocná funkcia pre stiahnutie súboru
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Tlač výsledkov
function printResults() {
    // Kontrola, či boli vypočítané výsledky
    if (!calculationResults) {
        alert("Najprv vykonajte výpočet!");
        return;
    }
    
    // Vytvorenie novej stránky pre tlač
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
        alert("Blokované vyskakovacie okno. Povoľte vyskakovacie okná pre túto stránku a skúste to znova.");
        return;
    }
    
    // Získanie typu konštrukcie a popisov
    const constructionType = document.getElementById('construction-type').value;
    const description = getDescriptionByType(constructionType);
    
    // Vytvorenie materiálovej tabuľky pre tlač
    let materialsTableHTML = `
        <table class="print-materials-table">
            <tr>
                <th rowspan="2">č.</th>
                <th rowspan="2">Názov materiálu</th>
                <th rowspan="2">Hrúbka</th>
                <th rowspan="2">Objemová<br>hmotnosť</th>
                <th rowspan="2">Súčiniteľ<br>tepelnej<br>vodivosti</th>
                <th rowspan="2">Merná<br>tepelná<br>kapacita</th>
                <th rowspan="2">Faktor<br>difúzneho<br>odporu</th>
                <th rowspan="2">Tepelný<br>odpor</th>
                <th rowspan="2">Difúzny<br>odpor</th>
            </tr>
            <tr class="unit-row">
                <!-- Jednotky sú v druhom riadku, ale prvý stĺpec je prázdny -->
            </tr>
            <tr class="symbol-row">
                <td>-</td>
                <td>Symbol</td>
                <td>d</td>
                <td>ρ</td>
                <td>λ</td>
                <td>c</td>
                <td>μ</td>
                <td>R</td>
                <td>Rd·10<sup>-9</sup></td>
            </tr>
            <tr class="unit-row">
                <td>-</td>
                <td>Jednotka</td>
                <td>m</td>
                <td>kg/m³</td>
                <td>W/(m·K)</td>
                <td>J/(kg·K)</td>
                <td>(-)</td>
                <td>m²·K/W</td>
                <td>m/s</td>
            </tr>
    `;
    
    // Pridanie riadkov materiálov
    calculationResults.layers.forEach((layer, index) => {
        materialsTableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td style="text-align: left;">${layer.name}</td>
                <td>${formatNumber(layer.thickness, 3)}</td>
                <td>${formatNumber(layer.density, 0)}</td>
                <td>${formatNumber(layer.thermalConductivity, 3)}</td>
                <td>${formatNumber(layer.heatCapacity, 0)}</td>
                <td>${formatNumber(layer.diffusionFactor, 1)}</td>
                <td>${formatNumber(layer.thermalResistance, 3)}</td>
                <td>${formatNumber(layer.diffusionResistance / 1e9, 2)}</td>
            </tr>
        `;
    });
    
    materialsTableHTML += `</table>`;
    
    // Získanie okrajových podmienok
    const internalTemp = document.getElementById('internal-temp').value;
    const internalHumidity = document.getElementById('internal-humidity').value;
    const internalResistance = document.getElementById('internal-thermal-resistance').value;
    const externalTemp = document.getElementById('external-temp').value;
    const externalHumidity = document.getElementById('external-humidity').value;
    const externalResistance = document.getElementById('external-thermal-resistance').value;
    
    // Vytvorenie HTML pre tlačovú stránku
    const printHTML = `
        <!DOCTYPE html>
        <html lang="sk">
        <head>
            <meta charset="UTF-8">
            <title>${description.title}</title>
            <link rel="stylesheet" href="css/print.css">
            <style>
                /* Inline štýly pre tlač */
                @page {
                    size: A4;
                    margin: 10mm;
                }
                
                body {
                    background-color: white;
                    font-family: Arial, sans-serif;
                    color: black;
                    font-size: 11pt;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .print-container {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 10mm;
                    box-sizing: border-box;
                }
                
                .print-title {
                    font-size: 14pt;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10mm;
                }
                
                .print-main-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid black;
                    margin-bottom: 5mm;
                }
                
                .print-construction-name {
                    font-weight: bold;
                    text-align: center;
                    padding: 2mm;
                    border-bottom: 2px solid black;
                    background-color: #f0f0f0;
                }
                
                .print-construction-details {
                    padding: 5mm;
                }
                
                .print-boundary-conditions {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5mm;
                }
                
                .print-condition-panel {
                    width: 48%;
                    border: 1px solid black;
                    padding: 2mm;
                    box-sizing: border-box;
                }
                
                .print-condition-panel h3 {
                    font-size: 11pt;
                    color: brown !important;
                    text-align: center;
                    margin-bottom: 3mm;
                }
                
                .print-condition-item {
                    margin: 1mm 0;
                }
                
                .print-materials-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 5mm;
                }
                
                .print-materials-table th, 
                .print-materials-table td {
                    border: 1px solid black;
                    padding: 1mm 2mm;
                    text-align: center;
                    font-size: 10pt;
                }
                
                .print-materials-table th {
                    background-color: #f0f0f0;
                }
                
                .print-materials-table .symbol-row td,
                .print-materials-table .unit-row td {
                    background-color: #f9f9f9;
                    font-style: italic;
                }
                
                .print-results {
                    border: 1px solid black;
                    padding: 3mm;
                    margin-bottom: 5mm;
                }
                
                .print-results h3 {
                    font-size: 11pt;
                    color: #004080 !important;
                    text-align: center;
                    margin-bottom: 3mm;
                }
                
                .print-result-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 1mm 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 1mm;
                }
                
                .print-result-label {
                    font-weight: bold;
                }
                
                .print-assessment {
                    margin-top: 5mm;
                }
                
                .print-assessment h3 {
                    font-size: 11pt;
                    color: #004080 !important;
                    text-align: center;
                    margin-bottom: 3mm;
                }
                
                .print-assessment-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .print-assessment-table th,
                .print-assessment-table td {
                    border: 1px solid black;
                    padding: 2mm;
                }
                
                .print-assessment-table th {
                    background-color: #f0f0f0;
                    text-align: center;
                }
                
                .print-assessment-table td:first-child {
                    font-weight: bold;
                    width: 25%;
                }
                
                .assessment-positive {
                    color: green !important;
                    font-weight: bold;
                }
                
                .assessment-negative {
                    color: red !important;
                    font-weight: bold;
                }
                
                .print-button {
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 10px;
                }
                
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="text-align: center; margin: 10px;">
                <button class="print-button" onclick="window.print();">Tlačiť</button>
                <button class="print-button" onclick="window.close();">Zavrieť</button>
            </div>
            
            <div class="print-container">
                <div class="print-title">${description.title}</div>
                
                <table class="print-main-table">
                    <tr>
                        <td class="print-construction-name">${description.name}</td>
                    </tr>
                    <tr>
                        <td class="print-construction-details">
                            <div class="print-boundary-conditions">
                                <div class="print-condition-panel">
                                    <h3>Uvažované podmienky pre interiér</h3>
                                    <div class="print-condition-item">θᵢ = ${internalTemp} °C</div>
                                    <div class="print-condition-item">φᵢ = ${internalHumidity} %</div>
                                    <div class="print-condition-item">Rₛᵢ = ${internalResistance} m²·K/W</div>
                                </div>
                                
                                <div class="print-condition-panel">
                                    <h3>Uvažované podmienky pre exteriér (${description.externalName})</h3>
                                    <div class="print-condition-item">θₑ = ${externalTemp} °C</div>
                                    <div class="print-condition-item">φₑ = ${externalHumidity} %</div>
                                    <div class="print-condition-item">Rₛₑ = ${externalResistance} m²·K/W</div>
                                </div>
                            </div>
                            
                            ${materialsTableHTML}
                            
                            <div class="print-results">
                                <h3>Výsledky výpočtu tepelnotechnických parametrov</h3>
                                <div class="print-result-row">
                                    <div class="print-result-label">Tepelný odpor konštrukcie</div>
                                    <div>R = ${formatNumber(calculationResults.totalThermalResistance, 3)} m²·K/W</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Difúzny odpor konštrukcie</div>
                                    <div>Rd = ${formatNumber(calculationResults.totalDiffusionResistance / 1e9, 2)}·10⁹ m/s</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Súčiniteľ prechodu tepla</div>
                                    <div>U = ${formatNumber(calculationResults.heatTransferCoefficient, 3)} W/(m²·K)</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Vnútorná povrchová teplota</div>
                                    <div>θₛᵢ = ${formatNumber(calculationResults.surfaceTemperature, 2)} °C</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Vlhkostný režim</div>
                                    <div>${calculationResults.moistureMode}</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Tepelná prijímavosť podlahy</div>
                                    <div>b = ${formatNumber(calculationResults.thermalAdmittance, 2)} W·s¹/²/(m²·K)</div>
                                </div>
                                <div class="print-result-row">
                                    <div class="print-result-label">Pokles dotykovej teploty podlahy</div>
                                    <div>Δθ₁₀ = ${formatNumber(calculationResults.temperatureDrop, 2)} °C</div>
                                </div>
                            </div>
                            
                            <div class="print-assessment">
                                <h3>Posúdenie konštrukcie fragmentu</h3>
                                <table class="print-assessment-table">
                                    <tr>
                                        <th>Parameter</th>
                                        <th>Hodnota</th>
                                        <th>Hodnotenie</th>
                                    </tr>
                                    <tr>
                                        <td>Tepelný odpor</td>
                                        <td>R = ${formatNumber(calculationResults.totalThermalResistance, 2)} m²·K/W ${calculationResults.assessment.thermalResistance ? '≥' : '<'} R₍ₙ₎ = ${calculationResults.normalizedValues.thermalResistance.toFixed(2)} m²·K/W - normalizovaná hodnota</td>
                                        <td class="${calculationResults.assessment.thermalResistance ? 'assessment-positive' : 'assessment-negative'}">${calculationResults.assessment.thermalResistance ? 'vyhovuje' : 'nevyhovuje'}</td>
                                    </tr>
                                    <tr>
                                        <td>Súčiniteľ prechodu tepla</td>
                                        <td>U = ${formatNumber(calculationResults.heatTransferCoefficient, 2)} W/(m²·K) ${calculationResults.assessment.heatTransferCoefficient ? '≤' : '>'} U₍ₙ₎ = ${calculationResults.normalizedValues.heatTransferCoefficient.toFixed(2)} W/(m²·K) - normalizovaná hodnota</td>
                                        <td class="${calculationResults.assessment.heatTransferCoefficient ? 'assessment-positive' : 'assessment-negative'}">${calculationResults.assessment.heatTransferCoefficient ? 'vyhovuje' : 'nevyhovuje'}</td>
                                    </tr>
                                    <tr>
                                        <td>Riziko vzniku plesní</td>
                                        <td>θₛᵢ = ${formatNumber(calculationResults.surfaceTemperature, 2)} °C ${calculationResults.assessment.moldRisk ? '>' : '≤'} θₛᵢ₊₈₀ + Δθₛᵢ = ${formatNumber(calculationResults.moldRisk.criticalTemperature, 2)} °C</td>
                                        <td class="${calculationResults.assessment.moldRisk ? 'assessment-positive' : 'assessment-negative'}">${calculationResults.assessment.moldRisk ? 'vyhovuje' : 'nevyhovuje'}</td>
                                    </tr>
                                    <tr>
                                        <td>Tepelná prijímavosť</td>
                                        <td>b = ${formatNumber(calculationResults.thermalAdmittance, 0)} W·s¹/²/(m²·K) - ${calculationResults.assessment.thermalAdmittanceDescription}</td>
                                        <td class="${calculationResults.assessment.thermalAdmittance ? 'assessment-positive' : 'assessment-negative'}">${calculationResults.assessment.thermalAdmittance ? 'vyhovuje' : 'nevyhovuje'}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
    
    // Zápis HTML do nového okna
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Tlač po úplnom načítaní stránky
    printWindow.onload = function() {
        setTimeout(() => {
            // Neautomaticky tlačíme, necháme užívateľovi možnosť najprv skontrolovať náhľad
            // printWindow.print();
        }, 500);
    };
}
