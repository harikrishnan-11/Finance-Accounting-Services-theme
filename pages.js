/* ==========================================================
   Stackly – shared behaviour for inner pages + auth pages
   Include at the end of <body>:  <script src="pages.js"></script>
   Every feature is null-safe, so the same file works on every page.
   ========================================================== */
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];

    /* ---------- loader ---------- */
    const ld = $('#loader');
    setTimeout(() => {
        if (ld) ld.classList.add('hide');
        document.body.classList.add('ready');
    }, ld ? 800 : 0);

    /* ---------- mobile menu ---------- */
    const burger = $('#burger');
    const links = $('#links');
    if (burger && links) {
        burger.onclick = () => {
            burger.classList.toggle('open');
            links.classList.toggle('open');
        };
        $$('a', links).forEach((a) =>
            a.addEventListener('click', () => {
                burger.classList.remove('open');
                links.classList.remove('open');
            })
        );
    }

    /* ---------- toast ---------- */
    const toastEl = $('#toast');
    let toastT;
    const toast = (msg) => {
        if (!toastEl) return;
        toastEl.querySelector('span').textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastT);
        toastT = setTimeout(() => toastEl.classList.remove('show'), 3200);
    };

    /* ---------- split heading words (uses .w CSS from style.css) ---------- */
    let wi = 0;
    const split = (n) => {
        [...n.childNodes].forEach((c) => {
            if (c.nodeType === 3) {
                const f = document.createDocumentFragment();
                c.textContent.split(/(\s+)/).forEach((t) => {
                    if (!t.trim()) { f.append(t); return; }
                    const w = document.createElement('span');
                    const i = document.createElement('span');
                    w.className = 'w';
                    i.style.setProperty('--i', wi++);
                    i.textContent = t;
                    w.appendChild(i);
                    f.append(w);
                });
                c.replaceWith(f);
            } else if (c.nodeType === 1 && c.classList.contains('g')) split(c);
        });
    };
    $$('.head h2, .split-words').forEach((t) => { wi = 0; split(t); });

    /* ---------- stagger groups: children become .rv with incremental delay ---------- */
    $$('.stagger').forEach((p) =>
        [...p.children].forEach((c, i) => {
            c.classList.add('rv');
            c.style.transitionDelay = i * 90 + 'ms';
        })
    );

    /* ---------- counters ---------- */
    const count = (c) => {
        const to = +c.dataset.to;
        const t0 = performance.now();
        const f = (t) => {
            const p = Math.min((t - t0) / 1500, 1);
            const v = Math.round(to * (1 - Math.pow(1 - p, 3)));
            c.textContent = (c.dataset.pre || '') + (c.dataset.sep ? v.toLocaleString('en-US') : v);
            if (p < 1) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
    };

    /* ---------- scroll reveal ---------- */
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const el = e.target;
                el.classList.add('in');
                io.unobserve(el);
                $$('.count', el).forEach(count);
                if (el.classList.contains('steps')) {
                    $$('.step', el).forEach((s, i) => setTimeout(() => s.classList.add('on'), 400 + i * 450));
                    const pl = $('.pline', el);
                    if (pl) pl.style.setProperty('--p', 1);
                }
                // after the entrance finishes, hand control back to hover transitions
                setTimeout(() => {
                    el.classList.add('done');
                    el.style.transitionDelay = '';
                }, 1500 + (parseFloat(el.style.transitionDelay) || 0));
            });
        },
        { threshold: 0.15 }
    );
    $$('.rv').forEach((el) => io.observe(el));

    const replay = (el, delay) => {
        el.classList.remove('in', 'done');
        el.style.transitionDelay = delay + 'ms';
        void el.offsetWidth;
        io.observe(el);
    };

    /* ---------- scroll effects: progress bar, back-to-top, nav, hero fade, timeline ---------- */
    const bar = $('#bar');
    const up = $('#up');
    const hero = $('.hero');
    const nav = hero && $('nav', hero);
    const tl = $('.tl');
    const tlFill = tl && $('.fill', tl);
    if (nav) nav.classList.add('fx');
    let last = 0;

    const onScroll = () => {
        const y = scrollY;
        const vh = innerHeight;
        const m = document.documentElement.scrollHeight - vh;
        if (bar && m > 0) bar.style.transform = `scaleX(${y / m})`;
        if (up) up.classList.toggle('show', y > 600);
        if (nav) {
            nav.classList.toggle('scrolled', y > 80);
            nav.classList.toggle('hide', y > 300 && y > last && !(links && links.classList.contains('open')));
        }
        last = y;
        if (hero) hero.style.setProperty('--s', Math.min(y / vh, 1));
        if (tl && tlFill) {
            const r = tl.getBoundingClientRect();
            const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
            tlFill.style.setProperty('--h', p * 100 + '%');
        }
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    if (up) up.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

    /* ---------- pricing: monthly / annual toggle ---------- */
    const sw = $('#billSw');
    if (sw) {
        const nums = $$('.amt .num');
        const lbls = $$('.bill span[data-b]');
        const per = $$('.amt .per');
        const tween = (el, to) => {
            const from = +el.dataset.cur || +el.dataset.m;
            const t0 = performance.now();
            const f = (t) => {
                const p = Math.min((t - t0) / 700, 1);
                const v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
                el.textContent = '$' + v.toLocaleString('en-US');
                el.dataset.cur = v;
                if (p < 1) requestAnimationFrame(f);
            };
            requestAnimationFrame(f);
        };
        sw.onclick = () => {
            const annual = sw.classList.toggle('on');
            nums.forEach((n) => tween(n, annual ? Math.round(n.dataset.m * 0.85) : +n.dataset.m));
            per.forEach((p) => (p.textContent = '/month' + (annual ? ', billed yearly' : '')));
            lbls.forEach((l) => l.classList.toggle('on', (l.dataset.b === 'a') === annual));
        };
    }

    /* ---------- blog: category filter + search + load more ---------- */
    const cards = $$('.bcard');
    if (cards.length) {
        const chips = $$('.fchip');
        const q = $('#blogSearch');
        const empty = $('#blogEmpty');
        const moreBtn = $('#loadMore');
        const STEP = 6;
        let cat = 'all', term = '', shown = STEP;

        const apply = (animate = true) => {
            let match = 0, i = 0;
            cards.forEach((c) => {
                const ok =
                    (cat === 'all' || c.dataset.cat === cat) &&
                    c.textContent.toLowerCase().includes(term);
                if (ok) match++;
                const vis = ok && match <= shown;
                const wasHidden = c.classList.contains('hide');
                c.classList.toggle('hide', !vis);
                if (vis && (animate || wasHidden)) replay(c, (i++ % 3) * 90);
            });
            if (empty) empty.classList.toggle('show', match === 0);
            if (moreBtn) moreBtn.parentElement.style.display = match > shown ? '' : 'none';
        };

        chips.forEach((ch) =>
            ch.addEventListener('click', () => {
                chips.forEach((x) => x.classList.remove('on'));
                ch.classList.add('on');
                cat = ch.dataset.cat;
                shown = STEP;
                apply();
            })
        );
        if (q) q.addEventListener('input', () => { term = q.value.trim().toLowerCase(); shown = STEP; apply(); });
        if (moreBtn) moreBtn.addEventListener('click', () => { shown += STEP; apply(false); });
        apply(false);
    }

    /* ---------- password: show/hide ---------- */
    $$('.pw button').forEach((b) =>
        b.addEventListener('click', () => {
            const i = b.parentElement.querySelector('input');
            const show = i.type === 'password';
            i.type = show ? 'text' : 'password';
            b.innerHTML = `<i class="fa-solid fa-eye${show ? '-slash' : ''}"></i>`;
        })
    );

    /* ---------- password: strength meter ---------- */
    const pass = $('#password');
    const meter = $('#meter');
    if (pass && meter) {
        const tests = {
            len: (v) => v.length >= 8,
            up: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v),
            num: (v) => /\d/.test(v),
            sym: (v) => /[^A-Za-z0-9]/.test(v)
        };
        const label = $('#strengthTxt');
        const names = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
        pass.addEventListener('input', () => {
            let lvl = 0;
            $$('.rules li').forEach((li) => {
                const ok = tests[li.dataset.r](pass.value);
                li.classList.toggle('ok', ok);
                li.querySelector('i').className = 'fa-solid ' + (ok ? 'fa-check' : 'fa-minus');
                if (ok) lvl++;
            });
            if (!pass.value) lvl = 0;
            meter.dataset.l = lvl;
            if (label) label.textContent = names[lvl];
        });
    }

    /* ---------- forms: validation + fake submit (replace with your API call) ---------- */
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const check = (field) => {
        const el = $('input,select,textarea', field);
        if (!el) return true;
        const v = el.value.trim();
        let msg = '';
        if (el.required && el.type === 'checkbox' && !el.checked) msg = 'Please accept to continue';
        else if (el.required && !v) msg = 'This field is required';
        else if (el.type === 'email' && v && !emailRe.test(v)) msg = 'Enter a valid email address';
        else if (el.dataset.min && v.length < +el.dataset.min) msg = `Use at least ${el.dataset.min} characters`;
        else if (el.dataset.match && v !== $(el.dataset.match).value) msg = 'Passwords do not match';
        field.classList.toggle('err', !!msg);
        const m = $('.msg', field);
        if (m) m.textContent = msg;
        return !msg;
    };

    $$('form[data-form]').forEach((f) => {
        $$('.field', f).forEach((fl) => {
            const el = $('input,select,textarea', fl);
            if (!el) return;
            el.addEventListener('blur', () => el.value && check(fl));
            el.addEventListener('input', () => fl.classList.contains('err') && check(fl));
        });

        f.addEventListener('submit', (e) => {
            e.preventDefault();
            let ok = true, firstBad = null;
            $$('.field', f).forEach((fl) => {
                if (!check(fl)) { ok = false; firstBad = firstBad || fl; }
            });
            if (!ok) { $('input,select,textarea', firstBad).focus(); return; }

            const btn = $('button[type=submit], .btn', f);
            const txt = btn && $('b', btn);
            const old = txt && txt.textContent;
            if (btn) { btn.classList.add('loading'); if (txt) txt.textContent = 'Please wait…'; }

            // TODO: replace this timeout with a real fetch() to your backend
            setTimeout(() => {
                if (btn) { btn.classList.remove('loading'); if (txt) txt.textContent = old; }
                if (f.dataset.form === 'sent') {
                    f.classList.add('sent');
                } else {
                    toast(f.dataset.toast || 'Done!');
                    f.reset();
                    $$('.rules li').forEach((li) => li.classList.remove('ok'));
                    if (meter) meter.dataset.l = 0;
                    if (f.dataset.redirect) setTimeout(() => (location.href = f.dataset.redirect), 1600);
                }
            }, 1200);
        });
    });

    $$('[data-reset]').forEach((b) =>
        b.addEventListener('click', () => {
            const f = b.closest('form');
            f.classList.remove('sent');
            f.reset();
        })
    );
})();