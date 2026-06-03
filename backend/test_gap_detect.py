import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import settings
from services.watcher import process_circular

async def test():
    demo_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'rbi_circular_demo.txt')
    with open(demo_path, 'r', encoding='utf-8') as f:
        text = f.read()
    status, clauses, ms, conf, full_text, *rest = await process_circular(text.encode('utf-8'), 'rbi_circular_demo.txt')
    print('Status:', status)
    print('Clauses:', len(clauses))
    assert full_text

if __name__ == '__main__':
    asyncio.run(test())
