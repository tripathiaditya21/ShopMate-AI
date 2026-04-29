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
    
    content = content.replace("border-blue-800", "border-blue-700")
    content = content.replace("border-zinc-800", "border-blue-800")
    content = content.replace("bg-blue-950", "bg-blue-800")
    content = content.replace("bg-black", "bg-blue-950")
    content = content.replace("bg-zinc-950", "bg-blue-900")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
