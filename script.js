/**
 * Hlavný skript pre inicializáciu aplikácie
 */

// Inicializácia aplikácie po načítaní DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializácia tepelnotechnickej kalkulačky...');
    
    // Inicializácia užívateľského rozhrania
    initUI();
    
    // Nastavenie automatického ukladania
    setupAutoSave();
    
    // Pokus o načítanie uloženej konfigurácie
    const loaded = autoLoadConfiguration();
    
    if (!loaded) {
        console.log('Nenašla sa žiadna uložená konfigurácia, používam predvolené hodnoty.');
        // Načítanie predvolených materiálov
        loadDefaultMaterials();
    } else {
        console.log('Úspešne načítaná uložená konfigurácia.');
    }
    
    // Pridanie event listenerov pre vstupy
    setupInputListeners();
    
    console.log('Tepelnotechnická kalkulačka bola úspešne inicializovaná.');
});

// Nastavenie event listenerov pre vstupy
function setupInputListeners() {
    // Automatické ukladanie pri zmene vstupov
    const inputFields = document.querySelectorAll('input, select');
    
    inputFields.forEach(input => {
        input.addEventListener('change', function() {
            autoSaveConfiguration();
        });
    });
}

// Funkcia pre spracovanie chýb
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Nastala chyba v aplikácii:', message, 'na riadku', lineno, 'v stĺpci', colno);
    console.error('Detaily chyby:', error);
    
    // Zabránenie šíreniu chyby
    return true;
};
