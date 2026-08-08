const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/content/projects.json', 'utf8'));
data[1].category = "AI Agents";
data[3].category = "WORKFLOW AUTOMATION";
fs.writeFileSync('src/content/projects.json', JSON.stringify(data, null, 2));
