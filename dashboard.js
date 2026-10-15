/* Stackly dashboards – shared behaviour (admin + client) */
document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');
  const navLinks = $$('.nav-link[data-section]');
  const sections = $$('.dash-section');

  /* ---------- toast ---------- */
  const toastEl = $('#toast');
  let toastT;
  const toast = (msg) => {
    if (!toastEl) return;
    $('span', toastEl).textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('show'), 2800);
  };

  /* ---------- mobile sidebar ---------- */
  const openSidebar = () => { sidebar.classList.add('open'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; };
  const closeSidebar = () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.style.overflow = ''; };
  $('#menuToggle')?.addEventListener('click', openSidebar);
  $('#sidebarClose')?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);
  addEventListener('keydown', (e) => e.key === 'Escape' && closeSidebar());
  addEventListener('resize', () => innerWidth > 900 && closeSidebar());

  /* ---------- in-page section routing ---------- */
  const showSection = (id) => {
    sections.forEach((s) => s.classList.toggle('active', s.id === id));
    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === id));
    scrollTo({ top: 0, behavior: 'smooth' });
  };
  navLinks.forEach((l) =>
    l.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(l.dataset.section);
      history.replaceState(null, '', '#' + l.dataset.section);
      closeSidebar();
    })
  );
  const ids = sections.map((s) => s.id);
  const start = location.hash.replace('#', '');
  showSection(ids.includes(start) ? start : 'overview');

  /* ---------- filter tabs: filter rows/cards that carry data-tag ---------- */
  $$('.filter-tabs').forEach((group) => {
    const section = group.closest('.dash-section');
    const items = $$('[data-tag]', section);
    const empty = $('.empty-row', section);
    $$('.filter-tab', group).forEach((tab) =>
      tab.addEventListener('click', () => {
        $$('.filter-tab', group).forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const f = tab.dataset.f || 'all';
        let shown = 0;
        items.forEach((it) => {
          const ok = f === 'all' || it.dataset.tag.split(' ').includes(f);
          it.hidden = !ok;
          if (ok) shown++;
        });
        if (empty) empty.classList.toggle('show', shown === 0);
      })
    );
  });

  /* ---------- KPI count-up ---------- */
  const countUp = (el) => {
    const raw = el.dataset.count;
    const to = parseFloat(raw);
    const pre = el.dataset.pre || '';
    const suf = el.dataset.suf || '';
    const dec = (raw.split('.')[1] || '').length;
    const t0 = performance.now();
    const f = (t) => {
      const p = Math.min((t - t0) / 1300, 1);
      const v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
  }), { threshold: 0.4 });
  $$('[data-count]').forEach((el) => io.observe(el));

  /* ---------- placeholder actions (buttons that have no page yet) ---------- */
  $$('[data-toast]').forEach((a) =>
    a.addEventListener('click', (e) => { e.preventDefault(); toast(a.dataset.toast); })
  );

  /* ---------- settings form (demo save) ---------- */
  const form = $('#settingsForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('button[type="submit"]', form);
    const old = btn.innerHTML;
    btn.classList.add('loading');
    btn.innerHTML = 'Saving…';
    setTimeout(() => {
      btn.classList.remove('loading');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
      toast('Profile updated');
      setTimeout(() => (btn.innerHTML = old), 1800);
    }, 900);
  });
  $$('.switch input').forEach((c) =>
    c.addEventListener('change', () => toast(c.checked ? 'Notification turned on' : 'Notification turned off'))
  );

  /* ---------- topbar email from login ---------- */
  const em = $('#dashboardEmail');
  try {
    const saved = localStorage.getItem('stacklyUserEmail');
    if (em && saved) em.textContent = saved;
  } catch (e) { /* storage unavailable */ }
});