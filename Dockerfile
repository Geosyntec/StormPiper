FROM node:16-buster as build-frontend
WORKDIR /app
COPY ./stormpiper/stormpiper/spa/package*.json /app/
RUN npm install
COPY ./stormpiper/stormpiper/spa /app/
RUN npm run build


FROM python:3.9-slim-buster as core-runtime
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends graphviz libspatialindex-dev unixodbc \ 
    && rm -rf /var/lib/apt/lists/*
WORKDIR /stormpiper
ENV PYTHONPATH=/stormpiper
ENV PATH=/opt/venv/bin:$PATH


FROM python:3.9-buster as builder
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends gcc g++ unixodbc-dev libspatialindex-dev \ 
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
COPY ./stormpiper/requirements.txt /requirements.txt
RUN mkdir /core \
    && pip wheel \
    --wheel-dir=/core \
    -r /requirements.txt gunicorn==20.1.0


FROM python:3.9-slim-buster as core-env
COPY --from=builder /core /core
COPY ./stormpiper/requirements.txt /requirements.txt
RUN python -m venv /opt/venv
# Make sure we use the virtualenv:
ENV PATH=/opt/venv/bin:$PATH
RUN pip install \
    --no-index \
    --no-cache-dir \
    --find-links=/core \
    -r /requirements.txt \
    gunicorn==20.1.0 \
    && rm -rf /core/*


FROM core-runtime as stormpiper
COPY --from=core-env /opt/venv /opt/venv
COPY ./stormpiper/gunicorn_conf.py /gunicorn_conf.py
COPY ./stormpiper/scripts/start.sh /start.sh
RUN chmod +x /start.sh
COPY ./stormpiper/scripts/start-reload.sh /start-reload.sh
RUN chmod +x /start-reload.sh
EXPOSE 80
COPY ./stormpiper/stormpiper /stormpiper/stormpiper
COPY --from=build-frontend /app/build/ /stormpiper/stormpiper/spa/build