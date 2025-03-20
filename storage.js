/**
 * Funkcie pre ukladanie a načítavanie konfigurácie
 */

// Uloženie konfigurácie do súboru
function saveConfiguration() {
    // Kontrola, či existujú materiály
    if (currentMaterials.length === 0) {
        alert("Nie sú zadané žiadne materiály na uloženie!");
        return;
    }
    
    // Získanie okrajových podmienok a vytvorenie konfiguračného objektu
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
        materials: currentMaterials
    };
    
    // Uloženie do localStorage pre autoload
    try {
        localStorage.setItem('thermalCalculator', JSON.stringify(configData));
    } catch (e) {
        console.warn('Nebolo možné uložiť konfiguráciu do localStorage:', e);
    }
    
    // Konverzia na JSON pre stiahnutie súboru
    const jsonContent = JSON.stringify(configData, null, 2);
    
    // Vytvorenie názvu súboru
    const constructionTypeText = document.getElementById('construction-type').options[document.getElementById('construction-type').selectedIndex].text;
    const fileName = `tepelnotechnicky_vypocet_${constructionTypeText.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    
    // Vytvorenie a stiahnutie súboru
    downloadFile(jsonContent, fileName, 'application/json');
    
    alert("Konfigurácia bola úspešne uložená.");
}

// Načítanie konfigurácie zo súboru
function loadConfigurationFromFile() {
    // Vytvorenie neviditeľného input elementu pre výber súboru
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // Pridanie do DOM
    document.body.appendChild(fileInput);
    
    // Event handler pre vybraný súbor
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const configData = JSON.parse(e.target.result);
                loadConfiguration(configData);
                alert("Konfigurácia bola úspešne načítaná.");
            } catch (error) {
                console.error("Chyba pri načítaní konfigurácie:", error);
                alert("Nepodarilo sa načítať konfiguráciu. Neplatný formát súboru.");
            }
        };
        
        reader.onerror = function() {
            alert("Chyba pri čítaní súboru.");
        };
        
        reader.readAsText(file);
    });
    
    // Odstránenie z DOM po zatvorení dialógu
    fileInput.addEventListener('blur', function() {
        document.body.removeChild(fileInput);
    });
    
    // Simulácia kliknutia pre otvorenie dialógu
    fileInput.click();
}

// Načítanie konfigurácie z objektu
function loadConfiguration(configData) {
    // Kontrola platnosti konfigurácie
    if (!configData || !configData.constructionType || !configData.materials || !Array.isArray(configData.materials)) {
        alert("Neplatná konfigurácia!");
        return false;
    }
    
    // Nastavenie typu konštrukcie
    if (configData.constructionType) {
        document.getElementById('construction-type').value = configData.constructionType;
    }
    
    // Nastavenie okrajových podmienok
    if (configData.conditions) {
        if (configData.conditions.internalTemp) {
            document.getElementById('internal-temp').value = configData.conditions.internalTemp;
        }
        if (configData.conditions.internalHumidity) {
            document.getElementById('internal-humidity').value = configData.conditions.internalHumidity;
        }
        if (configData.conditions.internalThermalResistance) {
            document.getElementById('internal-thermal-resistance').value = configData.conditions.internalThermalResistance;
        }
        if (configData.conditions.externalTemp) {
            document.getElementById('external-temp').value = configData.conditions.externalTemp;
        }
        if (configData.conditions.externalHumidity) {
            document.getElementById('external-humidity').value = configData.conditions.externalHumidity;
        }
        if (configData.conditions.externalThermalResistance) {
            document.getElementById('external-thermal-resistance').value = configData.conditions.externalThermalResistance;
        }
    }
    
    // Nastavenie materiálov
    if (configData.materials && configData.materials.length > 0) {
        currentMaterials = configData.materials.map(material => {
            return {
                name: material.name || "Neznámy materiál",
                thickness: parseFloat(material.thickness) || 0.01,
                density: parseFloat(material.density) || 1000,
                thermalConductivity: parseFloat(material.thermalConductivity) || 0.5,
                heatCapacity: parseFloat(material.heatCapacity) || 1000,
                diffusionFactor: parseFloat(material.diffusionFactor) || 10
            };
        });
        
        renderMaterialsTable();
    }
    
    // Reset výsledkov
    resetResults();
    
    return true;
}

// Automatické načítanie uloženej konfigurácie
function autoLoadConfiguration() {
    try {
        const savedConfig = localStorage.getItem('thermalCalculator');
        if (savedConfig) {
            const configData = JSON.parse(savedConfig);
            return loadConfiguration(configData);
        }
    } catch (e) {
        console.warn('Nebolo možné automaticky načítať konfiguráciu z localStorage:', e);
    }
    
    return false;
}

// Automatické ukladanie konfigurácie
function autoSaveConfiguration() {
    // Ak nie sú žiadne materiály, nemá význam ukladať
    if (currentMaterials.length === 0) return;
    
    // Vytvorenie konfiguračného objektu
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
        materials: currentMaterials
    };
    
    // Uloženie do localStorage
    try {
        localStorage.setItem('thermalCalculator', JSON.stringify(configData));
    } catch (e) {
        console.warn('Nebolo možné automaticky uložiť konfiguráciu do localStorage:', e);
    }
}

// Nastavenie automatického ukladania
function setupAutoSave() {
    // Automatické ukladanie každých 30 sekúnd
    setInterval(autoSaveConfiguration, 30000);
    
    // Ukladanie pri odchode zo stránky
    window.addEventListener('beforeunload', autoSaveConfiguration);
}
