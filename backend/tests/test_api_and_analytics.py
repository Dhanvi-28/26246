import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.services.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db, force=True)
    db.close()
    yield

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LMIS" in data["project"]

def test_filters_metadata():
    response = client.get("/api/v1/filters")
    assert response.status_code == 200
    data = response.json()
    assert len(data["states"]) >= 3
    assert len(data["sectors"]) >= 5
    assert len(data["occupations"]) >= 8

def test_overview_kpis():
    response = client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["ldi_score"] > 0
    assert len(data["top_shortages"]) > 0
    assert len(data["top_oversupplies"]) > 0

def test_demand_trends():
    response = client.get("/api/v1/demand/trends?state_code=KA")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
    assert "ldi_score" in data[0]

def test_supply_summary():
    response = client.get("/api/v1/supply/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sanctioned_seats"] > 0
    assert data["overall_completion_rate"] > 0
    assert len(data["occupation_capacities"]) > 0

def test_gap_rankings_and_sign_convention():
    response = client.get("/api/v1/gaps/rankings?horizon_months=6")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    
    # Check that shortages have positive gap, oversupply has negative gap
    has_shortage = any(item["gap"] > 0 for item in data)
    has_oversupply = any(item["gap"] < 0 for item in data)
    assert has_shortage
    assert has_oversupply

def test_forecast_evaluation():
    response = client.get("/api/v1/forecasts/evaluation")
    assert response.status_code == 200
    data = response.json()
    assert "mae_overall" in data
    assert "wape_overall" in data
    assert data["mae_overall"] >= 0

def test_alert_lifecycle():
    # 1. Fetch alerts
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # 2. Patch alert status
    patch_res = client.patch(f"/api/v1/alerts/{alert_id}", json={"status": "acknowledged"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "acknowledged"

def test_recommendation_status_lifecycle():
    response = client.get("/api/v1/recommendations")
    assert response.status_code == 200
    recs = response.json()
    assert len(recs) > 0

    first_rec = recs[0]
    rec_id = first_rec["id"]

    patch_res = client.patch(f"/api/v1/recommendations/{rec_id}", json={"status": "accepted"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "accepted"

def test_scenario_simulation():
    payload = {
        "state_code": "KA",
        "district_code": "KA_BLRU",
        "occupation_id": "OCC_EV_SERVICE",
        "horizon_months": 6,
        "target_seats": 500
    }
    response = client.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "simulated_gap" in data
    assert "baseline_gap" in data
    assert data["simulated_seats"] == 500

def test_csv_validation_and_malformed():
    # Invalid CSV
    invalid_csv = "period,occupation_id\n2025-13,OCC_TEST"
    response = client.post(
        "/api/v1/imports/validate",
        files={"file": ("test_invalid.csv", invalid_csv.encode("utf-8"), "text/csv")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert len(data["errors"]) > 0

    # Valid CSV
    valid_csv = "period,state_code,district_code,occupation_id,job_postings_count\n2025-12,KA,KA_BLRU,OCC_SOLAR_TECH,350\n"
    res_val = client.post(
        "/api/v1/imports/validate",
        files={"file": ("test_valid.csv", valid_csv.encode("utf-8"), "text/csv")}
    )
    assert res_val.status_code == 200
    assert res_val.json()["valid"] is True

def test_csv_exports():
    res_gaps = client.get("/api/v1/exports/gaps.csv?horizon_months=6")
    assert res_gaps.status_code == 200
    assert "text/csv" in res_gaps.headers["content-type"]
    assert b"Forecast Demand" in res_gaps.content

    res_fc = client.get("/api/v1/exports/forecasts.csv?horizon_months=6")
    assert res_fc.status_code == 200
    assert "text/csv" in res_fc.headers["content-type"]
    assert b"Predicted Demand" in res_fc.content
