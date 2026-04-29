import os

directory = r"d:\GENAI PROJECT\frontend\src\components"
app_jsx = r"d:\GENAI PROJECT\frontend\src\App.jsx"

files = [app_jsx]
for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        files.append(os.path.join(directory, filename))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("blue", "slate")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
