#!/bin/bash
# Деплой Yandex Weather API на VPS
# Скопируй и выполни пошагово в терминале

set -e

echo "=== Шаг 1: Обновление системы ==="
apt update && apt upgrade -y

echo "=== Шаг 2: Установка Python и зависимостей ==="
apt install python3 python3-pip python3-venv git -y

echo "=== Шаг 3: Клонирование проекта ==="
cd /opt
git clone https://github.com/consul2022/Weather_Yandex.git
cd Weather_Yandex

echo "=== Шаг 4: Создание виртуального окружения ==="
python3 -m venv venv
source venv/bin/activate

echo "=== Шаг 5: Установка зависимостей ==="
pip install -r requirements.txt
pip install fastapi uvicorn[standard]

echo "=== Шаг 6: Создание JSON API сервера ==="
cat > /opt/Weather_Yandex/weather_api.py << 'PYEOF'
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys, os

sys.path.insert(0, os.path.dirname(__file__))

app = FastAPI(title="Yandex Weather API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "Yandex Weather API is running"}

@app.get("/weather")
def get_weather(city: str = Query(default="Moscow", description="Город")):
    try:
        from parsers.parser import YandexWeatherParser
        parser = YandexWeatherParser()
        forecast = parser.get_forecast(city)
        return {"city": city, "forecast": forecast, "status": "ok"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "error", "city": city}
        )

@app.get("/weather/{city}")
def get_weather_by_path(city: str):
    try:
        from parsers.parser import YandexWeatherParser
        parser = YandexWeatherParser()
        forecast = parser.get_forecast(city)
        return {"city": city, "forecast": forecast, "status": "ok"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "status": "error", "city": city}
        )
PYEOF

echo "=== Шаг 7: Создание systemd сервиса ==="
cat > /etc/systemd/system/weather-api.service << 'SVCEOF'
[Unit]
Description=Yandex Weather API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/Weather_Yandex
ExecStart=/opt/Weather_Yandex/venv/bin/python -m uvicorn weather_api:app --host 0.0.0.0 --port 5000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SVCEOF

echo "=== Шаг 8: Запуск сервиса ==="
systemctl daemon-reload
systemctl enable weather-api
systemctl start weather-api

echo "=== Шаг 9: Проверка ==="
sleep 3
curl -s http://localhost:5000/ | python3 -m json.tool

echo ""
echo "========================================="
echo "  API запущен на порту 5000!"
echo "  Проверь: http://31.177.109.73:5000/"
echo "  Погода: http://31.177.109.73:5000/weather?city=Moscow"
echo "========================================="
