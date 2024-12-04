const fs = require('fs');
const path = require('path');

function generateReport(testResults) {
    // Leer el template HTML
    const template = fs.readFileSync(path.join(__dirname, '../reports/test-report.html'), 'utf8');
    
    // Generar el reporte con los resultados actuales
    const report = template.replace('{{testResults}}', JSON.stringify(testResults));
    
    // Guardar el reporte
    fs.writeFileSync(path.join(__dirname, '../reports/latest-report.html'), report);
}

module.exports = generateReport;
