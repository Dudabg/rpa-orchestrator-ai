from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import RobotExecution

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Contagens agregadas de execuções
    total_executions = db.query(RobotExecution).count()
    total_success = (
        db.query(RobotExecution).filter(RobotExecution.status == "SUCCESS").count()
    )
    total_failed = (
        db.query(RobotExecution).filter(RobotExecution.status == "FAILED").count()
    )

    # Cálculo da taxa de sucesso com proteção contra divisão por zero
    success_rate = (
        (total_success / total_executions * 100) if total_executions > 0 else 0.0
    )

    # Soma direta no banco de dados para ganho de performance em vez de carregar todos os objetos na memória
    total_seconds_success = (
        db.query(func.sum(RobotExecution.execution_time_seconds))
        .filter(RobotExecution.status == "SUCCESS")
        .scalar()
        or 0
    )

    # Cálculo das horas economizadas (convertendo segundos para horas)
    hours_saved = total_seconds_success / 3600.0

    return {
        "total_executions": total_executions,
        "total_success": total_success,
        "total_failed": total_failed,
        "success_rate": round(success_rate, 1),
        "hours_saved": round(hours_saved, 2),
    }
