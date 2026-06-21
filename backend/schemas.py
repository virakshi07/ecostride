from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    location: str
    household_size: int

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    location: str
    household_size: int
    signup_date: datetime
    sustainability_score: int
    cohort_id: Optional[int] = None

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityCreate(BaseModel):
    user_id: int
    category: str  # transport, energy, food, shopping, waste
    subtype: str
    quantity: float
    unit: str
    source: Optional[str] = "manual"
    recycling_rate: Optional[float] = None  # Specific to waste

class ActivityResponse(BaseModel):
    activity_id: int
    user_id: int
    category: str
    subtype: str
    quantity: float
    unit: str
    timestamp: datetime
    source: str
    co2e_kg: float

    class Config:
        from_attributes = True

# Emissions Breakdown Schemas
class CategoryEmission(BaseModel):
    category: str
    value: float
    percentage: float

class EmissionsBreakdownResponse(BaseModel):
    user_id: int
    total_co2e_kg: float
    breakdown: List[CategoryEmission]

# Score response
class ScoreResponse(BaseModel):
    user_id: int
    sustainability_score: int
    weekly_emissions_co2e: float
    rating: str  # Excellent, Moderate, Action Needed

# Recommendations
class RecommendationResponse(BaseModel):
    rec_id: int
    user_id: int
    generated_text: str
    category: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Leaderboard
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    score: int
    avatar: str

# Badge status matching user
class BadgeStatusResponse(BaseModel):
    badge_id: str
    name: str
    description: str
    criteria: str
    icon_url: str
    earned: bool
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True
