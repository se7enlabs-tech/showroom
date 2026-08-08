const fs = require('fs');

const knowledgePath = 'src/content/boon_mercado_knowledge.md';
let content = fs.readFileSync(knowledgePath, 'utf8');

const projectDataStr = fs.readFileSync('src/data/projectsData.ts', 'utf8');
const idMatches = [...projectDataStr.matchAll(/id:\s*"([^"]+)"/g)].map(m => m[1]);
const titleMatches = [...projectDataStr.matchAll(/title:\s*"([^"]+)"/g)].map(m => m[1]);
// We actually need the overview and challenge/solution
// Let's just generate the new section directly using a basic script.

