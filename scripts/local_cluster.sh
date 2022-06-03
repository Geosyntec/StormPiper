#! /usr/bin/env sh

kubectl delete secrets prod-secrets dev-secrets

set -e
kubectl create secret generic prod-secrets --from-env-file=./k8s/.env-prod
kubectl create secret generic dev-secrets --from-env-file=./k8s/.env-dev
# kubectl apply -f k8s/traefik-CRD.yml
# kubectl apply -f k8s/
kubectl apply -k k8s/release
