import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from crud import calculate_emissions
import models

from sqlalchemy.pool import StaticPool

# Setup an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency to point to our in-memory test database
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    # Seed essential database tables for tests to run
    db = TestingSessionLocal()
    
    # 1. Seed emission factors
    factors = [
        models.EmissionFactor(category="transport", subtype="car_petrol", value=0.192, unit="km", region="Seattle"),
        models.EmissionFactor(category="transport", subtype="bus", value=0.105, unit="km", region="Seattle"),
        models.EmissionFactor(category="energy", subtype="electricity", value=0.475, unit="kWh", region="Seattle"),
        models.EmissionFactor(category="food", subtype="beef", value=27.0, unit="kg", region="Seattle"),
        models.EmissionFactor(category="food", subtype="vegetables", value=1.0, unit="kg", region="Seattle"),
        models.EmissionFactor(category="shopping", subtype="electronics", value=0.8, unit="$", region="Seattle"),
        models.EmissionFactor(category="waste", subtype="landfill_base", value=1.2, unit="kg", region="Seattle"),
    ]
    db.add_all(factors)
    
    # 2. Seed default badges
    badges = [
        models.Badge(badge_id="first_log", name="First Step", description="Log first activity", criteria="Log any", icon_url="👣"),
        models.Badge(badge_id="car_free", name="Car-Free Week", description="Log bus or train", criteria="Log bus/train", icon_url="🚌"),
    ]
    db.add_all(badges)
    db.commit()
    db.close()
    
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

# 1. Unit Tests for Carbon Calculation Formulas
def test_calculate_emissions_transport():
    # Car Petrol: 100km * 0.192 = 19.2 kg
    co2 = calculate_emissions("transport", "car_petrol", 100.0, 0.192)
    assert co2 == pytest.approx(19.2)

def test_calculate_emissions_energy():
    # Electricity: 200 kWh * 0.475 = 95 kg
    co2 = calculate_emissions("energy", "electricity", 200.0, 0.475)
    assert co2 == pytest.approx(95.0)

def test_calculate_emissions_food():
    # Beef: 2 kg * 27.0 = 54 kg
    co2 = calculate_emissions("food", "beef", 2.0, 27.0)
    assert co2 == pytest.approx(54.0)

def test_calculate_emissions_shopping():
    # Electronics: $150 spent * 0.8 = 120 kg
    co2 = calculate_emissions("shopping", "electronics", 150.0, 0.8)
    assert co2 == pytest.approx(120.0)

def test_calculate_emissions_waste_with_recycling():
    # Waste: 10 kg * (1 - 50% recycling) * 1.2 base = 6.0 kg
    co2 = calculate_emissions("waste", "landfill_base", 10.0, 1.2, recycling_rate=50)
    assert co2 == pytest.approx(6.0)

    # Waste: 10 kg * (1 - 100% recycling) * 1.2 base = 0 kg
    co2_zero = calculate_emissions("waste", "landfill_base", 10.0, 1.2, recycling_rate=100)
    assert co2_zero == pytest.approx(0.0)

# 2. Integration Tests for API Endpoints
def test_create_user_api():
    response = client.post(
        "/api/users",
        json={
            "name": "Test User",
            "email": "test@ecostride.com",
            "location": "Seattle",
            "household_size": 3
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@ecostride.com"
    assert data["sustainability_score"] == 75
    assert "user_id" in data

def test_create_activity_and_badge_triggers_api():
    # First, create a user
    user_response = client.post(
        "/api/users",
        json={
            "name": "Eco Rider",
            "email": "rider@ecostride.com",
            "location": "Seattle",
            "household_size": 2
        }
    )
    user_id = user_response.json()["user_id"]

    # Log a transport activity (using bus to trigger first_log and car_free badges)
    activity_response = client.post(
        "/api/activities",
        json={
            "user_id": user_id,
            "category": "transport",
            "subtype": "bus",
            "quantity": 20.0,
            "unit": "km"
        }
    )
    assert activity_response.status_code == 200
    act_data = activity_response.json()
    assert act_data["co2e_kg"] == pytest.approx(2.1) # 20km * 0.105 = 2.1kg
    assert act_data["subtype"] == "bus"

    # Query the user's score endpoint
    score_response = client.get(f"/api/users/{user_id}/score")
    assert score_response.status_code == 200
    score_data = score_response.json()
    # Weekly emissions is 2.1kg (less than 30kg target), so base score is 100
    # Plus streak (5 * 0.5 = 2.5) + badges earned (first_log, car_free = 2 * 1.5 = 3)
    # Total = 100 + 2.5 + 3 = 106 -> clamped to 100
    assert score_data["sustainability_score"] == 100
    assert score_data["rating"] == "Excellent"

    # Query user badges endpoint to verify first_log and car_free are earned
    badges_response = client.get(f"/api/badges?user_id={user_id}")
    assert badges_response.status_code == 200
    badges_data = badges_response.json()
    
    first_log_badge = next(b for b in badges_data if b["badge_id"] == "first_log")
    car_free_badge = next(b for b in badges_data if b["badge_id"] == "car_free")
    
    assert first_log_badge["earned"] is True
    assert car_free_badge["earned"] is True

    # Query badges endpoint without user_id to verify we get all badges in locked/unearned status
    no_user_response = client.get("/api/badges")
    assert no_user_response.status_code == 200
    no_user_data = no_user_response.json()
    for badge in no_user_data:
        assert badge["earned"] is False
        assert badge["earned_at"] is None

def test_leaderboard_api():
    # Insert multiple users
    client.post("/api/users", json={"name": "User A", "email": "a@eco.com", "location": "Seattle", "household_size": 2})
    client.post("/api/users", json={"name": "User B", "email": "b@eco.com", "location": "Seattle", "household_size": 1})
    
    response = client.get("/api/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert data[0]["rank"] == 1
