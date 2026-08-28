FROM python:3.11-slim

WORKDIR /app

# Some sub-dependencies occasionally need to compile from source rather
# than use a prebuilt wheel — gcc is a small, cheap safety net against a
# confusing "no wheel available" build failure.
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Installing requirements before copying the rest of the app means this
# slow layer only re-runs when requirements.txt itself changes, not on
# every code edit.
COPY requirements.txt .

# Install the exact torch version requirements.txt pins, but from PyTorch's
# CPU-only index. Without this, pip installs the default build, which
# bundles CUDA support and is several GB — wasted weight on a CPU host.
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch==2.12.0
RUN pip install --no-cache-dir -r requirements.txt

# The sentence-transformer model isn't a pip package — it's fetched from
# Hugging Face the first time it's used. Downloading it here, at build
# time, avoids a slow, network-dependent first request in production.
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

COPY . .

# Render assigns its own PORT at runtime; 10000 is just Render's documented
# default, set here so the image also runs sensibly outside Render.
ENV PORT=10000
EXPOSE 10000

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT