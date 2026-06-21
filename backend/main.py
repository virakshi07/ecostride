from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db, engine, Base
import models
import schemas
import crud

# Initialize database tables on app startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoStride API", 
    description="Backend API for the EcoStride Carbon Footprint Tracking Platform"
)

# Configure CORS
origins = [
    "http://localhost:5173",    # React Vite standard port
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # React legacy dev port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "EcoStride API"}

@app.post("/api/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/activities", response_model=schemas.ActivityResponse)
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=activity.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        return crud.create_activity(db=db, activity=activity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/users/{user_id}/emissions", response_model=schemas.EmissionsBreakdownResponse)
def read_user_emissions(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_emissions_breakdown(db, user_id=user_id)

@app.get("/api/users/{user_id}/score", response_model=schemas.ScoreResponse)
def read_user_score(user_id: int, db: Session = Depends(get_db)):
    try:
        return crud.get_user_score_details(db, user_id=user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/users/{user_id}/recommendations", response_model=List[schemas.RecommendationResponse])
def read_user_recommendations(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_rule_based_recommendations(db, user_id=user_id)

@app.get("/api/leaderboard", response_model=List[schemas.LeaderboardEntry])
def read_leaderboard(db: Session = Depends(get_db)):
    return crud.get_leaderboard_list(db)

@app.get("/api/badges", response_model=List[schemas.BadgeStatusResponse])
def read_badges(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    if user_id is not None:
        db_user = crud.get_user(db, user_id=user_id)
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
    return crud.get_user_badges_status(db, user_id=user_id)
