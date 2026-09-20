# DEPI DevSecOps Project — MIND Notes App

!!! success "Live and Running"
    The full pipeline is deployed and active. All services are reachable at the links below.

---

## What Is This Project?

This is a complete **DevSecOps implementation** for the MIND Notes App — a full-stack note-taking application consisting of a React frontend, a Go backend API, and a PostgreSQL database.

The project demonstrates the entire modern DevSecOps lifecycle:

- Developers push code to **GitHub**
- **Jenkins** automatically triggers the CI/CD pipeline
- **Gitleaks** scans for leaked secrets before anything is built
- **SonarQube** performs static code analysis and quality gate validation
- **Docker** builds versioned container images for the frontend and backend
- **Trivy** scans those images for known CVE vulnerabilities
- Images are published to **DockerHub** as versioned artifacts
- **ArgoCD** detects the new image and syncs the Kubernetes manifests
- **K3s** deploys and runs the application on EC2
- The app is publicly reachable with a health-checked API

Every stage is automated, logged, and evidenced with screenshots.

---

## Live Access

| Resource | URL | Credentials |
|---|---|---|
| MIND Notes App | [https://fadyy2k.github.io/depi-mind-app-v2/showcase/](https://fadyy2k.github.io/depi-mind-app-v2/showcase/) | `<demo-user>` / `<configured-out-of-band>` |
| API Health | [https://fadyy2k.github.io/depi-mind-app-v2/operations/](https://fadyy2k.github.io/depi-mind-app-v2/operations/) | Public |
| Jenkins | [https://fadyy2k.github.io/depi-mind-app-v2/cicd/](https://fadyy2k.github.io/depi-mind-app-v2/cicd/) | Authentication required |
| ArgoCD | [https://fadyy2k.github.io/depi-mind-app-v2/argocd/](https://fadyy2k.github.io/depi-mind-app-v2/argocd/) | Authentication required |
| SonarQube | [https://fadyy2k.github.io/depi-mind-app-v2/security/](https://fadyy2k.github.io/depi-mind-app-v2/security/) | Authentication required |
| DockerHub (backend) | [fadyy2k/mind-backend](https://hub.docker.com/r/fadyy2k/mind-backend) | Public |
| DockerHub (frontend) | [fadyy2k/mind-frontend](https://hub.docker.com/r/fadyy2k/mind-frontend) | Public |

---

## The Complete Pipeline

```mermaid
flowchart LR
    DEV([Developer]) -->|git push| GH[GitHub]
    GH -->|webhook / poll| JK[Jenkins]
    JK --> GL[Gitleaks\nSecret Scan]
    GL --> SQ[SonarQube\nCode Analysis]
    SQ --> DB[Docker\nBuild]
    DB --> TR[Trivy\nImage Scan]
    TR --> DH[DockerHub\nRegistry]
    DH -->|watch & sync| AR[ArgoCD]
    AR -->|kubectl apply| K3[K3s Cluster]
    K3 --> FE[Frontend\nReact/Nginx]
    K3 --> BE[Backend\nGo API]
    K3 --> PG[PostgreSQL\nPVC]
```

---

## DevSecOps Toolchain

| Tool | Category | What It Does |
|---|---|---|
| **Jenkins** | CI/CD | Orchestrates all pipeline stages automatically |
| **Gitleaks** | Secret Scanning | Detects leaked credentials in source code |
| **SonarQube** | Code Quality | Static analysis, bugs, code smells, quality gate |
| **Trivy** | Vulnerability Scanning | Scans Docker images for known CVEs |
| **Docker** | Containerization | Builds and packages images |
| **DockerHub** | Registry | Stores and versions container images |
| **K3s** | Kubernetes | Lightweight container orchestration runtime |
| **ArgoCD** | GitOps | Declarative, self-healing continuous deployment |
| **GitHub Actions** | Pages Deployment | Builds and deploys docs + showcase |
| **MkDocs Material** | Documentation | This documentation portal |

---

## Infrastructure Summary

Two AWS EC2 instances power this project:

=== "EC2 #1 — CI/CD Server"
    **Hostname:** `ci-lab.internal.example`

    - Jenkins (port 8080)
    - SonarQube (port 9000)
    - Docker Engine
    - Gitleaks (Docker-based)
    - Trivy

=== "EC2 #2 — Kubernetes Server"
    **Hostname:** `k8s-lab.internal.example`

    - K3s Kubernetes Cluster
    - ArgoCD (port 32000)
    - MIND App (port 30080)
    - PostgreSQL with persistent storage

---

## Navigate the Documentation

<div class="grid cards" markdown>

-   :material-sitemap: **[Architecture](architecture.md)**

    Two EC2 servers, full infrastructure diagrams, DuckDNS networking

-   :material-pipe: **[CI/CD Pipeline](cicd.md)**

    Jenkins stages, Jenkinsfile walkthrough, pipeline screenshots

-   :material-shield-check: **[Security Scanning](security.md)**

    Gitleaks, SonarQube, Trivy — tools and results

-   :material-kubernetes: **[Kubernetes](kubernetes.md)**

    K3s cluster, namespace, pods, services, PVC, NodePort

-   :material-sync: **[ArgoCD GitOps](argocd.md)**

    Sync, health, drift detection, self-healing proof

-   :material-wrench: **[Operations](operations.md)**

    Commands, troubleshooting, deployment validation

-   :material-image: **[Screenshots](screenshots.md)**

    Full evidence gallery — all stages documented

-   :material-school: **[Professor Q&A](professor-qa.md)**

    Likely questions with clear, confident answers

</div>
