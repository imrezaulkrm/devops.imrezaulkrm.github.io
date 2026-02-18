/* ─── CANVAS BG ─── */
const C = document.getElementById("bgCanvas"),
  cx = C.getContext("2d");
function rz() {
  C.width = innerWidth;
  C.height = innerHeight;
}
rz();
addEventListener("resize", rz);
class P {
  constructor() {
    this.r();
  }
  r() {
    this.x = Math.random() * C.width;
    this.y = Math.random() * C.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.s = Math.random() * 1.5 + 0.3;
    this.tw = Math.random() * Math.PI * 2;
    this.a = Math.random() * 0.5 + 0.1;
  }
  tick() {
    this.tw += 0.015;
    this.ca = this.a * (0.5 + 0.5 * Math.sin(this.tw));
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > C.width) this.vx *= -1;
    if (this.y < 0 || this.y > C.height) this.vy *= -1;
  }
  draw() {
    cx.beginPath();
    cx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
    cx.fillStyle = `rgba(16,185,129,${this.ca})`;
    cx.fill();
  }
}
const pts = Array.from({ length: 70 }, () => new P());
function frame() {
  cx.clearRect(0, 0, C.width, C.height);
  pts.forEach(p => {
    p.tick();
    p.draw();
  });
  pts.forEach((a, i) =>
    pts.slice(i + 1).forEach(b => {
      const dx = a.x - b.x,
        dy = a.y - b.y,
        d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) {
        cx.beginPath();
        cx.moveTo(a.x, a.y);
        cx.lineTo(b.x, b.y);
        cx.strokeStyle = `rgba(16,185,129,${0.12 * (1 - d / 130)})`;
        cx.lineWidth = 0.7;
        cx.stroke();
      }
    })
  );
  requestAnimationFrame(frame);
}
frame();

/* ─── NAV ─── */
const nav = document.getElementById("nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 80));

/* ─── TERMINAL ─── */
const term = document.getElementById("terminal");
const CMDS = [
  {
    cmd: "cat profile.json",
    lines: [
      "{",
      '  "name"    : "Md Rezaul Karim",',
      '  "role"    : "Cloud & DevOps Engineer",',
      '  "location": "Savar, Dhaka, BD",',
      '  "exp"     : "3+ years",',
      '  "stack"   : ["K8s","Docker","AWS","Terraform"],',
      "}"
    ]
  },
  {
    cmd: "kubectl get pods -n production",
    lines: [
      "NAME                     READY  STATUS   AGE",
      "─────────────────────────────────────────────",
      "web-deploy-7d8f9c        3/3    Running  45d",
      "api-service-6b7c8d       2/2    Running  30d",
      "worker-5f6a7b            1/1    Running  15d"
    ]
  },
  {
    cmd: "terraform plan",
    lines: [
      "# Refreshing state...",
      "",
      "+ aws_instance.web_server",
      "+ aws_s3_bucket.static_assets",
      "+ aws_security_group.main",
      "",
      "Plan: 3 to add, 0 to change, 0 to destroy"
    ]
  },
  {
    cmd: 'docker ps --format "table {{.Names}}\\t{{.Status}}"',
    lines: [
      "CONTAINER          STATUS",
      "──────────────────────────────",
      "nginx              Up 2 hours",
      "postgres:14        Up 3 hours",
      "redis:alpine       Up 5 hours"
    ]
  },
  { cmd: "echo $MOTTO", lines: ['"Automate everything. Deploy fearlessly."'] }
];

function colorLine(txt) {
  if (txt.startsWith('  "'))
    return txt
      .replace(/("[\w\s]+")\s*:/, '<span class="tk">$1</span> :')
      .replace(/:\s*"([^"]+)"/, ': <span class="ts">"$1"</span>')
      .replace(/:\s*\[/, ": [")
      .replace(/"([^"]+)"/g, (m, v) => `<span class="ts">"${v}"</span>`);
  if (txt.startsWith("+")) return `<span class="tg">${txt}</span>`;
  if (txt.startsWith("#")) return `<span class="tr">${txt}</span>`;
  if (txt.startsWith("Plan:"))
    return `<span class="tw">Plan: </span><span class="tg">3 to add</span>, 0 to change, 0 to destroy`;
  if (txt.match(/Running/)) return txt.replace(/Running/, '<span class="tg">Running</span>');
  if (txt.match(/Up\s/)) return txt.replace(/(Up\s[\w\s]+)/g, '<span class="tg">$1</span>');
  if (txt.startsWith('"Automate')) return `<span class="tg">${txt}</span>`;
  if (txt.startsWith("NAME") || txt.startsWith("CONTAINER"))
    return `<span class="th">${txt}</span>`;
  if (txt.startsWith("─")) return `<span class="to">${txt}</span>`;
  return `<span class="tw">${txt}</span>`;
}

let ci = 0,
  chi = 0,
  cl = null,
  typing = false;
function typeNext() {
  if (ci >= CMDS.length) {
    setTimeout(() => {
      const ls = term.querySelectorAll(".t-line");
      if (ls.length > 18)
        Array.from(ls)
          .slice(0, ls.length - 12)
          .forEach(l => l.remove());
      ci = 0;
      setTimeout(typeNext, 1500);
    }, 3500);
    return;
  }
  const { cmd, lines } = CMDS[ci];
  if (!typing) {
    cl = document.createElement("div");
    cl.className = "t-line";
    cl.innerHTML = `<span class="tp">rezaul@devops</span><span class="tw">:</span><span class="tph">~</span><span class="tw">$ </span>`;
    const cs = document.createElement("span");
    cs.className = "tc";
    const cur = document.createElement("span");
    cur.className = "cursor";
    cl.appendChild(cs);
    cl.appendChild(cur);
    term.appendChild(cl);
    term.scrollTop = 9999;
    typing = true;
    chi = 0;
  }
  const cs = cl.querySelector(".tc"),
    cur = cl.querySelector(".cursor");
  if (chi < cmd.length) {
    cs.textContent += cmd[chi++];
    setTimeout(typeNext, 52);
  } else {
    cur.remove();
    let d = 250;
    lines.forEach(ln => {
      setTimeout(() => {
        const div = document.createElement("div");
        div.className = "t-line";
        div.innerHTML = colorLine(ln);
        term.appendChild(div);
        term.scrollTop = 9999;
      }, d);
      d += 100;
    });
    setTimeout(() => {
      ci++;
      typing = false;
      typeNext();
    }, d + 900);
  }
}
setTimeout(typeNext, 700);

/* ─── PROJECTS ─── */
const PROJS = [
  {
    n: "01",
    t: "Multi-Cloud CI/CD Pipeline",
    d: "Fully automated CI/CD pipeline using Jenkins and ArgoCD across AWS and GCP. Zero-downtime deployments with automated rollback and comprehensive testing.",
    tags: ["Jenkins", "ArgoCD", "Kubernetes", "AWS"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "02",
    t: "Infrastructure as Code Platform",
    d: "Comprehensive IaC with Terraform and Ansible for multi-environment infrastructure. Reusable modules reduced provisioning time from hours to minutes.",
    tags: ["Terraform", "Ansible", "AWS", "GitOps"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "03",
    t: "Monitoring & Observability Stack",
    d: "Full monitoring with Prometheus, Grafana and ELK. Custom SLI/SLO dashboards, automated alerting, and PagerDuty integration for incident management.",
    tags: ["Prometheus", "Grafana", "ELK", "Docker"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "04",
    t: "Kubernetes Cluster Autoscaler",
    d: "Custom autoscaling for AWS EKS. Reduced infrastructure costs by 40% while maintaining 99.99% uptime during peak traffic spikes.",
    tags: ["Kubernetes", "EKS", "HPA", "Go"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "05",
    t: "GitOps Deployment Framework",
    d: "End-to-end GitOps with FluxCD and ArgoCD. Declarative infrastructure management with full audit trail and automated drift detection.",
    tags: ["FluxCD", "ArgoCD", "Helm", "GitHub"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "06",
    t: "Secure VPN Infrastructure",
    d: "Enterprise VPN with WireGuard and automated certificate management. Zero-trust network architecture for secure remote access.",
    tags: ["WireGuard", "Terraform", "AWS VPC", "PKI"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "07",
    t: "Log Aggregation Pipeline",
    d: "Scalable pipeline using Fluentd, Kafka, and OpenSearch. Processing 10M+ events/day with real-time alerting and anomaly detection.",
    tags: ["Fluentd", "Kafka", "OpenSearch", "Python"],
    gh: "https://github.com/imrezaulkrm"
  },
  {
    n: "08",
    t: "Container Security Scanner",
    d: "Automated container vulnerability scanner in CI/CD pipelines. Blocks high-severity CVEs from production with detailed remediation reports.",
    tags: ["Trivy", "Docker", "Jenkins", "Python"],
    gh: "https://github.com/imrezaulkrm"
  }
];
const track = document.getElementById("projTrack");
[...PROJS, ...PROJS].forEach(p => {
  const c = document.createElement("div");
  c.className = "proj-card";
  c.innerHTML = `<div class="proj-num">PROJECT // ${p.n}</div><h3 class="proj-title">${p.t}</h3><p class="proj-desc">${p.d}</p><div class="proj-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div><a href="${p.gh}" target="_blank" class="proj-link">View on GitHub →</a>`;
  track.appendChild(c);
});

/* ─── PHOTO FOLDERS ─── */
const FOLDERS = [
  {
    id: "nature",
    imgs: [
      "img/nature/1.jpg",
      "img/nature/2.jpg",
      "img/nature/3.jpg",
      "img/nature/4.jpg",
      "img/nature/5.jpg"
    ]
  },
  {
    id: "urban",
    imgs: ["img/urban/1.jpg", "img/urban/2.jpg", "img/urban/3.jpg", "img/urban/4.jpg"]
  },
  {
    id: "landscape",
    imgs: ["img/landscape/1.jpg", "img/landscape/2.jpg", "img/landscape/3.jpg"]
  },
  {
    id: "golden",
    imgs: ["img/golden-hour/1.jpg", "img/golden-hour/2.jpg", "img/golden-hour/3.jpg"]
  },
  { id: "water", imgs: ["img/water/1.jpg", "img/water/2.jpg", "img/water/3.jpg"] },
  { id: "street", imgs: ["img/street/1.jpg", "img/street/2.jpg", "img/street/3.jpg"] }
];

FOLDERS.forEach(({ id, imgs }) => {
  const slide = document.getElementById(`fs-${id}`);
  const dotWrap = document.getElementById(`fd-${id}`);
  if (!slide) return;
  let cur = 0;
  const loadedImgs = [];
  imgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.className = "folder-slide-img" + (i === 0 ? " act" : "");
    img.src = src;
    img.alt = "Photo " + (i + 1);
    img.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.8s ease";
    if (i === 0) img.style.opacity = "1";
    img.onload = () => {
      loadedImgs.push(i);
      const ph = slide.querySelector(".folder-placeholder");
      if (ph) ph.style.display = "none";
    };
    slide.appendChild(img);
    const dot = document.createElement("div");
    dot.className = "fd" + (i === 0 ? " act" : "");
    dot.addEventListener("click", () => goTo(i));
    dotWrap.appendChild(dot);
  });
  function goTo(n) {
    const is = slide.querySelectorAll(".folder-slide-img"),
      ds = dotWrap.querySelectorAll(".fd");
    is.forEach((img, i) => (img.style.opacity = i === n ? "1" : "0"));
    ds.forEach((d, i) => d.classList.toggle("act", i === n));
    cur = n;
  }
  setInterval(() => goTo((cur + 1) % imgs.length), 3200 + Math.random() * 1500);
});

/* ─── SCROLL OBSERVER ─── */
const io = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("vis");
        // trigger skill bars
        e.target.querySelectorAll(".sk-fill").forEach((f, i) => {
          const s = parseFloat(f.style.getPropertyValue("--s") || ".7");
          f.style.transitionDelay = `${i * 0.1}s`;
          f.style.transform = `scaleX(${s})`;
        });
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".fadeup,.sk-card").forEach(el => io.observe(el));

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
  });
});
