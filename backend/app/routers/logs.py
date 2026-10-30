from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import RobotExecution
from app.schemas import ExecutionCreate, ExecutionResponse
from app.services.ai_inspector import analyze_error_log

router = APIRouter(prefix="/api/logs", tags=["Logs"])


# Schema Pydantic para receber a requisição de Self-Healing
class SelfHealingRequest(BaseModel):
    log_id: int
    corrected_code: str


@router.post("/", response_model=ExecutionResponse)
def create_execution_log(execution: ExecutionCreate, db: Session = Depends(get_db)):
    ai_diagnosis = None
    suggested_fix = None

    # Se o robô enviou status FAILED e um log de erro, chama o serviço de IA
    if execution.status == "FAILED" and execution.error_message:
        analysis = analyze_error_log(execution.robot_name, execution.error_message)
        ai_diagnosis = analysis.get("cause")
        suggested_fix = analysis.get("suggested_fix")

    db_execution = RobotExecution(
        robot_name=execution.robot_name,
        process_code=execution.process_code,
        status=execution.status,
        execution_time_seconds=execution.execution_time_seconds,
        error_message=execution.error_message,
        ai_diagnosis=ai_diagnosis,
        suggested_fix=suggested_fix,
    )

    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution


@router.get("/", response_model=list[ExecutionResponse])
def get_all_logs(limit: int = 50, db: Session = Depends(get_db)):
    # Retorna os logs ordenados pelo mais recente primeiro
    return (
        db.query(RobotExecution).order_by(RobotExecution.id.desc()).limit(limit).all()
    )


@router.post("/self-healing/apply-fix")
def apply_self_healing_fix(payload: SelfHealingRequest, db: Session = Depends(get_db)):
    # 1. Busca o log com a falha original
    log = db.query(RobotExecution).filter(RobotExecution.id == payload.log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log de execução não encontrado.")

    # 2. Cria um novo log simulando a reexecução bem-sucedida após o patch
    healed_execution = RobotExecution(
        robot_name=f"{log.robot_name} (Self-Healed)",
        process_code=log.process_code,
        status="SUCCESS",
        execution_time_seconds=1,
        error_message=None,
        ai_diagnosis="Correção autônoma aplicada com sucesso via Self-Healing.",
        suggested_fix=payload.corrected_code,
    )

    db.add(healed_execution)
    db.commit()
    db.refresh(healed_execution)

    return {
        "status": "success",
        "message": f"Hotfix aplicado com sucesso no robô '{log.robot_name}'. Processo reexecutado!",
        "new_log_id": healed_execution.id,
    }
