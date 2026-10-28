(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function init(wrap) {
    if (wrap.closest && wrap.closest('.rails[data-layout="grid"]')) return;
    var block = wrap.parentNode, rail = wrap.querySelector('.rail'), nav = block.querySelector('.rail-nav');
    if (!rail || !nav) return;
    var prev = nav.querySelector('[data-dir="prev"]'), next = nav.querySelector('[data-dir="next"]'), ticking = false;
    function update() {
      var max = rail.scrollWidth - rail.clientWidth, scrollable = max > 4;
      nav.classList.toggle('on', scrollable);
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max - 2;
      wrap.classList.toggle('can-next', scrollable && rail.scrollLeft < max - 2);
    }
    function step(dir) {
      var card = rail.querySelector('.featured'), w = card ? card.getBoundingClientRect().width + 24 : 340;
      var n = Math.max(1, Math.floor(rail.clientWidth / w));
      rail.scrollBy({ left: dir * w * n, behavior: reduce ? 'auto' : 'smooth' });
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    rail.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
  var wraps = document.querySelectorAll('.rail-wrap');
  for (var i = 0; i < wraps.length; i++) init(wraps[i]);
})();

/* Coverflow: drag, wheel, keyboard and buttons rotate a 3D catalog built from the rows */
(function () {
  var rails = document.querySelector('.rails');
  if (!rails) return;
  if (rails.getAttribute('data-layout') === 'grid') return; // the library page is a plain grid, no carousel
  try {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = [], themes = [];
    var blocks = rails.querySelectorAll('.rail-block');
    for (var b = 0; b < blocks.length; b++) {
      var title = blocks[b].querySelector('.rail-title').textContent;
      var cards = blocks[b].querySelectorAll('.rail .featured');
      if (!cards.length) continue;
      themes.push({ name: title, short: blocks[b].getAttribute('data-short') || title, first: items.length, count: cards.length });
      for (var c = 0; c < cards.length; c++) items.push({ node: cards[c].cloneNode(true), theme: themes.length - 1, i: c, n: cards.length });
    }
    var N = items.length;
    if (N < 2) return;

    function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    var flow = mk('div', 'flow');
    var tabs = mk('div', 'flow-tabs'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', 'Jump to a theme');
    var tabEls = themes.map(function (t, k) {
      var btn = mk('button', 'flow-tab'); btn.type = 'button'; btn.setAttribute('aria-pressed', 'false');
      btn.appendChild(document.createTextNode(t.short)); btn.appendChild(mk('span', null, String(t.count)));
      btn.addEventListener('click', function () { goTo(t.first); });
      tabs.appendChild(btn); return btn;
    });
    var stage = mk('div', 'flow-stage');
    stage.tabIndex = 0; stage.setAttribute('role', 'region'); stage.setAttribute('aria-roledescription', 'carousel');
    stage.setAttribute('aria-label', 'Portfolio catalog. Drag, scroll sideways or use the arrow keys to rotate it.');
    var els = items.map(function (it) {
      var el = it.node; el.classList.add('flow-card'); el.setAttribute('draggable', 'false'); stage.appendChild(el); return el;
    });
    var bar = mk('div', 'flow-bar');
    var prev = mk('button', 'rail-btn', '&larr;'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous piece');
    var next = mk('button', 'rail-btn', '&rarr;'); next.type = 'button'; next.setAttribute('aria-label', 'Next piece');
    var status = mk('div', 'flow-status'); status.setAttribute('aria-live', 'polite');
    bar.appendChild(prev); bar.appendChild(status); bar.appendChild(next);
    var hint = mk('p', 'flow-hint', 'Drag the catalog to rotate it, or use the arrow keys.');
    var meta = mk('div', 'flow-meta'); meta.appendChild(hint);
    var more = rails.parentNode.querySelector('.more'); if (more) meta.appendChild(more);
    flow.appendChild(tabs); flow.appendChild(meta); flow.appendChild(stage); flow.appendChild(bar);
    rails.parentNode.insertBefore(flow, rails);

    var pos = reduce ? 0 : 1.2, target = 0, active = -1, cardW = 340, spacing = 200, raf = 0, last = 0;
    var clamp = function (v, a, z) { return Math.max(a, Math.min(z, v)); };

    function layout() {
      var w = stage.clientWidth;
      cardW = Math.min(580, Math.max(240, w * 0.8));
      spacing = cardW * 0.62;
      var h = 0;
      for (var k = 0; k < els.length; k++) { els[k].style.width = cardW + 'px'; els[k].style.marginLeft = (-cardW / 2) + 'px'; els[k].style.height = 'auto'; }
      for (k = 0; k < els.length; k++) h = Math.max(h, els[k].offsetHeight);
      for (k = 0; k < els.length; k++) els[k].style.height = h + 'px';
      stage.style.height = (h + 64) + 'px';
    }
    function render() {
      var rot = reduce ? 18 : 52;
      for (var k = 0; k < els.length; k++) {
        var d = k - pos, ad = Math.abs(d), sg = d < 0 ? -1 : 1;
        var tx = sg * spacing * (Math.min(ad, 1) * 1.45 + Math.max(0, ad - 1) * 0.5);
        var tz = -Math.min(ad, 3) * 130;
        var ry = -clamp(d, -1, 1) * rot;
        var sc = 1 - Math.min(ad, 1) * 0.2 - Math.max(0, Math.min(ad, 3) - 1) * 0.05;
        var veil = Math.min(ad, 1) * 0.3 + Math.max(0, Math.min(ad, 3) - 1) * 0.2;
        var op = ad > 3.2 ? 0 : ad > 3 ? (3.2 - ad) * 5 : 1;
        var s = els[k].style;
        s.transform = 'translate3d(' + tx.toFixed(1) + 'px,0,' + tz.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        s.opacity = op.toFixed(3);
        s.setProperty('--veil', veil.toFixed(3));
        s.zIndex = String(100 - Math.round(ad * 10));
        s.pointerEvents = ad > 3.2 ? 'none' : 'auto';
      }
      var a = clamp(Math.round(pos), 0, N - 1);
      if (a !== active) { active = a; updateActive(); }
    }
    function updateActive() {
      var it = items[active], th = themes[it.theme];
      status.innerHTML = '<b>' + th.name + '</b> &middot; ' + (it.i + 1) + ' of ' + it.n;
      for (var t = 0; t < tabEls.length; t++) tabEls[t].setAttribute('aria-pressed', t === it.theme ? 'true' : 'false');
      for (var k = 0; k < els.length; k++) {
        var on = k === active;
        els[k].setAttribute('aria-hidden', on || Math.abs(k - active) <= 3 ? 'false' : 'true');
        els[k].tabIndex = on ? 0 : -1;
        els[k].classList.toggle('is-active', on);
      }
      prev.disabled = active === 0; next.disabled = active === N - 1;
    }
    function tick(ts) {
      var dt = last ? Math.min(48, ts - last) : 16; last = ts;
      var diff = target - pos;
      if (Math.abs(diff) < 0.0008) { pos = target; render(); raf = 0; last = 0; return; }
      pos += diff * (1 - Math.exp(-dt / 105));
      render(); raf = requestAnimationFrame(tick);
    }
    function animate() { if (reduce) { pos = target; render(); return; } if (!raf) raf = requestAnimationFrame(tick); }
    function goTo(i) { target = clamp(i, 0, N - 1); animate(); }

    // pointer drag with inertia
    var down = null, dragging = false, moved = false, samples = [], lastDrag = 0, downT = 0, downX = 0, downY = 0;
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      downT = e.timeStamp; downX = e.clientX; downY = e.clientY;
      down = { x: e.clientX, y: e.clientY, pos: pos, id: e.pointerId }; dragging = false; moved = false; samples = [{ x: e.clientX, t: e.timeStamp }];
    });
    stage.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (!dragging && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - down.y)) {
        dragging = true; moved = true; stage.classList.add('dragging');
        try { stage.setPointerCapture(down.id); } catch (err) {}
      }
      if (!dragging) return;
      var raw = down.pos - dx / (cardW * 0.55);
      if (raw < 0) raw = raw * 0.35; else if (raw > N - 1) raw = (N - 1) + (raw - (N - 1)) * 0.35;
      pos = raw; target = raw; render();
      samples.push({ x: e.clientX, t: e.timeStamp }); if (samples.length > 6) samples.shift();
    });
    function endDrag(e) {
      if (!down) return;
      var wasDragging = dragging; if (wasDragging) lastDrag = Date.now(); down = null; dragging = false; stage.classList.remove('dragging');
      if (!wasDragging) return;
      var v = 0, s0 = samples[0], s1 = samples[samples.length - 1];
      if (s1 && s0 && s1.t > s0.t) v = -(s1.x - s0.x) / (s1.t - s0.t) / (cardW * 0.55); // cards per ms
      target = clamp(Math.round(pos + clamp(v * 240, -2.5, 2.5)), 0, N - 1); animate();
      setTimeout(function () { moved = false; }, 0);
    }
    stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', function () { if (dragging) endDrag(); });
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // clicks: open any card (center or side), but ignore drags, slow presses, and clicks while the catalog is still moving
    stage.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.flow-card');
      if (!card) return;
      var still = Math.abs(e.clientX - downX) < 8 && Math.abs(e.clientY - downY) < 8;
      var quick = (e.timeStamp - downT) < 600;
      var settled = !raf && Date.now() - lastDrag > 500;
      if (moved || !still || !quick || !settled) { e.preventDefault(); e.stopPropagation(); return; }
      try { sessionStorage.setItem('rails.last', card.getAttribute('href') || ''); } catch (err) {}
    }, true);

    // sideways wheel or trackpad swipe
    var wheelT = 0;
    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      pos = clamp(pos + e.deltaX / (cardW * 0.9), 0, N - 1); target = pos; render();
      clearTimeout(wheelT); wheelT = setTimeout(function () { target = Math.round(pos); animate(); }, 120);
    }, { passive: false });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(N - 1); }
    });
    prev.addEventListener('click', function () { goTo(active - 1); });
    next.addEventListener('click', function () { goTo(active + 1); });
    window.addEventListener('resize', function () { layout(); render(); });

    // coming back from a piece: reopen the catalog on the card that was opened
    try {
      var saved = sessionStorage.getItem('rails.last');
      if (saved) for (var q = 0; q < els.length; q++) if (els[q].getAttribute('href') === saved) { pos = target = q; break; }
    } catch (err) {}
    layout(); render();
    rails.classList.add('is-replaced');
    if (!reduce) animate();
    window.addEventListener('load', function () { layout(); render(); });
  } catch (err) { /* leave the scrolling rows visible */ }
})();

/* Lead-to-cash map: start the drawing animation when it scrolls into view */
(function () {
  var fig = document.querySelector('figure.map');
  if (!fig || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (fig.getBoundingClientRect().top < window.innerHeight) return;
  fig.classList.add('pending');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { fig.classList.remove('pending'); io.disconnect(); } });
  }, { threshold: 0.35 });
  io.observe(fig);
})();
