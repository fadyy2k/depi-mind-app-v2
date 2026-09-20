# Deployment Commands Reference

> 🔐 **Public / sanitized reference.** Operational hostnames, IP addresses, credentials, and tokens are intentionally omitted. Use environment variables or your secret manager for real values.

## Local Development

```bash
git clone https://github.com/fadyy2k/depi-mind-app-v2.git
cd depi-mind-app-v2
```

### MkDocs

```bash
pip install mkdocs-material
mkdocs serve
mkdocs build
```

### Showcase

```bash
cd showcase
npm install
npm run dev
npm run build
npm run preview
```

### Docker

Create a local `.env` from `.env.example`, set a strong local-only database password, then:

```bash
docker compose -f MIND/docker-compose.yml up --build
```

## Kubernetes Operations

These commands assume authenticated access to the cluster. No public control-plane endpoint is documented here.

```bash
kubectl get all -n mind
kubectl get pods -n mind -o wide
kubectl get svc -n mind
kubectl get pvc -n mind
kubectl get application mind-app -n argocd
argocd app get mind-app
```

### Secret Provisioning

The PostgreSQL secret is deliberately not committed to Git.

```bash
kubectl -n mind create secret generic postgres-secret \
  --from-literal=POSTGRES_DB="${POSTGRES_DB}" \
  --from-literal=POSTGRES_USER="${POSTGRES_USER}" \
  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  --dry-run=client -o yaml | kubectl apply -f -
```

For a persistent production workflow, prefer External Secrets, Sealed Secrets, Vault, or a cloud secrets manager instead of imperative secret creation.

## CI/CD Operations

Jenkins, SonarQube, ArgoCD, Grafana, and log-viewer endpoints are intentionally not published.

Use authenticated variables in your own environment:

```bash
export JENKINS_URL="https://<authenticated-ci-endpoint>"
export APP_URL="https://<authenticated-or-public-app-endpoint>"

curl -fsS "${APP_URL}/api/health"
```

Never place access tokens in shell history or documentation.

## GitHub Pages

Public documentation:
- https://fadyy2k.github.io/depi-mind-app-v2/
- https://fadyy2k.github.io/depi-mind-app-v2/showcase/

Repository settings should use **GitHub Actions** as the Pages source.

## DNS / Host Updates

Do not publish DNS update tokens or operational hostnames. Store the DNS token in a secrets manager and inject it at runtime.

Example pattern:

```bash
curl "https://www.duckdns.org/update?domains=${LAB_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=${NEW_PUBLIC_IP}"
```

The values above must come from protected environment variables or a secret store.
