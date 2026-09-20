> 🔐 Public documentation: operational endpoints and credentials are sanitized. Use authenticated values supplied out-of-band for a live environment.

# Architecture

This page explains the full infrastructure design: the two AWS EC2 servers, how they interconnect, and the role of every component.

---

## High-Level Architecture Diagram

```mermaid
flowchart TB
    DEV([👨‍💻 Developer\nLocal Machine])

    subgraph GH["☁️ GitHub (Source of Truth)"]
        REPO[depi-mind-app-v2\nSource Code + K8s Manifests]
    end

    subgraph EC1["🖥️ EC2 #1 — CI/CD Server\nci-lab.internal.example"]
        JK[Jenkins :8080\nCI/CD Orchestrator]
        GL[Gitleaks\nSecret Scanner]
        SQ[SonarQube :9000\nCode Quality]
        DC[Docker Engine\nImage Builder]
        TR[Trivy\nVulnerability Scanner]
    end

    subgraph DH["🐳 DockerHub Registry"]
        IMG_BE[fadyy2k/mind-backend]
        IMG_FE[fadyy2k/mind-frontend]
    end

    subgraph EC2["🖥️ EC2 #2 — Kubernetes Server\nk8s-lab.internal.example"]
        AR[ArgoCD :32000\nGitOps Controller]
        subgraph K3["K3s Cluster — namespace: mind"]
            FE[Frontend Pod\nReact/Nginx :30080]
            BE[Backend Pod\nGo API]
            PG[PostgreSQL Pod\nPVC Storage]
        end
    end

    DEV -->|git push| REPO
    REPO -->|trigger / poll| JK
    JK --> GL --> SQ --> DC --> TR --> DH
    DC -->|build & push| IMG_BE
    DC -->|build & push| IMG_FE
    REPO -->|watch manifests| AR
    IMG_BE -->|pull| K3
    IMG_FE -->|pull| K3
    AR -->|kubectl apply| K3
```

---

## Sequence Diagram — Full Pipeline Run

```mermaid
sequenceDiagram
    participant DEV as Developer
    participant GH as GitHub
    participant JK as Jenkins (EC2 #1)
    participant GL as Gitleaks
    participant SQ as SonarQube
    participant DC as Docker
    participant TR as Trivy
    participant DH as DockerHub
    participant AR as ArgoCD (EC2 #2)
    participant K3 as K3s Kubernetes

    DEV->>GH: git push (code + k8s manifests)
    GH->>JK: Trigger pipeline (webhook/poll)
    JK->>JK: Checkout repository
    JK->>GL: Run Gitleaks scan
    GL-->>JK: No leaks found ✓
    JK->>SQ: Run SonarQube scanner
    SQ-->>JK: Quality gate passed ✓
    JK->>DC: docker build mind-backend
    JK->>DC: docker build mind-frontend
    DC-->>JK: Images ready
    JK->>TR: trivy image mind-backend
    JK->>TR: trivy image mind-frontend
    TR-->>JK: Scan report shown ✓
    JK->>DH: docker push fadyy2k/mind-backend
    JK->>DH: docker push fadyy2k/mind-frontend
    DH-->>JK: Push complete ✓
    GH->>AR: ArgoCD watches manifest repo
    AR->>K3: kubectl apply -f k8s/
    K3->>DH: Pull fadyy2k/mind-backend
    K3->>DH: Pull fadyy2k/mind-frontend
    K3-->>AR: Pods Running ✓
    AR-->>AR: Status: Synced + Healthy ✓
```

---

## EC2 #1 — CI/CD Server

**Hostname:** `ci-lab.internal.example`
**Role:** All CI/CD and security scanning workloads.

### Services Running

| Service | Port | Purpose |
|---|---|---|
| **Jenkins** | 8080 | Pipeline orchestrator. Runs all stages: checkout, scan, build, push |
| **SonarQube** | 9000 | Static code analysis server. Receives scanner results and applies quality gate |
| **Docker Engine** | — | Builds backend and frontend container images |
| **Gitleaks** | — | Runs inside a Docker container (`ghcr.io/gitleaks/gitleaks:latest`). Scans repository for leaked secrets |
| **Trivy** | — | Scans built Docker images for CVE vulnerabilities before pushing to registry |

### Jenkins Credentials (stored securely — never in code)

| Credential ID | Type | Used For |
|---|---|---|
| `dockerhub-creds` | Username + Password | Push images to DockerHub |
| `github-creds` | Username + Token | Pull source code from GitHub |
| `sonarqube-token` | Secret Text | Authenticate SonarQube scanner |

!!! warning "Security"
    No credential values are stored in source code, YAML manifests, or documentation. All secrets are injected at runtime by Jenkins from its encrypted credentials store.

---

## EC2 #2 — Kubernetes / GitOps Server

**Hostname:** `k8s-lab.internal.example`
**Role:** Container runtime, GitOps controller, and public app hosting.

### Services Running

| Service | Port | Purpose |
|---|---|---|
| **K3s Kubernetes** | 6443 (internal API) | Lightweight Kubernetes cluster running all app workloads |
| **ArgoCD** | 32000 (NodePort) | GitOps controller. Watches GitHub, syncs manifests to cluster |
| **MIND Frontend** | 30080 (NodePort) | React/Nginx app. Publicly accessible |
| **MIND Backend** | (internal ClusterIP) | Go API. Serves `/api/health` and all note operations |
| **PostgreSQL** | (internal ClusterIP) | Persistent database with PVC storage |

### Kubernetes Namespaces

| Namespace | Contents |
|---|---|
| `mind` | Frontend, backend, PostgreSQL, all services, PVC, secrets |
| `argocd` | ArgoCD controller and application definition |

---

## Networking and DuckDNS

Both EC2 instances use **DuckDNS** for stable, human-readable hostnames that map to their dynamic public IPs.

| Hostname | Resolves To | Used For |
|---|---|---|
| `ci-lab.internal.example` | EC2 #1 Public IP | Jenkins (8080), SonarQube (9000) |
| `k8s-lab.internal.example` | EC2 #2 Public IP | MIND App (30080), ArgoCD (32000) |

---

## DockerHub as the Bridge

DockerHub acts as the **shared image registry** connecting EC2 #1 (build) to EC2 #2 (runtime).

```
EC2 #1 Jenkins                DockerHub                EC2 #2 K3s
─────────────    push →    ──────────────    ← pull    ────────────
Docker build   ─────────▶  fadyy2k/mind-   ─────────▶  Pod runs
(CI/CD server)              backend:8        (K3s node)
                            frontend:8
```

The image tag is the Jenkins build number. This creates an immutable, traceable artifact for every pipeline run.

---

## Application Stack

| Component | Technology | Docker Image |
|---|---|---|
| **Frontend** | React + Nginx | `fadyy2k/mind-frontend` |
| **Backend** | Go REST API | `fadyy2k/mind-backend` |
| **Database** | PostgreSQL 15 | `postgres:15` |

### Local Development

Both `docker-compose.yml` and `docker-compose.dev.yml` are provided for local development without Kubernetes:

```bash
docker compose up           # Full stack
docker compose -f docker-compose.dev.yml up  # Dev mode with hot-reload
```

---

## GitHub as the Source of Truth

The repository holds two critical things:

1. **Application source code** — `MIND/backend/` and `MIND/frontend/`
2. **Kubernetes manifests** — `k8s/` directory

ArgoCD watches the `k8s/` directory in GitHub. Any change pushed to Git is automatically synced to the cluster. No manual `kubectl apply` is needed for deployments — **Git is the deployment mechanism**.
