/**
 * Funkcie pre tepelnotechnické výpočty
 */

// Výpočet tepelného odporu jednotlivej vrstvy
function calculateLayerThermalResistance(thickness, thermalConductivity) {
    if (thermalConductivity === 0) return 0;
    return thickness / thermalConductivity;
}

// Výpočet difúzneho odporu jednotlivej vrstvy
function calculateLayerDiffusionResistance(thickness, diffusionFactor) {
    // Konštanta pre difúzny odpor vodnej pary vo vzduchu (s/m)
    const diffusionConstant = 1.95e-10;
    return thickness * diffusionFactor / diffusionConstant;
}

// Výpočet celkového tepelného odporu konštrukcie
function calculateTotalThermalResistance(layers, rsi, rse) {
    let totalResistance = rsi + rse;
    
    for (const layer of layers) {
        totalResistance += calculateLayerThermalResistance(
            layer.thickness, 
            layer.thermalConductivity
        );
    }
    
    return totalResistance;
}

// Výpočet celkového difúzneho odporu konštrukcie
function calculateTotalDiffusionResistance(layers) {
    let totalResistance = 0;
    
    for (const layer of layers) {
        totalResistance += calculateLayerDiffusionResistance(
            layer.thickness, 
            layer.diffusionFactor
        );
    }
    
    return totalResistance;
}

// Výpočet súčiniteľa prechodu tepla
function calculateHeatTransferCoefficient(totalThermalResistance) {
    if (totalThermalResistance === 0) return 0;
    return 1 / totalThermalResistance;
}

// Výpočet vnútornej povrchovej teploty
function calculateSurfaceTemperature(internalTemp, externalTemp, rsi, totalThermalResistance, heatTransferCoefficient) {
    const temperatureDifference = internalTemp - externalTemp;
    return internalTemp - heatTransferCoefficient * rsi * temperatureDifference;
}

// Výpočet tepelnej prijímavosti podlahy
function calculateThermalAdmittance(layers) {
    // Výpočet tepelnej prijímavosti pre vrchnú vrstvu (pre podlahy)
    const topLayer = layers[0];
    if (!topLayer) return 0;
    
    const c = topLayer.heatCapacity;
    const rho = topLayer.density;
    const lambda = topLayer.thermalConductivity;
    
    // Tepelná prijímavosť b = sqrt(c * rho * lambda)
    return Math.sqrt(c * rho * lambda);
}

// Výpočet poklesu dotykovej teploty podlahy
function calculateTemperatureDrop(thermalAdmittance) {
    // Zjednodušený výpočet poklesu dotykovej teploty na základe tepelnej prijímavosti
    // Presné hodnoty by mali byť vypočítané podľa normy STN 73 0540
    
    if (thermalAdmittance < 350) {
        return 3.8; // Veľmi teplá podlaha
    } else if (thermalAdmittance < 700) {
        return 5.0; // Teplá podlaha
    } else if (thermalAdmittance < 850) {
        return 6.9; // Mierne teplá podlaha
    } else {
        return 8.0; // Studená podlaha
    }
}

// Kontrola rizika vzniku plesní
function checkMoldRisk(surfaceTemperature, internalTemp, internalHumidity) {
    // Výpočet kritickej povrchovej teploty pre vznik plesní
    // θsi,80 = teplota, pri ktorej je relatívna vlhkosť na povrchu 80%
    
    // Zjednodušený výpočet, v praxi sa používajú tabuľkové hodnoty alebo funkcie pre výpočet tlaku vodnej pary
    const saturationPressure = calculateSaturationPressure(internalTemp);
    const internalVaporPressure = saturationPressure * (internalHumidity / 100);
    const criticalVaporPressure = internalVaporPressure / 0.8; // 80% relatívna vlhkosť
    
    // Spätný výpočet teploty z tlaku nasýtenej vodnej pary
    const criticalTemperature = calculateTemperatureFromSaturationPressure(criticalVaporPressure);
    
    // Bezpečnostná prirážka
    const safetyMargin = 0.5;
    
    // Kritická teplota pre vznik plesní s bezpečnostnou prirážkou
    const moldRiskThreshold = criticalTemperature + safetyMargin;
    
    return {
        surfaceTemperature: surfaceTemperature,
        criticalTemperature: moldRiskThreshold,
        safe: surfaceTemperature > moldRiskThreshold
    };
}

// Pomocná funkcia pre výpočet tlaku nasýtenej vodnej pary
function calculateSaturationPressure(temperature) {
    // Magnusov vzorec pre tlak nasýtenej vodnej pary (Pa)
    // Platný pre teploty -20°C až +50°C
    const a = 17.27;
    const b = 237.7;
    
    const exponent = (a * temperature) / (b + temperature);
    return 610.78 * Math.exp(exponent);
}

// Pomocná funkcia pre výpočet teploty z tlaku nasýtenej vodnej pary
function calculateTemperatureFromSaturationPressure(pressure) {
    // Inverzný Magnusov vzorec
    const a = 17.27;
    const b = 237.7;
    
    const ln = Math.log(pressure / 610.78);
    return (b * ln) / (a - ln);
}

// Funkcia pre kompletný tepelnotechnický výpočet
function performThermalCalculation(materials, params) {
    // Vstupné parametre
    const internalTemp = parseFloat(params.internalTemp);
    const externalTemp = parseFloat(params.externalTemp);
    const internalHumidity = parseFloat(params.internalHumidity);
    const externalHumidity = parseFloat(params.externalHumidity);
    const rsi = parseFloat(params.rsi);
    const rse = parseFloat(params.rse);
    const constructionType = params.constructionType;
    
    // Normové hodnoty
    const normalizedValues = getNormalizedValuesByType(constructionType);
    
    // 1. Tepelný odpor jednotlivých vrstiev
    const layersWithResistance = materials.map(layer => {
        const r = calculateLayerThermalResistance(layer.thickness, layer.thermalConductivity);
        const rd = calculateLayerDiffusionResistance(layer.thickness, layer.diffusionFactor);
        return { ...layer, thermalResistance: r, diffusionResistance: rd };
    });
    
    // 2. Celkový tepelný odpor konštrukcie
    const totalThermalResistance = calculateTotalThermalResistance(materials, rsi, rse);
    
    // 3. Celkový difúzny odpor konštrukcie
    const totalDiffusionResistance = calculateTotalDiffusionResistance(materials);
    
    // 4. Súčiniteľ prechodu tepla
    const heatTransferCoefficient = calculateHeatTransferCoefficient(totalThermalResistance);
    
    // 5. Vnútorná povrchová teplota
    const surfaceTemperature = calculateSurfaceTemperature(
        internalTemp, 
        externalTemp, 
        rsi, 
        totalThermalResistance, 
        heatTransferCoefficient
    );
    
    // 6. Tepelná prijímavosť podlahy (relevantné hlavne pre podlahy)
    const thermalAdmittance = calculateThermalAdmittance(materials);
    
    // 7. Pokles dotykovej teploty podlahy (relevantné hlavne pre podlahy)
    const temperatureDrop = calculateTemperatureDrop(thermalAdmittance);
    
    // 8. Kontrola rizika vzniku plesní
    const moldRisk = checkMoldRisk(surfaceTemperature, internalTemp, internalHumidity);
    
    // 9. Hodnotenie kritérií
    // a) Tepelný odpor
    const thermalResistanceAssessment = totalThermalResistance >= normalizedValues.thermalResistance;
    
    // b) Súčiniteľ prechodu tepla
    const heatTransferCoefficientAssessment = heatTransferCoefficient <= normalizedValues.heatTransferCoefficient;
    
    // c) Riziko vzniku plesní
    const moldRiskAssessment = moldRisk.safe;
    
    // d) Tepelná prijímavosť (len pre podlahy)
    // Hodnotenie podľa kategórií podláh:
    // I. kategória: b < 350 W·s^(1/2)/(m²·K) - veľmi teplé podlahy
    // II. kategória: 350 ≤ b < 700 W·s^(1/2)/(m²·K) - teplé podlahy
    // III. kategória: 700 ≤ b < 850 W·s^(1/2)/(m²·K) - mierne teplé podlahy
    // IV. kategória: b ≥ 850 W·s^(1/2)/(m²·K) - studené podlahy
    let thermalAdmittanceCategory = "";
    let thermalAdmittanceDescription = "";
    let thermalAdmittanceAssessment = true; // Predvolene vyhovuje
    
    if (thermalAdmittance < 350) {
        thermalAdmittanceCategory = "I";
        thermalAdmittanceDescription = "veľmi teplá podlaha";
    } else if (thermalAdmittance < 700) {
        thermalAdmittanceCategory = "II";
        thermalAdmittanceDescription = "teplá podlaha";
    } else if (thermalAdmittance < 850) {
        thermalAdmittanceCategory = "III";
        thermalAdmittanceDescription = "mierne teplá podlaha";
    } else {
        thermalAdmittanceCategory = "IV";
        thermalAdmittanceDescription = "studená podlaha";
        // Pre obytné miestnosti sa požaduje maximálne III. kategória
        if (constructionType === 'floor') {
            thermalAdmittanceAssessment = false;
        }
    }
    
    // Určenie vlhkostného režimu - zjednodušená implementácia
    // V reálnej praxi by sa mal vykonať výpočet priebehu teplôt a tlakov vodnej pary v konštrukcii
    const moistureMode = "Vo vnútri konštrukcie nekondenzuje vodná para";
    
    // Výsledky výpočtu
    return {
        layers: layersWithResistance,
        totalThermalResistance: totalThermalResistance,
        totalDiffusionResistance: totalDiffusionResistance,
        heatTransferCoefficient: heatTransferCoefficient,
        surfaceTemperature: surfaceTemperature,
        thermalAdmittance: thermalAdmittance,
        temperatureDrop: temperatureDrop,
        moistureMode: moistureMode,
        moldRisk: moldRisk,
        assessment: {
            thermalResistance: thermalResistanceAssessment,
            heatTransferCoefficient: heatTransferCoefficientAssessment,
            moldRisk: moldRiskAssessment,
            thermalAdmittance: thermalAdmittanceAssessment,
            thermalAdmittanceCategory: thermalAdmittanceCategory,
            thermalAdmittanceDescription: thermalAdmittanceDescription
        },
        normalizedValues: normalizedValues
    };
}

// Funkcia pre formátovanie čísel na požadovaný počet desatinných miest
function formatNumber(number, decimals = 3) {
    return parseFloat(number.toFixed(decimals));
}
