import re

with open('src/data/projectsData.ts', 'r') as f:
    data = f.read()

# basic parsing of projectsData
projects = []
# Split by id:
parts = data.split('id: "')[1:]
for part in parts:
    id_match = part.split('"', 1)[0]
    title_match = re.search(r'title:\s*"([^"]+)"', part)
    tagline_match = re.search(r'tagline:\s*"([^"]+)"', part)
    tools_match = re.search(r'tools:\s*\[([^\]]+)\]', part)
    overview_match = re.search(r'overview:\s*"([^"]+)"', part)
    
    if title_match:
        title = title_match.group(1)
        tagline = tagline_match.group(1) if tagline_match else ""
        overview = overview_match.group(1) if overview_match else ""
        
        tools = ""
        if tools_match:
            tools = tools_match.group(1).replace('"', '').replace('\n', '').strip()
            
        projects.append(f"### {title}\n{tagline}\n\n**Overview:** {overview}\n**Tools:** {tools}\n")

new_projects_section = "## Portfolio Projects (AI Automation Era)\n\n" + "\n".join(projects)

with open('src/content/boon_mercado_knowledge.md', 'r') as f:
    knowledge = f.read()
    
start_idx = knowledge.find('## Portfolio Projects (AI Automation Era)')
end_idx = knowledge.find('## Data Analysis Projects (Prior Era)')

if start_idx != -1 and end_idx != -1:
    updated_knowledge = knowledge[:start_idx] + new_projects_section + "\n" + knowledge[end_idx:]
    with open('src/content/boon_mercado_knowledge.md', 'w') as f:
        f.write(updated_knowledge)
    print("Updated successfully")
else:
    print("Could not find sections")

