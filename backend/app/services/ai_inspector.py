import json
import requests
import urllib3
from app.config import settings

# Desativa alertas de certificado SSL no terminal
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def analyze_error_log(robot_name: str, error_traceback: str) -> dict:
    if not settings.GEMINI_API_KEY:
        return {
            "cause": "API Key do Gemini não configurada.",
            "suggested_fix": "Configure a variável GEMINI_API_KEY no arquivo .env.",
        }

    # Endpoint oficial atualizado para o modelo gemini-3.8-flash
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={settings.GEMINI_API_KEY}"

    prompt = f"""
    Você é um Engenheiro Sênior de RPA especializado em Python e automação.
    O robô '{robot_name}' falhou com o seguinte log de erro:

    --- LOG DE ERRO ---
    {error_traceback}
    -------------------

    Analise a causa do erro e responda estritamente em formato JSON válido com as chaves:
    1. "cause": Explicação clara e objetiva da causa raiz em português.
    2. "suggested_fix": Trecho de código ou ação técnica exata em português para correção.
    """

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            verify=False,
            timeout=20,
        )

        if response.status_code == 200:
            res_data = response.json()
            text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]

            try:
                data = json.loads(text_content)
                return {
                    "cause": data.get("cause", "Causa não identificada."),
                    "suggested_fix": data.get(
                        "suggested_fix", "Nenhuma sugestão disponível."
                    ),
                }
            except json.JSONDecodeError:
                return {
                    "cause": "Erro ao interpretar a resposta da IA.",
                    "suggested_fix": text_content,
                }
        else:
            return {
                "cause": f"Erro na API do Gemini (HTTP {response.status_code})",
                "suggested_fix": response.text,
            }

    except Exception as e:
        print(f"Erro ao chamar a IA via REST: {e}")
        return {
            "cause": f"Falha no processamento do log via IA: {str(e)}",
            "suggested_fix": "Verifique a conexão de rede ou a chave de API no backend.",
        }
