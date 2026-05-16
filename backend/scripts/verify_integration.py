import asyncio
import httpx
import time
from typing import Dict, Any

API_BASE = "http://localhost:8000/api"

class SystemVerifier:
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=API_BASE, timeout=10.0)
        self.results = []
        
    async def run_suite(self):
        print("\n🚀 Starting SuRaksha MAPS v4.0 System Verification Pipeline\n")
        
        # Test 1: Core Connectivity
        await self.verify_endpoint("GET", "/health", "System Health Check")
        await self.verify_endpoint("GET", "/debug/deployment", "Database & Environment Setup")
        
        # Test 2: Watcher Pipeline
        await self.verify_endpoint("GET", "/circulars", "Circular List Check")
        
        # Test 3: Gap Detector
        await self.verify_endpoint("GET", "/gaps/queue", "Gap Queue Fetch")
        
        self.print_report()

    async def verify_endpoint(self, method: str, path: str, name: str, payload: Dict = None):
        print(f"⏳ Running: {name}...", end=" ", flush=True)
        start = time.time()
        try:
            if method == "GET":
                res = await self.client.get(path)
            elif method == "POST":
                res = await self.client.post(path, json=payload)
                
            elapsed = (time.time() - start) * 1000
            
            if res.status_code < 400:
                print(f"✅ PASS ({elapsed:.0f}ms)")
                self.results.append({"name": name, "status": "pass"})
            else:
                print(f"❌ FAIL (Status {res.status_code})")
                self.results.append({"name": name, "status": "fail"})
        except Exception as e:
            print(f"❌ ERROR ({str(e)})")
            self.results.append({"name": name, "status": "error"})

    def print_report(self):
        print("\n--- 📊 Verification Summary ---")
        passed = sum(1 for r in self.results if r['status'] == 'pass')
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if passed == total:
            print("\n✅ SYSTEM IS FULLY OPERATIONAL AND READY FOR HACKATHON DEMO.")
        else:
            print("\n❌ SYSTEM ISSUES DETECTED. DO NOT DEPLOY.")

if __name__ == "__main__":
    verifier = SystemVerifier()
    asyncio.run(verifier.run_suite())
