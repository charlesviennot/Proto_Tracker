function parseMoxyTime(timeStr: string): number {
    if (!timeStr) return NaN;
    if (timeStr.includes(':')) {
        const parts = timeStr.split(':').map(p => parseFloat(p.replace(',', '.')));
        if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        if (parts.length === 2) return (parts[0] * 60) + parts[1];
    }
    return parseFloat(timeStr.replace(',', '.'));
}

const csvText = `Header1, Header2
Blah, Blah
Time,SmO2 Live,THb Live
14:00:00, 50, 12
14:00:02, 51, 12.1
14:00:04, 50, 12.0
`;

const lines = csvText.split('\n');
const dataPoints: any[] = [];
const separator = csvText.includes(';') ? ';' : ',';

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.split(separator);
    
    if (columns.length >= 3) {
        let timeIdx = columns.length >= 4 ? 1 : 0;
        let smo2Idx = columns.length >= 4 ? 2 : 1;
        let thbIdx = columns.length >= 4 ? 3 : 2;

        let timeVal = parseMoxyTime(columns[timeIdx]);
        if (isNaN(timeVal) && timeIdx === 1) {
            timeVal = parseMoxyTime(columns[0]);
            if (!isNaN(timeVal)) {
                smo2Idx = 1;
                thbIdx = 2;
            }
        }
        
        const smo2Val = parseFloat(columns[smo2Idx]?.replace(',', '.'));
        const thbVal = parseFloat(columns[thbIdx]?.replace(',', '.'));
        
        if (!isNaN(smo2Val) && !isNaN(thbVal) && !isNaN(timeVal)) {
            dataPoints.push({ time: timeVal, smo2: smo2Val, thb: thbVal });
        }
    }
}
if (dataPoints.length > 0) {
    const firstTime = dataPoints[0].time;
    dataPoints.forEach(dp => dp.time -= firstTime);
}

console.log(dataPoints);
