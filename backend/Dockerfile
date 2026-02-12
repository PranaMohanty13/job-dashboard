FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt requirements.txt
COPY requirements-dev.txt requirements-dev.txt

RUN pip install --upgrade pip \
    && pip install -r requirements-dev.txt

COPY . .

CMD ["sh", "-c", "echo 'Backend image built. Use docker compose to run the server.' && tail -f /dev/null"]
