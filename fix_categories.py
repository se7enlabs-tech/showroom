import json

with open('src/content/projects.json', 'r') as f:
    data = json.load(f)

data[1]['category'] = "AI Agents"
data[3]['category'] = "WORKFLOW AUTOMATION"

with open('src/content/projects.json', 'w') as f:
    json.dump(data, f, indent=2)
