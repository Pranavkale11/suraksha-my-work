from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from typing import Optional

from database import db
from core.security import get_password_hash, verify_password, create_access_token
from models.auth import (
    UserRegister, UserLogin, TokenResponse, 
    EnrollmentResponse, VerificationRequest, VerificationResponse,
    CriticalActionRequest, CriticalActionResponse
)
from models.behavioral import BehavioralPayload
from services.behavioral_auth import calculate_risk_score, determine_access_level, train_user_models

router = APIRouter()

def get_db():
    return db.client.suraksha_maps

@router.post("/register", response_model=dict)
async def register_user(user_data: UserRegister):
    database = get_db()
    
    # Check if user exists
    existing = await database.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Generate EMP ID
    emp_id = f"EMP-{user_data.department}-{str(uuid.uuid4())[:6].upper()}"
    
    hashed_pwd = get_password_hash(user_data.password)
    
    new_user = {
        "emp_id": emp_id,
        "full_name": user_data.full_name,
        "email": user_data.email,
        "mobile": user_data.mobile,
        "department_id": user_data.department,
        "designation": user_data.designation,
        "hashed_password": hashed_pwd,
        "role": "user",
        "behavioral_baseline": {
            "status": "pending",
            "rounds_completed": 0,
            "raw_data": []
        }
    }
    
    await database.users.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": emp_id, "role": "user"})
    
    return {
        "emp_id": emp_id,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    database = get_db()
    
    user = await database.users.find_one({"emp_id": login_data.emp_id})
    if not user or not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    # Compute behavioral score
    risk_score = 50
    breakdown = {}
    
    if login_data.behavioral_data:
        risk_score, breakdown = calculate_risk_score(
            login_data.emp_id, 
            login_data.behavioral_data.keystroke, 
            login_data.behavioral_data.mouse
        )
    
    access_level = determine_access_level(risk_score)
    requires_hardware_token = access_level == "red"
    
    access_token = create_access_token(data={"sub": user["emp_id"], "role": user.get("role", "user")})
    session_id = f"sess_{uuid.uuid4().hex}"
    
    return TokenResponse(
        access_token=access_token,
        session_id=session_id,
        risk_score=risk_score,
        access_level=access_level,
        behavioral_breakdown=breakdown,
        requires_hardware_token=requires_hardware_token,
        user={
            "emp_id": user["emp_id"],
            "full_name": user["full_name"],
            "department": user["department_id"],
            "role": user.get("role", "user")
        }
    )

@router.post("/enrollment/round/{round_number}", response_model=EnrollmentResponse)
async def enrollment_round(round_number: int, data: BehavioralPayload, emp_id: str = "EMP-DEMO"):
    # In a real app, emp_id comes from JWT dependency
    database = get_db()
    
    # Store data
    await database.users.update_one(
        {"emp_id": emp_id},
        {"$push": {"behavioral_baseline.raw_data": data.model_dump()}}
    )
    
    # Fake quality score for demo
    quality = 0.85
    status_str = "pending"
    trained = False
    
    if round_number == 3:
        status_str = "active"
        trained = True
        await database.users.update_one(
            {"emp_id": emp_id},
            {"$set": {"behavioral_baseline.status": "active"}}
        )
        # Mock training models
        # train_user_models(emp_id, [data.keystroke], [data.mouse])
        
    return EnrollmentResponse(
        round=round_number,
        quality_score=quality,
        status=status_str,
        round_scores={
            "round_1": 0.82,
            "round_2": 0.79,
            "round_3": quality,
            "consistency_deviation": 0.15
        },
        models_trained=trained,
        message=f"Round {round_number} complete."
    )

@router.post("/verify-session", response_model=VerificationResponse)
async def verify_session(req: VerificationRequest, emp_id: str = "EMP-DEMO"):
    risk, _ = calculate_risk_score(emp_id, req.behavioral_data.keystroke, req.behavioral_data.mouse)
    
    anomaly = risk > 50
    return VerificationResponse(
        current_risk_score=risk,
        anomaly_detected=anomaly
    )

@router.post("/critical-action", response_model=CriticalActionResponse)
async def critical_action(req: CriticalActionRequest, emp_id: str = "EMP-DEMO"):
    risk, _ = calculate_risk_score(emp_id, req.behavioral_data.keystroke, req.behavioral_data.mouse)
    
    if risk > 60:
        return CriticalActionResponse(allowed=False, score=risk, required_action="hardware_token")
    
    return CriticalActionResponse(allowed=True, score=risk)
