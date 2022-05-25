# Local dev

```shell
sudo -E kubectl port-forward --address 0.0.0.0 service/traefik 8000:8000 8080:8080 443:4443 -n default
```

```shell
kubectl logs deployment.apps/stormpiper
```

```shell
kubectl delete secrets prod-secrets dev-secrets
kubectl create secret generic prod-secrets --from-env-file=./k8s/.env-prod
kubectl create secret generic dev-secrets --from-env-file=./k8s/.env-dev
```
