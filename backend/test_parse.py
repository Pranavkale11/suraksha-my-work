import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.watcher import parse_clauses
demo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'rbi_circular_demo.txt')
with open(demo_path, 'r', encoding='utf-8') as f:
    text = f.read()
print(parse_clauses(text))
