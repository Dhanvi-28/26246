import io
import csv
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.entities import (
    DemandObservation, SupplyObservation, District, State, Occupation, Sector, DataImportLog
)

REQUIRED_DEMAND_COLUMNS = [
    "period", "state_code", "district_code", "occupation_id", "job_postings_count"
]

def validate_csv_content(csv_text: str, import_type: str = "demand") -> Dict[str, Any]:
    f = io.StringIO(csv_text)
    reader = csv.DictReader(f)
    
    headers = [h.strip() for h in (reader.fieldnames or [])]
    missing_cols = [c for c in REQUIRED_DEMAND_COLUMNS if c not in headers]
    if missing_cols:
        return {
            "valid": False,
            "total_rows": 0,
            "preview_rows": [],
            "errors": [{
                "row_number": 0,
                "column": "headers",
                "value": str(headers),
                "error_message": f"Missing mandatory columns: {', '.join(missing_cols)}"
            }],
            "unmapped_occupations": [],
            "summary_message": f"Header validation failed: Missing columns {', '.join(missing_cols)}"
        }

    errors = []
    preview = []
    unmapped_occupations = set()
    row_count = 0

    for idx, row in enumerate(reader, start=1):
        row_count += 1
        if len(preview) < 5:
            preview.append(dict(row))

        # Check period
        period = row.get("period", "").strip()
        if not period or len(period) != 7 or "-" not in period:
            errors.append({
                "row_number": idx,
                "column": "period",
                "value": period,
                "error_message": "Invalid period format. Expected YYYY-MM."
            })

        # Check job postings count
        try:
            cnt = int(row.get("job_postings_count", 0))
            if cnt < 0:
                errors.append({
                    "row_number": idx,
                    "column": "job_postings_count",
                    "value": str(cnt),
                    "error_message": "Postings count cannot be negative."
                })
        except ValueError:
            errors.append({
                "row_number": idx,
                "column": "job_postings_count",
                "value": row.get("job_postings_count"),
                "error_message": "job_postings_count must be an integer."
            })

        occ_id = row.get("occupation_id", "").strip()
        if not occ_id:
            errors.append({
                "row_number": idx,
                "column": "occupation_id",
                "value": "",
                "error_message": "Occupation ID is required."
            })

    is_valid = len(errors) == 0
    return {
        "valid": is_valid,
        "total_rows": row_count,
        "preview_rows": preview,
        "errors": errors[:50], # Limit error preview
        "unmapped_occupations": list(unmapped_occupations),
        "summary_message": f"Validated {row_count} rows. {len(errors)} error(s) found." if not is_valid else f"Ready for ingestion: {row_count} rows validated cleanly."
    }

def execute_csv_import(db: Session, filename: str, csv_text: str) -> Dict[str, Any]:
    val = validate_csv_content(csv_text)
    if not val["valid"]:
        log = DataImportLog(
            filename=filename,
            imported_at=datetime.utcnow(),
            status="Failed",
            total_rows=val["total_rows"],
            accepted_rows=0,
            rejected_rows=val["total_rows"],
            error_summary=f"Validation failed with {len(val['errors'])} errors."
        )
        db.add(log)
        db.commit()
        return {
            "import_id": log.id,
            "filename": filename,
            "status": "Failed",
            "accepted_rows": 0,
            "rejected_rows": val["total_rows"],
            "message": "Import rejected due to validation errors."
        }

    f = io.StringIO(csv_text)
    reader = csv.DictReader(f)
    accepted = 0
    
    for row in reader:
        occ_id = row.get("occupation_id", "").strip()
        sec_id = row.get("sector_id", "SEC_RENEWABLE").strip()
        obs = DemandObservation(
            period=row.get("period", "").strip(),
            state_code=row.get("state_code", "").strip(),
            district_code=row.get("district_code", "").strip(),
            sector_id=sec_id,
            occupation_id=occ_id,
            job_postings_count=int(row.get("job_postings_count", 0)),
            unique_employer_count=int(row.get("unique_employer_count", 10)),
            estimated_vacancies=int(row.get("estimated_vacancies", 15)),
            source_id="UPLOADED_CSV",
            source_type="User Ingested Data",
            data_status="Uploaded",
            collected_at=datetime.utcnow()
        )
        db.add(obs)
        accepted += 1

    log = DataImportLog(
        filename=filename,
        imported_at=datetime.utcnow(),
        status="Success",
        total_rows=accepted,
        accepted_rows=accepted,
        rejected_rows=0,
        error_summary="Imported successfully."
    )
    db.add(log)
    db.commit()

    return {
        "import_id": log.id,
        "filename": filename,
        "status": "Success",
        "accepted_rows": accepted,
        "rejected_rows": 0,
        "message": f"Successfully ingested {accepted} demand observation records."
    }
