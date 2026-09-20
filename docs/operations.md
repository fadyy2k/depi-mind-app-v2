> 🔐 Public documentation: operational endpoints and credentials are sanitized. Use authenticated values supplied out-of-band for a live environment.

# Operations

This page covers day-to-day operational tasks: validation commands, deployment verification, troubleshooting, and how the documentation and showcase are deployed.

---

## Application Validation Checklist

Run these checks to confirm the full stack is healthy:

### 1. API Health

```bash
curl http://k8s-lab.internal.example:30080/api/health
```

**Expected response:**
```json
{"message":"Notes API is running","status":"ok"}
```

### 2. Kubernetes Nodes

```bash
kubectl get nodes -o wide
```

**Expected:** Node status `Ready`

### 3. Application Pods

```bash
kubectl get pods -n mind -o wide
```

**Expected:**
```
NAME                         READY   STATUS    RESTARTS
mind-frontend-xxx            1/1     Running   0
mind-backend-xxx             1/1     Running   X
postgres-xxx                 1/1     Running   0
```

### 4. Services

```bash
kubectl get svc -n mind
```

**Expected:**
```
NAME                   TYPE        CLUSTER-IP    PORT(S)
mind-frontend-service  NodePort    10.x.x.x      80:30080/TCP
backend-service        ClusterIP   10.x.x.x      8080/TCP
postgres               ClusterIP   10.x.x.x      5432/TCP
```

### 5. PVC Status

```bash
kubectl get pvc -n mind
```

**Expected:** `postgres-pvc` status `Bound`

### 6. ArgoCD Status

```bash
kubectl get application mind-app -n argocd
```

**Expected:** `Synced` / `Healthy`

---

## Deployment Workflow

### How a New Deployment Works

1. Update the Kubernetes manifest in `k8s/` (e.g., bump image tag)
2. Commit and push to GitHub `main` branch
3. ArgoCD detects the change within ~3 minutes
4. ArgoCD applies the updated manifests to K3s
5. K3s pulls the new image from DockerHub
6. Rolling update completes
7. ArgoCD status returns to **Synced** and **Healthy**

No manual `kubectl apply` is needed.

### Manual Sync (if needed)

To force an immediate sync without waiting for the poll interval:

```bash
# Using ArgoCD CLI
argocd app sync mind-app

# Or trigger from the ArgoCD web UI: App → Sync button
```

---

## Jenkins Operations

### Trigger a Pipeline Run

Navigate to: [http://ci-lab.internal.example:8080](http://ci-lab.internal.example:8080)

Click the pipeline job → **Build Now**

### View Console Output

Click on the build number → **Console Output**

This shows every stage output including:
- Gitleaks scan result
- SonarQube scanner output
- Docker build output
- Trivy vulnerability report
- DockerHub push confirmation

### Jenkins Credentials

Managed at: Jenkins → Manage Jenkins → Credentials

| ID | Purpose |
|---|---|
| `dockerhub-creds` | DockerHub push |
| `github-creds` | GitHub checkout |
| `sonarqube-token` | SonarQube auth |

**Never expose credential values in documentation, code, or screenshots.**

---

## Documentation and Showcase Deployment

The MkDocs documentation and React showcase are deployed via **GitHub Actions** to **GitHub Pages**.

### Workflow File

`.github/workflows/deploy-pages-combined.yml`

### Build Steps

```yaml
1. Checkout repository
2. Setup GitHub Pages
3. Setup Python
4. Install MkDocs Material
5. Build MkDocs → site/
6. Setup Node.js
7. Install showcase npm dependencies
8. Build React/Vite showcase → showcase/dist/
9. Copy showcase/dist/ → site/showcase/
10. Upload Pages artifact
11. Deploy to GitHub Pages
```

### Key Configuration — Vite Base Path

The showcase must be built with the correct GitHub Pages base path:

```javascript
// showcase/vite.config.js
export default defineConfig({
  base: '/depi-mind-app-v2/showcase/',
  // ...
})
```

Without this, all asset paths break under GitHub Pages subdirectory routing.

### GitHub Pages Settings

In the repository: **Settings → Pages → Source**

Must be set to: **GitHub Actions** (not branch/docs or gh-pages)

### Deploy Commands

```bash
# The deployment is fully automatic on git push to main.
# To trigger manually:

git add .
git commit -m "Update documentation"
git push origin main

# Check workflow status:
# https://github.com/fadyy2k/depi-mind-app-v2/actions

# Verify deployed URLs:
# https://fadyy2k.github.io/depi-mind-app-v2/
# https://fadyy2k.github.io/depi-mind-app-v2/showcase/
```

---

## Local MkDocs Development

```bash
# Install MkDocs Material
pip install mkdocs-material

# Serve locally (hot reload)
mkdocs serve

# Build locally
mkdocs build

# Output in site/ directory
```

## Local Showcase Development

```bash
cd showcase

# Install dependencies
npm install

# Run dev server
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n mind

# Check logs
kubectl logs <pod-name> -n mind
```

### ArgoCD Out of Sync

```bash
# Force sync
argocd app sync mind-app

# Or hard reset
argocd app sync mind-app --force
```

### DockerHub Push Failing

- Verify `dockerhub-creds` in Jenkins credentials
- Ensure the credential has write access to `fadyy2k/mind-backend` and `fadyy2k/mind-frontend`

### Showcase 404 Under GitHub Pages

- Verify GitHub Pages source is set to **GitHub Actions**
- Verify Vite base path is `/depi-mind-app-v2/showcase/`
- Check the GitHub Actions workflow completed successfully

### Backend Pod Restarting

The backend pod may restart on startup if the database is not ready. This is expected during initial deployment. The pod recovers once PostgreSQL is ready to accept connections. Add a `readinessProbe` and `initContainer` for production.

---

## EC2 Instance Management

If an EC2 instance is stopped and restarted (e.g., cost management):

- The **public IP changes** unless an Elastic IP is assigned
- **DuckDNS hostname** must be updated to point to the new IP
- K3s and all pods restart automatically when EC2 starts
- Jenkins and SonarQube restart automatically (if configured as systemd services)
- ArgoCD restarts automatically in K3s
- The application resumes without manual intervention after the IP is updated in DuckDNS

---

## Useful Reference Commands

```bash
# Full namespace status
kubectl get all -n mind

# Watch pods in real-time
kubectl get pods -n mind -w

# Scale deployment manually (ArgoCD will restore)
kubectl scale deployment mind-frontend -n mind --replicas=0

# Force rollout restart
kubectl rollout restart deployment/mind-backend -n mind

# Check ArgoCD apps
kubectl get applications -n argocd

# View ArgoCD app details
argocd app get mind-app

# List images in cluster
kubectl get pods -n mind -o jsonpath="{.items[*].spec.containers[*].image}"
```
