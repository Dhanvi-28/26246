import sys
import unittest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import SessionLocal, Base, engine
from backend.app.services.seed_data import seed_database

class LMISBackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        seed_database(db, force=True)
        db.close()
        cls.client = TestClient(app)

    def test_01_health(self):
        res = self.client.get("/api/v1/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("LMIS", data["project"])
        print("[PASS] test_01_health passed")

    def test_02_filters_metadata(self):
        res = self.client.get("/api/v1/filters")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data["states"]), 3)
        self.assertGreaterEqual(len(data["sectors"]), 5)
        self.assertGreaterEqual(len(data["occupations"]), 8)
        print("[PASS] test_02_filters_metadata passed")

    def test_03_overview_kpis(self):
        res = self.client.get("/api/v1/overview")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("kpis", data)
        self.assertGreater(data["kpis"]["ldi_score"], 0)
        self.assertGreater(len(data["top_shortages"]), 0)
        self.assertGreater(len(data["top_oversupplies"]), 0)
        print("[PASS] test_03_overview_kpis passed")

    def test_04_demand_trends(self):
        res = self.client.get("/api/v1/demand/trends?state_code=KA")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(len(data), 12)
        self.assertIn("ldi_score", data[0])
        print("[PASS] test_04_demand_trends passed")

    def test_05_supply_summary(self):
        res = self.client.get("/api/v1/supply/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_sanctioned_seats"], 0)
        self.assertGreater(data["overall_completion_rate"], 0)
        self.assertGreater(len(data["occupation_capacities"]), 0)
        print("[PASS] test_05_supply_summary passed")

    def test_06_gap_rankings_and_sign(self):
        res = self.client.get("/api/v1/gaps/rankings?horizon_months=6")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data), 0)
        has_shortage = any(item["gap"] > 0 for item in data)
        has_oversupply = any(item["gap"] < 0 for item in data)
        self.assertTrue(has_shortage)
        self.assertTrue(has_oversupply)
        print("[PASS] test_06_gap_rankings_and_sign passed")

    def test_07_forecast_evaluation(self):
        res = self.client.get("/api/v1/forecasts/evaluation")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("mae_overall", data)
        self.assertIn("wape_overall", data)
        self.assertGreaterEqual(data["mae_overall"], 0)
        print("[PASS] test_07_forecast_evaluation passed")

    def test_08_alert_lifecycle(self):
        res = self.client.get("/api/v1/alerts")
        self.assertEqual(res.status_code, 200)
        alerts = res.json()
        self.assertGreater(len(alerts), 0)
        alert_id = alerts[0]["id"]
        patch_res = self.client.patch(f"/api/v1/alerts/{alert_id}", json={"status": "acknowledged"})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "acknowledged")
        print("[PASS] test_08_alert_lifecycle passed")

    def test_09_recommendation_status_lifecycle(self):
        res = self.client.get("/api/v1/recommendations")
        self.assertEqual(res.status_code, 200)
        recs = res.json()
        self.assertGreater(len(recs), 0)
        rec_id = recs[0]["id"]
        patch_res = self.client.patch(f"/api/v1/recommendations/{rec_id}", json={"status": "accepted"})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "accepted")
        print("[PASS] test_09_recommendation_status_lifecycle passed")

    def test_10_scenario_simulation(self):
        payload = {
            "state_code": "KA",
            "district_code": "KA_BLRU",
            "occupation_id": "OCC_EV_SERVICE",
            "horizon_months": 6,
            "target_seats": 500
        }
        res = self.client.post("/api/v1/scenarios/simulate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("simulated_gap", data)
        self.assertIn("baseline_gap", data)
        self.assertEqual(data["simulated_seats"], 500)
        print("[PASS] test_10_scenario_simulation passed")

    def test_11_csv_validation(self):
        invalid_csv = "period,occupation_id\n2025-13,OCC_TEST"
        res_inv = self.client.post(
            "/api/v1/imports/validate",
            files={"file": ("test_invalid.csv", invalid_csv.encode("utf-8"), "text/csv")}
        )
        self.assertEqual(res_inv.status_code, 200)
        self.assertFalse(res_inv.json()["valid"])

        valid_csv = "period,state_code,district_code,occupation_id,job_postings_count\n2025-12,KA,KA_BLRU,OCC_SOLAR_TECH,350\n"
        res_val = self.client.post(
            "/api/v1/imports/validate",
            files={"file": ("test_valid.csv", valid_csv.encode("utf-8"), "text/csv")}
        )
        self.assertEqual(res_val.status_code, 200)
        self.assertTrue(res_val.json()["valid"])
        print("[PASS] test_11_csv_validation passed")

    def test_12_csv_exports(self):
        res_gaps = self.client.get("/api/v1/exports/gaps.csv?horizon_months=6")
        self.assertEqual(res_gaps.status_code, 200)
        self.assertIn("text/csv", res_gaps.headers["content-type"])
        self.assertIn(b"Forecast Demand", res_gaps.content)

        res_fc = self.client.get("/api/v1/exports/forecasts.csv?horizon_months=6")
        self.assertEqual(res_fc.status_code, 200)
        self.assertIn("text/csv", res_fc.headers["content-type"])
        self.assertIn(b"Predicted Demand", res_fc.content)
        print("[PASS] test_12_csv_exports passed")

if __name__ == "__main__":
    unittest.main()
