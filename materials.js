/**
 * Definície predvolených materiálov a normových hodnôt
 */

// Aktuálne materiály
let currentMaterials = [];

// Predvolené materiály pre podlahu na strope
const defaultFloorMaterials = [
    {
        name: "Parketové vlysy",
        thickness: 0.021,
        density: 600,
        thermalConductivity: 0.180,
        heatCapacity: 2510,
        diffusionFactor: 157.0
    },
    {
        name: "Asfaltové lepidlo",
        thickness: 0.003,
        density: 1300,
        thermalConductivity: 0.220,
        heatCapacity: 1300,
        diffusionFactor: 1350.0
    },
    {
        name: "Betónový poter",
        thickness: 0.035,
        density: 2100,
        thermalConductivity: 1.050,
        heatCapacity: 1020,
        diffusionFactor: 17.0
    },
    {
        name: "Lepenka",
        thickness: 0.001,
        density: 1070,
        thermalConductivity: 0.210,
        heatCapacity: 1470,
        diffusionFactor: 8550.0
    },
    {
        name: "Rohož so sklenou vlnou",
        thickness: 0.020,
        density: 260,
        thermalConductivity: 0.050,
        heatCapacity: 880,
        diffusionFactor: 2.5
    },
    {
        name: "Železobetónový panel",
        thickness: 0.100,
        density: 2400,
        thermalConductivity: 1.340,
        heatCapacity: 1020,
        diffusionFactor: 29.0
    },
    {
        name: "Vnútorná omietka",
        thickness: 0.010,
        density: 1600,
        thermalConductivity: 0.700,
        heatCapacity: 840,
        diffusionFactor: 6.0
    }
];

// Predvolené materiály pre stenu
const defaultWallMaterials = [
    {
        name: "Vnútorná omietka",
        thickness: 0.010,
        density: 1600,
        thermalConductivity: 0.700,
        heatCapacity: 840,
        diffusionFactor: 6.0
    },
    {
        name: "Tehla plná pálená",
        thickness: 0.380,
        density: 1800,
        thermalConductivity: 0.800,
        heatCapacity: 900,
        diffusionFactor: 9.0
    },
    {
        name: "Vonkajšia omietka",
        thickness: 0.020,
        density: 1800,
        thermalConductivity: 0.880,
        heatCapacity: 790,
        diffusionFactor: 19.0
    }
];

// Predvolené materiály pre strechu
const defaultRoofMaterials = [
    {
        name: "Sadrokartónový podhľad",
        thickness: 0.0125,
        density: 750,
        thermalConductivity: 0.220,
        heatCapacity: 1060,
        diffusionFactor: 9.0
    },
    {
        name: "Parozábrana",
        thickness: 0.0002,
        density: 1400,
        thermalConductivity: 0.350,
        heatCapacity: 1470,
        diffusionFactor: 100000.0
    },
    {
        name: "Tepelná izolácia - minerálna vlna",
        thickness: 0.250,
        density: 40,
        thermalConductivity: 0.041,
        heatCapacity: 840,
        diffusionFactor: 1.0
    },
    {
        name: "Strešná konštrukcia - krokvy",
        thickness: 0.200,
        density: 500,
        thermalConductivity: 0.180,
        heatCapacity: 2510,
        diffusionFactor: 157.0
    },
    {
        name: "Difúzna fólia",
        thickness: 0.0002,
        density: 400,
        thermalConductivity: 0.350,
        heatCapacity: 1700,
        diffusionFactor: 100.0
    }
];

// Normové hodnoty podľa typu konštrukcie
const normalizedValues = {
    wall: {
        thermalResistance: 2.00,
        heatTransferCoefficient: 0.38,
        description: "Stena"
    },
    roof: {
        thermalResistance: 4.80,
        heatTransferCoefficient: 0.20,
        description: "Strecha"
    },
    floor: {
        thermalResistance: 1.70,
        heatTransferCoefficient: 0.50,
        description: "Podlaha na strope"
    }
};

// Definície popiskov podľa typu konštrukcie
const constructionDescriptions = {
    wall: {
        title: "Tepelnotechnické vlastnosti a posúdenie fragmentu steny",
        name: "Stena (pôvodný stav)",
        externalName: "exteriér"
    },
    roof: {
        title: "Tepelnotechnické vlastnosti a posúdenie fragmentu strechy",
        name: "Strecha (pôvodný stav)",
        externalName: "exteriér"
    },
    floor: {
        title: "Tepelnotechnické vlastnosti a posúdenie fragmentu podlahy na strope",
        name: "Podlaha na strope nad suterénom (pôvodný stav)",
        externalName: "nevykurovaný suterén"
    }
};

// Získanie materiálov podľa typu konštrukcie
function getMaterialsByType(type) {
    switch(type) {
        case 'wall':
            return JSON.parse(JSON.stringify(defaultWallMaterials));
        case 'roof':
            return JSON.parse(JSON.stringify(defaultRoofMaterials));
        case 'floor':
        default:
            return JSON.parse(JSON.stringify(defaultFloorMaterials));
    }
}

// Získanie normových hodnôt podľa typu konštrukcie
function getNormalizedValuesByType(type) {
    return normalizedValues[type] || normalizedValues.floor;
}

// Získanie popiskov podľa typu konštrukcie
function getDescriptionByType(type) {
    return constructionDescriptions[type] || constructionDescriptions.floor;
}

// Vytvorenie nového prázdneho materiálu
function createEmptyMaterial() {
    return {
        name: "Nový materiál",
        thickness: 0.01,
        density: 1000,
        thermalConductivity: 0.5,
        heatCapacity: 1000,
        diffusionFactor: 10.0
    };
}

// Konverzia materiálu na objekt pre CSV export
function materialToCSVRow(material, index) {
    return {
        index: index + 1,
        name: material.name,
        thickness: material.thickness,
        density: material.density,
        thermalConductivity: material.thermalConductivity,
        heatCapacity: material.heatCapacity,
        diffusionFactor: material.diffusionFactor
    };
}

// Konverzia CSV riadku na materiál
function csvRowToMaterial(row) {
    return {
        name: row.name || "Nový materiál",
        thickness: parseFloat(row.thickness) || 0.01,
        density: parseFloat(row.density) || 1000,
        thermalConductivity: parseFloat(row.thermalConductivity) || 0.5,
        heatCapacity: parseFloat(row.heatCapacity) || 1000,
        diffusionFactor: parseFloat(row.diffusionFactor) || 10.0
    };
}

// Validácia materiálu
function validateMaterial(material) {
    return (
        material.name && 
        material.thickness > 0 &&
        material.density > 0 && 
        material.thermalConductivity > 0 &&
        material.heatCapacity > 0 &&
        material.diffusionFactor > 0
    );
}
