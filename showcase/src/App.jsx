import { useEffect, useMemo, useState } from "react";

const DOCS_BASE = "/depi-mind-app-v2/";

const LINKS = {
  github: "https://github.com/fadyy2k/depi-mind-app-v2",
  docs: "https://fadyy2k.github.io/depi-mind-app-v2/",
  showcase: "https://fadyy2k.github.io/depi-mind-app-v2/showcase/",
  jenkins: "https://fadyy2k.github.io/depi-mind-app-v2/cicd/",
  app: "https://fadyy2k.github.io/depi-mind-app-v2/showcase/",
  health: "https://fadyy2k.github.io/depi-mind-app-v2/operations/",
  argocd: "https://fadyy2k.github.io/depi-mind-app-v2/argocd/",
  sonarqube: "https://fadyy2k.github.io/depi-mind-app-v2/security/",
  dockerBackend: "https://hub.docker.com/r/fadyy2k/mind-backend",
  dockerFrontend: "https://hub.docker.com/r/fadyy2k/mind-frontend",
};

const PIPELINE_STAGES = [
  { id: 1, icon: "↑", label: "Checkout", desc: "Jenkins pulls latest code from GitHub", color: "#64748b" },
  { id: 2, icon: "🔍", label: "Gitleaks", desc: "Secret scan — no leaks found", color: "#ef4444", result: "No leaks found ✓" },
  { id: 3, icon: "📊", label: "SonarQube", desc: "Static code analysis — quality gate passed", color: "#3b82f6", result: "Quality gate passed ✓" },
  { id: 4, icon: "🐳", label: "Docker Build", desc: "Build backend & frontend images", color: "#06b6d4", result: "2 images built ✓" },
  { id: 5, icon: "🛡️", label: "Trivy Scan", desc: "Container vulnerability scanning", color: "#8b5cf6", result: "Images scanned ✓" },
  { id: 6, icon: "📦", label: "DockerHub Push", desc: "Publish versioned images to registry", color: "#10b981", result: "Images published ✓" },
  { id: 7, icon: "🔄", label: "ArgoCD Sync", desc: "GitOps sync — manifests applied", color: "#f59e0b", result: "Synced + Healthy ✓" },
  { id: 8, icon: "☸️", label: "K3s Deploy", desc: "Pods running — app live", color: "#326ce5", result: "3/3 Running ✓" },
];

const EC2_SERVERS = [
  {
    name: "EC2 #1 — CI/CD Server",
    hostname: "Sanitized CI/CD host",
    color: "#3b82f6",
    icon: "🖥️",
    summary: "Builds, scans, packages, and publishes images.",
    services: [
      { name: "Jenkins", port: "8080", icon: "⚙️" },
      { name: "SonarQube", port: "9000", icon: "📊" },
      { name: "Docker Engine", port: "local", icon: "🐳" },
      { name: "Gitleaks", port: "Docker", icon: "🔍" },
      { name: "Trivy", port: "CLI", icon: "🛡️" },
    ],
  },
  {
    name: "EC2 #2 — Kubernetes Server",
    hostname: "Sanitized Kubernetes host",
    color: "#10b981",
    icon: "☸️",
    summary: "Runs the app, database, ArgoCD, and Kubernetes workloads.",
    services: [
      { name: "K3s Cluster", port: "6443", icon: "☸️" },
      { name: "ArgoCD", port: "32000", icon: "🔄" },
      { name: "MIND Frontend", port: "30080", icon: "⚛️" },
      { name: "Go Backend", port: "ClusterIP", icon: "🔧" },
      { name: "PostgreSQL", port: "5432", icon: "🗄️" },
    ],
  },
];

const K8S_RESOURCES = [
  { kind: "Deployment", name: "mind-frontend", status: "1/1 Running", icon: "⚛️" },
  { kind: "Deployment", name: "mind-backend", status: "1/1 Running", icon: "🔧" },
  { kind: "Deployment", name: "postgres", status: "1/1 Running", icon: "🗄️" },
  { kind: "Service", name: "mind-frontend-service", port: "NodePort:30080", icon: "🌐" },
  { kind: "Service", name: "backend-service", port: "ClusterIP:8080", icon: "🔌" },
  { kind: "Service", name: "postgres", port: "ClusterIP:5432", icon: "🔌" },
  { kind: "PVC", name: "postgres-pvc", status: "Bound / 1Gi", icon: "💾" },
  { kind: "Secret", name: "postgres-secret", status: "Configured", icon: "🔐" },
];

const EVIDENCE = [
  { title: "GitHub Repository", img: "screenshots/github-repo.png", proof: "Source code, Jenkinsfile, Kubernetes manifests, docs, and workflow." },
  { title: "Jenkins Dashboard", img: "screenshots/jenkins-dashboard.png", proof: "Jenkins CI is available and running the project pipeline." },
  { title: "Build #8 Success", img: "screenshots/jenkins-build-8-success.png", proof: "Final successful pipeline after Gitleaks and SonarQube integration." },
  { title: "Gitleaks Console", img: "screenshots/jenkins-gitleaks-console.png", proof: "Secret scanning completed with no leaks found." },
  { title: "SonarQube Scan", img: "screenshots/jenkins-sonarqube-console.png", proof: "Jenkins executed the SonarQube code analysis stage." },
  { title: "SonarQube Dashboard", img: "screenshots/sonarqube-dashboard.png", proof: "DEPI MIND App project created and quality gate passed." },
  { title: "Trivy Console", img: "screenshots/jenkins-trivy-console.png", proof: "Container vulnerability scan output is visible in Jenkins." },
  { title: "DockerHub Backend", img: "screenshots/dockerhub-backend.png", proof: "Backend image published to DockerHub." },
  { title: "DockerHub Frontend", img: "screenshots/dockerhub-frontend.png", proof: "Frontend image published to DockerHub." },
  { title: "K3s Pods", img: "screenshots/k3s-pods.png", proof: "Kubernetes workloads and services are running." },
  { title: "MIND App Running", img: "screenshots/mind-app.png", proof: "The app is reachable from the public NodePort." },
  { title: "API Health", img: "screenshots/api-health.png", proof: "Backend API health endpoint returns OK." },
  { title: "ArgoCD Synced", img: "screenshots/argocd-synced.png", proof: "GitOps application is Synced and Healthy." },
  { title: "ArgoCD Self-Heal", img: "screenshots/argocd-self-heal.png", proof: "ArgoCD restored the frontend after manual drift." },
];

const DEMO_FLOW = [
  ["Open GitHub Repository", "Show source code, Jenkinsfile, Dockerfiles, Kubernetes manifests, and docs."],
  ["Open Jenkins", "Show the pipeline job and the final successful build."],
  ["Show Gitleaks", "Explain the pre-build secret scan and no-leaks result."],
  ["Show SonarQube", "Show static analysis and quality gate passed."],
  ["Show Trivy", "Show container image vulnerability scan in report-only mode."],
  ["Show DockerHub", "Open backend and frontend repositories and image tags."],
  ["Show K3s", "Show pods, services, namespace, and PVC resources."],
  ["Show ArgoCD", "Explain Synced/Healthy and Git as the source of truth."],
  ["Show Self-Healing", "Explain scaling frontend to zero and ArgoCD restoring it."],
  ["Open Live App", "Login with demo user and show API health endpoint."],
];

const ROADMAP = [
  ["HTTPS / Ingress", "Add Nginx Ingress or Traefik with cert-manager and Let's Encrypt."],
  ["Private Networking", "Restrict public exposure and allow only required ports."],
  ["Secrets Manager", "Move production secrets to Vault, AWS Secrets Manager, or sealed secrets."],
  ["Blocking Gates", "Fail pipeline on leaked secrets and unaccepted HIGH/CRITICAL CVEs."],
  ["Monitoring", "Add Prometheus, Grafana, uptime checks, and alerting."],
  ["Logging", "Centralize logs with Loki/ELK and retention policy."],
  ["Backups", "Automate PostgreSQL PVC backup and restore testing."],
  ["Image Signing", "Sign images with Cosign and verify admission policy."],
  ["EKS / Multi-node", "Move from single-node K3s to multi-node Kubernetes for HA."],
];

const QA = [
  {
    q: "What is the project goal?",
    a: "To implement a complete DevSecOps pipeline — from a developer git push to a live Kubernetes deployment — with automated secret scanning, code quality analysis, container vulnerability scanning, GitOps sync, and self-healing validation.",
  },
  {
    q: "Why Jenkins?",
    a: "Jenkins gives full control over the CI/CD process, secure credential injection, and clear visibility for each stage: checkout, scans, builds, image publishing, and logout.",
  },
  {
    q: "Why Gitleaks?",
    a: "A single accidentally committed token can expose the whole system. Gitleaks scans before the build starts and confirms the repository is clean.",
  },
  {
    q: "Why SonarQube?",
    a: "SonarQube adds static code quality and maintainability checks so code problems are visible during CI, not after deployment.",
  },
  {
    q: "Why Trivy in report-only mode?",
    a: "For the demo, the goal is to prove vulnerability scanning is integrated. In production, the same stage should fail on unaccepted HIGH or CRITICAL vulnerabilities.",
  },
  {
    q: "Why K3s instead of full Kubernetes?",
    a: "K3s is lightweight and cost-effective for an EC2 lab, but still demonstrates real Kubernetes concepts: deployments, services, namespaces, PVCs, and GitOps.",
  },
  {
    q: "How does ArgoCD self-healing work?",
    a: "ArgoCD continuously compares Git desired state with the live cluster. When the frontend was scaled to zero replicas, ArgoCD detected drift and restored it automatically.",
  },
  {
    q: "What should be improved for production?",
    a: "Add TLS, ingress, managed secrets, centralized monitoring/logging, backups, image signing, stricter security gates, and a multi-node Kubernetes platform.",
  },
];

function NavBar({ activeSection, onNav }) {
  const sections = ["Overview", "Architecture", "Pipeline", "Security", "Kubernetes", "Evidence", "Demo", "Q&A"];
  return (
    <nav className="nav">
      <button className="brand" onClick={() => onNav("Overview")}>
        <span>🚀</span>
        <strong>DEPI DevSecOps</strong>
      </button>
      <div className="navLinks">
        {sections.map((s) => (
          <button key={s} onClick={() => onNav(s)} className={activeSection === s ? "active" : ""}>
            {s}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Tag({ children, color = "#63b3ed" }) {
  return <span className="tag" style={{ "--tag-color": color }}>{children}</span>;
}

function Card({ children, className = "", style = {}, glow }) {
  return (
    <div className={`card ${className}`} style={{ "--glow": glow || "rgba(99,179,237,.18)", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="sectionTitle">
      <h2>{children}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function HeroSection() {
  return (
    <section id="overview" className="hero section">
      <div className="heroGlow one" />
      <div className="heroGlow two" />

      <div className="heroInner">
        <Tag>DEPI DevSecOps Project</Tag>
        <h1>
          <span>MIND Notes App</span>
          <strong>Full DevSecOps Pipeline</strong>
        </h1>
        <p>
          From a developer git push to a live, self-healing Kubernetes deployment —
          with automated secret scanning, code quality gates, container vulnerability scanning,
          GitOps sync, and visual evidence for every stage.
        </p>

        <div className="flowBadges">
          {["GitHub", "→", "Jenkins", "→", "Gitleaks", "→", "SonarQube", "→", "Docker", "→", "Trivy", "→", "DockerHub", "→", "ArgoCD", "→", "K3s"].map((item, i) => (
            <span key={i} className={item === "→" ? "arrow" : ""}>{item}</span>
          ))}
        </div>

        <div className="ctaRow">
          <a className="primaryBtn" href={LINKS.app} target="_blank" rel="noopener noreferrer">🚀 Live App</a>
          <a href={LINKS.jenkins} target="_blank" rel="noopener noreferrer">⚙️ Jenkins</a>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">📂 GitHub</a>
          <a href={LINKS.docs} target="_blank" rel="noopener noreferrer">📚 Docs</a>
        </div>

        <div className="statusRow">
          {[
            ["Pipeline: Active", "#10b981"],
            ["App: Live", "#10b981"],
            ["ArgoCD: Synced", "#3b82f6"],
            ["Gitleaks: Clean", "#10b981"],
            ["SonarQube: Passed", "#3b82f6"],
          ].map(([label, color]) => (
            <span key={label} style={{ "--status": color }}><i />{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section id="architecture" className="section">
      <div className="wrap">
        <SectionTitle sub="Two AWS EC2 servers power the entire platform">Infrastructure Architecture</SectionTitle>

        <div className="ec2Grid">
          {EC2_SERVERS.map((server) => (
            <Card key={server.name} glow={server.color}>
              <div className="ec2Head">
                <div className="ec2Icon" style={{ "--ec2": server.color }}>{server.icon}</div>
                <div>
                  <h3>{server.name}</h3>
                  <code>{server.hostname}</code>
                  <p>{server.summary}</p>
                </div>
              </div>

              <div className="serviceList">
                {server.services.map((svc) => (
                  <div key={svc.name}>
                    <span><b>{svc.icon}</b>{svc.name}</span>
                    <code style={{ color: server.color }}>{svc.port}</code>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="bridgeCard">
          <div className="bridgeIcon">🐳</div>
          <h3>DockerHub Registry — The Bridge</h3>
          <p>Jenkins on EC2 #1 builds and pushes images. K3s on EC2 #2 pulls and runs them. DockerHub is the shared image store between CI and runtime.</p>
          <div className="linkPills">
            <a href={LINKS.dockerBackend} target="_blank" rel="noopener noreferrer">fadyy2k/mind-backend</a>
            <a href={LINKS.dockerFrontend} target="_blank" rel="noopener noreferrer">fadyy2k/mind-frontend</a>
          </div>
        </Card>
      </div>
    </section>
  );
}

function PipelineSection() {
  const [active, setActive] = useState(null);

  return (
    <section id="pipeline" className="section sectionAlt">
      <div className="wrap">
        <SectionTitle sub="10 automated stages — from git push to live deployment">CI/CD Pipeline</SectionTitle>

        <div className="pipelineGrid">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.id}
              onMouseEnter={() => setActive(stage.id)}
              onMouseLeave={() => setActive(null)}
              className="pipelineCard"
              style={{
                "--stage": stage.color,
                background: active === stage.id ? `${stage.color}18` : "rgba(10,15,35,0.6)",
                borderColor: active === stage.id ? `${stage.color}77` : "rgba(255,255,255,0.08)",
              }}
            >
              <span className="stageLabel">Stage {stage.id}</span>
              <div className="stageIcon">{stage.icon}</div>
              <h3>{stage.label}</h3>
              <p>{stage.desc}</p>
              {stage.result && <strong>{stage.result}</strong>}
            </div>
          ))}
        </div>

        <p className="centerNote">Every stage runs automatically on every Git push.</p>
      </div>
    </section>
  );
}

function SecuritySection() {
  const tools = [
    {
      name: "Gitleaks", icon: "🔍", color: "#ef4444",
      what: "Secret / credential scanner",
      why: "Prevents accidental token/key exposure in source code",
      result: "No leaks found",
      status: "PASSED",
      mode: "Pre-build scan",
    },
    {
      name: "SonarQube", icon: "📊", color: "#3b82f6",
      what: "Static code analysis platform",
      why: "Catches bugs, vulnerabilities, and code smells on every commit",
      result: "Quality gate passed",
      status: "PASSED",
      mode: "Pre-build analysis",
    },
    {
      name: "Trivy", icon: "🛡️", color: "#8b5cf6",
      what: "Container image vulnerability scanner",
      why: "Detects CVEs in Docker image layers before deployment",
      result: "Images scanned — report shown",
      status: "REPORT-ONLY",
      mode: "Pre-push scan",
    },
  ];

  return (
    <section id="security" className="section">
      <div className="wrap narrow">
        <SectionTitle sub="Security integrated at every pipeline stage — not added at the end">DevSecOps Security Gates</SectionTitle>

        <div className="securityStack">
          {tools.map((tool) => (
            <Card key={tool.name} glow={tool.color}>
              <div className="securityItem">
                <div className="securityIcon" style={{ "--sec": tool.color }}>{tool.icon}</div>
                <div>
                  <div className="toolLine">
                    <h3>{tool.name}</h3>
                    <Tag color={tool.color}>{tool.mode}</Tag>
                    <span className={tool.status === "PASSED" ? "passed" : "report"}>{tool.status}</span>
                  </div>
                  <p><b>What:</b> {tool.what}</p>
                  <p><b>Why:</b> {tool.why}</p>
                  <strong style={{ color: tool.color }}>Result: {tool.result}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="warningCard">
          <strong>⚠️ Secrets Policy</strong>
          <p>No passwords, tokens, SSH keys, AWS credentials, or cloud secrets are stored in this repository, documentation, or showcase app. All credentials are stored in Jenkins Credentials Manager and injected at runtime only.</p>
        </Card>
      </div>
    </section>
  );
}

function KubernetesSection() {
  return (
    <section id="kubernetes" className="section sectionAlt">
      <div className="wrap">
        <SectionTitle sub="K3s cluster running on EC2 #2 — GitOps managed by ArgoCD">Kubernetes Deployment</SectionTitle>

        <div className="kpiGrid">
          {[
            ["✅", "Synced", "ArgoCD Status", "#10b981"],
            ["💚", "Healthy", "App Health", "#10b981"],
            ["🔄", "Proven", "Self-Healing", "#3b82f6"],
            ["☸️", "mind", "Namespace", "#9f7aea"],
            ["🟢", "3 / 3", "Pods Running", "#10b981"],
            ["💾", "Bound", "PVC", "#10b981"],
          ].map(([icon, value, label, color]) => (
            <Card key={label} className="kpi">
              <span>{icon}</span>
              <strong style={{ color }}>{value}</strong>
              <p>{label}</p>
            </Card>
          ))}
        </div>

        <Card>
          <h3>Kubernetes Resources — namespace: <code>mind</code></h3>
          <div className="resourceList">
            {K8S_RESOURCES.map((r) => (
              <div key={r.name}>
                <span><b>{r.icon}</b><strong>{r.name}</strong><small>{r.kind}</small></span>
                <code>{r.status || r.port}</code>
              </div>
            ))}
          </div>
        </Card>

        <Card className="selfHeal">
          <h3>🔄 Self-Healing Test — Proven</h3>
          <pre>$ kubectl scale deployment mind-frontend -n mind --replicas=0</pre>
          <ol>
            <li><span>Frontend pod terminated immediately</span></li>
            <li><span>ArgoCD detected drift — cluster state did not match Git</span></li>
            <li><span>ArgoCD restored deployment to 1 replica in about 90 seconds</span></li>
            <li><span>Frontend returned to 1/1 Running</span></li>
            <li><span>ArgoCD returned to Synced + Healthy</span></li>
          </ol>
        </Card>
      </div>
    </section>
  );
}

function EvidenceSection() {
  return (
    <section id="evidence" className="section">
      <div className="wrap">
        <SectionTitle sub="Real screenshots proving every stage of the project">Evidence Gallery</SectionTitle>

        <div className="evidenceGrid">
          {EVIDENCE.map((item) => (
            <a key={item.title} className="evidenceCard" href={`${DOCS_BASE}${item.img}`} target="_blank" rel="noopener noreferrer">
              <img src={`${DOCS_BASE}${item.img}`} alt={item.title} loading="lazy" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.proof}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoFlowSection() {
  return (
    <section id="demo" className="section sectionAlt">
      <div className="wrap">
        <SectionTitle sub="A clear path to present the project confidently">Live Demo Flow</SectionTitle>

        <div className="demoTimeline">
          {DEMO_FLOW.map(([title, desc], index) => (
            <div key={title} className="demoStep">
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="scriptCard">
          <h3>One-minute explanation</h3>
          <p>
            “This project demonstrates a complete DevSecOps delivery pipeline. Jenkins pulls the code from GitHub, scans it with Gitleaks and SonarQube, builds Docker images, scans them with Trivy, pushes them to DockerHub, then ArgoCD deploys the desired state into a K3s Kubernetes cluster. I also proved GitOps self-healing by manually breaking the frontend deployment and letting ArgoCD restore it automatically.”
          </p>
        </Card>
      </div>
    </section>
  );
}

function RoadmapSection() {
  return (
    <section id="roadmap" className="section">
      <div className="wrap">
        <SectionTitle sub="What I would add before moving from lab/demo to production">Production Upgrade Roadmap</SectionTitle>

        <div className="roadmapGrid">
          {ROADMAP.map(([title, desc]) => (
            <Card key={title} className="roadmapCard">
              <h3>{title}</h3>
              <p>{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function QASection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="qa" className="section sectionAlt">
      <div className="wrap narrow">
        <SectionTitle sub="Questions a professor or evaluator is likely to ask — with complete answers">Professor Q&A</SectionTitle>

        <div className="qaStack">
          {QA.map((item, i) => (
            <div key={item.q} onClick={() => setOpen(open === i ? null : i)} className={open === i ? "qa open" : "qa"}>
              <div>
                <strong>Q{i + 1}: {item.q}</strong>
                <span>{open === i ? "▲" : "▼"}</span>
              </div>
              {open === i && <p>{item.a}</p>}
            </div>
          ))}
        </div>

        <Card className="resourcesCard">
          <h3>All Live Resources</h3>
          <div className="resourceLinks">
            {[
              ["MIND App", LINKS.app, "#10b981"],
              ["API Health", LINKS.health, "#10b981"],
              ["Jenkins", LINKS.jenkins, "#d24939"],
              ["ArgoCD", LINKS.argocd, "#ef7b4d"],
              ["SonarQube", LINKS.sonarqube, "#3b82f6"],
              ["DockerHub Backend", LINKS.dockerBackend, "#06b6d4"],
              ["DockerHub Frontend", LINKS.dockerFrontend, "#06b6d4"],
              ["GitHub Repo", LINKS.github, "#9f7aea"],
              ["Documentation", LINKS.docs, "#9f7aea"],
            ].map(([label, url, color]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{ "--link": color }}>
                {label} ↗
              </a>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("Overview");

  const sectionMap = useMemo(() => ({
    Overview: "overview",
    Architecture: "architecture",
    Pipeline: "pipeline",
    Security: "security",
    Kubernetes: "kubernetes",
    Evidence: "evidence",
    Demo: "demo",
    "Q&A": "qa",
  }), []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(sectionMap[id]);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);

    const onScroll = () => {
      const current = Object.entries(sectionMap)
        .map(([name, id]) => [name, document.getElementById(id)])
        .filter(([, el]) => el)
        .sort((a, b) => Math.abs(a[1].getBoundingClientRect().top - 80) - Math.abs(b[1].getBoundingClientRect().top - 80))[0];
      if (current) setActiveSection(current[0]);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.head.removeChild(link);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sectionMap]);

  return (
    <div className="app">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #020714; }
        a { color: inherit; }
        .app {
          min-height: 100vh;
          background:
            linear-gradient(rgba(99,179,237,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,.035) 1px, transparent 1px),
            radial-gradient(circle at 20% 0%, rgba(59,130,246,.13), transparent 38rem),
            radial-gradient(circle at 80% 10%, rgba(139,92,246,.12), transparent 36rem),
            linear-gradient(160deg, #020714 0%, #050c1e 45%, #080d24 100%);
          background-size: 48px 48px, 48px 48px, auto, auto, auto;
          color: #fff;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow-x: hidden;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        section { scroll-margin-top: 70px; }
        .section { padding: 6rem 2rem; position: relative; }
        .sectionAlt { background: rgba(5,10,25,.55); }
        .wrap { max-width: 1120px; margin: 0 auto; }
        .narrow { max-width: 920px; }
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 60px; padding: 0 2rem;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(5,8,20,.82); backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(99,179,237,.14);
        }
        .brand {
          display: flex; align-items: center; gap: .55rem; border: 0; background: transparent;
          color: #63b3ed; cursor: pointer; font: inherit; font-weight: 800; letter-spacing: .02em;
        }
        .brand span { font-size: 1.35rem; }
        .navLinks { display: flex; gap: .25rem; }
        .navLinks button {
          background: transparent; border: 1px solid transparent; color: rgba(255,255,255,.5);
          padding: .38rem .82rem; border-radius: 8px; cursor: pointer; font: inherit; font-size: .8rem; font-weight: 700;
          transition: .2s ease;
        }
        .navLinks button:hover, .navLinks button.active {
          background: rgba(99,179,237,.15); border-color: rgba(99,179,237,.35); color: #63b3ed;
        }
        .tag {
          display: inline-block; padding: .16rem .65rem; border-radius: 999px;
          background: color-mix(in srgb, var(--tag-color) 16%, transparent);
          border: 1px solid color-mix(in srgb, var(--tag-color) 35%, transparent);
          color: var(--tag-color); font-size: .72rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase;
        }
        .card {
          background: rgba(10,15,35,.72);
          border: 1px solid rgba(99,179,237,.13);
          border-radius: 18px;
          padding: 1.5rem;
          backdrop-filter: blur(14px);
          box-shadow: 0 6px 34px rgba(0,0,0,.34), 0 0 50px color-mix(in srgb, var(--glow) 17%, transparent);
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }
        .card:hover { transform: translateY(-3px); border-color: rgba(99,179,237,.28); }
        .sectionTitle { text-align: center; margin-bottom: 3rem; }
        .sectionTitle h2 {
          font-size: clamp(2rem, 4.2vw, 3rem); font-weight: 900; letter-spacing: -.03em;
          background: linear-gradient(135deg, #63b3ed 0%, #9f7aea 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          margin-bottom: .8rem;
        }
        .sectionTitle p { color: rgba(255,255,255,.55); font-size: 1rem; }
        .hero {
          min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;
          text-align: center; padding-top: 7rem;
        }
        .heroGlow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(4px); }
        .heroGlow.one { top: 18%; left: 8%; width: 420px; height: 420px; background: radial-gradient(circle, rgba(59,130,246,.16), transparent 70%); animation: float 7s ease-in-out infinite; }
        .heroGlow.two { right: 9%; bottom: 18%; width: 380px; height: 380px; background: radial-gradient(circle, rgba(139,92,246,.14), transparent 70%); animation: float 8s ease-in-out infinite reverse; }
        .heroInner { position: relative; z-index: 1; max-width: 980px; }
        .hero h1 { margin: 1.4rem 0 1rem; font-size: clamp(3rem, 7.5vw, 6rem); line-height: 1.02; letter-spacing: -.045em; font-weight: 950; }
        .hero h1 span { display: block; color: #fff; }
        .hero h1 strong {
          display: block;
          background: linear-gradient(135deg, #63b3ed 0%, #9f7aea 55%, #ed64a6 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .hero p { max-width: 720px; margin: 0 auto 2.5rem; color: rgba(255,255,255,.62); font-size: 1.14rem; line-height: 1.75; }
        .flowBadges { display: flex; flex-wrap: wrap; gap: .55rem; justify-content: center; margin-bottom: 3rem; }
        .flowBadges span:not(.arrow) {
          color: rgba(255,255,255,.85); background: rgba(99,179,237,.08);
          border: 1px solid rgba(99,179,237,.22); padding: .34rem .75rem; border-radius: 8px; font-size: .84rem; font-weight: 800;
        }
        .flowBadges .arrow { color: rgba(255,255,255,.28); padding-top: .32rem; }
        .ctaRow, .statusRow { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .ctaRow a {
          display: flex; align-items: center; gap: .45rem; padding: .72rem 1.55rem; border-radius: 12px;
          background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.14);
          color: #fff; text-decoration: none; font-weight: 800; font-size: .92rem;
        }
        .ctaRow .primaryBtn { background: linear-gradient(135deg, #3b82f6, #8b5cf6); border: 0; box-shadow: 0 12px 36px rgba(59,130,246,.28); }
        .statusRow { margin-top: 2.5rem; gap: .75rem; }
        .statusRow span {
          display: flex; align-items: center; gap: .45rem; padding: .34rem .9rem; border-radius: 999px;
          color: var(--status); background: color-mix(in srgb, var(--status) 11%, transparent);
          border: 1px solid color-mix(in srgb, var(--status) 28%, transparent);
          font-size: .78rem; font-weight: 800;
        }
        .statusRow i { width: 6px; height: 6px; border-radius: 50%; background: var(--status); animation: pulse 2s infinite; }
        .ec2Grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .ec2Head { display: flex; gap: .85rem; align-items: flex-start; margin-bottom: 1.25rem; }
        .ec2Icon {
          width: 52px; height: 52px; border-radius: 14px; background: color-mix(in srgb, var(--ec2) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--ec2) 36%, transparent);
          display: grid; place-items: center; font-size: 1.5rem; flex-shrink: 0;
        }
        .ec2Head h3 { color: #fff; font-size: 1.02rem; margin-bottom: .2rem; }
        code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: rgba(255,255,255,.06); padding: .1rem .35rem; border-radius: 5px; }
        .ec2Head code { color: #63b3ed; font-size: .78rem; background: transparent; padding: 0; }
        .ec2Head p, .bridgeCard p { color: rgba(255,255,255,.54); font-size: .86rem; line-height: 1.55; margin-top: .4rem; }
        .serviceList, .resourceList { display: flex; flex-direction: column; gap: .55rem; }
        .serviceList div, .resourceList div {
          display: flex; justify-content: space-between; align-items: center; gap: .8rem; flex-wrap: wrap;
          padding: .62rem .82rem; border-radius: 10px; background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.065);
        }
        .serviceList span, .resourceList span { display: flex; align-items: center; gap: .55rem; color: rgba(255,255,255,.82); font-size: .86rem; }
        .bridgeCard { text-align: center; padding: 2rem; }
        .bridgeIcon { font-size: 1.7rem; margin-bottom: .8rem; }
        .bridgeCard h3, .scriptCard h3, .resourcesCard h3 { color: #fff; margin-bottom: .5rem; }
        .linkPills, .resourceLinks { display: flex; flex-wrap: wrap; gap: .8rem; justify-content: center; margin-top: 1rem; }
        .linkPills a, .resourceLinks a {
          color: #63b3ed; text-decoration: none; font-family: ui-monospace, monospace; font-size: .82rem;
          padding: .4rem .9rem; border-radius: 8px; background: rgba(99,179,237,.08); border: 1px solid rgba(99,179,237,.23);
        }
        .pipelineGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(238px, 1fr)); gap: 1.1rem; }
        .pipelineCard {
          position: relative; padding: 1.25rem; border: 1px solid; border-radius: 16px; min-height: 190px;
          transition: .25s ease; box-shadow: 0 6px 24px rgba(0,0,0,.25);
        }
        .pipelineCard:hover { transform: translateY(-5px); box-shadow: 0 0 30px color-mix(in srgb, var(--stage) 26%, transparent); }
        .stageLabel { position: absolute; top: -10px; left: 1rem; background: var(--stage); color: #fff; border-radius: 999px; padding: .16rem .55rem; font-size: .64rem; font-weight: 900; text-transform: uppercase; }
        .stageIcon { font-size: 1.8rem; margin: .35rem 0 .55rem; }
        .pipelineCard h3 { color: #fff; margin-bottom: .35rem; }
        .pipelineCard p, .timeline p, .roadmapCard p, .qa p { color: rgba(255,255,255,.55); font-size: .86rem; line-height: 1.55; }
        .pipelineCard strong { display: block; margin-top: .55rem; color: var(--stage); font-size: .8rem; }
        .centerNote { text-align: center; margin-top: 2rem; color: rgba(255,255,255,.34); }
        .securityStack { display: flex; flex-direction: column; gap: 1.4rem; }
        .securityItem { display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap; }
        .securityIcon { width: 58px; height: 58px; border-radius: 16px; flex-shrink: 0; display: grid; place-items: center; font-size: 1.6rem; background: color-mix(in srgb, var(--sec) 16%, transparent); border: 1px solid color-mix(in srgb, var(--sec) 35%, transparent); }
        .toolLine { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; margin-bottom: .6rem; }
        .toolLine h3 { color: #fff; font-size: 1.1rem; }
        .passed, .report { border-radius: 999px; font-size: .7rem; font-weight: 900; padding: .22rem .72rem; }
        .passed { color: #10b981; background: rgba(16,185,129,.13); border: 1px solid rgba(16,185,129,.32); }
        .report { color: #f59e0b; background: rgba(245,158,11,.13); border: 1px solid rgba(245,158,11,.32); }
        .securityItem p { color: rgba(255,255,255,.60); font-size: .86rem; margin-bottom: .42rem; }
        .warningCard { margin-top: 1.5rem; border-color: rgba(239,68,68,.28); background: rgba(239,68,68,.055); }
        .warningCard strong { color: #ef4444; display: block; margin-bottom: .45rem; }
        .warningCard p { color: rgba(255,255,255,.58); line-height: 1.6; font-size: .88rem; }
        .kpiGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .kpi { text-align: center; padding: 1.25rem; }
        .kpi span { display: block; font-size: 1.45rem; margin-bottom: .35rem; }
        .kpi strong { display: block; font-size: 1.35rem; }
        .kpi p { color: rgba(255,255,255,.4); font-size: .76rem; margin-top: .25rem; }
        .resourceList { margin-top: 1rem; }
        .resourceList span { display: grid; grid-template-columns: 24px 1fr; column-gap: .55rem; }
        .resourceList small { grid-column: 2; color: rgba(255,255,255,.35); font-size: .7rem; }
        .resourceList code { color: #10b981; background: transparent; }
        .selfHeal { margin-top: 1.5rem; border-color: rgba(16,185,129,.25); }
        .selfHeal h3 { color: #10b981; margin-bottom: .8rem; }
        .selfHeal pre { overflow:auto; padding: .9rem; border-radius: 10px; background: rgba(0,0,0,.38); color: #63b3ed; border: 1px solid rgba(99,179,237,.14); margin-bottom: 1rem; }
        .selfHeal ol { list-style: none; display: grid; gap: .55rem; }
        .selfHeal li { color: rgba(255,255,255,.65); font-size: .86rem; }
        .selfHeal li::before { content: counter(list-item); display: inline-grid; place-items: center; width: 20px; height: 20px; margin-right: .5rem; border-radius: 6px; background: rgba(99,179,237,.18); color: #63b3ed; font-size: .7rem; font-weight: 900; }
        .evidenceGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(245px, 1fr)); gap: 1rem; }
        .evidenceCard {
          display: block; overflow: hidden; text-decoration: none; border-radius: 18px;
          background: rgba(10,15,35,.72); border: 1px solid rgba(99,179,237,.13);
          box-shadow: 0 6px 28px rgba(0,0,0,.30); transition: .25s ease;
        }
        .evidenceCard:hover { transform: translateY(-5px); border-color: rgba(99,179,237,.36); box-shadow: 0 0 34px rgba(99,179,237,.14); }
        .evidenceCard img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; background: #020714; border-bottom: 1px solid rgba(99,179,237,.12); }
        .evidenceCard div { padding: .95rem; }
        .evidenceCard h3 { color: #fff; font-size: .94rem; margin-bottom: .35rem; }
        .evidenceCard p { color: rgba(255,255,255,.5); font-size: .78rem; line-height: 1.5; }
        .demoTimeline { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
        .demoStep {
          display: grid; grid-template-columns: 48px 1fr; gap: 1rem; align-items: start; padding: 1rem;
          border-radius: 16px; background: rgba(10,15,35,.72); border: 1px solid rgba(99,179,237,.13);
        }
        .demoStep b { width: 42px; height: 42px; border-radius: 14px; background: linear-gradient(135deg,#3b82f6,#8b5cf6); display: grid; place-items: center; color: #fff; }
        .demoStep h3 { color: #fff; margin-bottom: .35rem; font-size: .96rem; }
        .scriptCard { margin-top: 1.5rem; border-color: rgba(139,92,246,.26); }
        .scriptCard p { color: rgba(255,255,255,.62); line-height: 1.75; font-size: .92rem; }
        .roadmapGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; }
        .roadmapCard h3 { color: #fff; margin-bottom: .55rem; font-size: .96rem; }
        .qaStack { display: flex; flex-direction: column; gap: .8rem; }
        .qa { cursor: pointer; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: rgba(10,15,35,.65); overflow: hidden; transition: .2s ease; }
        .qa.open { border-color: rgba(99,179,237,.34); background: rgba(99,179,237,.08); }
        .qa > div { display: flex; justify-content: space-between; gap: 1rem; padding: 1rem 1.2rem; color: rgba(255,255,255,.86); }
        .qa.open > div { color: #63b3ed; }
        .qa p { padding: 0 1.2rem 1rem; border-top: 1px solid rgba(99,179,237,.15); padding-top: .9rem; }
        .resourcesCard { margin-top: 2.5rem; text-align: center; }
        .resourceLinks a { color: var(--link); background: color-mix(in srgb, var(--link) 12%, transparent); border-color: color-mix(in srgb, var(--link) 28%, transparent); }
        footer { text-align: center; padding: 3rem 2rem; border-top: 1px solid rgba(99,179,237,.08); color: rgba(255,255,255,.28); font-size: .82rem; }
        @media (max-width: 860px) {
          .nav { padding: 0 1rem; }
          .navLinks { max-width: 65vw; overflow-x: auto; scrollbar-width: none; }
          .navLinks::-webkit-scrollbar { display: none; }
          .section { padding: 4rem 1rem; }
          .hero h1 { font-size: clamp(2.4rem, 12vw, 4rem); }
          .hero p { font-size: 1rem; }
          .flowBadges .arrow { display: none; }
          .ec2Grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <NavBar activeSection={activeSection} onNav={scrollTo} />
      <HeroSection />
      <ArchitectureSection />
      <PipelineSection />
      <SecuritySection />
      <KubernetesSection />
      <EvidenceSection />
      <DemoFlowSection />
      <RoadmapSection />
      <QASection />

      <footer>
        DEPI DevSecOps Project — MIND Notes App | GitHub → Jenkins → Gitleaks → SonarQube → Docker → Trivy → DockerHub → ArgoCD → K3s
      </footer>
    </div>
  );
}
