import requests
import random
import time

API_URL = "http://127.0.0.1:8000/api/logs/"

ROBOTS = [
    {"name": "RPA_Emissao_Nota_Fiscal", "code": "PROC_FIN_001"},
    {"name": "RPA_Conciliacao_Bancaria", "code": "PROC_FIN_002"},
    {"name": "RPA_Cadastrar_Cliente_SAP", "code": "PROC_LOG_003"},
    {"name": "RPA_Extracao_Portal_Porto", "code": "PROC_OPS_004"},
]

ERRORS = [
    "selenium.common.exceptions.NoSuchElementException: Message: Unable to locate element with xpath: //button[@id='btn-salvar-nf']",
    "requests.exceptions.HTTPError: 502 Server Error: Bad Gateway for url: https://api.sistema-legado.internal/v1/auth",
    "TimeoutException: Timed out waiting for 15 seconds for element to be clickable: //input[@name='cpf_cnpj']",
]


def send_robot_event():
    robot = random.choice(ROBOTS)
    status = random.choices(["SUCCESS", "FAILED"], weights=[0.7, 0.3])[0]

    payload = {
        "robot_name": robot["name"],
        "process_code": robot["code"],
        "status": status,
        "execution_time_seconds": random.randint(10, 180),
        "error_message": random.choice(ERRORS) if status == "FAILED" else None,
    }

    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"[{status}] Evento enviado -> {robot['name']}")
            if status == "FAILED":
                print("   └── 🤖 IA acionada para analisar esta falha!")
        else:
            print(f"Erro na API: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Erro de conexão com o Backend: {e}")


if __name__ == "__main__":
    print("🚀 Iniciando Simulador de Execuções RPA (Ctrl+C para parar)...")
    print("---------------------------------------------------------------")

    # Envia 1 evento imediatamente e depois entra em loop
    send_robot_event()
