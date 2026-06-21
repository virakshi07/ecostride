import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import models
import schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        location=user.location,
        household_size=user.household_size,
        sustainability_score=75,
        cohort_id=1  # Default cohort ID for Seattle
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def calculate_sustainability_score(db: Session, user_id: int) -> int:
    # 1. Fetch activities in the last 7 days
    one_week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    emissions = db.query(models.Emission).join(models.Activity).filter(
        models.Activity.user_id == user_id,
        models.Activity.timestamp >= one_week_ago
    ).all()
    
    weekly_total = sum(e.co2e_kg for e in emissions)
    
    # 2. Score Formula:
    # perfect score (100) is achieved at 30kg or less weekly emissions.
    # score drops linearly. At 150kg weekly emissions, score reaches baseline 20.
    if weekly_total <= 30:
        base_score = 100.0
    else:
        base_score = 100.0 - ((weekly_total - 30) / 1.2)
        
    # Query streak bonus
    streak = 5 # Stub streak value
    badge_count = db.query(models.UserBadge).filter(models.UserBadge.user_id == user_id).count()
    
    final_score = round(base_score + (streak * 0.5) + (badge_count * 1.5))
    return max(10, min(100, final_score))

def check_and_award_badges(db: Session, activity: models.Activity):
    user_id = activity.user_id
    
    # helper to check and award badge
    def award_if_not_exists(badge_id: str):
        exists = db.query(models.UserBadge).filter(
            models.UserBadge.user_id == user_id,
            models.UserBadge.badge_id == badge_id
        ).first()
        if not exists:
            # Check if badge exists in DB first
            badge = db.query(models.Badge).filter(models.Badge.badge_id == badge_id).first()
            if badge:
                db_user_badge = models.UserBadge(user_id=user_id, badge_id=badge_id)
                db.add(db_user_badge)
                db.commit()

    # Badge 1: First Step
    award_if_not_exists("first_log")
    
    # Badge 2: Car-Free Week
    if activity.category == "transport" and activity.subtype in ["bus", "train"]:
        award_if_not_exists("car_free")
        
    # Badge 3: Plant-Based Pioneer
    if activity.category == "food" and activity.subtype == "vegetables":
        award_if_not_exists("plant_pioneer")
        
    # Badge 4: Zero-Waste Hero
    if activity.category == "waste":
        # Waste is logged. In LogActivity, we pass recycling_rate.
        # Check if they have logged recycling rate > 80% (this would be in the raw activity quantity/source or we check database parameters if stored).
        # We can mock this by checking if the calculated emission represents over 80% recycling savings.
        # Recycling factor base is 1.2. If co2e_kg is less than 0.24 per kg waste, it implies over 80% recycling.
        if activity.quantity > 0:
            actual_rate = (1 - (activity.emission.co2e_kg / (activity.quantity * 1.2))) * 100
            if actual_rate > 80:
                award_if_not_exists("zero_waste")

    # Badge 5: Conscious Shopper
    if activity.category == "shopping":
        award_if_not_exists("eco_shopper")

    # Badge 6: 1 Ton Saved Club
    # Sum all lifetime emissions savings compared to average Seattle average (84 kg/week).
    # For hackathon, if they have logged more than 5 activities, award it as a milestone indicator.
    activity_count = db.query(models.Activity).filter(models.Activity.user_id == user_id).count()
    if activity_count >= 5:
        award_if_not_exists("saving_streak")

def calculate_emissions(category: str, subtype: str, quantity: float, factor_value: float, recycling_rate: float = None) -> float:
    if category == "waste" and recycling_rate is not None:
        return quantity * (1 - (recycling_rate / 100.0)) * factor_value
    return quantity * factor_value

def create_activity(db: Session, activity: schemas.ActivityCreate):
    # 1. Find emission factor
    factor = db.query(models.EmissionFactor).filter(
        models.EmissionFactor.category == activity.category,
        models.EmissionFactor.subtype == activity.subtype
    ).first()
    
    if not factor:
        raise ValueError(f"Emission factor not found for category: '{activity.category}' and subtype: '{activity.subtype}'")
        
    # 2. Calculate emissions
    co2e_kg = calculate_emissions(
        activity.category,
        activity.subtype,
        activity.quantity,
        factor.value,
        activity.recycling_rate
    )

    # 3. Create Activity
    db_activity = models.Activity(
        user_id=activity.user_id,
        category=activity.category,
        subtype=activity.subtype,
        quantity=activity.quantity,
        unit=activity.unit,
        source=activity.source or "manual"
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    # 4. Create Emission
    db_emission = models.Emission(
        activity_id=db_activity.activity_id,
        factor_id=factor.factor_id,
        co2e_kg=round(co2e_kg, 2)
    )
    db.add(db_emission)
    db.commit()
    db.refresh(db_activity) # Load emission back-relation

    # 5. Award Badges
    check_and_award_badges(db, db_activity)
    
    # 6. Recalculate score
    user = get_user(db, activity.user_id)
    if user:
        user.sustainability_score = calculate_sustainability_score(db, activity.user_id)
        db.commit()

    return db_activity

def get_user_emissions_breakdown(db: Session, user_id: int):
    one_week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    
    # Group emissions by category
    results = db.query(
        models.Activity.category,
        func.sum(models.Emission.co2e_kg).label("total")
    ).join(models.Emission).filter(
        models.Activity.user_id == user_id,
        models.Activity.timestamp >= one_week_ago
    ).group_by(models.Activity.category).all()
    
    breakdown_map = {category: 0.0 for category in ["transport", "energy", "food", "shopping", "waste"]}
    total_co2e = 0.0
    
    for category, total in results:
        breakdown_map[category] = float(total or 0)
        total_co2e += float(total or 0)
        
    breakdown = []
    for cat, val in breakdown_map.items():
        percentage = (val / total_co2e * 100) if total_co2e > 0 else 0.0
        breakdown.append(schemas.CategoryEmission(
            category=cat,
            value=round(val, 1),
            percentage=round(percentage, 1)
        ))
        
    return schemas.EmissionsBreakdownResponse(
        user_id=user_id,
        total_co2e_kg=round(total_co2e, 1),
        breakdown=breakdown
    )

def get_user_score_details(db: Session, user_id: int) -> schemas.ScoreResponse:
    user = get_user(db, user_id)
    if not user:
        raise ValueError("User not found")
        
    one_week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    weekly_emissions = db.query(func.sum(models.Emission.co2e_kg)).join(models.Activity).filter(
        models.Activity.user_id == user_id,
        models.Activity.timestamp >= one_week_ago
    ).scalar() or 0.0
    
    score = user.sustainability_score
    rating = "Excellent" if score >= 75 else "Moderate" if score >= 50 else "Action Needed"
    
    return schemas.ScoreResponse(
        user_id=user_id,
        sustainability_score=score,
        weekly_emissions_co2e=round(weekly_emissions, 1),
        rating=rating
    )

def get_rule_based_recommendations(db: Session, user_id: int):
    # Fetch breakdown
    breakdown_res = get_user_emissions_breakdown(db, user_id)
    
    # Default category is transport if no activities
    highest_category = "transport"
    max_val = -1.0
    
    for item in breakdown_res.breakdown:
        if item.value > max_val:
            max_val = item.value
            highest_category = item.category
            
    # Hardcoded recommendation templates
    recommendations_db = {
        "transport": [
            ("Commute by bus or train to cut your daily travel emissions.", "transport", "high"),
            ("Carpool with colleagues or walk for short trips under 2 km.", "transport", "medium"),
            ("Avoid domestic flights if train options exist, or buy offset credits.", "transport", "low")
        ],
        "energy": [
            ("Lower your thermostat by 2°C in winter to save heating energy.", "energy", "high"),
            ("Unplug electronics when fully charged to eliminate phantom load.", "energy", "medium"),
            ("Wash your clothes in cold water (eco mode) and air dry.", "energy", "low")
        ],
        "food": [
            ("Choose vegetables, grains, or poultry over high-methane beef/lamb.", "food", "high"),
            ("Buy local, seasonal produce to cut food miles emissions.", "food", "medium"),
            ("Plan meals ahead to avoid organic waste that produces landfill gas.", "food", "low")
        ],
        "shopping": [
            ("Buy second-hand or borrow instead of purchasing new electronics.", "shopping", "high"),
            ("Avoid fast-fashion; invest in durable, carbon-neutral clothing.", "shopping", "medium"),
            ("Repurpose or purchase recycled plastic furniture items.", "shopping", "low")
        ],
        "waste": [
            ("Separate plastic, metal, and compostables to hit a 75%+ recycling rate.", "waste", "high"),
            ("Compost organic food leftovers to avoid anaerobic landfill decay.", "waste", "medium"),
            ("Choose items with minimal packaging or buy in bulk.", "waste", "low")
        ]
    }
    
    suggestions = recommendations_db.get(highest_category, recommendations_db["transport"])
    
    # Map to schema response
    return [
        schemas.RecommendationResponse(
            rec_id=idx + 1,
            user_id=user_id,
            generated_text=text,
            category=cat,
            priority=pri,
            status="pending",
            created_at=datetime.datetime.utcnow()
        )
        for idx, (text, cat, pri) in enumerate(suggestions)
    ]

def get_leaderboard_list(db: Session):
    users = db.query(models.User).order_by(models.User.sustainability_score.desc()).limit(10).all()
    
    avatars = ["🦊", "🐱", "🦁", "🐼", "🐰", "🐻", "🐸", "🐷", "🐨", "🐯"]
    
    leaderboard = []
    for idx, user in enumerate(users):
        avatar = avatars[idx % len(avatars)]
        if user.name == "EcoStrider":
            avatar = "🚶"
        leaderboard.append(schemas.LeaderboardEntry(
            rank=idx + 1,
            username=user.name,
            score=user.sustainability_score,
            avatar=avatar
        ))
        
    return leaderboard

def get_user_badges_status(db: Session, user_id: Optional[int] = None):
    # Fetch all badges
    badges = db.query(models.Badge).all()
    
    # Fetch earned user badges
    if user_id is not None:
        earned_badges = db.query(models.UserBadge).filter(models.UserBadge.user_id == user_id).all()
        earned_map = {ub.badge_id: ub.earned_at for ub in earned_badges}
    else:
        earned_map = {}
    
    status_list = []
    for badge in badges:
        earned = badge.badge_id in earned_map
        earned_at = earned_map.get(badge.badge_id)
        
        status_list.append(schemas.BadgeStatusResponse(
            badge_id=badge.badge_id,
            name=badge.name,
            description=badge.description,
            criteria=badge.criteria,
            icon_url=badge.icon_url,
            earned=earned,
            earned_at=earned_at
        ))
        
    return status_list
