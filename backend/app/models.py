from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base


class RobotExecution(Base):
    __tablename__ = "robot_executions"

    id = Column(Integer, primary_key=True, index=True)
    robot_name = Column(String, index=True)
    process_code = Column(String)
    status = Column(String)  # "SUCCESS" ou "FAILED"
    execution_time_seconds = Column(Integer)
    error_message = Column(Text, nullable=True)  # Log de erro enviado pelo robô
    ai_diagnosis = Column(Text, nullable=True)  # Análise do erro pela IA
    suggested_fix = Column(Text, nullable=True)  # Solução em código sugerida pela IA
    created_at = Column(DateTime, default=datetime.utcnow)
