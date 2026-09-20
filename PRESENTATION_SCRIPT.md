> 🔐 Public script: live operational endpoints and demo credentials have been removed. Use authenticated links shared privately during a live demonstration.

# Final Professor Presentation Script

## Total time: ~12-15 minutes

---

## 1. Open the GitHub Repository (1 min)

**Say:**

> "This is the GitHub repository for my DEPI DevSecOps project. Everything is public — the application source code in `MIND/backend` and `MIND/frontend`, the Jenkins pipeline in `Jenkinsfile`, all Kubernetes manifests in `k8s/`, and the documentation.

> The project demonstrates a complete DevSecOps workflow: from a developer pushing code, through automated security scanning, to a live Kubernetes deployment that heals itself automatically."

**Show:** The repo root — point to `MIND/`, `k8s/`, `Jenkinsfile`, `.github/workflows/`

---

## 2. Open Jenkins (2 min)

**Navigate to:** the authenticated Jenkins endpoint (shared out-of-band)

**Say:**

> "This is Jenkins — my CI/CD server running on EC2 #1. When code is pushed to GitHub, Jenkins automatically runs this pipeline."

**Click the pipeline job and open Build #8 console output.**

**Say:**

> "Let me show you each stage.

> First — **Stage 3: Gitleaks**. This scans the repository for leaked credentials, tokens, or private keys before the build even starts. The result: no leaks found. This means the repository is clean — no accidentally committed secrets.

> Next — **Stage 4: SonarQube**. This runs static code analysis on both the Go backend and the React frontend. The scanner uploads results to SonarQube and the quality gate passed."

**Scroll to Trivy output:**

> "Stage 7 is Trivy — it scans the built Docker images for known CVE vulnerabilities. The results are shown here in the console. For this demo it's report-only — in production, I would configure it to fail the build on any HIGH or CRITICAL vulnerability that doesn't have an accepted exception."

**Scroll to DockerHub push:**

> "Finally, Stages 8-9 log in to DockerHub with credentials stored securely in Jenkins — never in code — and push the images."

---

## 3. Open SonarQube (1 min)

**Navigate to:** the authenticated SonarQube endpoint (shared out-of-band)

**Say:**

> "This is the SonarQube server, also on EC2 #1. Here you can see the project `DEPI MIND App` — the analysis was uploaded by Jenkins, and the quality gate passed. If I had written code with serious bugs or security vulnerabilities, this would block the pipeline."

---

## 4. Open DockerHub (1 min)

**Navigate to:** `https://hub.docker.com/r/fadyy2k/mind-backend`

**Say:**

> "Jenkins pushed the images to DockerHub. You can see the tags — `latest` and build numbers like `8`. Every pipeline run creates a new tagged, immutable artifact. K3s pulls from here during deployment."

---

## 5. Show the App Running (1 min)

**Navigate to:** `https://fadyy2k.github.io/depi-mind-app-v2/showcase/`

**Say:**

> "This is the MIND Notes App running live in Kubernetes. Let me log in — `<demo-user>`, `<configured-out-of-band>`."

**Log in and show the notes interface.**

**Navigate to:** `https://fadyy2k.github.io/depi-mind-app-v2/operations/`

**Say:**

> "And here is the API health endpoint — it returns `status: ok`. This confirms the Go backend is running and the Nginx frontend is correctly proxying API requests."

---

## 6. Open ArgoCD (2 min)

**Navigate to:** the authenticated ArgoCD endpoint (shared out-of-band)

**Log in with demo credentials.**

**Say:**

> "This is ArgoCD — the GitOps controller. It watches the `k8s/` directory in GitHub. The application `mind-app` shows status **Synced** and **Healthy**. This means the cluster state matches exactly what is declared in Git."

**Click on the application to show the resource graph.**

**Say:**

> "ArgoCD manages all the Kubernetes resources — the namespace, three deployments, three services, the PVC for PostgreSQL, and the secrets. It deployed all of this by watching Git."

---

## 7. Demonstrate Self-Healing (2 min)

**Open a terminal to the K3s server.**

**Say:**

> "Now I'll prove self-healing. I'm going to manually scale the frontend to zero replicas — simulating an accidental or unauthorized change to the cluster."

**Run:**
```bash
kubectl scale deployment mind-frontend -n mind --replicas=0
```

**Say:**

> "The pod is now terminating. The app is down. But I haven't changed anything in Git — so ArgoCD sees that the actual cluster state no longer matches the desired state in Git. It classifies this as OutOfSync."

**Wait ~90 seconds, refresh ArgoCD.**

**Say:**

> "And there — ArgoCD has restored the deployment. The frontend is back to 1/1 Running. ArgoCD is Synced and Healthy again. This happened automatically, with no human intervention. This is why GitOps is powerful — Git is always the enforced source of truth."

---

## 8. Show Kubernetes Validation (1 min)

**Run:**
```bash
kubectl get pods -n mind -o wide
kubectl get svc -n mind
kubectl get application mind-app -n argocd
```

**Say:**

> "All three pods are Running — frontend, backend, and PostgreSQL. The services are correctly configured with the NodePort on 30080. And ArgoCD shows Synced and Healthy."

---

## 9. Show the Documentation and Showcase (1 min)

**Navigate to:** `https://fadyy2k.github.io/depi-mind-app-v2/`

**Say:**

> "The full project documentation is published here via GitHub Actions. It covers the architecture, every CI/CD stage, security tools, Kubernetes, and ArgoCD — with screenshots as evidence for every stage."

**Navigate to:** `https://fadyy2k.github.io/depi-mind-app-v2/showcase/`

**Say:**

> "And this is the visual showcase — a React app also deployed via GitHub Actions. It shows the architecture, pipeline timeline, security results, Kubernetes resources, and the Q&A section."

---

## 10. Closing Summary (1 min)

**Say:**

> "To summarize what this project demonstrates:

> - **Jenkins** automates every stage — no manual builds
> - **Gitleaks** prevents credential leaks in source code
> - **SonarQube** enforces code quality on every commit
> - **Trivy** gives us container vulnerability visibility before deployment
> - **DockerHub** stores versioned, immutable image artifacts
> - **K3s** runs the full application in Kubernetes
> - **ArgoCD** ensures the cluster always matches Git — and self-heals any deviation

> Everything runs on two EC2 servers on AWS. The code, manifests, and pipeline are all in the public GitHub repository. I'm happy to walk through any specific part in more detail."

---

## Quick Reference — URLs to Have Open

| Tab | URL |
|---|---|
| GitHub | https://github.com/fadyy2k/depi-mind-app-v2 |
| Jenkins Build #8 Console | https://fadyy2k.github.io/depi-mind-app-v2/cicd/ |
| SonarQube | https://fadyy2k.github.io/depi-mind-app-v2/security/ |
| DockerHub | https://hub.docker.com/r/fadyy2k/mind-backend |
| MIND App | https://fadyy2k.github.io/depi-mind-app-v2/showcase/ |
| API Health | https://fadyy2k.github.io/depi-mind-app-v2/operations/ |
| ArgoCD | https://fadyy2k.github.io/depi-mind-app-v2/argocd/ |
| Documentation | https://fadyy2k.github.io/depi-mind-app-v2/ |
| Showcase | https://fadyy2k.github.io/depi-mind-app-v2/showcase/ |

## Terminal Commands Ready to Run

```bash
# Check pods
kubectl get pods -n mind -o wide

# Trigger self-healing test
kubectl scale deployment mind-frontend -n mind --replicas=0

# Watch pods recover
kubectl get pods -n mind -w

# ArgoCD status
kubectl get application mind-app -n argocd

# API health check
curl https://fadyy2k.github.io/depi-mind-app-v2/operations/
```
