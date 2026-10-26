(() => {
  'use strict';
  const data = window.PORTFOLIO;
  if (!data) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const svgIcon = paths => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
  const icons = {
    database: svgIcon('<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 4 14 4 14 0V5M5 11v7c0 4 14 4 14 0v-7"/>'),
    code: svgIcon('<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>'),
    bars: svgIcon('<rect x="4" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="18" rx="1"/>'),
    grid: svgIcon('<path d="M12 3v6m-3-3h6m-9 4v8m-4-4h8m8-4v8m-4-4h8M12 17v5m-3-2h6"/>'),
    sheet: svgIcon('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 9v12"/>'),
    chart: svgIcon('<path d="M3 4v17h18M6 16l4-5 4 3 7-10"/><path d="M17 4h4v4"/>'),
    office: svgIcon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
    app: svgIcon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01M7 13h4v4H7zM14 13h3M14 17h3"/>'),
    flow: svgIcon('<rect x="3" y="8" width="6" height="8" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 12h3M12 6v12M12 6h3M12 18h3"/>'),
    web: svgIcon('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>'),
    store: svgIcon('<path d="M4 10v10h16V10M3 10l2-7h14l2 7H3ZM8 3l-1 7M16 3l1 7M9 20v-6h6v6"/>'),
    design: svgIcon('<path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm10-10 4 4M4 16l4 4M3 4h6M3 8h3"/>')
  };

  $$('[data-name]').forEach(el => el.textContent = data.name);
  $$('[data-role]').forEach(el => el.textContent = data.role);
  $$('[data-initials]').forEach(el => el.textContent = data.initials);
  $$('[data-availability]').forEach(el => el.textContent = data.availability);
  $('[data-introduction]').textContent = data.introduction;
  $('[data-about]').textContent = data.about;
  $('.brand').setAttribute('aria-label', `${data.name}, home`);
  document.title = `${data.name} — ${data.role}`;
  $('meta[name="description"]').content = `${data.name}'s portfolio. ${data.introduction}`;
  $('meta[property="og:title"]').content = document.title;
  $('meta[property="og:description"]').content = data.introduction;
  $('#current-year').textContent = new Date().getFullYear();

  // Visuals are drawn with HTML and SVG so they stay crisp at every screen size.
  const retailVisual = () => `<div class="project-visual retail-visual" aria-hidden="true"><div class="preview-topline"><span>RETAIL / OVERVIEW</span><span>01 — BUSINESS INTELLIGENCE</span></div><div class="mini-dashboard"><div class="mini-eyebrow">SALES PERFORMANCE</div><div class="mini-stat-row"><span><strong>$84,254</strong><small>NET REVENUE · DEMO</small></span><span><strong>1,724</strong><small>TOTAL ORDERS</small></span></div><div class="mini-columns"><div><div class="mini-chart-title">Revenue by month</div><div class="mini-bar-chart">${[37, 52, 44, 65, 58, 77, 69, 93].map(height => `<i style="height:${height}%"></i>`).join('')}</div></div><div><div class="mini-chart-title">Category mix</div><div class="mini-donut"></div><div class="mini-legend">Category A · B · C</div></div></div></div></div>`;
  const retentionVisual = () => {
    const rows = [[100, 46, 35, 29, 25, 23], [100, 51, 39, 32, 28], [100, 48, 37, 31], [100, 54, 41], [100, 56]];
    const heatmap = rows.map((row, index) => `<span class="heat-label">${['Jan', 'Feb', 'Mar', 'Apr', 'May'][index]}</span>${Array.from({length: 6}, (_, col) => row[col] == null ? '<span></span>' : `<span class="heat-cell ${row[col] > 70 ? 'high' : ''}" style="--heat:${row[col] / 100}">${row[col]}%</span>`).join('')}`).join('');
    return `<div class="project-visual retention-visual" aria-hidden="true"><div class="preview-topline"><span>CUSTOMERS / COHORTS</span><span>02 — CUSTOMER ANALYTICS</span></div><div class="mini-heatmap"><div class="heatmap-heading"><span>The return journey</span><span>RETENTION BY MONTH</span></div><div class="heatmap-grid"><span></span>${[0, 1, 2, 3, 4, 5].map(i => `<span class="heat-col">M${i}</span>`).join('')}${heatmap}</div><div class="heatmap-legend"><span>Less</span>${[.15, .3, .5, .75, 1].map(v => `<i style="--heat:${v}"></i>`).join('')}<span>More</span></div></div></div>`;
  };
  const mobilityVisual = () => `<div class="project-visual mobility-visual" aria-hidden="true"><div class="preview-topline"><span>MOBILITY / EXPLORER</span><span>03 — DATA STORYTELLING</span></div><div class="mini-mobility"><div class="mini-eyebrow">THE RHYTHM OF A CITY</div><div class="mobility-stats"><strong>24 hours.</strong><span>COUNTLESS LITTLE STORIES.</span></div><svg class="mini-line-chart" viewBox="0 0 280 92"><g stroke="#bba08020" fill="none"><path d="M0 15H280M0 45H280M0 75H280" stroke-dasharray="2 4"/></g><path d="M0 77C15 78 20 79 30 75S47 12 60 13S80 68 95 64S120 49 140 54S159 9 177 11S193 49 211 55S244 71 280 78" fill="none" stroke="#dfae79" stroke-width="2.4"/><path d="M0 80C25 79 40 77 60 67S89 45 110 38S148 26 170 30S212 46 230 58S260 75 280 80" fill="none" stroke="#a3a089" stroke-width="2" stroke-dasharray="4 3"/><g fill="#ab9d89" font-size="6"><text x="0" y="91">00:00</text><text x="86" y="91">08:00</text><text x="176" y="91">16:00</text><text x="260" y="91">23:00</text></g></svg><div class="mobility-legend"><span>Weekday</span><span>Weekend</span></div></div></div>`;
  const visuals = { retail: retailVisual, retention: retentionVisual, mobility: mobilityVisual };
  const projectVisual = project => {
    const image = String(project.image || '').trim();
    if (image && (/^\.\/assets\//.test(image) || safeUrl(image))) {
      return `<div class="project-visual project-image-visual" aria-hidden="true"><img src="${escape(image)}" alt="" loading="lazy" width="760" height="480"></div>`;
    }
    return (visuals[project.visual] || retailVisual)();
  };

  $('#projects-grid').innerHTML = data.projects.map((project, index) => `<article class="project-card reveal" data-project-card="${escape(project.id)}" style="animation-delay:${index * 55}ms"><button class="project-preview-button" data-open-project="${escape(project.id)}" aria-label="Read case study: ${escape(project.title)}">${projectVisual(project)}<span class="project-view" aria-hidden="true">View<br>study ↗</span></button><div class="project-content"><span class="project-number" aria-hidden="true">${escape(project.number)}</span><div class="project-meta"><span>${escape(project.category)}</span><span>${project.isSample ? 'SAMPLE · ' : ''}${escape(project.number)}</span></div><h3>${escape(project.title)}</h3><p>${escape(project.description)}</p><div class="project-tags">${project.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div><button class="case-link" data-open-project="${escape(project.id)}" aria-label="Read case study: ${escape(project.title)}">Explore case study <span aria-hidden="true">↗</span></button></div></article>`).join('');
  const hasSamples = data.projects.some(project => project.isSample);
  $('.sample-label').hidden = !hasSamples;
  $('.projects-footnote').hidden = !hasSamples;
  $('.project-filters [data-filter="all"] span').textContent = String(data.projects.length).padStart(2, '0');
  const emptyProjects = $('#projects-empty');
  emptyProjects.hidden = data.projects.length > 0;
  if (!data.projects.length) emptyProjects.textContent = 'New projects are on the way. Check back soon.';
  const filterButtons = $$('.project-filters button');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const filter = button.dataset.filter;
    let visible = 0;
    data.projects.forEach(project => {
      const matches = filter === 'all' || project.filters.includes(filter);
      const card = $$('[data-project-card]').find(el => el.dataset.projectCard === project.id);
      card.hidden = !matches;
      if (matches) { visible++; card.classList.add('visible'); }
    });
    emptyProjects.hidden = visible > 0;
    emptyProjects.textContent = data.projects.length ? 'No projects in this category yet. Try another filter.' : 'New projects are on the way. Check back soon.';
    $('#filter-status').textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown.`;
  }));

  $('#skills-grid').innerHTML = data.skills.map(skill => `<div class="skill"><div class="skill-icon">${icons[skill.icon] || icons.code}</div><div><p class="skill-category">${escape(skill.category)}</p><h3>${escape(skill.name)}</h3><p class="skill-description">${escape(skill.description)}</p></div></div>`).join('');

  // The native dialog handles focus containment and Escape. Focus returns to the trigger.
  const dialog = $('#case-study');
  let trigger = null;
  let previousHash = '#work';
  let activeProjectId = null;
  let caseTraversalPending = false;
  function openProject(id, updateHistory = true) {
    const project = data.projects.find(item => item.id === id);
    if (!project) return;
    if (dialog.open && activeProjectId === id) return;
    if (!dialog.open) trigger = document.activeElement;
    if (!location.hash.startsWith('#case-')) previousHash = location.hash || '#work';
    else previousHash = history.state?.portfolioReturnHash || '#work';
    activeProjectId = id;
    const repo = safeUrl(project.repository);
    const live = safeUrl(project.liveUrl);
    $('#case-content').innerHTML = `<div class="case-body"><p class="case-label">${escape(project.year)} / ${escape(project.category)}</p><h2 id="case-title">${escape(project.title)}</h2><p class="case-summary">${escape(project.summary)}</p><div class="case-meta"><div><span>Format</span>${escape(project.type)}</div><div><span>Tools</span>${escape(project.tags.join(' · '))}</div></div>${project.dataNote ? `<p class="case-data-note">${escape(project.dataNote)}</p>` : ''}<div class="case-visual">${projectVisual(project)}</div><section class="case-section"><h3>The question</h3><p class="case-question">${escape(project.question)}</p></section><section class="case-section"><h3>The approach</h3><ol class="case-process">${project.process.map(step => `<li><strong>${escape(step.title)}</strong><p>${escape(step.text)}</p></li>`).join('')}</ol></section><section class="case-section"><h3>What the analysis shows</h3><p>${escape(project.finding)}</p></section><section class="case-section"><h3>The next step</h3><p>${escape(project.nextStep)}</p></section>${repo || live ? `<div class="case-links">${repo ? `<a class="button button-primary" href="${escape(repo)}" target="_blank" rel="noopener noreferrer">View repository <span aria-hidden="true">↗</span></a>` : ''}${live ? `<a class="button button-secondary" href="${escape(live)}" target="_blank" rel="noopener noreferrer">View live project <span aria-hidden="true">↗</span></a>` : ''}</div>` : ''}</div>`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
    if (updateHistory) history.pushState({ portfolioCase: project.id, portfolioReturnHash: previousHash }, '', `#case-${encodeURIComponent(project.id)}`);
    $('#close-case').focus({ preventScroll: true });
  }
  function closeProject() {
    if (!dialog.open || caseTraversalPending) return;
    // A case opened in this visit has its own history entry. Back closes it,
    // and Forward can reopen it. A directly shared link has no entry to undo.
    if (history.state?.portfolioCase === activeProjectId && location.hash.startsWith('#case-')) {
      caseTraversalPending = true;
      history.back();
    } else {
      history.replaceState(null, '', previousHash);
      dialog.close();
      $(previousHash)?.scrollIntoView({ block: 'start' });
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-open-project]');
    if (button) openProject(button.dataset.openProject);
  });
  $('#close-case').addEventListener('click', closeProject);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject(); } });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    const fallbackTrigger = $$('[data-open-project]').find(button => button.dataset.openProject === activeProjectId);
    const focusTarget = trigger && trigger !== document.body && trigger.isConnected ? trigger : fallbackTrigger;
    activeProjectId = null;
    focusTarget?.focus({ preventScroll: true });
  });
  function readProjectHash() {
    caseTraversalPending = false;
    if (location.hash.startsWith('#case-')) {
      let id;
      try { id = decodeURIComponent(location.hash.slice(6)); } catch { return; }
      if (data.projects.some(project => project.id === id)) openProject(id, false);
      else if (dialog.open) dialog.close();
    } else if (dialog.open) dialog.close();
  }
  window.addEventListener('popstate', readProjectHash);
  window.addEventListener('hashchange', readProjectHash);
  readProjectHash();

  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); mobileNav.hidden = true; };
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    mobileNav.hidden = expanded;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Prefer email; otherwise use a real profile or return visitors to the work.
  const email = String(data.email || '').trim();
  const contactCta = $('#contact-cta');
  const contactProfile = [['LinkedIn', safeUrl(data.linkedin)], ['GitHub', safeUrl(data.github)]].find(([, url]) => url);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const mailto = `mailto:${encodeURIComponent(email)}`;
    $('#email-contact').innerHTML = `<a class="email-link" href="${mailto}">${escape(email)} <span aria-hidden="true">↗</span></a>`;
    contactCta.href = mailto;
    contactCta.setAttribute('aria-label', `Email ${data.name}`);
  } else if (contactProfile) {
    const [label, url] = contactProfile;
    contactCta.href = url;
    contactCta.target = '_blank';
    contactCta.rel = 'noopener noreferrer';
    contactCta.setAttribute('aria-label', `Connect with ${data.name} on ${label}`);
    contactCta.querySelector('span:last-child').textContent = label.toUpperCase();
    $('#email-contact').textContent = `Find me on ${label}.`;
  } else {
    contactCta.classList.add('unconfigured');
    contactCta.href = '#work';
    contactCta.querySelector('span:last-child').textContent = 'VIEW THE WORK';
    contactCta.setAttribute('aria-label', 'Back to selected work');
  }
  $('#social-links').innerHTML = [['GitHub', data.github], ['LinkedIn', data.linkedin]].filter(([, url]) => safeUrl(url)).map(([label, url]) => `<a href="${escape(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`).join('');

  const chartData = {
    revenue: { values: [48120, 55840, 52430, 69120, 65780, 84254], max: 90000, total: '$84,254', label: 'revenue', format: n => `$${n.toLocaleString('en-US')}`, tick: n => n ? `${Math.round(n / 1000)}k` : '0' },
    orders: { values: [990, 1180, 1140, 1480, 1390, 1724], max: 1800, total: '1,724', label: 'orders', format: n => n.toLocaleString('en-US'), tick: n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n) },
    conversion: { values: [2.8, 3.1, 2.9, 3.5, 3.4, 4.2], max: 6, total: '4.2%', label: 'conversion rate', format: n => `${n}%`, tick: n => `${n}%` }
  };
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  let activeMetric = 'revenue';
  function updateChart(key) {
    const metric = chartData[key];
    if (!metric) return;
    activeMetric = key;
    $('#metric-value').textContent = metric.total;
    const change = metric.values.at(-1) - metric.values.at(-2);
    const growth = key === 'conversion' ? `${Math.abs(change).toFixed(1)} pp` : `${Math.abs(change / metric.values.at(-2) * 100).toFixed(1)}%`;
    $('#metric-trend').textContent = `${change >= 0 ? '↗' : '↘'} ${growth}`;
    $('#chart-title').textContent = `Sample monthly ${metric.label}`;
    $('#chart-desc').textContent = `Synthetic ${metric.label} from January to June: ${metric.values.map((value, i) => `${months[i]} ${metric.format(value)}`).join(', ')}. Values are for demonstration.`;
    $('#chart-y').innerHTML = [1, 2 / 3, 1 / 3, 0].map((ratio, i) => `<text x="29" y="${24 + i * 44}">${metric.tick(Math.round(metric.max * ratio))}</text>`).join('');
    const points = metric.values.map((value, i) => [48 + i * 86, 152 - value / metric.max * 132]);
    let path = `M${points[0][0]},${points[0][1]}`;
    points.slice(1).forEach(([x, y], i) => { const [px, py] = points[i]; const midpoint = (px + x) / 2; path += ` C${midpoint},${py} ${midpoint},${y} ${x},${y}`; });
    $('#chart-line').setAttribute('d', path);
    $('#chart-area').setAttribute('d', `${path} L478,163 L48,163 Z`);
    $('#chart-points').innerHTML = points.map(([x, y], i) => `<circle class="chart-point" tabindex="0" role="img" aria-label="${months[i]}: ${escape(metric.format(metric.values[i]))}" data-point="${i}" cx="${x}" cy="${y}" r="4"/>`).join('');
    $('#chart-tooltip').hidden = true;
    $$('.dashboard-tabs button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.metric === key)));
  }
  $$('.dashboard-tabs button').forEach(button => button.addEventListener('click', () => updateChart(button.dataset.metric)));
  function showPoint(point) {
    if (!point) return;
    const index = Number(point.dataset.point);
    const metric = chartData[activeMetric];
    const tooltip = $('#chart-tooltip');
    tooltip.textContent = `${months[index]} · ${metric.format(metric.values[index])}`;
    tooltip.style.left = `${Math.min(86, Math.max(15, Number(point.getAttribute('cx')) / 5))}%`;
    tooltip.style.top = `${Number(point.getAttribute('cy')) / 196 * 100}%`;
    tooltip.hidden = false;
  }
  $('#chart-points').addEventListener('pointerover', event => showPoint(event.target.closest('[data-point]')));
  $('#chart-points').addEventListener('focusin', event => showPoint(event.target.closest('[data-point]')));
  $('#chart-points').addEventListener('click', event => showPoint(event.target.closest('[data-point]')));
  $('#hero-chart').addEventListener('pointerleave', () => { $('#chart-tooltip').hidden = true; });
  $('#chart-points').addEventListener('focusout', () => { $('#chart-tooltip').hidden = true; });
  updateChart('revenue');

  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-animations');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    $$('.reveal').forEach(element => observer.observe(element));
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) $$('.desktop-nav a').forEach(link => { const active = link.hash === `#${entry.target.id}`; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }), { rootMargin: '-20% 0px -55% 0px' });
    $$('main section[id]:not(#home)').forEach(section => sectionObserver.observe(section));
  }
})();
