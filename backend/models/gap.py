from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class KeywordComplianceResult(BaseModel):
    exact_found: List[str]
    policy_has: List[str]
    policy_missing: List[str]
    fuzzy_matched: bool
    severity: str
    pass_status: bool = Field(alias="pass")

class JudgeExplanationStep(BaseModel):
    stage: Literal["vector_search", "semantic_analysis", "syntactic_check", "historical_match"]
    title: str
    technicalDetail: str
    businessImpact: str
    result: Literal["pass", "fail", "review"]
    data: Dict[str, Any]

class PolicyMatch(BaseModel):
    policy_id: str
    title: str
    similarity: float
    department: str
    keyword_compliance: Dict[str, KeywordComplianceResult]
    overall_pass: bool
    explanation: str

class GapDetectionResult(BaseModel):
    clause_number: Optional[str]
    clause_text: str
    obligation_type: str
    severity: str
    gap_status: Literal["covered", "suspected", "confirmed", "false_positive"]
    top_matches: List[PolicyMatch]
    historical_matches_count: int
    judge_explanation: List[JudgeExplanationStep]

class GapQueueEntry(BaseModel):
    gap_id: str
    circular_id: str
    clause_number: Optional[str]
    clause_text: str
    triage_status: Literal["new", "assigned", "resolved", "escalated"] = "new"
    classification: Literal["critical", "high", "medium", "low"]
    gap_description: str
    department: Optional[str] = None
    ai_confidence_score: float
    suggested_action: str
    detection_results: GapDetectionResult
    created_at: datetime = Field(default_factory=datetime.utcnow)
