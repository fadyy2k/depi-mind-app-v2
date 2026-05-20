# Professor Q&A

This section anticipates likely evaluation questions and provides complete, confident answers based on what was actually built and deployed.

---

## Project Overview Questions

### What is the goal of this project?

This project demonstrates a complete, end-to-end DevSecOps implementation. The goal is to show how modern software teams automate the entire path from writing code to deploying a secure, validated application — with security integrated at every stage rather than treated as a final step.

Specifically, it proves:
- Automated CI/CD with Jenkins
- Proactive security scanning (Gitleaks, SonarQube, Trivy)
- Container image management through DockerHub
- Production-like Kubernetes deployment on K3s
- GitOps with ArgoCD including self-healing validation

---

### Where is the code?

Everything is in the public GitHub repository: [https://github.com/fadyy2k/depi-mind-app-v2](https://github.com/fadyy2k/depi-mind-app-v2)

| What | Where |
|---|---|
| Application source code | `MIND/backend/` (Go), `MIND/frontend/` (React) |
| Jenkins pipeline | `Jenkinsfile` |
| Kubernetes manifests | `k8s/` |
| Docker Compose (local dev) | `docker-compose.yml`, `docker-compose.dev.yml` |
| MkDocs documentation | `docs/`, `mkdocs.yml` |
| GitHub Pages workflow | `.github/workflows/deploy-pages-combined.yml` |
| Visual showcase | `showcase/` |

---

### Where are the deployment files?

Kubernetes deployment files are in the `k8s/` directory:

```
k8s/
├── namespace.yaml
├── backend-deployment.yaml
├── frontend-deployment.yaml
├── postgres-deployment.yaml
├── postgres-pvc.yaml
├── postgres-secret.yaml
└── services.yaml
```

These are the files ArgoCD watches and applies to the K3s cluster.

---

## Pipeline and Tooling Questions

### Why Jenkins?

Jenkins is the industry standard for self-hosted CI/CD. It was chosen because:

1. **Full control** — The pipeline runs on our own EC2 server, not a SaaS platform
2. **Plugin ecosystem** — Supports every tool in this stack
3. **Credential management** — Secure injection of DockerHub, GitHub, and SonarQube secrets
4. **Visibility** — Console output shows every stage in detail
5. **Learning value** — Understanding Jenkins prepares engineers for real enterprise environments

Alternatives like GitHub Actions or GitLab CI would also work, but Jenkins demonstrates a more traditional enterprise CI/CD approach.

---

### Why Gitleaks?

Gitleaks prevents one of the most common and damaging security incidents: **accidental credential exposure in source code**.

A developer might accidentally commit a DockerHub token, AWS key, or database password. Once pushed to GitHub (even briefly), it can be scraped by automated bots within minutes. Rotating the credential and auditing access is expensive and time-consuming.

Gitleaks catches this **before the build starts** — before the code ever reaches an image, registry, or server.

Result in this project: **No leaks found** — confirming the repository is clean.

---

### Why SonarQube?

SonarQube integrates code quality into the CI/CD loop so developers get feedback on bugs, vulnerabilities, and technical debt on every build — not just at release time.

Benefits:
- Catches security vulnerabilities in code logic (not just secrets)
- Tracks code quality trends over time
- Quality gate can block deployment if code quality drops below threshold
- Supports Go and React/JavaScript

In this project, SonarQube analyzed both the backend (Go) and frontend (React) and the quality gate passed.

---

### Why Trivy?

Docker images are not automatically secure just because the code is clean. Base images like `golang:1.21` or `node:18-alpine` may include OS packages with known CVEs.

Trivy scans the final built image — including all layers — against multiple CVE databases and reports HIGH and CRITICAL vulnerabilities. This gives the team visibility into runtime security risk before the image is deployed.

---

### Why is Trivy in report-only mode?

For this demo, the goal is to prove that the tool is integrated and that scan results are visible and logged. Blocking pipelines based on vulnerability severity requires:

1. Organizational policy on acceptable risk
2. Exception workflows for false positives
3. Coordination with the security team on remediation timelines

Without these policies defined, blocking the build on every Trivy finding would halt the demo pipeline due to transitive CVEs in base images that may not be exploitable in this context.

In production, the `--exit-code 0` flag would be removed and a proper exception policy would be in place.

---

### Why DockerHub?

DockerHub is the most widely used public container registry. It was used here because:

- Free tier is sufficient for this project
- K3s can pull from DockerHub without authentication
- Images are publicly visible for evaluation
- Build tags (`:latest`, `:8`) create traceable, immutable artifacts per pipeline run

In production, a private registry (AWS ECR, Google Artifact Registry, or self-hosted Harbor) would be preferred.

---

## Infrastructure Questions

### What is the role of each EC2 server?

**EC2 #1 (`depi-jenkins-server` — `depi-jenkins-depi.duckdns.org`)**

This is the CI/CD and security scanning server. It runs:
- Jenkins (port 8080) — all pipeline stages
- SonarQube (port 9000) — receives scanner results
- Docker Engine — builds images
- Gitleaks (Docker-based) — secret scanning
- Trivy — image vulnerability scanning

Nothing from this server is exposed to users. It is purely a build and scan system.

**EC2 #2 (`depi-k3s-server` — `depi-k3s-depi.duckdns.org`)**

This is the runtime and GitOps server. It runs:
- K3s Kubernetes cluster — hosts the application
- ArgoCD (port 32000) — watches GitHub, deploys to K3s
- MIND Notes App (port 30080) — public user access
- PostgreSQL — persistent database storage

---

### Why K3s instead of full Kubernetes or EKS?

K3s is a **fully certified Kubernetes distribution** — it passes all conformance tests and uses the same API as full Kubernetes. Every concept demonstrated (Deployments, Services, PVC, Namespaces, NodePort) works identically in EKS, GKE, or AKS.

K3s was chosen because:
- **Cost** — A single EC2 t3.medium runs it without a managed control plane fee
- **Speed** — Installs in minutes, no cluster provisioning delay
- **Scope** — The project focuses on DevSecOps toolchain, not cluster management
- **Equivalence** — All Kubernetes objects and manifests are identical to production

The switch from K3s to EKS would require only a kubeconfig change — no manifest changes.

---

### What happens if EC2 is stopped and restarted?

When an EC2 instance stops and starts:

1. The **public IP changes** (unless an Elastic IP is allocated)
2. The **DuckDNS hostname** must be updated to point to the new IP
3. All services **restart automatically** because they are configured as systemd services (K3s) or Docker containers
4. **K3s pods restart** because the cluster is running as a systemd service
5. **ArgoCD** resumes watching the repository and syncing
6. The **application becomes available** again without manual intervention after the IP update

For production: use Elastic IPs or a load balancer with a fixed DNS entry to eliminate the IP change problem.

---

## Deployment and Operations Questions

### How are images deployed?

1. Jenkins builds `fadyy2k/mind-backend` and `fadyy2k/mind-frontend`
2. Jenkins pushes them to DockerHub
3. The Kubernetes manifests in `k8s/` reference these image names
4. ArgoCD applies the manifests to K3s
5. K3s pulls the images from DockerHub and starts the pods

To deploy a new version: update the image tag in the manifest, commit to Git, and ArgoCD does the rest.

---

### How do you prove the app is running?

Three ways:

1. **Browser** — Open [http://depi-k3s-depi.duckdns.org:30080](http://depi-k3s-depi.duckdns.org:30080) and log in with `demo@example.com` / `demo123456`

2. **API health endpoint** — `curl http://depi-k3s-depi.duckdns.org:30080/api/health` returns:
   ```json
   {"message":"Notes API is running","status":"ok"}
   ```

3. **kubectl** — `kubectl get pods -n mind -o wide` shows all pods as `1/1 Running`

---

### How do you prove security scanning is integrated?

1. **Gitleaks** — Jenkins console shows `No leaks found` in Build #8 console output. Screenshot: `jenkins-gitleaks-console.png`

2. **SonarQube** — Jenkins console shows scanner output. SonarQube dashboard shows the project with quality gate passed. Screenshot: `sonarqube-dashboard.png`

3. **Trivy** — Jenkins console shows vulnerability scan output for both images. Screenshot: `jenkins-trivy-console.png`

All three tools run in every pipeline execution as mandatory stages.

---

## ArgoCD and GitOps Questions

### Why ArgoCD?

ArgoCD implements the GitOps model: Git is the single source of truth for the cluster state. Benefits:

- **No manual kubectl apply** in production — Git commits are the deployment mechanism
- **Full audit trail** — every deployment is a Git commit with author, timestamp, and diff
- **Automatic drift correction** — any manual change is reverted within minutes
- **Self-healing** — the application always converges to the declared state
- **Rollback** — `git revert` is the rollback mechanism

---

### How does self-healing work?

ArgoCD continuously compares the **desired state** (Git manifests) to the **actual state** (running cluster). When they differ, ArgoCD applies the desired state.

This was proven by:
```bash
kubectl scale deployment mind-frontend -n mind --replicas=0
```

The frontend pod terminated. ArgoCD detected the drift, restored the deployment to 1 replica, and the pod returned to `1/1 Running` within ~90 seconds.

---

## Improvement Questions

### What should be improved for production?

| Area | Current State | Production Target |
|---|---|---|
| **Trivy** | Report-only | Fail build on HIGH/CRITICAL |
| **Gitleaks** | Report-only | Fail build on any leak |
| **TLS** | HTTP only | HTTPS with cert-manager |
| **Secrets** | Jenkins creds + K8s base64 | HashiCorp Vault / AWS Secrets Manager |
| **Kubernetes** | K3s single-node | Multi-node EKS/GKE |
| **Networking** | NodePort | Ingress + LoadBalancer |
| **Monitoring** | None | Prometheus + Grafana |
| **Alerting** | None | Slack/PagerDuty |
| **Registry** | DockerHub public | Private ECR/Harbor |
| **Testing** | None in pipeline | Unit + integration tests |
| **SBOM** | None | Syft SBOM per image |
| **Runtime security** | None | Falco |

---

## Monitoring and Observability Questions

### Did you add monitoring to the project?

Yes. I added a monitoring layer using Prometheus and Grafana inside the K3s cluster on EC2 #2.

The monitoring stack runs in a dedicated `monitoring` namespace and includes:

- Prometheus
- Grafana
- Prometheus Operator
- kube-state-metrics
- node-exporter
- Blackbox Exporter
- A 5Gi Prometheus PVC

Grafana is exposed for the demo on NodePort `30300`.

### What does Prometheus monitor?

Prometheus monitors Kubernetes runtime metrics including node CPU and memory, namespace metrics, pod metrics, Kubernetes object metrics, and the MIND API health endpoint.

The MIND API health endpoint is monitored through Blackbox Exporter using this internal Kubernetes URL:

```text
http://mind-frontend-service.mind.svc.cluster.local/api/health
```

The Prometheus query used to verify application health is:

```promql
probe_success{job="probe/monitoring/mind-api-health"}
```

A value of `1` means the MIND API health endpoint is UP.

### What does the custom Grafana dashboard show?

I created a custom dashboard called **MIND App Monitoring**.

It contains:

| Panel | Purpose |
|---|---|
| MIND API Health | Shows whether the API health endpoint is UP or DOWN |
| MIND API Response Time | Shows Blackbox probe response time |
| MIND API Probe Status Over Time | Shows historical health status |

This proves that the system is not only deployed, but also observable after deployment.

### Why is monitoring important in DevSecOps?

DevSecOps is not only about building and deploying safely. It also requires visibility after deployment.

Prometheus and Grafana help answer:

- Is the cluster healthy?
- Are pods running correctly?
- Is the node under pressure?
- Is the application health endpoint responding?
- Is the API response time stable?

This makes the project closer to a production-ready delivery platform.

### Did you add live log viewing?

Yes. I added Dozzle as a lightweight live log viewer for the K3s cluster.

Dozzle runs in Kubernetes mode inside the `monitoring` namespace and is exposed for the demo using NodePort `30301`.

It complements Prometheus and Grafana:

| Tool | Purpose |
|---|---|
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| Blackbox Exporter | API health probing |
| Dozzle | Live Kubernetes pod/container logs |

Dozzle helps inspect live pod logs from the browser without manually running `kubectl logs` for every pod.

For production, access to Dozzle should be secured with authentication, HTTPS, and strict firewall rules.
