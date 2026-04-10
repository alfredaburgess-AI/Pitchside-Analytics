import os

replacements = {
    '#004d2c': '#001d3d',
    '#006838': '#002855',
    '#D4AF37': '#facc15',
    'rgba(212, 175, 55': 'rgba(250, 204, 21',
    'rgba(0, 77, 44': 'rgba(0, 29, 61'
}

for root, _, files in os.walk('dashboard/src'):
    for file in files:
        if file.endswith(('.css', '.tsx', '.ts')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
