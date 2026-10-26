/* Original Canvas 2D artwork and a dependency-free motion layer. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reducedPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('#motion-toggle');
  let savedPreference = null;
  try { savedPreference = localStorage.getItem('portfolio.motion'); } catch { /* Storage is optional. */ }
  let paused = reducedPreference.matches || savedPreference === 'off';
  const surfaces = [...document.querySelectorAll('.project-card, .about-visual, .skill')];
  const magneticButtons = [...document.querySelectorAll('.button')];
  const progress = document.querySelector('.scroll-progress');
  const heroCopy = document.querySelector('.hero-copy');
  const cursor = document.createElement('div');
  cursor.className = 'cursor-ring';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);

  function createSignal(canvas, stage) {
    const noop = { setMotion() {}, setPointer() {}, setForm() {}, setStructure() {} };
    if (!canvas || !stage) return noop;
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.hidden = true; return noop; }
    let active = !paused, visible = true, frame = null, last = 0, clock = 0;
    let width = 1, height = 1, ratio = 1, dirty = true, traced = false;
    let target = 'connect', mix = [1, 0, 0], pointer = [3, 3];
    const columns = 48, rows = 28, count = columns * rows;
    const points = new Array(count);
    function requestFrame() {
      if (frame === null && visible && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function resize() {
      const box = stage.getBoundingClientRect();
      width = Math.max(1, box.width); height = Math.max(1, box.height);
      ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.6);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); dirty = false;
    }
    function draw(time) {
      frame = null;
      if (!visible || document.hidden) return;
      if (active && last && time - last < 32 && !dirty) { requestFrame(); return; }
      if (active && last) clock += Math.min((time - last) / 1000, .06);
      last = time;
      if (dirty) resize();
      const selected = ['connect', 'create', 'explore'].indexOf(target);
      mix = mix.map((value, index) => value + ((index === selected ? 1 : 0) - value) * (active ? .08 : 1));
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width * .44, height * .46);
      const centerX = width * .54, centerY = height * .49;
      for (let i = 0; i < count; i++) {
        const col = i % columns, row = Math.floor(i / columns);
        const u = col / (columns - 1), v = row / (rows - 1);
        const angle = u * Math.PI * 2 + v * 1.7 + clock * .16;
        const flowX = (u - .5) * 1.95 + .1 * Math.sin(v * 7 + clock * .4);
        const flowY = (v - .5) * 1.3 + .25 * Math.sin(u * 7 + v * 3 + clock * .6);
        const gridX = (u - .5) * 1.9;
        const gridY = (v - .5) * 1.48 + Math.sin(u * 9 + clock * .8) * .12;
        const orbitAngle = u * Math.PI * 2 + v * .5 - clock * .1;
        const orbitRadius = .3 + v * .63;
        const orbitX = Math.cos(orbitAngle) * orbitRadius;
        const orbitY = Math.sin(orbitAngle) * orbitRadius;
        let x = flowX * mix[0] + gridX * mix[1] + orbitX * mix[2];
        let y = flowY * mix[0] + gridY * mix[1] + orbitY * mix[2];
        if (active) {
          const dx = x - pointer[0], dy = y - pointer[1], distance = Math.hypot(dx, dy);
          const force = Math.max(0, .45 - distance) * .28;
          x += dx / (distance || 1) * force; y += dy / (distance || 1) * force;
        }
        const px = centerX + x * scale, py = centerY + y * scale;
        points[i] = [px, py];
        const pulse = .55 + .45 * Math.sin(angle * 2 + v * 8 + clock);
        ctx.fillStyle = col % 11 === 0 ? `rgba(202,192,247,${.45 + pulse * .4})` : `rgba(${col % 3 === 0 ? '237,242,223' : '216,255,104'},${.3 + pulse * .65})`;
        const size = (1.05 + pulse * 1.15) * (innerWidth < 700 ? .85 : 1);
        ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
      }
      if (traced) {
        ctx.lineWidth = .6; ctx.strokeStyle = 'rgba(216,255,104,.2)'; ctx.beginPath();
        points.forEach((point, index) => {
          if (index % columns === 0) ctx.moveTo(...point); else ctx.lineTo(...point);
        });
        ctx.stroke();
      }
      canvas.dataset.state = active ? 'running' : 'paused';
      if (active) requestFrame();
    }
    const observer = new ResizeObserver(() => { dirty = true; requestFrame(); });
    observer.observe(stage);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; last = 0;
      if (visible) requestFrame();
      else { cancelAnimationFrame(frame); frame = null; canvas.dataset.state = 'offscreen'; }
    }, { threshold:.01 }).observe(stage);
    document.addEventListener('visibilitychange', () => {
      last = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = null; } else requestFrame();
    });
    stage.classList.add('signal-ready'); requestFrame();
    return {
      setMotion(enabled) { active = enabled; last = 0; cancelAnimationFrame(frame); frame = null; requestFrame(); },
      setPointer(x, y) { pointer = [x, y]; if (active) requestFrame(); },
      setForm(name) { target = name; canvas.dataset.form = name; requestFrame(); },
      setStructure(enabled) { traced = enabled; canvas.dataset.trace = String(enabled); requestFrame(); }
    };
  }

  const signal = createSignal(document.querySelector('#signal-canvas'), document.querySelector('#signal-stage'));
  const formConsole = document.querySelector('.form-console');
  if (document.querySelector('#signal-stage').classList.contains('signal-ready')) formConsole.hidden = false;
  const formNotes = {
    connect: ['01 / FLOW', 'A living field. Move your cursor through it.'],
    create: ['02 / GRID', 'A little structure. A different rhythm.'],
    explore: ['03 / ORBIT', 'Individual points. A shared direction.']
  };
  document.querySelectorAll('button[data-form]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('button[data-form]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const name = button.dataset.form;
    document.querySelector('#form-coordinate').textContent = formNotes[name][0];
    document.querySelector('#form-description').textContent = formNotes[name][1];
    signal.setForm(name);
  }));
  document.querySelector('#structure-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const enabled = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(enabled));
    signal.setStructure(enabled);
  });
  function resetSurface(surface) {
    surface.style.setProperty('--tilt-x', '0deg');
    surface.style.setProperty('--tilt-y', '0deg');
  }
  function updateMotion() {
    root.dataset.motion = paused ? 'reduced' : 'full';
    motionButton.hidden = false;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Enable animations' : 'Pause animations');
    motionButton.querySelector('.motion-label').textContent = paused ? 'Motion off' : 'Motion on';
    signal.setMotion(!paused);
    if (paused) {
      cursor.style.opacity = '0';
      surfaces.forEach(resetSurface);
      magneticButtons.forEach(button => { button.style.setProperty('--mag-x', '0px'); button.style.setProperty('--mag-y', '0px'); });
      heroCopy?.style.setProperty('--hero-drift', '0px');
    }
  }
  motionButton.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('portfolio.motion', paused ? 'off' : 'on'); } catch { /* Motion still works without storage. */ }
    updateMotion();
  });
  reducedPreference.addEventListener('change', event => { paused = event.matches || localStorageValue() === 'off'; updateMotion(); });
  function localStorageValue() { try { return localStorage.getItem('portfolio.motion'); } catch { return null; } }

  surfaces.forEach(surface => {
    surface.addEventListener('pointermove', event => {
      if (paused || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const strength = surface.classList.contains('skill') ? 6 : 11;
      surface.style.setProperty('--tilt-x', `${((0.5 - y) * strength).toFixed(2)}deg`);
      surface.style.setProperty('--tilt-y', `${((x - 0.5) * strength).toFixed(2)}deg`);
      surface.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`);
      surface.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`);
    }, { passive: true });
    surface.addEventListener('pointerleave', () => resetSurface(surface));
  });
  magneticButtons.forEach(button => {
    button.addEventListener('pointermove', event => {
      if (paused || !finePointer.matches || button.disabled) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--mag-x', `${Math.max(-8, Math.min(8, (event.clientX - rect.left - rect.width / 2) * 0.14)).toFixed(1)}px`);
      button.style.setProperty('--mag-y', `${Math.max(-6, Math.min(6, (event.clientY - rect.top - rect.height / 2) * 0.17)).toFixed(1)}px`);
    }, { passive: true });
    button.addEventListener('pointerleave', () => { button.style.setProperty('--mag-x', '0px'); button.style.setProperty('--mag-y', '0px'); });
  });

  let pointerFrame = null;
  let pointerEvent = null;
  document.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches || event.pointerType === 'touch') return;
    pointerEvent = event;
    if (pointerFrame !== null) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = null;
      if (paused) return;
      const event = pointerEvent;
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0) translate(-50%,-50%)`;
      cursor.style.opacity = event.target.closest('dialog') ? '0' : '.7';
      cursor.classList.toggle('over-link', Boolean(event.target.closest('a,button,summary')));
      const hero = document.querySelector('#signal-stage').getBoundingClientRect();
      if (hero.bottom > 0 && hero.top < innerHeight) signal.setPointer((event.clientX - hero.left - hero.width * .54) / Math.min(hero.width * .44, hero.height * .46), (event.clientY - hero.top - hero.height * .49) / Math.min(hero.width * .44, hero.height * .46));
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });

  let scrollFrame = null;
  function updateScroll() {
    scrollFrame = null;
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0})`;
    if (!paused && finePointer.matches) heroCopy?.style.setProperty('--hero-drift', `${Math.min(700, Math.max(0, scrollY)) * 0.035}px`);
  }
  addEventListener('scroll', () => { if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  addEventListener('resize', updateScroll, { passive: true });
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.section-heading, .contact-layout').forEach(element => { element.classList.add('motion-reveal'); revealObserver.observe(element); });
  }
  root.classList.add('motion-ready');
  updateMotion();
  updateScroll();
})();
