/* =========================================================================
   Dawar Ali — Senior DevOps Engineer · Neon Terminal Portfolio
   Boot sequence + interactive shell + data-driven sections.
   ========================================================================= */
(function () {
  'use strict';

  const html = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let PROFILE = {};

  /* ----------------------------- helpers -------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------ theme --------------------------------- */
  const themeToggle = $('themeToggle');
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // neon-on-dark is the intended default
  }
  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '◐' : '◑';
  }
  function toggleTheme() {
    const next = (html.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
    return next;
  }

  /* --------------------------- scroll reveal ---------------------------- */
  function initReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  }

  /* --------------------------- active nav ------------------------------- */
  function initActiveNav() {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const map = new Map(sections.map((s) => [s.id, navLinks.find((a) => a.getAttribute('href') === `#${s.id}`)]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) { navLinks.forEach((a) => a.classList.remove('active')); link.classList.add('active'); }
      });
    }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
  }

  /* ------------------------- scroll progress ---------------------------- */
  function initScrollProgress() {
    const bar = $('scrollProgress');
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* --------------------------- hero particles --------------------------- */
  function initParticles() {
    const canvas = $('heroParticles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0;
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * DPR; canvas.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener('resize', resize); resize();
    const count = Math.min(80, Math.floor(w / 16));
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.5 + 0.15,
    }));
    function step() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(92, 255, 157, ${p.o})`; ctx.fill();
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < 9000) {
            ctx.strokeStyle = `rgba(56, 232, 255, ${0.10 * (1 - d2 / 9000)})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }
    step();
  }

  /* ---------------------------- data loading ---------------------------- */
  async function loadProfile() {
    try {
      const res = await fetch('./data/profile.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('bad status');
      return await res.json();
    } catch (_) {
      return window.PROFILE_FALLBACK || {};
    }
  }

  /* --------------------------- skill grouping --------------------------- */
  function groupSkillsIntoTabs(skills) {
    const tabs = { cloud: {}, devops: {}, others: {} };
    if (!skills) return tabs;
    const cloud = ['Cloud Platforms', 'Networking and Security', 'Networking & Security', 'Edge & Delivery', 'Messaging & Data'];
    const devops = ['DevOps Tools', 'Scripting and Automation', 'Monitoring & Observability', 'Containers & Orchestration', 'Infrastructure as Code', 'SRE & Reliability'];
    Object.entries(skills).forEach(([group, items]) => {
      const key = cloud.includes(group) ? 'cloud' : devops.includes(group) ? 'devops' : 'others';
      tabs[key][group] = items;
    });
    return tabs;
  }

  const SKILL_EMOJI = new Map([
    ['AWS', '☁️'], ['GCP', '☁️'], ['Azure', '☁️'],
    ['Jenkins', '🤖'], ['GitHub Actions', '⚙️'], ['GitLab CI', '🦊'], ['Argo CD', '🚀'], ['Flux', '🔁'],
    ['Docker', '🐳'], ['Kubernetes', '⎈'], ['EKS', '⎈'], ['Helm', '⚓'], ['Kustomize', '🧩'],
    ['Terraform', '🟪'], ['CloudFormation', '🧱'], ['Ansible', '🅰️'], ['Packer', '📦'],
    ['VPC', '🌐'], ['Transit Gateway', '🧭'], ['WAF', '🛡️'], ['Security Hub', '🛡️'], ['IAM', '🪪'], ['SSO', '🔐'], ['HashiCorp Vault', '🔑'],
    ['CloudWatch', '🕒'], ['Prometheus', '🔥'], ['Grafana', '📈'], ['Loki', '🧿'], ['ELK', '🌳'], ['New Relic', '🧪'],
    ['SQS', '📬'], ['SNS', '📣'], ['Kafka', '🧵'], ['RDS', '🗄️'], ['DynamoDB', '🧊'], ['ElastiCache', '⚡'],
    ['Bash', '💻'], ['Python', '🐍'], ['Go (basics)', '🐹'],
    ['GitHub', '🐙'], ['Jira', '📋'], ['JumpCloud', '🔐'], ['Jamf', '🍎'], ['CloudFormation', '🧱'], ['Linux (Ubuntu, CentOS, Red Hat)', '🐧'], ['Windows', '🪟'],
    ['Network Security', '🛡️'], ['SSL/TLS', '🔒'], ['VPN Setup', '🕳️'], ['Firewall Configuration', '🧱'],
    ['Problem-solving', '🧩'], ['Communication', '🗣️'], ['Cross-functional Collaboration', '🤝'], ['Team Leadership', '🧭'],
  ]);
  const skillEmoji = (n) => SKILL_EMOJI.get(n) || '▹';

  // Real brand logos (downloaded to assets/icons/), recolored via CSS mask.
  const SKILL_ICON = new Map([
    ['AWS', 'aws'], ['GCP', 'gcp'],
    ['Jenkins', 'jenkins'], ['GitHub', 'github'], ['GitLab', 'gitlab'],
    ['Docker', 'docker'], ['Kubernetes', 'kubernetes'], ['Terraform', 'terraform'],
    ['Bash', 'bash'], ['Ansible', 'ansible'], ['Linux (Ubuntu, CentOS, Red Hat)', 'linux'],
    ['Loki', 'loki'], ['Prometheus', 'prometheus'], ['New Relic', 'newrelic'],
    ['Google Workspace', 'googleworkspace'], ['Slack', 'slack'], ['Cloudflare', 'cloudflare'], ['Jira', 'jira'],
  ]);
  const ICON_COLOR = {
    aws: '#FF9900', gcp: '#4285F4', jenkins: '#E8483B', github: '#e6edf3', gitlab: '#FC6D26',
    docker: '#2496ED', kubernetes: '#5b8def', terraform: '#9c6cff', bash: '#5fd35f', ansible: '#ff4d4d',
    linux: '#FCC624', loki: '#F9A825', prometheus: '#E6522C', newrelic: '#1CE783',
    googleworkspace: '#4285F4', slack: '#E8528B', cloudflare: '#F38020', jira: '#3b82f6',
  };
  function skillIconEl(name) {
    const key = SKILL_ICON.get(name);
    if (!key) return null;
    const el = document.createElement('span');
    el.className = 'skill-ico';
    el.style.setProperty('--im', `url("./assets/icons/${key}.svg")`);
    el.style.setProperty('--ic', ICON_COLOR[key] || 'var(--accent)');
    el.setAttribute('aria-hidden', 'true');
    return el;
  }
  // Append a logo (or emoji fallback) + label into a chip element.
  function fillChip(chip, name) {
    const ico = skillIconEl(name);
    if (ico) chip.appendChild(ico);
    else {
      const em = document.createElement('span'); em.className = 'icon-emoji'; em.textContent = skillEmoji(name);
      chip.appendChild(em);
    }
    chip.appendChild(document.createTextNode(name));
  }

  /* --------------------------- section renders -------------------------- */
  function setText(id, text) {
    const el = $(id);
    if (el && typeof text === 'string' && text.trim().length) el.textContent = text;
  }
  function setLink(container, label, url, emoji) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = `${emoji} ${label}`;
    container.appendChild(a);
  }

  function renderSocials(contact) {
    const socials = $('socialLinks'); if (!socials) return;
    socials.innerHTML = '';
    if (!contact) return;
    if (contact.email) setLink(socials, 'email', `mailto:${contact.email}`, '✉️');
    if (contact.linkedin) setLink(socials, 'linkedin', contact.linkedin, '💼');
    if (contact.github) setLink(socials, 'github', contact.github, '🐙');
    if (contact.website) setLink(socials, 'website', contact.website, '🌐');
    if (PROFILE.resumeUrl) setLink(socials, 'résumé', PROFILE.resumeUrl, '📄');
  }

  function renderSkillsTabs(skills) {
    const tabsEl = $('skillsTabs'); const grid = $('skillsGrid');
    if (!tabsEl || !grid) return;
    const grouped = groupSkillsIntoTabs(skills);
    let active = 'cloud';
    function renderActive() {
      grid.innerHTML = ''; grid.classList.add('cols-2');
      Object.entries(grouped[active]).forEach(([group, items]) => {
        const card = document.createElement('div'); card.className = 'card';
        const title = document.createElement('h3'); title.textContent = group;
        const chips = document.createElement('div'); chips.className = 'chips';
        (items || []).forEach((skill) => {
          const chip = document.createElement('span'); chip.className = 'chip';
          fillChip(chip, skill);
          chips.appendChild(chip);
        });
        card.append(title, chips); grid.appendChild(card);
      });
    }
    tabsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab'); if (!btn) return;
      tabsEl.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active'); active = btn.getAttribute('data-tab'); renderActive();
    });
    renderActive();
  }

  function renderExperience(experience) {
    const list = $('experienceList'); if (!list) return;
    list.innerHTML = '';
    (experience || []).forEach((job) => {
      const item = document.createElement('div'); item.className = 'timeline-item';
      const title = document.createElement('h3'); title.textContent = `${job.role} — ${job.company}`;
      const where = document.createElement('div'); where.className = 'where';
      where.textContent = [job.location, job.period].filter(Boolean).join(' • ');
      item.append(title, where);
      if (Array.isArray(job.highlights) && job.highlights.length) {
        const ul = document.createElement('ul');
        job.highlights.forEach((h) => { const li = document.createElement('li'); li.textContent = h; ul.appendChild(li); });
        item.appendChild(ul);
      }
      list.appendChild(item);
    });
  }

  function renderProjects(projects, activeCategory = 'all') {
    const grid = $('projectsGrid'); if (!grid) return;
    grid.classList.add('cols-3'); grid.innerHTML = '';
    (projects || []).filter((p) => activeCategory === 'all' || p.category === activeCategory).forEach((p) => {
      const card = document.createElement('div'); card.className = 'card';
      const h3 = document.createElement('h3'); h3.textContent = p.name;
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = (p.period || '').toString();
      const desc = document.createElement('p'); desc.textContent = p.description || '';
      const chips = document.createElement('div'); chips.className = 'chips';
      (p.tech || []).forEach((t) => { const c = document.createElement('span'); c.className = 'chip'; fillChip(c, t); chips.appendChild(c); });
      const links = document.createElement('div'); links.className = 'socials';
      if (p.repo) setLink(links, 'code', p.repo, '🔗');
      if (p.demo) setLink(links, 'live', p.demo, '🚀');
      card.append(h3, meta, desc, chips, links); grid.appendChild(card);
    });
  }

  function renderProjectFilters(projects) {
    const filters = $('projectFilters'); if (!filters) return;
    const cats = Array.from(new Set(['all', ...(projects || []).map((p) => p.category).filter(Boolean)]));
    let active = 'all';
    function draw() {
      filters.innerHTML = '';
      cats.forEach((c) => {
        const b = document.createElement('button');
        b.className = `filter${c === active ? ' active' : ''}`; b.setAttribute('data-cat', c);
        b.textContent = c.charAt(0).toUpperCase() + c.slice(1); filters.appendChild(b);
      });
    }
    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter'); if (!btn) return;
      active = btn.getAttribute('data-cat'); draw(); renderProjects(PROFILE.projects, active);
    });
    draw();
  }

  function renderEducation(education) {
    const list = $('eduList'); if (!list) return;
    list.innerHTML = '';
    (education || []).forEach((ed) => {
      const item = document.createElement('div'); item.className = 'timeline-item';
      const h3 = document.createElement('h3'); h3.textContent = `${ed.degree} — ${ed.school}`;
      const where = document.createElement('div'); where.className = 'where';
      where.textContent = [ed.location, ed.period].filter(Boolean).join(' • ');
      item.append(h3, where); list.appendChild(item);
    });
  }

  function renderCertifications(certs) {
    const ul = $('certList'); if (!ul) return;
    ul.innerHTML = '';
    (certs || []).forEach((c) => {
      const li = document.createElement('li');
      const a = document.createElement('a'); a.textContent = c.name;
      if (c.url) { a.href = c.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      li.appendChild(a);
      if (c.issuer || c.year) {
        const meta = document.createElement('span'); meta.className = 'meta'; meta.style.marginLeft = '8px';
        meta.textContent = ' • ' + [c.issuer, c.year].filter(Boolean).join(' • ');
        li.appendChild(meta);
      }
      ul.appendChild(li);
    });
  }

  function renderContact(contact) {
    const cards = $('contactCards'); if (!cards) return;
    cards.innerHTML = '';
    const items = [
      contact?.email ? { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, emoji: '✉️' } : null,
      contact?.phone ? { label: 'Phone', value: contact.phone, href: `tel:${contact.phone}`, emoji: '📞' } : null,
      contact?.linkedin ? { label: 'LinkedIn', value: contact.linkedin, href: contact.linkedin, emoji: '💼' } : null,
      contact?.github ? { label: 'GitHub', value: contact.github, href: contact.github, emoji: '🐙' } : null,
      contact?.website ? { label: 'Website', value: contact.website, href: contact.website, emoji: '🌐' } : null,
    ].filter(Boolean);
    items.forEach((it) => {
      const card = document.createElement('div'); card.className = 'card';
      const h3 = document.createElement('h3'); h3.textContent = `${it.emoji} ${it.label}`;
      const a = document.createElement('a'); a.href = it.href; a.textContent = it.value;
      if (!it.href.startsWith('mailto:') && !it.href.startsWith('tel:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      card.append(h3, a); cards.appendChild(card);
    });
  }

  function hydrate(profile) {
    setText('heroName', profile.name);
    setText('heroRole', profile.role);
    setText('heroBio', profile.tagline || profile.bio);
    setText('footerName', profile.name);
    const about = $('aboutText'); if (about && profile.about) about.textContent = profile.about;
    const resumeBtn = $('resumeButton'); if (resumeBtn && profile.resumeUrl) resumeBtn.href = profile.resumeUrl;
    const cta = $('contactCtaButton'); if (cta && profile?.contact?.email) cta.href = `mailto:${profile.contact.email}`;
  }

  /* ========================================================================
     INTERACTIVE TERMINAL
     ===================================================================== */
  const term = {
    output: null, input: null, body: null, hint: null,
    history: [], hIndex: -1,
  };

  function termScroll() { term.body.scrollTop = term.body.scrollHeight; }

  function printBlock(html, cls) {
    const div = document.createElement('div');
    div.className = 'term-block' + (cls ? ' ' + cls : '');
    div.innerHTML = html;
    term.output.appendChild(div);
    termScroll();
    return div;
  }

  function echoCommand(cmd) {
    printBlock(
      `<span class="term-cmd-echo"><span class="ps1-user">dawar</span><span class="dim">@</span><span class="k">portfolio</span><span class="dim">:</span><span class="m">~</span><span class="dim">$</span> <span class="typed">${esc(cmd)}</span></span>`
    );
  }

  function bar(pct) {
    const total = 14, filled = Math.round((pct / 100) * total);
    return `<span class="bar">${'█'.repeat(filled)}</span><span class="barbg">${'░'.repeat(total - filled)}</span>`;
  }

  function goto(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  /* --------------------------- command registry ------------------------- */
  const COMMANDS = {
    help: { desc: 'list all available commands', run: () => {
      const rows = Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => `  <span class="h">${name.padEnd(13)}</span><span class="dim">${esc(c.desc)}</span>`)
        .join('\n');
      printBlock(`<span class="y">Available commands</span> <span class="dim">— click any nav item too</span>\n${rows}\n\n<span class="dim">tips: ↑/↓ history · Tab autocomplete · <span class="h">clear</span> to reset</span>`);
    }},

    about: { desc: 'who is Dawar?', run: () => {
      printBlock(
        `<span class="h">${esc(PROFILE.name)}</span> — <span class="k">${esc(PROFILE.role)}</span>\n` +
        (PROFILE.location ? `<span class="dim">📍 ${esc(PROFILE.location)}</span>\n\n` : '\n') +
        `<span class="v">${esc(PROFILE.about || PROFILE.bio || '')}</span>`
      );
    }},

    skills: { desc: 'print the tech stack', run: () => {
      const skills = PROFILE.skills || {};
      let out = '<span class="y">stack/</span>\n';
      const groups = Object.entries(skills);
      groups.forEach(([group, items], gi) => {
        const last = gi === groups.length - 1;
        out += `<span class="dim">${last ? '└──' : '├──'}</span> <span class="h">${esc(group)}</span>\n`;
        (items || []).forEach((s) => {
          out += `<span class="dim">${last ? '   ' : '│  '}   </span><span class="m">${skillEmoji(s)}</span> <span class="v">${esc(s)}</span>\n`;
        });
      });
      printBlock(out.trimEnd());
    }},

    experience: { desc: 'work history', run: () => {
      let out = '';
      (PROFILE.experience || []).forEach((j) => {
        out += `<span class="h">▸ ${esc(j.role)}</span> <span class="dim">@</span> <span class="k">${esc(j.company)}</span>\n`;
        out += `  <span class="dim">${esc([j.location, j.period].filter(Boolean).join(' • '))}</span>\n`;
        (j.highlights || []).forEach((h) => { out += `  <span class="m">-</span> <span class="v">${esc(h)}</span>\n`; });
        out += '\n';
      });
      printBlock(out.trimEnd());
    }},

    projects: { desc: 'selected projects', run: () => {
      let out = '';
      (PROFILE.projects || []).forEach((p) => {
        out += `<span class="h">📦 ${esc(p.name)}</span> <span class="dim">(${esc(p.period || '')})</span>\n`;
        out += `   <span class="v">${esc(p.description || '')}</span>\n`;
        if ((p.tech || []).length) out += `   <span class="k">stack:</span> <span class="dim">${esc((p.tech || []).join(', '))}</span>\n`;
        out += '\n';
      });
      out += '<span class="dim">→ see the full grid: </span><a href="#projects">scroll to projects</a>';
      printBlock(out);
      goto('projects');
    }},

    certs: { desc: 'certifications', run: () => {
      let out = '<span class="y">certifications:</span>\n';
      (PROFILE.certifications || []).forEach((c) => {
        out += `  <span class="h">✦</span> <span class="v">${esc(c.name)}</span> <span class="dim">${esc([c.issuer, c.year].filter(Boolean).join(' • '))}</span>\n`;
      });
      printBlock(out.trimEnd());
    }},

    education: { desc: 'education', run: () => {
      let out = '';
      (PROFILE.education || []).forEach((e) => {
        out += `<span class="h">🎓 ${esc(e.degree)}</span> — <span class="k">${esc(e.school)}</span>\n  <span class="dim">${esc([e.location, e.period].filter(Boolean).join(' • '))}</span>\n`;
      });
      printBlock(out.trimEnd());
    }},

    contact: { desc: 'how to reach me', run: () => {
      const c = PROFILE.contact || {};
      let out = '<span class="y">reach me:</span>\n';
      if (c.email) out += `  <span class="k">email   </span> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>\n`;
      if (c.phone) out += `  <span class="k">phone   </span> <span class="v">${esc(c.phone)}</span>\n`;
      if (c.linkedin) out += `  <span class="k">linkedin</span> <a href="${esc(c.linkedin)}" target="_blank" rel="noopener">${esc(c.linkedin)}</a>\n`;
      if (c.github) out += `  <span class="k">github  </span> <a href="${esc(c.github)}" target="_blank" rel="noopener">${esc(c.github)}</a>\n`;
      if (c.website) out += `  <span class="k">web     </span> <a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>\n`;
      printBlock(out.trimEnd());
    }},

    resume: { desc: 'open my résumé (PDF)', run: () => {
      const url = PROFILE.resumeUrl;
      if (!url) { printBlock('résumé not available yet.', 'term-error'); return; }
      printBlock(`<span class="dim">opening</span> <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a> <span class="dim">…</span>`);
      window.open(url, '_blank', 'noopener');
    }},

    social: { desc: 'social links', run: () => COMMANDS.contact.run() },

    neofetch: { desc: 'system info, devops-style', run: () => {
      const c = PROFILE.contact || {};
      const skillCount = Object.values(PROFILE.skills || {}).reduce((a, b) => a + (b ? b.length : 0), 0);
      const ascii = [
        '      <span class="h">.--.</span>      ',
        '     <span class="h">|o_o |</span>     ',
        '     <span class="h">|:_/ |</span>     ',
        '    <span class="h">//   \\ \\</span>    ',
        '   <span class="h">(|     | )</span>   ',
        '  <span class="h">/\'\\_   _/`\\</span>  ',
        '  <span class="h">\\___)=(___/</span>  ',
      ];
      const info = [
        `<span class="k">user</span>@<span class="k">portfolio</span>`,
        `<span class="dim">-----------------</span>`,
        `<span class="m">OS</span>      : DevOps Linux x86_64`,
        `<span class="m">Role</span>    : ${esc(PROFILE.role || '')}`,
        `<span class="m">Uptime</span>  : 6+ years in production`,
        `<span class="m">Shell</span>   : bash / zsh`,
        `<span class="m">Cloud</span>   : AWS · GCP · Azure`,
        `<span class="m">Orchestr</span>: Kubernetes (EKS)`,
        `<span class="m">IaC</span>     : Terraform · Ansible`,
        `<span class="m">Skills</span>  : ${skillCount} loaded`,
        `<span class="m">Email</span>   : ${esc(c.email || '')}`,
      ];
      let out = '';
      const rows = Math.max(ascii.length, info.length);
      for (let i = 0; i < rows; i++) {
        out += `<span class="term-ascii">${ascii[i] || '              '}</span>   ${info[i] || ''}\n`;
      }
      printBlock(out.trimEnd());
    }},

    banner: { desc: 'show the name banner', run: () => printBanner() },

    ls: { desc: 'list sections', run: () => {
      const items = ['about', 'skills', 'experience', 'projects', 'certifications', 'education', 'contact'];
      printBlock(items.map((s) => `<a href="#${s}" class="k">${s}/</a>`).join('   '));
    }},

    cat: { desc: 'cat <section> — print a section', run: (args) => {
      const t = (args[0] || '').replace(/\.\w+$/, '');
      const alias = { certifications: 'certs', edu: 'education', work: 'experience', cv: 'resume', me: 'about', whoami: 'about' };
      const cmd = COMMANDS[alias[t] || t];
      if (cmd && !cmd.hidden && t) cmd.run([]);
      else printBlock(`cat: ${esc(t || '')}: No such file. try <span class="h">ls</span>`, 'term-error');
    }},

    goto: { desc: 'goto <section> — scroll to a section', run: (args) => {
      const id = (args[0] || '').replace('#', '');
      if (document.getElementById(id)) { goto(id); printBlock(`<span class="dim">scrolling to</span> <span class="k">#${esc(id)}</span>`); }
      else printBlock(`goto: unknown section '${esc(id)}'`, 'term-error');
    }},

    theme: { desc: 'theme [dark|light] — toggle look', run: (args) => {
      const want = (args[0] || '').toLowerCase();
      let next;
      if (want === 'dark' || want === 'light') { localStorage.setItem('theme', want); applyTheme(want); next = want; }
      else next = toggleTheme();
      printBlock(`<span class="dim">theme set to</span> <span class="h">${next}</span>`);
    }},

    echo: { desc: 'echo <text>', run: (args) => printBlock(esc(args.join(' '))) },
    date: { desc: 'current date/time', run: () => printBlock(`<span class="v">${esc(new Date().toString())}</span>`) },
    whoami: { desc: 'print current user', hidden: true, run: () => printBlock('<span class="h">dawar</span> <span class="dim">(visitor: you 👋)</span>') },
    pwd: { desc: '', hidden: true, run: () => printBlock('<span class="m">/home/dawar/portfolio</span>') },
    uptime: { desc: '', hidden: true, run: () => printBlock('<span class="v">up 6+ years, load average: shipping, shipping, shipping</span>') },
    sudo: { desc: '', hidden: true, run: (args) => {
      if (args.join(' ').includes('hire')) { printBlock('<span class="h">[sudo] access granted ✅</span> → run <span class="h">contact</span> to proceed.'); return; }
      printBlock('<span class="y">dawar is not in the sudoers file. This incident will be reported. 😏</span>', 'term-error');
    }},
    rm: { desc: '', hidden: true, run: () => printBlock("<span class=\"term-error\">nice try. this portfolio is immutable infrastructure. 🧱</span>") },
    exit: { desc: '', hidden: true, run: () => printBlock('<span class="dim">there is no escape from devops. (Ctrl-C won\'t help either)</span>') },
    clear: { desc: 'clear the terminal', run: () => { term.output.innerHTML = ''; } },
  };
  COMMANDS.cls = { desc: '', hidden: true, run: COMMANDS.clear.run };
  COMMANDS.history = { desc: 'show command history', run: () => {
    if (!term.history.length) { printBlock('<span class="dim">no history yet</span>'); return; }
    printBlock(term.history.map((h, i) => `  <span class="dim">${String(i + 1).padStart(3)}</span>  <span class="v">${esc(h)}</span>`).join('\n'));
  }};

  function runCommand(raw) {
    const line = raw.trim();
    echoCommand(line || '');
    if (!line) return;
    term.history.push(line); term.hIndex = term.history.length;
    const [name, ...args] = line.split(/\s+/);
    const cmd = COMMANDS[name.toLowerCase()];
    if (cmd) {
      try { cmd.run(args); } catch (e) { printBlock(`error: ${esc(e.message)}`, 'term-error'); }
    } else {
      printBlock(`command not found: <span class="h">${esc(name)}</span> — type <span class="h">help</span>`, 'term-error');
    }
  }

  function autocomplete(value) {
    const parts = value.split(/\s+/);
    if (parts.length > 1) return value; // only complete the command word
    const frag = parts[0].toLowerCase();
    if (!frag) return value;
    const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(frag));
    if (matches.length === 1) return matches[0] + ' ';
    if (matches.length > 1) {
      printBlock(matches.map((m) => `<span class="k">${m}</span>`).join('   '));
      // complete to common prefix
      let prefix = matches[0];
      matches.forEach((m) => { while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1); });
      return prefix;
    }
    return value;
  }

  function printBanner() {
    const banner =
` <span class="h">██████   █████  ██     ██  █████  ██████</span>
 <span class="h">██   ██ ██   ██ ██     ██ ██   ██ ██   ██</span>
 <span class="h">██   ██ ███████ ██  █  ██ ███████ ██████</span>
 <span class="h">██   ██ ██   ██ ██ ███ ██ ██   ██ ██   ██</span>
 <span class="h">██████  ██   ██  ███ ███  ██   ██ ██   ██</span>`;
    printBlock(banner, 'term-ascii');
    printBlock(`<span class="k">${esc(PROFILE.role || 'Senior DevOps Engineer')}</span> <span class="dim">·</span> <span class="dim">${esc(PROFILE.location || '')}</span>`);
    printBlock(`<span class="v">Welcome. Type</span> <span class="h">help</span> <span class="v">to explore, or try</span> <span class="h">neofetch</span><span class="v">,</span> <span class="h">skills</span><span class="v">,</span> <span class="h">resume</span><span class="v">.</span>`);
  }

  function initTerminal() {
    term.output = $('termOutput');
    term.input = $('termInput');
    term.body = $('termBody');
    term.hint = $('termHint');
    if (!term.input) return;

    printBanner();

    // Focus input when clicking anywhere in the terminal body
    term.body.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'A') { /* let link clicks work */ }
    });
    term.body.addEventListener('click', (e) => {
      if (e.target.tagName !== 'A' && window.getSelection().toString() === '') term.input.focus();
    });

    term.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (term.hint) term.hint.style.display = 'none';
        const v = term.input.value; term.input.value = ''; runCommand(v);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (term.history.length) { term.hIndex = Math.max(0, term.hIndex - 1); term.input.value = term.history[term.hIndex] || ''; setCaretEnd(); }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (term.history.length) {
          term.hIndex = Math.min(term.history.length, term.hIndex + 1);
          term.input.value = term.history[term.hIndex] || ''; setCaretEnd();
        }
      } else if (e.key === 'Tab') {
        e.preventDefault(); term.input.value = autocomplete(term.input.value); setCaretEnd();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault(); term.output.innerHTML = '';
      }
    });
    function setCaretEnd() { const v = term.input.value; requestAnimationFrame(() => term.input.setSelectionRange(v.length, v.length)); }
  }

  /* ========================================================================
     BOOT SEQUENCE
     ===================================================================== */
  async function runBoot() {
    const boot = $('boot');
    const log = $('bootLog');
    if (!boot || !log) return;

    const alreadyBooted = sessionStorage.getItem('booted') === '1';
    if (alreadyBooted || prefersReducedMotion) {
      boot.classList.add('hidden');
      setTimeout(() => boot.remove(), 200);
      focusTermSoon();
      return;
    }

    let skipped = false;
    const skip = () => { skipped = true; };
    window.addEventListener('keydown', skip, { once: true });
    boot.addEventListener('click', skip, { once: true });

    // Global pacing multiplier — raise to slow the whole boot down. ~1.0 ≈ 13s, 1.45 ≈ 18s.
    const SPEED = 1.45;

    // Append one boot line. opts: {type} types char-by-char; {pause} ms after.
    async function addLine(cls, text, opts) {
      opts = opts || {};
      if (skipped) return;
      const span = document.createElement('span');
      if (cls) span.className = cls;
      log.appendChild(span);
      if (opts.type) {
        for (let i = 0; i < text.length; i++) {
          if (skipped) { span.textContent = text; break; }
          span.textContent += text[i];
          await sleep((opts.cps || 24) * SPEED);
        }
        span.textContent += '\n';
      } else {
        span.textContent = text + '\n';
      }
      boot.scrollTop = boot.scrollHeight;
      if (skipped) return;
      await sleep((opts.pause != null ? opts.pause : (240 + Math.random() * 150)) * SPEED);
    }

    // Profile-derived details (with safe fallbacks).
    const name = PROFILE.name || 'Dawar Ali';
    const role = PROFILE.role || 'Senior DevOps Engineer';
    const loc = PROFILE.location || 'Gurugram, India';
    const tagline = PROFILE.tagline || PROFILE.bio || '';
    const c = PROFILE.contact || {};
    const skillCount = Object.values(PROFILE.skills || {}).reduce((a, b) => a + (b ? b.length : 0), 0);
    const certs = (PROFILE.certifications || []).map((x) => x.name).join(' · ');

    // ── Phase 1: kernel + services ──────────────────────────────
    await addLine('dim',  'Booting dawar@portfolio (kernel 6.8.0-cloud-amd64) ...', { pause: 520 });
    await addLine('info', '[ INFO ] POST self-test: cpu=ok  mem=caffeine  net=up', { pause: 360 });
    await addLine('ok',   '[  OK  ] Reached target Cloud Init.');
    await addLine('ok',   '[  OK  ] Mounted volumes: /aws  /gcp.');
    await addLine('ok',   '[  OK  ] Started Terraform state backend.');
    await addLine('info', '[ INFO ] Pulling container images ........', { pause: 700 });
    await addLine('ok',   '[  OK  ] Kubernetes control plane is healthy.');
    await addLine('ok',   '[  OK  ] Started CI/CD daemon (jenkins, gitlab).');
    await addLine('ok',   '[  OK  ] Observability online (prometheus, loki, new relic).');
    await addLine('ok',   '[  OK  ] Security policies applied (IAM, WAF, Cloudflare).');
    await addLine('warn', '[ WARN ] Coffee level low — proceeding anyway.', { pause: 520 });
    await addLine('ok',   '[  OK  ] Incident response runbooks loaded.');
    await addLine('ok',   '[  OK  ] SLOs nominal · error budget healthy.', { pause: 400 });
    await addLine('info', '[ INFO ] Running pre-flight checks ........', { pause: 800 });

    // ── Phase 2: load profile (progress) ───────────────────────
    await addLine('dim', '', { pause: 120 });
    await addLine('info', '[ INFO ] Mounting /home/dawar/profile ...', { pause: 500 });
    for (const pct of [17, 48, 76, 100]) {
      if (skipped) break;
      const total = 24, fill = Math.round((pct / 100) * total);
      await addLine('dim', '          [' + '#'.repeat(fill) + '-'.repeat(total - fill) + '] ' + pct + '%',
        { pause: pct === 100 ? 520 : 320 });
    }

    // ── Phase 3: identity / about me ────────────────────────────
    await addLine('dim', '', { pause: 120 });
    await addLine('info', '── identity ───────────────────────────────', { pause: 320 });
    await addLine('b',   '  user      : ' + name, { type: true, cps: 36, pause: 320 });
    await addLine('info','  title     : ' + role, { type: true, cps: 22, pause: 360 });
    await addLine('dim', '  location  : ' + loc);
    await addLine('dim', '  uptime    : 6+ years in production (since Oct 2019 @ ixigo)');
    await addLine('dim', '  promotion : Senior DevOps Engineer — Apr 2026 → present');
    await addLine('ok',  '  domains   : AWS · Kubernetes · Terraform · CI/CD · Observability · Security');
    await addLine('dim', '  modules   : ' + skillCount + ' skills loaded');
    if (certs) await addLine('dim', '  certs     : ' + certs);
    const edu = (PROFILE.education || [])[0];
    if (edu) await addLine('dim', '  education : ' + [edu.degree, edu.school].filter(Boolean).join(' — '));
    await addLine('dim', '  also      : IT/DevOps leadership · audit & DPDP readiness · AI-assisted workflows');
    if (c.email) await addLine('dim', '  contact   : ' + c.email + (c.linkedin ? '  ·  linkedin.com/in/dawar-ali-devops' : ''), { pause: 360 });
    if (tagline) {
      await addLine('dim', '', { pause: 120 });
      await addLine('y', '  "' + tagline + '"', { type: true, cps: 20, pause: 520 });
    }

    // ── Phase 4: login + handoff ────────────────────────────────
    await addLine('dim', '', { pause: 160 });
    await addLine('b',   'login: dawar', { pause: 360 });
    await addLine('ok',  'Authentication: passwordless — visitor trusted ✓', { pause: 360 });
    await addLine('dim', 'Last login: just now on tty-portfolio');
    await addLine('info','Starting interactive shell ...', { pause: 500 });

    // Final loader bar — fills in place to give a beat to finish reading.
    if (!skipped) {
      const barSpan = document.createElement('span');
      barSpan.className = 'ok';
      log.appendChild(barSpan);
      const W = 32;
      for (let i = 0; i <= W; i++) {
        if (skipped) { barSpan.textContent = '  [' + '#'.repeat(W) + '] 100%'; break; }
        const pct = Math.round((i / W) * 100);
        barSpan.textContent = '  [' + '#'.repeat(i) + '·'.repeat(W - i) + '] ' + pct + '%';
        boot.scrollTop = boot.scrollHeight;
        await sleep(95 * SPEED);
      }
      barSpan.textContent += '\n';
      await addLine('b', '  welcome aboard ✓', { pause: 650 });
    }

    if (!skipped) await sleep(420);
    sessionStorage.setItem('booted', '1');
    boot.classList.add('hidden');
    setTimeout(() => boot.remove(), 450);
    focusTermSoon();
  }

  function focusTermSoon() {
    setTimeout(() => { if (term.input) term.input.focus({ preventScroll: true }); }, 500);
  }

  /* ------------------------------- init --------------------------------- */
  async function init() {
    const yearEl = $('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
    applyTheme(getPreferredTheme());
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    initReveal();
    initActiveNav();
    initScrollProgress();
    initParticles();

    PROFILE = await loadProfile();
    hydrate(PROFILE);
    renderSocials(PROFILE.contact);
    renderSkillsTabs(PROFILE.skills);
    renderExperience(PROFILE.experience);
    renderProjectFilters(PROFILE.projects);
    renderProjects(PROFILE.projects, 'all');
    renderCertifications(PROFILE.certifications);
    renderEducation(PROFILE.education);
    renderContact(PROFILE.contact);

    initTerminal();
    runBoot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
