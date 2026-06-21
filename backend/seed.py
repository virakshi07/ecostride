import datetime
from database import SessionLocal, engine, Base
import models

def seed_db():
    # 1. Drop all tables and recreate them to ensure a fresh, clean seed
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 2. Seed Emission Factors
        factors = [
            # Transport (kg CO2e / km)
            models.EmissionFactor(category="transport", subtype="car_petrol", value=0.192, unit="km", region="Seattle"),
            models.EmissionFactor(category="transport", subtype="car_diesel", value=0.171, unit="km", region="Seattle"),
            models.EmissionFactor(category="transport", subtype="bus", value=0.105, unit="km", region="Seattle"),
            models.EmissionFactor(category="transport", subtype="train", value=0.041, unit="km", region="Seattle"),
            models.EmissionFactor(category="transport", subtype="flight", value=0.255, unit="km", region="Seattle"),
            
            # Energy (kg CO2e / unit)
            models.EmissionFactor(category="energy", subtype="electricity", value=0.475, unit="kWh", region="Seattle"),
            models.EmissionFactor(category="energy", subtype="lpg", value=2.3, unit="kg", region="Seattle"),
            models.EmissionFactor(category="energy", subtype="natural_gas", value=2.0, unit="m3", region="Seattle"),
            
            # Food (kg CO2e / kg)
            models.EmissionFactor(category="food", subtype="beef", value=27.0, unit="kg", region="Seattle"),
            models.EmissionFactor(category="food", subtype="lamb", value=24.0, unit="kg", region="Seattle"),
            models.EmissionFactor(category="food", subtype="chicken", value=6.9, unit="kg", region="Seattle"),
            models.EmissionFactor(category="food", subtype="dairy", value=3.2, unit="kg", region="Seattle"),
            models.EmissionFactor(category="food", subtype="vegetables", value=1.0, unit="kg", region="Seattle"),
            
            # Shopping (kg CO2e / $)
            models.EmissionFactor(category="shopping", subtype="electronics", value=0.8, unit="$", region="Seattle"),
            models.EmissionFactor(category="shopping", subtype="fashion", value=0.4, unit="$", region="Seattle"),
            models.EmissionFactor(category="shopping", subtype="fast_fashion", value=0.9, unit="$", region="Seattle"),
            models.EmissionFactor(category="shopping", subtype="furniture", value=0.3, unit="$", region="Seattle"),
            
            # Waste (kg CO2e / kg)
            models.EmissionFactor(category="waste", subtype="landfill_base", value=1.2, unit="kg", region="Seattle"),
        ]
        db.add_all(factors)
        
        # 3. Seed Badges
        badges = [
            models.Badge(badge_id="first_log", name="First Step", description="Log your first carbon activity.", criteria="Log any activity", icon_url="👣"),
            models.Badge(badge_id="car_free", name="Car-Free Week", description="Log train or bus transport without driving.", criteria="Log bus or train", icon_url="🚌"),
            models.Badge(badge_id="plant_pioneer", name="Plant-Based Pioneer", description="Log vegetable meals with zero beef or lamb.", criteria="Log veg/grain food", icon_url="🌱"),
            models.Badge(badge_id="zero_waste", name="Zero-Waste Hero", description="Log a waste activity with over 80% recycling rate.", criteria="Recycling rate > 80%", icon_url="♻️"),
            models.Badge(badge_id="saving_streak", name="1 Ton Saved Club", description="Accumulate enough carbon savings to equal 1 ton CO2e offset.", criteria="Accumulated savings", icon_url="🏆"),
            models.Badge(badge_id="eco_shopper", name="Conscious Shopper", description="Spend on sustainable categories or limit shopping emissions.", criteria="Log shopping", icon_url="🛍️"),
        ]
        db.add_all(badges)
        
        # 4. Seed Challenges
        challenges = [
            models.Challenge(challenge_id="c1", name="Meatless Week", description="Swap beef/lamb for plant-based alternatives for 7 days.", target_metric="0 kg beef/lamb logged", points=150, category="food", duration="7 days"),
            models.Challenge(challenge_id="c2", name="Bus & Train Streak", description="Commute at least 50 km using public transit instead of driving.", target_metric="50 km transit logged", points=200, category="transport", duration="5 days left"),
            models.Challenge(challenge_id="c3", name="Smart Power Saver", description="Reduce home electricity usage by at least 15 kWh.", target_metric="Log electricity < 20 kWh", points=180, category="energy", duration="12 days left"),
            models.Challenge(challenge_id="c4", name="Recycling Champion", description="Achieve an average waste recycling rate of over 75%.", target_metric="75%+ recycling rate", points=120, category="waste", duration="3 days left"),
        ]
        db.add_all(challenges)
        
        # 5. Seed Offsets
        offsets = [
            models.Offset(offset_id="r1", project_name="Plant 1 Tree Credit", type="reforestation", price_per_ton=20.0, verification_body="One Tree Planted"),
            models.Offset(offset_id="r2", project_name="100 kg Carbon Offset", type="solar", price_per_ton=15.0, verification_body="Gold Standard Carbon"),
        ]
        db.add_all(offsets)

        # 6. Seed Users
        users = [
            models.User(name="EcoWarrior99", email="warrior@eco.com", location="Seattle", household_size=2, sustainability_score=94, cohort_id=1),
            models.User(name="GreenQueen", email="queen@eco.com", location="Seattle", household_size=1, sustainability_score=89, cohort_id=1),
            models.User(name="SolarPowerSam", email="sam@eco.com", location="Seattle", household_size=4, sustainability_score=85, cohort_id=1),
            models.User(name="CycleChef", email="chef@eco.com", location="Seattle", household_size=3, sustainability_score=71, cohort_id=1),
            models.User(name="ZeroWasteZac", email="zac@eco.com", location="Seattle", household_size=2, sustainability_score=68, cohort_id=1),
            models.User(name="EcoStrider", email="user@ecostride.com", location="Seattle", household_size=2, sustainability_score=75, cohort_id=1),
        ]
        db.add_all(users)
        db.commit()

        # 7. Seed Mock Historical Activities for EcoStrider (User ID 6)
        # We add some past activities so they have an emissions history on load
        historical_activities = [
            # Transport
            models.Activity(user_id=6, category="transport", subtype="car_petrol", quantity=120.0, unit="km", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=4)),
            models.Activity(user_id=6, category="transport", subtype="bus", quantity=30.0, unit="km", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=2)),
            
            # Energy
            models.Activity(user_id=6, category="energy", subtype="electricity", quantity=80.0, unit="kWh", source="auto", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=5)),
            
            # Food
            models.Activity(user_id=6, category="food", subtype="beef", quantity=0.8, unit="kg", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=6)),
            models.Activity(user_id=6, category="food", subtype="vegetables", quantity=2.5, unit="kg", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=1)),
            
            # Shopping
            models.Activity(user_id=6, category="shopping", subtype="fashion", quantity=50.0, unit="$", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=3)),
            
            # Waste
            models.Activity(user_id=6, category="waste", subtype="landfill_base", quantity=8.0, unit="kg", source="manual", timestamp=datetime.datetime.utcnow() - datetime.timedelta(days=2))
        ]
        db.add_all(historical_activities)
        db.commit()

        # Add corresponding emissions for historical activities
        for act in historical_activities:
            factor = db.query(models.EmissionFactor).filter(
                models.EmissionFactor.category == act.category,
                models.EmissionFactor.subtype == act.subtype
            ).first()
            co2e = act.quantity * factor.value
            
            # Waste recycling discount
            if act.category == "waste":
                co2e = act.quantity * 0.5 * factor.value  # Assume 50% recycling rate baseline
                
            db_emission = models.Emission(
                activity_id=act.activity_id,
                factor_id=factor.factor_id,
                co2e_kg=round(co2e, 2),
                calculated_at=act.timestamp
            )
            db.add(db_emission)
        db.commit()

        # Recalculate score for EcoStrider (User ID 6) based on seeded activities
        from crud import calculate_sustainability_score
        ecostrider = db.query(models.User).filter(models.User.user_id == 6).first()
        if ecostrider:
            ecostrider.sustainability_score = calculate_sustainability_score(db, 6)
            db.commit()
            
        print("Database seeded successfully with factors, badges, challenges, users, and historical logs.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
