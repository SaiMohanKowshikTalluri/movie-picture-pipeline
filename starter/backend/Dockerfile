FROM python:3.10-slim

# Install system dependencies required for building uwsgi
RUN apt-get update && apt-get install -y build-core build-essential gcc

WORKDIR /app

# Copy dependency files
COPY Pipfile Pipfile.lock /app/

# Install pipenv
RUN pip install pipenv

# Install dependencies with CFLAGS to bypass strict GCC 15 pointer/standard errors
RUN CFLAGS="-std=gnu17 -O2" pipenv install --system --deploy

# Copy application files
COPY . /app

EXPOSE 5000

CMD ["uwsgi", "--ini", "uwsgi.ini"]