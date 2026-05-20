# Monitoring — Prometheus and Grafana

This page documents the observability layer added to the DEPI DevSecOps Project — MIND Notes App.

---

## Monitoring Goal

Prometheus and Grafana were added to monitor the live Kubernetes runtime environment and the MIND application health endpoint.

The monitoring layer proves that the deployed system is not only running, but also observable.

---

## Where Monitoring Runs

Monitoring runs on **EC2 #2 — K3s Server** inside a dedicated Kubernetes namespace:

```text
namespace: monitoring
```

This keeps monitoring separate from the application and GitOps namespaces:

```text
namespace: mind     # MIND frontend, backend, PostgreSQL
namespace: argocd   # ArgoCD GitOps controller
```

---

## Installed Components

| Component | Purpose |
|---|---|
| Prometheus | Collects and stores metrics |
| Grafana | Visualizes metrics and dashboards |
| Prometheus Operator | Manages Prometheus custom resources |
| kube-state-metrics | Exposes Kubernetes object metrics |
| node-exporter | Exposes node CPU, memory, disk, and network metrics |
| Blackbox Exporter | Probes the MIND API health endpoint |
| Dozzle | Provides live Kubernetes pod/container logs |
| Prometheus PVC | Stores Prometheus metrics data |

---

## Access

| Resource | URL |
|---|---|
| Grafana | `http://depi-k3s-depi.duckdns.org:30300` |
| MIND App Monitoring Dashboard | `http://depi-k3s-depi.duckdns.org:30300/d/mind-app-monitoring/mind-app-monitoring` |
| Dozzle Live Logs | `http://depi-k3s-depi.duckdns.org:30301` |

!!! warning "Security"
    Grafana is exposed using NodePort `30300` for demo purposes.
    In production, access should be restricted by firewall/security group, protected with HTTPS, and integrated with proper authentication.

---

## Kubernetes Resources

Monitoring resources were deployed in the `monitoring` namespace.

Validation command:

```bash
kubectl get pods -n monitoring
```

Expected running components:

```text
blackbox-prometheus-blackbox-exporter
monitoring-grafana
monitoring-kube-prometheus-operator
monitoring-kube-state-metrics
monitoring-prometheus-node-exporter
prometheus-monitoring-kube-prometheus-prometheus-0
```

---

## Grafana Dashboard

A custom Grafana dashboard was created:

```text
Dashboard name: MIND App Monitoring
Dashboard UID: mind-app-monitoring
```

It contains three panels:

| Panel | Purpose |
|---|---|
| MIND API Health | Shows whether `/api/health` is UP or DOWN |
| MIND API Response Time | Shows probe duration in seconds |
| MIND API Probe Status Over Time | Shows historical UP/DOWN status |

---

## MIND API Health Probe

The MIND API health endpoint is monitored using Blackbox Exporter and Prometheus Probe CRD.

Internal Kubernetes target:

```text
http://mind-frontend-service.mind.svc.cluster.local/api/health
```

Probe object:

```text
kind: Probe
name: mind-api-health
namespace: monitoring
job: probe/monitoring/mind-api-health
```

Prometheus query:

```promql
probe_success{job="probe/monitoring/mind-api-health"}
```

Expected value:

```text
1 = UP
0 = DOWN
```

Verified result:

```text
probe_success = 1
```

---

## Storage

Prometheus uses a persistent volume claim:

```text
StorageClass: local-path
Size: 5Gi
Status: Bound
```

This allows metrics data to survive Prometheus pod restarts.

---

## Validation Commands

```bash
# Check monitoring pods
kubectl get pods -n monitoring

# Check monitoring services
kubectl get svc -n monitoring

# Check Prometheus PVC
kubectl get pvc -n monitoring

# Check MIND API health probe
kubectl get probe -n monitoring

# Query MIND API health status from Prometheus
kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-prometheus 9090:9090
```

Then query:

```bash
curl -sG "http://127.0.0.1:9090/api/v1/query" \
  --data-urlencode 'query=probe_success{job="probe/monitoring/mind-api-health"}'
```

Expected result:

```json
"value": ["timestamp", "1"]
```

---

## Why This Improves the Project

Before this step, the project proved:

- CI/CD automation with Jenkins
- Security scanning with Gitleaks, SonarQube, and Trivy
- GitOps deployment with ArgoCD
- Kubernetes runtime with K3s
- Self-healing deployment behavior

After adding Prometheus and Grafana, the project also proves:

- Runtime observability
- Kubernetes metrics monitoring
- Node-level resource visibility
- Application health monitoring
- Custom Grafana dashboarding
- Prometheus-based API probing

This makes the project closer to a production-ready DevSecOps platform.
