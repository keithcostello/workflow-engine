# Docker Hello - Orchestration Training Example
# Single-stage build with Python runtime

FROM python:3.12-alpine
WORKDIR /app
COPY requirements.txt hello.py .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python3", "hello.py"]
