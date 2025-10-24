(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');

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

  function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    grid.classList.add('cols-3');
    grid.innerHTML = '';
    (projects || []).forEach((p) => {
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

    const profile = await loadProfile();
    hydrateHero(profile);
    hydrateAbout(profile);
    renderSocials(profile.contact);
    renderSkills(profile.skills);
    renderExperience(profile.experience);
    renderProjects(profile.projects);
    renderCertifications(profile.certifications);
    renderContact(profile.contact);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


