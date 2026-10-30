from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# O que o robô enviará ao disparar um log para a API
class ExecutionCreate(BaseModel):
    robot_name: str
    process_code: str
    status: str
    execution_time_seconds: float  # Permite valores inteiros e decimais
    error_message: Optional[str] = None


# O que a API retornará para o Frontend no Dashboard
class ExecutionResponse(BaseModel):
    id: int
    robot_name: str
    process_code: str
    status: str
    execution_time_seconds: (
        float  # Aceita floats (ex: 1.2) e evita ResponseValidationError
    )
    error_message: Optional[str] = None
    ai_diagnosis: Optional[str] = None
    suggested_fix: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True
