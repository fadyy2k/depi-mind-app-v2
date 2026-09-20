> 🔐 Public version: infrastructure identifiers, addresses, and credentials are sanitized. Operational access is shared only through authenticated channels when required.

# DEPI DevSecOps Project - MIND Notes App

## Overview

This project demonstrates a complete DevSecOps pipeline on AWS using:

- GitHub
- Jenkins
- Docker
- DockerHub
- Trivy
- K3s Kubernetes
- ArgoCD GitOps

## Application

MIND Notes App:

- Frontend: React / Nginx
- Backend: Go API
- Database: PostgreSQL

## Architecture

GitHub -> Jenkins -> Docker Build -> Trivy Scan -> DockerHub -> ArgoCD -> K3s Kubernetes -> MIND App

## AWS Servers

Jenkins server:

- Name: depi-jenkins-server
- Public IP: 192.0.2.10
- Jenkins URL: https://fadyy2k.github.io/depi-mind-app-v2/cicd/

K3s server:

- Name: depi-k3s-server
- Public IP: 198.51.100.20
- Private IP: 10.0.20.10
- Kubernetes: K3s v1.35.4+k3s1

## GitHub Repository

https://github.com/fadyy2k/depi-mind-app-v2

Important files:

- Jenkinsfile
- k8s/mind-app.yaml
- DEPI_PROJECT_FINAL_SUMMARY.md

## DockerHub Images

- fadyy2k/mind-backend
- fadyy2k/mind-frontend

Tags created by Jenkins:

- 1
- 2
- 3
- latest

## Jenkins Pipeline

Job name:

- depi-mind-app-ci

Pipeline stages:

1. Checkout
2. Show Workspace
3. Build Backend Image
4. Build Frontend Image
5. Trivy Image Scan
6. DockerHub Login
7. Push Images

## Trivy Scan Results

Build #3 results:

- Backend: 15 HIGH/CRITICAL findings
- Frontend: 1 HIGH finding

Trivy is configured in report-only mode for the demo.

## Kubernetes Deployment

Namespace:

- mind

Main resources:

- postgres
- mind-backend
- mind-frontend
- postgres-pvc
- backend-service
- mind-frontend-service

Application URL:

- https://fadyy2k.github.io/depi-mind-app-v2/showcase/

API health URL:

- https://fadyy2k.github.io/depi-mind-app-v2/operations/

Demo login:

- Email: <demo-user>
- Password: <configured-out-of-band>

## ArgoCD GitOps

ArgoCD URL:

- https://fadyy2k.github.io/depi-mind-app-v2/argocd/

ArgoCD application:

- mind-app

Source:

- Repo: https://github.com/fadyy2k/depi-mind-app-v2.git
- Path: k8s
- Branch: main

Final ArgoCD status:

- Synced
- Healthy

## Self-Healing Test

The frontend deployment was manually scaled to zero replicas.

ArgoCD detected the drift and restored it back to the Git desired state.

Final result:

- mind-frontend: 1/1 Running
- mind-app: Synced / Healthy

## Final Validation

Final confirmed status:

- K3s node: Ready
- Backend pod: Running
- Frontend pod: Running
- PostgreSQL pod: Running
- ArgoCD app: Synced / Healthy
- API health: 200 OK
