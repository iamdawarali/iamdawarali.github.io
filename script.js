(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  const heroCanvas = document.getElementById('heroParticles');

  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  function initTheme() {
    const theme = getPreferredTheme();
    applyTheme(theme);
  }

  // Scroll reveal
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => io.observe(el));
    // Stagger indices
    document.querySelectorAll('[data-reveal-stagger] > *').forEach((el, idx) => el.style.setProperty('--i', idx));
  }

  // Active nav highlight
  function initActiveNav() {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const map = new Map(sections.map((s) => [s.id, navLinks.find((a) => a.getAttribute('href') === `#${s.id}`)]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  }

  // Hero particles
  function initParticles() {
    if (!heroCanvas) return;
    const ctx = heroCanvas.getContext('2d');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    function resize() {
      w = heroCanvas.clientWidth; h = heroCanvas.clientHeight;
      heroCanvas.width = w * DPR; heroCanvas.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.6 + h * 0.1,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.6 + 0.4,
      o: Math.random() * 0.5 + 0.2,
    }));
    function step() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < h * 0.1 || p.y > h * 0.9) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 164, 107, ${p.o})`;
        ctx.fill();
      });
      requestAnimationFrame(step);
    }
    step();
  }

  function toggleTheme() {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  async function loadProfile() {
    try {
      const res = await fetch('./data/profile.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load profile.json');
      return await res.json();
    } catch (_) {
      return window.PROFILE_FALLBACK || {};
    }
  }

  function groupSkillsIntoTabs(skills) {
    // Heuristic mapping to tabs similar to reference site's Frontend/Backend/Others
    const tabs = { cloud: {}, devops: {}, others: {} };
    if (!skills) return tabs;
    const cloudKeys = ['Cloud Platforms'];
    const devopsKeys = ['DevOps Tools'];
    const othersKeys = ['Scripting & Automation', 'Operating Systems', 'Networking & Security', 'Monitoring & Observability', 'Applications Administration', 'Soft Skills'];
    Object.entries(skills).forEach(([group, items]) => {
      const key = cloudKeys.includes(group) ? 'cloud' : devopsKeys.includes(group) ? 'devops' : 'others';
      tabs[key][group] = items;
    });
    return tabs;
  }

  function getSkillVisual(name) {
    const iconFiles = new Map([
      ['AWS', 'aws.svg'], ['GCP', 'gcp.svg'], ['Azure', 'azure.svg'],
      ['Jenkins', 'jenkins.svg'], ['GitHub Actions', 'github-actions.svg'], ['GitLab CI', 'gitlab.svg'], ['Argo CD', 'argo.svg'], ['Flux', 'flux.svg'],
      ['Docker', 'docker.svg'], ['Kubernetes', 'kubernetes.svg'], ['EKS', 'aws-eks.svg'], ['Helm', 'helm.svg'], ['Kustomize', 'kustomize.svg'],
      ['Terraform', 'terraform.svg'], ['CloudFormation', 'cloudformation.svg'], ['Ansible', 'ansible.svg'], ['Packer', 'packer.svg'],
      ['VPC', 'vpc.svg'], ['Transit Gateway', 'tgw.svg'], ['WAF', 'waf.svg'], ['Security Hub', 'security-hub.svg'], ['IAM', 'iam.svg'], ['SSO', 'sso.svg'], ['HashiCorp Vault', 'vault.svg'],
      ['CloudWatch', 'cloudwatch.svg'], ['Prometheus', 'prometheus.svg'], ['Grafana', 'grafana.svg'], ['Loki', 'loki.svg'], ['ELK', 'elk.svg'], ['New Relic', 'newrelic.svg'],
      ['SQS', 'sqs.svg'], ['SNS', 'sns.svg'], ['Kafka', 'kafka.svg'], ['RDS', 'rds.svg'], ['DynamoDB', 'dynamodb.svg'], ['ElastiCache', 'elasticache.svg'],
      ['Bash', 'bash.svg'], ['Python', 'python.svg'], ['Go (basics)', 'go.svg']
    ]);
    const emojis = new Map([
      ['AWS', '☁️'], ['GCP', '☁️'], ['Azure', '☁️'],
      ['Jenkins', '🤖'], ['GitHub Actions', '⚙️'], ['GitLab CI', '🦊'], ['Argo CD', '🚀'], ['Flux', '🔁'],
      ['Docker', '🐳'], ['Kubernetes', '⎈'], ['EKS', '⎈'], ['Helm', '⚓'], ['Kustomize', '🧩'],
      ['Terraform', '🟪'], ['CloudFormation', '🧱'], ['Ansible', '🅰️'], ['Packer', '📦'],
      ['VPC', '🌐'], ['Transit Gateway', '🧭'], ['WAF', '🛡️'], ['Security Hub', '🛡️'], ['IAM', '🪪'], ['SSO', '🔐'], ['HashiCorp Vault', '🔑'],
      ['CloudWatch', '🕒'], ['Prometheus', '🔥'], ['Grafana', '📈'], ['Loki', '🧿'], ['ELK', '🌳'], ['New Relic', '🧪'],
      ['SQS', '📬'], ['SNS', '📣'], ['Kafka', '🧵'], ['RDS', '🗄️'], ['DynamoDB', '🧊'], ['ElastiCache', '⚡'],
      ['Bash', '💻'], ['Python', '🐍'], ['Go (basics)', '🐹']
    ]);
    const file = iconFiles.get(name);
    // If icons folder or file not present, fall back to emoji gracefully
    if (file) return { type: 'icon', value: `./assets/icons/${file}` };
    return { type: 'emoji', value: emojis.get(name) || '🔧' };
  }

  function renderSkillsTabs(skills) {
    const tabsEl = document.getElementById('skillsTabs');
    const grid = document.getElementById('skillsGrid');
    const grouped = groupSkillsIntoTabs(skills);
    let active = 'cloud';
    function renderActive() {
      grid.innerHTML = '';
      const groups = grouped[active];
      Object.entries(groups).forEach(([group, items]) => {
        const card = document.createElement('div');
        card.className = 'card';
        const title = document.createElement('h3');
        title.textContent = group;
        const chips = document.createElement('div');
        chips.className = 'chips';
        items.forEach((skill) => {
          const chip = document.createElement('span');
          chip.className = 'chip';
          const visual = getSkillVisual(skill);
          if (visual.type === 'icon') {
            const img = document.createElement('img');
            img.className = 'icon';
            img.alt = `${skill} icon`;
            img.loading = 'lazy';
            img.src = visual.value;
            img.onerror = () => {
              img.remove();
              const span = document.createElement('span');
              span.className = 'icon-emoji';
              span.textContent = getSkillVisual(skill).value;
              chip.insertBefore(span, chip.firstChild);
            };
            chip.appendChild(img);
          } else {
            const span = document.createElement('span');
            span.className = 'icon-emoji';
            span.textContent = visual.value;
            chip.appendChild(span);
          }
          chip.appendChild(document.createTextNode(skill));
          chips.appendChild(chip);
        });
        card.append(title, chips);
        grid.appendChild(card);
      });
      grid.classList.add('cols-2');
    }
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      tabsEl.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.getAttribute('data-tab');
      renderActive();
    });
    renderActive();
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && typeof text === 'string' && text.trim().length) el.textContent = text;
  }

  function setLink(container, label, url, emoji) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = `${emoji} ${label}`;
    container.appendChild(a);
  }

  function renderSocials(contact) {
    const socials = document.getElementById('socialLinks');
    socials.innerHTML = '';
    if (!contact) return;
    if (contact.email) setLink(socials, 'Email', `mailto:${contact.email}`, '✉️');
    if (contact.linkedin) setLink(socials, 'LinkedIn', contact.linkedin, '💼');
    if (contact.github) setLink(socials, 'GitHub', contact.github, '🐱');
    if (contact.website) setLink(socials, 'Website', contact.website, '🌐');
  }

  function renderSkills(skills) {
    const grid = document.getElementById('skillsGrid');
    grid.classList.add('cols-2');
    grid.innerHTML = '';
    if (!skills) return;
    Object.entries(skills).forEach(([group, items]) => {
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = group;
      const chips = document.createElement('div');
      chips.className = 'chips';
      items.forEach((skill) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = skill;
        chips.appendChild(chip);
      });
      card.appendChild(title);
      card.appendChild(chips);
      grid.appendChild(card);
    });
  }

  function renderExperience(experience) {
    const list = document.getElementById('experienceList');
    list.innerHTML = '';
    (experience || []).forEach((job) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const title = document.createElement('h3');
      title.textContent = `${job.role} — ${job.company}`;
      const where = document.createElement('div');
      where.className = 'where';
      where.textContent = [job.location, job.period].filter(Boolean).join(' • ');
      item.appendChild(title);
      item.appendChild(where);
      if (Array.isArray(job.highlights) && job.highlights.length) {
        const ul = document.createElement('ul');
        job.highlights.forEach((h) => {
          const li = document.createElement('li');
          li.textContent = h;
          ul.appendChild(li);
        });
        item.appendChild(ul);
      }
      list.appendChild(item);
    });
  }

  function renderProjects(projects, activeCategory = 'all') {
    const grid = document.getElementById('projectsGrid');
    grid.classList.add('cols-3');
    grid.innerHTML = '';
    (projects || []).filter((p) => activeCategory === 'all' || p.category === activeCategory).forEach((p) => {
      const card = document.createElement('div');
      card.className = 'card';
      const h3 = document.createElement('h3');
      h3.textContent = p.name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = (p.period || '').toString();
      const desc = document.createElement('p');
      desc.textContent = p.description || '';
      const chips = document.createElement('div');
      chips.className = 'chips';
      (p.tech || []).forEach((t) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = t;
        chips.appendChild(chip);
      });
      const links = document.createElement('div');
      links.className = 'socials';
      if (p.repo) setLink(links, 'Code', p.repo, '🔗');
      if (p.demo) setLink(links, 'Live', p.demo, '🚀');
      card.append(h3, meta, desc, chips, links);
      grid.appendChild(card);
    });
  }

  function renderProjectFilters(projects) {
    const filters = document.getElementById('projectFilters');
    filters.innerHTML = '';
    const cats = Array.from(new Set(['all', ...(projects || []).map(p => p.category).filter(Boolean)]));
    let active = 'all';
    function draw() {
      filters.innerHTML = '';
      cats.forEach((c) => {
        const b = document.createElement('button');
        b.className = `filter${c === active ? ' active' : ''}`;
        b.setAttribute('data-cat', c);
        b.textContent = c.charAt(0).toUpperCase() + c.slice(1);
        filters.appendChild(b);
      });
    }
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter');
      if (!btn) return;
      active = btn.getAttribute('data-cat');
      draw();
      renderProjects(window.__PROJECTS__, active);
    });
    draw();
  }

  function renderEducation(education) {
    const list = document.getElementById('eduList');
    if (!list) return;
    list.innerHTML = '';
    (education || []).forEach((ed) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const h3 = document.createElement('h3');
      h3.textContent = `${ed.degree} — ${ed.school}`;
      const where = document.createElement('div');
      where.className = 'where';
      where.textContent = [ed.location, ed.period].filter(Boolean).join(' • ');
      item.append(h3, where);
      list.appendChild(item);
    });
  }

  function renderCertifications(certs) {
    const ul = document.getElementById('certList');
    ul.innerHTML = '';
    (certs || []).forEach((c) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = c.name;
      if (c.url) { a.href = c.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      li.appendChild(a);
      if (c.issuer || c.year) {
        const meta = document.createElement('span');
        meta.className = 'meta';
        meta.style.marginLeft = '8px';
        meta.textContent = [c.issuer, c.year].filter(Boolean).join(' • ');
        li.appendChild(meta);
      }
      ul.appendChild(li);
    });
  }

  function renderContact(contact) {
    const cards = document.getElementById('contactCards');
    cards.innerHTML = '';
    const items = [
      contact?.email ? { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, emoji: '✉️' } : null,
      contact?.linkedin ? { label: 'LinkedIn', value: contact.linkedin, href: contact.linkedin, emoji: '💼' } : null,
      contact?.github ? { label: 'GitHub', value: contact.github, href: contact.github, emoji: '🐱' } : null,
      contact?.website ? { label: 'Website', value: contact.website, href: contact.website, emoji: '🌐' } : null,
    ].filter(Boolean);
    items.forEach((it) => {
      const card = document.createElement('div');
      card.className = 'card';
      const h3 = document.createElement('h3');
      h3.textContent = `${it.emoji} ${it.label}`;
      const a = document.createElement('a');
      a.href = it.href; a.textContent = it.value; a.target = '_blank'; a.rel = 'noopener noreferrer';
      card.append(h3, a);
      cards.appendChild(card);
    });
  }

  function hydrateHero(profile) {
    setText('brandName', profile.name);
    setText('heroName', profile.name);
    setText('heroRole', profile.role);
    setText('heroBio', profile.bio);
    setText('footerName', profile.name);
    const primary = document.getElementById('ctaPrimary');
    if (profile.resumeUrl) {
      primary.textContent = 'Download Resume';
      primary.href = profile.resumeUrl;
      primary.target = '_blank';
      primary.rel = 'noopener noreferrer';
    }
  }

  function hydrateAbout(profile) {
    const about = document.getElementById('aboutText');
    if (profile.about) about.textContent = profile.about;
  }

  async function init() {
    yearEl.textContent = new Date().getFullYear();
    initTheme();
    themeToggle.addEventListener('click', toggleTheme);
    initReveal();
    initActiveNav();
    initParticles();

    const profile = await loadProfile();
    hydrateHero(profile);
    hydrateAbout(profile);
    renderSocials(profile.contact);
    renderSkillsTabs(profile.skills);
    renderExperience(profile.experience);
    window.__PROJECTS__ = profile.projects || [];
    renderProjectFilters(window.__PROJECTS__);
    renderProjects(window.__PROJECTS__, 'all');
    renderCertifications(profile.certifications);
    renderEducation(profile.education);
    renderContact(profile.contact);
    const cta = document.getElementById('contactCtaButton');
    if (cta && profile?.contact?.email) cta.href = `mailto:${profile.contact.email}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


