import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, nullable=False)
    household_size = Column(Integer, nullable=False)
    signup_date = Column(DateTime, default=datetime.datetime.utcnow)
    sustainability_score = Column(Integer, default=75)
    cohort_id = Column(Integer, nullable=True)

    # Relationships
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("UserBadge", back_populates="user", cascade="all, delete-orphan")
    challenges = relationship("ChallengeParticipant", back_populates="user", cascade="all, delete-orphan")
    offset_purchases = relationship("OffsetPurchase", back_populates="user", cascade="all, delete-orphan")

class Activity(Base):
    __tablename__ = "activities"

    activity_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    category = Column(String, nullable=False)  # transport, energy, food, shopping, waste
    subtype = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    source = Column(String, default="manual")  # manual, auto, scanned

    # Relationships
    user = relationship("User", back_populates="activities")
    emission = relationship("Emission", back_populates="activity", uselist=False, cascade="all, delete-orphan")

    @property
    def co2e_kg(self) -> float:
        return self.emission.co2e_kg if self.emission else 0.0

class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    factor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, nullable=False)
    subtype = Column(String, nullable=False)
    region = Column(String, default="global")
    value = Column(Float, nullable=False)  # kg CO2e per unit
    unit = Column(String, nullable=False)
    version = Column(String, default="1.0")
    effective_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    emissions = relationship("Emission", back_populates="factor")

class Emission(Base):
    __tablename__ = "emissions"

    emission_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    activity_id = Column(Integer, ForeignKey("activities.activity_id"), nullable=False)
    factor_id = Column(Integer, ForeignKey("emission_factors.factor_id"), nullable=True)
    co2e_kg = Column(Float, nullable=False)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    activity = relationship("Activity", back_populates="emission")
    factor = relationship("EmissionFactor", back_populates="emissions")

class Recommendation(Base):
    __tablename__ = "recommendations"

    rec_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    generated_text = Column(String, nullable=False)
    category = Column(String, nullable=False)
    priority = Column(String, nullable=False)  # high, medium, low
    status = Column(String, default="pending")  # pending, accepted, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recommendations")

class Badge(Base):
    __tablename__ = "badges"

    badge_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    criteria = Column(String, nullable=False)
    icon_url = Column(String, nullable=False)  # contains emojis or image urls

    # Relationships
    earned_by_users = relationship("UserBadge", back_populates="badge", cascade="all, delete-orphan")

class UserBadge(Base):
    __tablename__ = "user_badges"

    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    badge_id = Column(String, ForeignKey("badges.badge_id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        PrimaryKeyConstraint("user_id", "badge_id"),
    )

    # Relationships
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge", back_populates="earned_by_users")

class Challenge(Base):
    __tablename__ = "challenges"

    challenge_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    target_metric = Column(String, nullable=False)
    points = Column(Integer, default=100)
    category = Column(String, default="general")  # food, transport, energy, waste, general
    duration = Column(String, default="7 days")
    start_date = Column(DateTime, default=datetime.datetime.utcnow)
    end_date = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(days=7))

    # Relationships
    participants = relationship("ChallengeParticipant", back_populates="challenge", cascade="all, delete-orphan")

class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    challenge_id = Column(String, ForeignKey("challenges.challenge_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    progress = Column(Float, default=0.0)  # 0.0 to 100.0
    rank = Column(Integer, nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint("challenge_id", "user_id"),
    )

    # Relationships
    user = relationship("User", back_populates="challenges")
    challenge = relationship("Challenge", back_populates="participants")

class Offset(Base):
    __tablename__ = "offsets"

    offset_id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # reforestation, wind, solar, etc.
    price_per_ton = Column(Float, nullable=False)
    verification_body = Column(String, nullable=False)

    # Relationships
    purchases = relationship("OffsetPurchase", back_populates="offset", cascade="all, delete-orphan")

class OffsetPurchase(Base):
    __tablename__ = "offset_purchases"

    purchase_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    offset_id = Column(String, ForeignKey("offsets.offset_id"), nullable=False)
    tons_purchased = Column(Float, nullable=False)
    amount_paid = Column(Float, nullable=False)
    purchased_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="offset_purchases")
    offset = relationship("Offset", back_populates="purchases")
