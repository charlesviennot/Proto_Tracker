const extractNirsData = (csvText) => {
    const lines = csvText.split('\n');
    const separator = csvText.includes(';') ? ';' : ',';
    const dataPoints = [];
    
    const isTrainRed = csvText.includes('Train.Red Export') || csvText.includes('Timestamp (seconds passed)');

    if (isTrainRed) {
        let timeIdx = -1;
        let smo2Indices = [];
        let thbIndices = [];
        let dataStarted = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const columns = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
            
            if (!dataStarted) {
                if (columns.includes('Timestamp (seconds passed)')) {
                    timeIdx = columns.indexOf('Timestamp (seconds passed)');
                    smo2Indices = columns.map((c, idx) => c === 'SmO2' ? idx : -1).filter(idx => idx !== -1);
                    thbIndices = columns.map((c, idx) => c === 'THb unfiltered' ? idx : -1).filter(idx => idx !== -1);
                    if (thbIndices.length === 0) thbIndices = columns.map((c, idx) => c.toLowerCase().includes('thb') ? idx : -1).filter(idx => idx !== -1);
                    dataStarted = true;
                }
                continue;
            }

            if (dataStarted && timeIdx !== -1 && smo2Indices.length > 0) {
                const tStr = columns[timeIdx];
                if (!tStr) continue;

                const tVal = parseFloat(tStr.replace(',', '.'));
                
                let smo2Sum = 0, smo2Count = 0;
                smo2Indices.forEach(idx => {
                    const valStr = columns[idx];
                    if (valStr) {
                        const val = parseFloat(valStr.replace(',', '.'));
                        if (!isNaN(val)) { smo2Sum += val; smo2Count++; }
                    }
                });
                const sVal = smo2Count > 0 ? smo2Sum / smo2Count : NaN;

                let thbSum = 0, thbCount = 0;
                thbIndices.forEach(idx => {
                    const valStr = columns[idx];
                    if (valStr) {
                        const val = parseFloat(valStr.replace(',', '.'));
                        if (!isNaN(val)) { thbSum += val; thbCount++; }
                    }
                });
                const thbVal = thbCount > 0 ? thbSum / thbCount : 0;

                if (!isNaN(tVal) && !isNaN(sVal)) {
                    dataPoints.push({ time: tVal, smo2: sVal, thb: thbVal });
                }
            }
        }
        return dataPoints;
    }

    return null;
}

const csvContent = `Train.Red Export for;Session at 16/04/2026 13:34
Some other header;
Timestamp (seconds passed);Lap/Event;;SmO2;HBDiff;Muscle state;Muscle trend;SmO2 unfiltered;O2HB unfiltered;HHb unfiltered;THb unfiltered;HBDiff unfiltered;SmO2;HBDiff;Muscle state;Muscle trend;SmO2 unfiltered;O2HB unfiltered;HHb unfiltered;THb unfiltered;HBDiff unfiltered
0;;;74,68;22,04;0;2;68,5;-0,58;2;57,02;18,9;75,32;10,12;0;2;76,67;-6,34;0,91;67;-0,18
1;;;75,00;;;;;;;;58,00;;76,00;;;;;;;68
`;

console.log(extractNirsData(csvContent));
