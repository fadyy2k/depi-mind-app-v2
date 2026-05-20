# DEPI DevSecOps Project — MIND Notes App

<div align="center">

[![Pipeline](https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?style=for-the-badge&logo=jenkins)](http://depi-jenkins-depi.duckdns.org:8080)
[![K8s](https://img.shields.io/badge/Runtime-K3s%20Kubernetes-326CE5?style=for-the-badge&logo=kubernetes)](http://depi-k3s-depi.duckdns.org:30080)
[![GitOps](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?style=for-the-badge&logo=argo)](http://depi-k3s-depi.duckdns.org:32000)
[![Docs](https://img.shields.io/badge/Docs-MkDocs-526CFE?style=for-the-badge&logo=material-for-mkdocs)](https://fadyy2k.github.io/depi-mind-app-v2/)
[![Showcase](https://img.shields.io/badge/Showcase-Live-00C9A7?style=for-the-badge)](https://fadyy2k.github.io/depi-mind-app-v2/showcase/)

**A production-grade DevSecOps pipeline: from source code commit to live Kubernetes deployment — with security scanning, GitOps, and self-healing automation at every step.**

</div>

---

## Live Links

| Resource | URL | Access |
|---|---|---|
| MIND Notes App | http://depi-k3s-depi.duckdns.org:30080 | `demo@example.com` / `demo123456` |
| API Health | http://depi-k3s-depi.duckdns.org:30080/api/health | Public |
| Jenkins CI/CD | http://depi-jenkins-depi.duckdns.org:8080 | No login required |
| ArgoCD GitOps | http://depi-k3s-depi.duckdns.org:32000 | Demo credentials — live demo only |
| SonarQube | http://depi-jenkins-depi.duckdns.org:9000 | Demo credentials — live demo only |
| Grafana Monitoring | http://depi-k3s-depi.duckdns.org:30300 | Demo credentials — live demo only |
| Dozzle Live Logs | http://depi-k3s-depi.duckdns.org:30301 | Demo access — live Kubernetes logs |
| DockerHub Backend | https://hub.docker.com/r/fadyy2k/mind-backend | Public |
| DockerHub Frontend | https://hub.docker.com/r/fadyy2k/mind-frontend | Public |
| MkDocs Documentation | https://fadyy2k.github.io/depi-mind-app-v2/ | Public |
| Visual Showcase | https://fadyy2k.github.io/depi-mind-app-v2/showcase/ | Public |

---

## Project Summary

This project implements a complete **DevSecOps workflow** for the MIND Notes App — a full-stack note-taking application (React frontend, Go backend, PostgreSQL database).

The pipeline automates:
- **Secret scanning** with Gitleaks — no credentials leak into the repository
- **Code quality analysis** with SonarQube — static analysis, quality gates
- **Container vulnerability scanning** with Trivy — Docker image security
- **Image publishing** to DockerHub — versioned, tagged artifacts
- **GitOps deployment** with ArgoCD — declarative, self-healing Kubernetes

Every stage is triggered automatically from a **GitHub push** through **Jenkins** and deployed to a **K3s Kubernetes cluster** via **ArgoCD**.

---

## Full Pipeline Flow

```
Developer (git push)
        │
        ▼
    GitHub Repository
        │
        ▼
    Jenkins (EC2 #1 — depi-jenkins-depi.duckdns.org)
        │
        ├── Gitleaks Secret Scan     → No leaks found ✓
        ├── SonarQube Code Analysis  → Quality gate passed ✓
        ├── Docker Build Backend     → fadyy2k/mind-backend ✓
        ├── Docker Build Frontend    → fadyy2k/mind-frontend ✓
        ├── Trivy Image Scan         → Vulnerabilities reported ✓
        └── Push to DockerHub        → Images published ✓
                                         │
                    ┌────────────────────┘
                    ▼
              DockerHub Registry
                    │
                    ▼
              ArgoCD (EC2 #2 — depi-k3s-depi.duckdns.org)
                    │
                    ▼
              K3s Kubernetes Cluster
                    │
                    ├── mind-frontend  (React/Nginx)  → NodePort 30080
                    ├── mind-backend   (Go API)
                    └── postgres       (PostgreSQL 15 + PVC)
```

---

## Infrastructure

Two AWS EC2 servers power this project:

### EC2 #1 — CI/CD Server (`depi-jenkins-server`)
**Hostname:** `depi-jenkins-depi.duckdns.org`

| Service | Port | Purpose |
|---|---|---|
| Jenkins | 8080 | CI/CD orchestration |
| SonarQube | 9000 | Code quality scanning |
| Docker Engine | — | Image builds |
| Gitleaks | — | Secret scanning (Docker) |
| Trivy | — | Vulnerability scanning |

### EC2 #2 — Kubernetes / GitOps Server (`depi-k3s-server`)
**Hostname:** `depi-k3s-depi.duckdns.org`

| Service | Port | Purpose |
|---|---|---|
| K3s Kubernetes | 6443 (internal) | Container orchestration |
| ArgoCD | 32000 | GitOps deployment |
| MIND App (frontend) | 30080 | Public access |

---

## DevSecOps Toolchain

| Tool | Category | Role |
|---|---|---|
| Jenkins | CI/CD | Pipeline automation |
| Gitleaks | Security | Secret/credential scanning |
| SonarQube | Security / Quality | Static code analysis |
| Trivy | Security | Container vulnerability scanning |
| Docker | Containers | Image build and packaging |
| DockerHub | Registry | Image storage and versioning |
| K3s | Runtime | Lightweight Kubernetes cluster |
| ArgoCD | GitOps | Declarative continuous deployment |
| GitHub Actions | CI/CD | MkDocs + Showcase deployment |
| Prometheus + Grafana | Monitoring | Kubernetes metrics, node metrics, and MIND API health dashboard |
| Dozzle | Logs | Live Kubernetes pod/container log viewer |
| MkDocs Material | Documentation | Project documentation portal |
| React + Vite | Frontend | Visual showcase app |

---

## Repository Structure

```
depi-mind-app-v2/
├── MIND/
│   ├── backend/          # Go API source code
│   └── frontend/         # React frontend source code
├── k8s/                  # Kubernetes manifests (ArgoCD watches this)
│   ├── namespace.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-secret.yaml
│   └── services.yaml
├── Jenkinsfile            # Jenkins pipeline definition
├── docker-compose.yml     # Full stack compose
├── docker-compose.dev.yml # Development compose
├── docs/                 # MkDocs source pages
│   ├── index.md
│   ├── architecture.md
│   ├── cicd.md
│   ├── security.md
│   ├── kubernetes.md
│   ├── argocd.md
│   ├── operations.md
│   ├── screenshots.md
│   ├── professor-qa.md
│   └── screenshots/      # Evidence screenshots
├── showcase/             # React/Vite visual showcase
├── mkdocs.yml            # MkDocs configuration
└── .github/
    └── workflows/
        └── deploy-pages-combined.yml  # GitHub Pages deployment
```

---

## Security

> **Important:** This repository does not contain any real passwords, tokens, SSH keys, cloud credentials, or secrets.

All sensitive values (DockerHub token, SonarQube token, GitHub token) are stored exclusively as **Jenkins credentials** and are never written to source code, Dockerfiles, YAML manifests, or documentation.

Secrets are enforced by:
- **Gitleaks** pre-build scan — blocks any accidental commit with exposed credentials
- **Jenkins credentials manager** — injects secrets at runtime only

---

## ArgoCD Self-Healing Proof

The GitOps self-healing capability was validated:

1. Frontend deployment was manually scaled to zero replicas:
   ```bash
   kubectl scale deployment mind-frontend -n mind --replicas=0
   ```
2. ArgoCD detected the drift from the Git-declared desired state.
3. Within ~90 seconds, ArgoCD restored the frontend to 1/1 Running.
4. ArgoCD status remained **Synced** and **Healthy** throughout.

This proves the cluster always converges to the Git-defined desired state — no manual intervention required.

---

## Kubernetes Validation

```bash
kubectl get nodes -o wide
kubectl get pods -n mind -o wide
kubectl get svc -n mind
kubectl get application mind-app -n argocd
```

Expected results:
- Node: `Ready`
- `mind-backend`: `1/1 Running`
- `mind-frontend`: `1/1 Running`
- `postgres`: `1/1 Running`
- ArgoCD app: `Synced` / `Healthy`
- API health: `{"message":"Notes API is running","status":"ok"}`

---

## Documentation

Full documentation is published at:
**https://fadyy2k.github.io/depi-mind-app-v2/**

Visual showcase:
**https://fadyy2k.github.io/depi-mind-app-v2/showcase/**

Both are built and deployed automatically via GitHub Actions on every push to `main`.

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/fadyy2k/depi-mind-app-v2.git
cd depi-mind-app-v2

# Run full stack locally
docker compose up

# Run development mode
docker compose -f docker-compose.dev.yml up
```

---

## Production Improvements

For a production-grade deployment, the following enhancements are recommended:

| Area | Current | Production Target |
|---|---|---|
| Trivy | Report-only | Fail build on HIGH/CRITICAL |
| TLS | HTTP only | HTTPS with cert-manager + Let's Encrypt |
| Secrets | Jenkins creds | HashiCorp Vault or AWS Secrets Manager |
| Kubernetes | K3s (single node) | Multi-node cluster or managed EKS/GKE |
| Monitoring | Prometheus + Grafana added | Alerting + retention policy + secured access |
| Alerting | None | PagerDuty / Slack notifications |
| Image tags | Build number | Semantic versioning with Git SHA |

---

<div align="center">
<b>DEPI DevSecOps Project — MIND Notes App</b><br>
Full pipeline · Security scanning · GitOps · Self-healing Kubernetes
</div>
