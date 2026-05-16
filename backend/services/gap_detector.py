import uuid
from datetime import datetime
from models.gap import KeywordComplianceResult, JudgeExplanationStep, PolicyMatch, GapDetectionResult

KEYWORD_TAXONOMY = {
    "cryptography": {
        "exact": ["AES-256", "AES-128", "SHA-256", "SHA-384", "RSA-2048", "TLS 1.3", "TLS 1.2"],
        "fuzzy": ["encryption", "cipher", "cryptographic"],
        "severity": "critical"
    },
    "authentication": {
        "exact": ["MFA", "2FA", "multi-factor", "biometric", "hardware token", "OTP"],
        "fuzzy": ["authenticate", "login", "access control"],
        "severity": "critical"
    },
    "data_protection": {
        "exact": ["DLP", "data loss prevention", "masking", "tokenization", "PII", "sensitive data"],
        "fuzzy": ["data protection", "privacy", "anonymization"],
        "severity": "high"
    },
    "network_security": {
        "exact": ["firewall", "IDS", "IPS", "WAF", "DMZ", "VPN", "zero trust"],
        "fuzzy": ["network segmentation", "perimeter"],
        "severity": "high"
    },
    "monitoring": {
        "exact": ["SIEM", "SOC", "real-time monitoring", "24x7", "24/7"],
        "fuzzy": ["monitor", "alert", "log analysis"],
        "severity": "medium"
    },
    "frequency": {
        "exact": ["quarterly", "monthly", "weekly", "daily", "annual", "biannual"],
        "fuzzy": ["periodic", "regular", "routine"],
        "severity": "high"
    },
    "response_time": {
        "exact": ["within 24 hours", "within 48 hours", "within 72 hours", "immediately", "without delay"],
        "fuzzy": ["prompt", "timely", "expeditious"],
        "severity": "high"
    },
    "audit": {
        "exact": ["audit trail", "audit log", "immutable log", "tamper-evident"],
        "fuzzy": ["audit", "review", "assessment"],
        "severity": "medium"
    },
    "backup": {
        "exact": ["backup", "disaster recovery", "DR", "BCP", "business continuity"],
        "fuzzy": ["redundancy", "failover", "resilience"],
        "severity": "medium"
    },
    "scanning": {
        "exact": ["vulnerability scan", "penetration test", "pentest", "security assessment"],
        "fuzzy": ["scan", "test", "assessment"],
        "severity": "high"
    }
}

def check_keyword_compliance(clause_text: str, policy_text: str) -> dict:
    results = {}
    for category, rules in KEYWORD_TAXONOMY.items():
        exact_matches = [kw for kw in rules["exact"] if kw.lower() in clause_text.lower()]
        policy_has = [kw for kw in exact_matches if kw.lower() in policy_text.lower()]
        policy_missing = [kw for kw in exact_matches if kw not in policy_has]
        
        fuzzy_matched = False
        if not exact_matches:
            fuzzy_matched = any(fw in clause_text.lower() for fw in rules["fuzzy"])
        
        results[category] = KeywordComplianceResult(
            exact_found=exact_matches,
            policy_has=policy_has,
            policy_missing=policy_missing,
            fuzzy_matched=fuzzy_matched,
            severity=rules["severity"],
            **{"pass": len(policy_missing) == 0 and (len(exact_matches) > 0 or fuzzy_matched)}
        )
    return results

def generate_explanation(policy_sim: float, keyword_check: dict) -> str:
    parts = []
    if policy_sim > 0.85:
        parts.append(f"Strong semantic similarity ({policy_sim:.2f})")
    elif policy_sim > 0.70:
        parts.append(f"Moderate semantic match ({policy_sim:.2f}) — needs review")
    else:
        parts.append(f"Weak semantic match ({policy_sim:.2f}) — likely gap")
    
    failed_categories = [k for k, v in keyword_check.items() if not getattr(v, 'pass_status')]
    if failed_categories:
        parts.append(f"Missing keywords in: {', '.join(failed_categories)}")
    
    return " | ".join(parts)

async def vector_search_policy_matches(clause_text: str, clause_embedding: list, db, top_k: int = 5) -> list[PolicyMatch]:
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index_policies",
                "path": "embedding",
                "queryVector": clause_embedding,
                "numCandidates": 100,
                "limit": top_k,
                "filter": {
                    "status": "active"
                }
            }
        },
        {
            "$project": {
                "policy_id": 1,
                "title": 1,
                "department_owner_id": 1,
                "full_text": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    try:
        results = await db.policies.aggregate(pipeline).to_list(length=top_k)
    except Exception as e:
        print(f"Vector search error (mocking results instead): {e}")
        # Mock results if vector search fails (e.g. index not ready)
        results = []
    
    enriched = []
    for r in results:
        policy_text = r.get("full_text", "")
        if not policy_text and "content" in r:
            policy_text = r["content"]
            
        keyword_check = check_keyword_compliance(clause_text, policy_text)
        overall_pass = all(getattr(k, 'pass_status') for k in keyword_check.values() if k.exact_found)
        
        enriched.append(PolicyMatch(
            policy_id=r["policy_id"],
            title=r.get("title", "Unknown Policy"),
            similarity=round(r["score"], 4),
            department=r.get("department_owner_id", "UNKNOWN"),
            keyword_compliance=keyword_check,
            overall_pass=overall_pass,
            explanation=generate_explanation(r["score"], keyword_check)
        ))
    
    return enriched

async def analyze_clause(circular_id: str, clause: dict, db) -> GapDetectionResult:
    clause_text = clause.get("text", "")
    embedding = clause.get("embedding", [])
    
    if not embedding:
        # Fallback if no embedding
        embedding = [0.0] * 384
        
    top_matches = await vector_search_policy_matches(clause_text, embedding, db)
    
    # Historical match check (mock simplified query)
    dept = "UNKNOWN"
    if top_matches:
        dept = top_matches[0].department
        
    hist_count = await db.gap_queue.count_documents({
        "department": dept,
        "triage_status": "resolved"
    })
    
    # Evaluate gap status
    gap_status = "covered"
    best_match = top_matches[0] if top_matches else None
    
    if not best_match:
        gap_status = "confirmed"
    elif best_match.similarity < 0.70:
        gap_status = "confirmed"
    elif best_match.similarity >= 0.70 and best_match.similarity < 0.85:
        gap_status = "suspected"
    else:
        if best_match.overall_pass:
            gap_status = "covered"
        else:
            gap_status = "suspected"
            
    # Judge explanation steps
    judge_steps = []
    
    # 1. Semantic Search
    top_sim = best_match.similarity if best_match else 0.0
    top_pid = best_match.policy_id if best_match else "None"
    judge_steps.append(JudgeExplanationStep(
        stage="vector_search",
        title="1. Semantic Search",
        technicalDetail="$vectorSearch on Atlas Vector Index 'vector_index_policies' | numCandidates: 100 | limit: 5 | filter: {status: 'active'}",
        businessImpact="Finding policies that 'sound like' they cover this clause",
        result="pass" if top_sim > 0.70 else "fail",
        data={"top_match": top_pid, "similarity": top_sim}
    ))
    
    # 2. Similarity Threshold
    judge_steps.append(JudgeExplanationStep(
        stage="semantic_analysis",
        title="2. Similarity Threshold",
        technicalDetail=f"Score {top_sim:.2f} vs 0.85 threshold",
        businessImpact="This policy is semantically related — but does it have the exact requirements?",
        result="pass" if top_sim >= 0.85 else "review" if top_sim >= 0.70 else "fail",
        data={"threshold": 0.85, "actual": top_sim}
    ))
    
    # 3. Syntactic check
    syn_result = "pass"
    missing = []
    found = []
    if best_match:
        for cat, res in best_match.keyword_compliance.items():
            if res.exact_found:
                missing.extend(res.policy_missing)
                found.extend(res.policy_has)
                if not getattr(res, 'pass_status'):
                    syn_result = "fail"
    
    judge_steps.append(JudgeExplanationStep(
        stage="syntactic_check",
        title="3. Keyword Compliance",
        technicalDetail=f"Missing: {missing} | Found: {found}",
        businessImpact="Checking if specific keyword requirements are met in the policy",
        result=syn_result,
        data={"missing": missing, "found": found}
    ))
    
    # 4. Historical
    judge_steps.append(JudgeExplanationStep(
        stage="historical_match",
        title="4. Historical Pattern",
        technicalDetail=f"Query: db.gap_queue.find({{department: '{dept}', triage_status: 'resolved'}}).count() = {hist_count}",
        businessImpact="Checking if similar gaps were previously approved for this department",
        result="pass" if hist_count >= 3 else "review",
        data={"similar_count": hist_count, "auto_route_threshold": 3}
    ))
    
    return GapDetectionResult(
        clause_number=clause.get("clause_number"),
        clause_text=clause_text,
        obligation_type=clause.get("obligation_type", "unknown"),
        severity=clause.get("severity", "low"),
        gap_status=gap_status,
        top_matches=top_matches,
        historical_matches_count=hist_count,
        judge_explanation=judge_steps
    )
