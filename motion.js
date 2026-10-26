/* An original, dependency-free motion layer and WebGL sculpture. */
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

  function createSculpture(canvas, stage) {
    if (!canvas || !stage) return { setMotion() {}, setPointer() {}, setForm() {}, setStructure() {} };
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch { /* The CSS sculpture remains available. */ }
    if (!gl) { canvas.hidden = true; return { setMotion() {}, setPointer() {}, setForm() {}, setStructure() {} }; }

    const vertexSource = `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec3 aCreatePosition;
      attribute vec3 aCreateNormal;
      attribute vec3 aExplorePosition;
      attribute vec3 aExploreNormal;
      uniform vec2 uFormMix;
      uniform mat4 uModel;
      uniform mat4 uProjection;
      uniform float uFloat;
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        float base = 1.0 - uFormMix.x - uFormMix.y;
        vec3 position = aPosition * base + aCreatePosition * uFormMix.x + aExplorePosition * uFormMix.y;
        vec3 normal = normalize(aNormal * base + aCreateNormal * uFormMix.x + aExploreNormal * uFormMix.y);
        vec4 world = uModel * vec4(position, 1.0);
        world.y += uFloat;
        vPosition = world.xyz;
        vNormal = mat3(uModel) * normal;
        gl_Position = uProjection * vec4(world.xyz - vec3(0.0, 0.0, 7.5), 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uStructure;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 view = normalize(vec3(0.0, 0.0, 7.5) - vPosition);
        vec3 reflection = reflect(-view, normal);
        float sky = pow(max(reflection.y * 0.5 + 0.5, 0.0), 2.0);
        vec3 environment = vec3(0.018, 0.023, 0.031) + sky * vec3(0.28, 0.31, 0.37);
        float softbox = pow(max(dot(reflection, normalize(vec3(-0.8, 1.4, 1.5))), 0.0), 17.0);
        float warmbox = pow(max(dot(reflection, normalize(vec3(1.6, 0.3, 0.7))), 0.0), 22.0);
        float lightstrip = 1.0 - smoothstep(0.025, 0.13, abs(reflection.y + 0.18 + 0.035 * sin(reflection.x * 5.0)));
        environment += softbox * vec3(4.0, 3.9, 3.7);
        environment += warmbox * vec3(2.0, 2.7, 0.7);
        environment += lightstrip * vec3(0.78, 0.6, 1.15);
        float copper = smoothstep(-0.85, 1.05, vPosition.x + 0.18 * sin(vPosition.y * 2.0));
        vec3 metal = mix(vec3(0.72, 0.79, 0.85), vec3(0.77, 0.94, 0.42), copper);
        float diffuse = max(dot(normal, normalize(vec3(-1.0, 1.5, 2.0))), 0.0) * 0.2 + 0.045;
        float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.8);
        vec3 color = metal * (environment * (0.64 + 0.36 * fresnel) + diffuse);
        color += fresnel * vec3(0.07, 0.12, 0.025);
        float cavity = smoothstep(0.2, 1.55, length(vPosition.xy));
        color *= mix(0.6, 1.0, cavity);
        color = 1.0 - exp(-color * 1.4);
        color = pow(color, vec3(1.0 / 2.2));
        gl_FragColor = vec4(mix(color, vec3(0.72, 0.94, 0.43) * (0.6 + 0.4 * max(normal.z, 0.0)), uStructure), 1.0);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }
    let program;
    try {
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (error) {
      console.warn('The 3D sculpture is using its CSS fallback.', error.message);
      canvas.hidden = true;
      return { setMotion() {}, setPointer() {}, setForm() {}, setStructure() {} };
    }

    const normalize = vector => {
      const length = Math.hypot(...vector) || 1;
      return vector.map(value => value / length);
    };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const curve = t => {
      const radius = 1.3 + 0.38 * Math.cos(3 * t);
      return [radius * Math.cos(2 * t), radius * Math.sin(2 * t), 0.5 * Math.sin(3 * t)];
    };
    const createCurve = t => [1.55 * Math.cos(t), 1.55 * Math.sin(t), 0.14 * Math.sin(3 * t)];
    const exploreCurve = t => {
      const radius = 1.3 + 0.37 * Math.cos(5 * t);
      return [radius * Math.cos(t), radius * Math.sin(t), 0.38 * Math.sin(5 * t)];
    };
    const segments = 360;
    const sides = 40;
    const positions = [];
    const normals = [];
    const indices = [];
    const wireIndices = [];
    const createPositions = [], createNormals = [], explorePositions = [], exploreNormals = [];
    function tubePoint(path, t, angle, radius) {
      const center = path(t);
      const before = path(t - 0.001), after = path(t + 0.001);
      const tangent = normalize(after.map((value, axis) => value - before[axis]));
      const normal = normalize([tangent[1], -tangent[0], 0]);
      const binormal = cross(tangent, normal);
      const outward = normal.map((value, axis) => value * Math.cos(angle) + binormal[axis] * Math.sin(angle));
      return { position: outward.map((value, axis) => center[axis] + value * radius), normal: outward };
    }
    // A trefoil tube: the connected loop is geometry, not an image or video.
    for (let i = 0; i <= segments; i++) {
      const t = i / segments * Math.PI * 2;
      const center = curve(t);
      const before = curve(t - 0.001);
      const after = curve(t + 0.001);
      const tangent = normalize(after.map((value, axis) => value - before[axis]));
      const normal = normalize([tangent[1], -tangent[0], 0]);
      const binormal = cross(tangent, normal);
      for (let j = 0; j <= sides; j++) {
        const angle = j / sides * Math.PI * 2;
        const outward = normal.map((value, axis) => value * Math.cos(angle) + binormal[axis] * Math.sin(angle));
        outward.forEach((value, axis) => {
          positions.push(center[axis] + value * 0.42);
          normals.push(value);
        });
        const created = tubePoint(createCurve, t, angle, 0.49);
        const explored = tubePoint(exploreCurve, t, angle, 0.32);
        createPositions.push(...created.position); createNormals.push(...created.normal);
        explorePositions.push(...explored.position); exploreNormals.push(...explored.normal);
        const pointIndex = i * (sides + 1) + j;
        if (i < segments && j % 4 === 0) wireIndices.push(pointIndex, pointIndex + sides + 1);
        if (j < sides && i % 8 === 0) wireIndices.push(pointIndex, pointIndex + 1);
        if (i < segments && j < sides) {
          const a = i * (sides + 1) + j;
          const b = a + sides + 1;
          indices.push(a, a + 1, b, a + 1, b + 1, b);
        }
      }
    }
    gl.useProgram(program);
    function attribute(name, values) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    }
    attribute('aPosition', positions);
    attribute('aNormal', normals);
    attribute('aCreatePosition', createPositions);
    attribute('aCreateNormal', createNormals);
    attribute('aExplorePosition', explorePositions);
    attribute('aExploreNormal', exploreNormals);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    const wireBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireIndices), gl.STATIC_DRAW);
    const formLocation = gl.getUniformLocation(program, 'uFormMix');
    const structureLocation = gl.getUniformLocation(program, 'uStructure');
    const modelLocation = gl.getUniformLocation(program, 'uModel');
    const projectionLocation = gl.getUniformLocation(program, 'uProjection');
    const floatLocation = gl.getUniformLocation(program, 'uFloat');
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    function multiply(a, b) {
      const out = new Float32Array(16);
      for (let column = 0; column < 4; column++) {
        for (let row = 0; row < 4; row++) {
          for (let k = 0; k < 4; k++) out[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
        }
      }
      return out;
    }
    const rotationX = angle => { const c = Math.cos(angle), s = Math.sin(angle); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; };
    const rotationY = angle => { const c = Math.cos(angle), s = Math.sin(angle); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; };
    const rotationZ = angle => { const c = Math.cos(angle), s = Math.sin(angle); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
    let dirty = true;
    let visible = true;
    let active = !paused;
    let failed = false;
    let frame = null;
    let elapsed = 0;
    let lastTime = 0;
    let lastDraw = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let formX = 0, formY = 0, targetFormX = 0, targetFormY = 0;
    let structure = false;
    function resize() {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.65, 1600 / Math.max(1, rect.width), 1400 / Math.max(1, rect.height));
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const f = 1 / Math.tan(38 * Math.PI / 360);
      const near = 0.1, far = 30;
      const aspect = Math.max(0.1, canvas.width / canvas.height);
      gl.uniformMatrix4fv(projectionLocation, false, new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]));
      dirty = false;
    }
    function requestFrame() {
      if (frame === null && visible && !document.hidden && !failed) frame = requestAnimationFrame(draw);
    }
    function draw(time) {
      frame = null;
      if (failed || !visible || document.hidden) return;
      const interval = innerWidth < 700 ? 1000 / 30 : 1000 / 50;
      if (active && time - lastDraw < interval && !dirty) { requestFrame(); return; }
      lastDraw = time;
      if (dirty) resize();
      if (active && lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      pointerX += (targetX - pointerX) * 0.055;
      pointerY += (targetY - pointerY) * 0.055;
      formX += (targetFormX - formX) * (active ? 0.085 : 1);
      formY += (targetFormY - formY) * (active ? 0.085 : 1);
      const rotation = multiply(rotationY(0.28 + elapsed * 0.13 + pointerX * 0.45), multiply(rotationX(0.78 + pointerY * 0.3), rotationZ(0.25 + elapsed * 0.075)));
      gl.uniformMatrix4fv(modelLocation, false, rotation);
      gl.uniform1f(floatLocation, Math.sin(elapsed * 0.7) * 0.075);
      gl.uniform2f(formLocation, formX, formY);
      gl.uniform1f(structureLocation, structure ? 1 : 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, structure ? wireBuffer : indexBuffer);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(structure ? gl.LINES : gl.TRIANGLES, structure ? wireIndices.length : indices.length, gl.UNSIGNED_SHORT, 0);
      canvas.dataset.state = active ? 'running' : 'paused';
      if (active) requestFrame();
    }
    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => { dirty = true; requestFrame(); }) : null;
    resizeObserver?.observe(stage);
    window.addEventListener('resize', () => { dirty = true; requestFrame(); }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        lastTime = 0;
        if (visible) requestFrame();
        else { if (frame !== null) cancelAnimationFrame(frame); frame = null; canvas.dataset.state = 'offscreen'; }
      }, { threshold: 0.01 }).observe(stage);
    }
    document.addEventListener('visibilitychange', () => {
      lastTime = 0;
      if (document.hidden) { if (frame !== null) cancelAnimationFrame(frame); frame = null; }
      else requestFrame();
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      failed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      canvas.hidden = true;
      stage.classList.remove('webgl-ready');
      canvas.dataset.state = 'fallback';
      document.querySelector('.form-console').hidden = true;
    });
    stage.classList.add('webgl-ready');
    requestFrame();
    return {
      setMotion(enabled) {
        active = enabled;
        lastTime = 0;
        if (!enabled) { targetX = pointerX; targetY = pointerY; if (frame !== null) cancelAnimationFrame(frame); frame = null; }
        requestFrame();
      },
      setPointer(x, y) { if (active) { targetX = x; targetY = y; requestFrame(); } },
      setForm(name) {
        targetFormX = name === 'create' ? 1 : 0;
        targetFormY = name === 'explore' ? 1 : 0;
        canvas.dataset.form = name;
        requestFrame();
      },
      setStructure(enabled) { structure = enabled; canvas.dataset.structure = enabled ? 'wireframe' : 'solid'; requestFrame(); }
    };
  }

  const sculpture = createSculpture(document.querySelector('#sculpture-canvas'), document.querySelector('#sculpture-stage'));
  const formConsole = document.querySelector('.form-console');
  if (document.querySelector('#sculpture-stage').classList.contains('webgl-ready')) formConsole.hidden = false;
  const formNotes = {
    connect: ['01 / CONNECTION', 'Different ideas. One connected system.'],
    create: ['02 / POSSIBILITY', 'A clear starting point. Room to build.'],
    explore: ['03 / DISCOVERY', 'A new perspective changes the picture.']
  };
  document.querySelectorAll('button[data-form]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('button[data-form]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const name = button.dataset.form;
    document.querySelector('#form-coordinate').textContent = formNotes[name][0];
    document.querySelector('#form-description').textContent = formNotes[name][1];
    sculpture.setForm(name);
  }));
  document.querySelector('#structure-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const enabled = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(enabled));
    sculpture.setStructure(enabled);
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
    sculpture.setMotion(!paused);
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
      const hero = document.querySelector('#home').getBoundingClientRect();
      if (hero.bottom > 0 && hero.top < innerHeight) sculpture.setPointer((event.clientX - hero.left) / hero.width - 0.5, (event.clientY - hero.top) / hero.height - 0.5);
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
