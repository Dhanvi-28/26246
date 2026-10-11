from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class State(Base):
    __tablename__ = "states"
    code = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")

class District(Base):
    __tablename__ = "districts"
    code = Column(String(20), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)

    state = relationship("State", back_populates="districts")

class Sector(Base):
    __tablename__ = "sectors"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    occupations = relationship("Occupation", back_populates="sector", cascade="all, delete-orphan")

class Occupation(Base):
    __tablename__ = "occupations"
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    nco_code = Column(String(20), nullable=True, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False, index=True)
    nsqf_level = Column(Integer, nullable=True)
    skills_list = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    sector = relationship("Sector", back_populates="occupations")

class DemandObservation(Base):
    __tablename__ = "demand_observations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    period = Column(String(7), nullable=False, index=True) # YYYY-MM
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("districts.code"), nullable=False, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False, index=True)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=False, index=True)
    job_postings_count = Column(Integer, nullable=False, default=0)
    unique_employer_count = Column(Integer, nullable=False, default=0)
    estimated_vacancies = Column(Integer, nullable=False, default=0)
    source_id = Column(String(50), nullable=False, default="NCS")
    source_type = Column(String(50), nullable=False, default="Job Aggregator")
    data_status = Column(String(50), nullable=False, default="Synthetic Sample")
    collected_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_demand_lookup", "period", "state_code", "district_code", "occupation_id"),
    )

class SupplyObservation(Base):
    __tablename__ = "supply_observations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    period = Column(String(7), nullable=False, index=True) # YYYY-MM
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("districts.code"), nullable=False, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False, index=True)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=False, index=True)
    sanctioned_seats = Column(Integer, nullable=False, default=0)
    enrolments = Column(Integer, nullable=False, default=0)
    completions = Column(Integer, nullable=False, default=0)
    certified_candidates = Column(Integer, nullable=False, default=0)
    placed_candidates = Column(Integer, nullable=False, default=0)
    active_centres = Column(Integer, nullable=False, default=0)
    source_id = Column(String(50), nullable=False, default="TRAINING_ECOSYSTEM")
    data_status = Column(String(50), nullable=False, default="Synthetic Sample")
    collected_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_supply_lookup", "period", "state_code", "district_code", "occupation_id"),
    )

class ForecastRecord(Base):
    __tablename__ = "forecast_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    forecast_origin_period = Column(String(7), nullable=False, index=True)
    target_period = Column(String(7), nullable=False, index=True)
    horizon_months = Column(Integer, nullable=False) # 3, 6, 12
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("districts.code"), nullable=False, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=False, index=True)
    predicted_demand = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    model_name = Column(String(100), nullable=False, default="Ridge Lag Regression + Trend Baseline")
    model_version = Column(String(50), nullable=False, default="v1.2-chronological")
    mae = Column(Float, nullable=True)
    wape = Column(Float, nullable=True)
    confidence_score = Column(String(20), nullable=False, default="Moderate") # High, Moderate, Low, Insufficient
    data_coverage = Column(Float, nullable=False, default=0.92)
    generated_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_forecast_lookup", "horizon_months", "state_code", "district_code", "occupation_id"),
    )

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(50), nullable=False) # shortage, oversupply, rising_demand, data_quality
    severity = Column(String(20), nullable=False) # critical, high, medium, low
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("districts.code"), nullable=False, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=False, index=True)
    observed_value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="open") # open, acknowledged, resolved
    created_at = Column(DateTime, default=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(250), nullable=False)
    action_type = Column(String(50), nullable=False) # expand_seats, review_intake, update_curriculum, validate_demand, improve_placement, regional_mobility
    state_code = Column(String(10), ForeignKey("states.code"), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("districts.code"), nullable=False, index=True)
    sector_id = Column(String(50), ForeignKey("sectors.id"), nullable=False)
    occupation_id = Column(String(50), ForeignKey("occupations.id"), nullable=False, index=True)
    proposed_action = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    evidence_metrics = Column(Text, nullable=False) # JSON formatted string
    confidence = Column(String(20), nullable=False, default="Moderate")
    suggested_review_period = Column(String(50), nullable=False, default="Q1 2026")
    caveats = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="proposed") # proposed, under_review, accepted, rejected, completed
    created_at = Column(DateTime, default=datetime.utcnow)

class Scenario(Base):
    __tablename__ = "scenarios"
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    state_code = Column(String(10), nullable=False)
    district_code = Column(String(20), nullable=False)
    occupation_id = Column(String(50), nullable=False)
    horizon_months = Column(Integer, nullable=False, default=6)
    baseline_seats = Column(Integer, nullable=False)
    proposed_seats = Column(Integer, nullable=False)
    baseline_gap = Column(Float, nullable=False)
    simulated_gap = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SourceMetadata(Base):
    __tablename__ = "source_metadata"
    source_id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    publisher = Column(String(150), nullable=False)
    source_type = Column(String(50), nullable=False)
    access_method = Column(String(100), nullable=False)
    frequency = Column(String(50), nullable=False)
    last_updated_at = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False) # Connected, Uploaded, Synthetic Sample, Planned
    coverage_description = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)

class DataImportLog(Base):
    __tablename__ = "data_import_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(200), nullable=False)
    imported_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), nullable=False) # Success, Partial, Failed
    total_rows = Column(Integer, nullable=False, default=0)
    accepted_rows = Column(Integer, nullable=False, default=0)
    rejected_rows = Column(Integer, nullable=False, default=0)
    error_summary = Column(Text, nullable=True)
