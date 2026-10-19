(() => {
  'use strict';
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const total = slides.length;
  const $ = (id) => document.getElementById(id);
  const prev = $('prev'), next = $('next'), fs = $('fs'), bar = $('bar'), count = $('count');
  const prog = document.querySelector('.prog');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NS = 'http://www.w3.org/2000/svg';
  let cur = -1;
  const timers = new Map();

  // Escala fixa 16:9 centralizada (área segura)
  function fit() {
    const s = Math.min(innerWidth / 1920, (innerHeight - 4) / 1080);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  }
  addEventListener('resize', fit);
  fit();

  // Partículas leves (poucos elementos CSS)
  document.querySelectorAll('.fx').forEach((fx) => {
    const n = +fx.dataset.n || 12;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const s = rnd(4, 12);
      p.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;--s:${s}px;--t:${rnd(5, 11)}s;--x:${rnd(-60, 60)}px;--y:${rnd(-80, 80)}px;animation-delay:${rnd(0, 3)}s`;
      if (i % 5 === 0) { p.style.background = 'var(--amb)'; p.style.boxShadow = '0 0 14px var(--amb)'; }
      fx.appendChild(p);
    }
  });

  // Cristais de açúcar caindo (slide 4)
  const rain = document.querySelector('.rain');
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('i');
    c.style.cssText = `left:${40 + i * 36}px;--d:${(i * 0.37).toFixed(2)}s`;
    rain.appendChild(c);
  }

  // Íons de sal ao redor da célula (slide 3)
  const salt = document.querySelector('.salt');
  for (let i = 0; i < 34; i++) {
    const x = rnd(20, 720), y = rnd(20, 520);
    if (((x - 370) / 230) ** 2 + ((y - 300) / 200) ** 2 < 1) continue;
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y);
    r.setAttribute('width', 12); r.setAttribute('height', 12);
    r.setAttribute('transform', `rotate(45 ${x + 6} ${y + 6})`);
    r.setAttribute('opacity', rnd(0.4, 1).toFixed(2));
    salt.appendChild(r);
  }

  // Navegação: reinicia animações removendo/adicionando a classe "on"
  function go(i) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur) return;
    const old = slides[cur];
    if (old) {
      old.classList.remove('act');
      clearTimeout(timers.get(old));
      timers.set(old, setTimeout(() => { if (slides[cur] !== old) old.classList.remove('on'); }, 900));
    }
    cur = i;
    const s = slides[i];
    clearTimeout(timers.get(s));
    s.classList.remove('on');
    void s.offsetWidth; // força reflow para reiniciar as animações
    s.classList.add('act', 'on');
    bar.style.width = ((i + 1) / total) * 100 + '%';
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${total}`;
    prog.setAttribute('aria-valuenow', i + 1);
    prev.disabled = i === 0;
    next.disabled = i === total - 1;
    next.style.visibility = i === total - 1 ? 'hidden' : 'visible';
    slides.forEach((x, k) => x.setAttribute('aria-hidden', k !== i));
  }

  prev.addEventListener('click', (e) => { e.stopPropagation(); go(cur - 1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); go(cur + 1); });

  // Tela cheia com tratamento de erros
  fs.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      if (!document.fullscreenEnabled) throw new Error('indisponível');
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (err) {
      fs.disabled = true; fs.title = 'Tela cheia indisponível neste navegador';
    }
  });

  // Teclado (ignora campos de texto e elementos editáveis)
  addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (t && t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(total - 1); }
    else if (k === 'f' || k === 'F') fs.click();
  });

  // Parallax sutil
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('mousemove', (e) => {
      stage.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
      stage.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
    });
  }

  go(0);
})();
