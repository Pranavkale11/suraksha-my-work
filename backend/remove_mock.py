import re

import os

admin_api_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api', 'admin.py')

with open(admin_api_path, 'r', encoding='utf-8') as f:
    text = f.read()

# remove @router.get("/policies") ...
text = re.sub(r'@router\.get\("/policies"\).*?\]\n', '', text, flags=re.DOTALL)
text = re.sub(r'@router\.post\("/policies"\).*?return.*?\n', '', text, flags=re.DOTALL)

with open(admin_api_path, 'w', encoding='utf-8') as f:
    f.write(text)
