// ==========================================
// Mobile Menu
// ==========================================

const burger = document.getElementById('burger');
const links = document.getElementById('links');

burger.onclick = () => {
burger.classList.toggle('open');
links.classList.toggle('open');
};

links.querySelectorAll('a').forEach((a) => {
a.onclick = () => {
    burger.classList.remove('open');
    links.classList.remove('open');
};
});


// ==========================================
// 3D Ring
// ==========================================

const stage = document.getElementById('stage');
const base = [...document.querySelectorAll('.card3d')];
const ring = document.createElement('div');

ring.className = 'ring';

const N = 14;

for (let i = 0; i < N; i++) {
const c =
    i < base.length
        ? base[i]
        : base[i % base.length].cloneNode(true);

c.style.setProperty('--a', (i * 360 / N) + 'deg');
ring.appendChild(c);
}

stage.appendChild(ring);


// ==========================================
// More Menu
// ==========================================



// ==========================================
// Amount Counters Setup
// ==========================================

document.querySelectorAll('.amt').forEach((a) => {
const t = a.firstChild;
const s = document.createElement('span');

s.className = 'count';
s.dataset.to = t.textContent.replace(/[$,]/g, '');
s.dataset.pre = '$';
s.dataset.sep = 1;
s.textContent = '$0';

a.replaceChild(s, t);
});


// ==========================================
// Scroll Reveal + Counters
// ==========================================

const io = new IntersectionObserver(
(entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('in');
        io.unobserve(entry.target);

        entry.target.querySelectorAll('.count').forEach((c) => {
            const to = +c.dataset.to;
            const t0 = performance.now();

            (function f(t) {
                const p = Math.min(
                    (t - t0) / 1400,
                    1
                );

                const v = Math.round(
                    to * (1 - Math.pow(1 - p, 3))
                );

                c.textContent =
                    (c.dataset.pre || '') +
                    (
                        c.dataset.sep
                            ? v.toLocaleString('en-US')
                            : v
                    );

                if (p < 1) {
                    requestAnimationFrame(f);
                }
            })(t0);
        });
    });
},
{
    threshold: 0.15
}
);

document.querySelectorAll('.rv').forEach((el) => {
io.observe(el);
});


// ==========================================
// Testimonials Slider
// ==========================================

const s = document.getElementById('slider');

const step = () => {
return s.firstElementChild.offsetWidth + 24;
};

document.getElementById('next').onclick = () => {
s.scrollBy({
    left: step()
});
};

document.getElementById('prev').onclick = () => {
s.scrollBy({
    left: -step()
});
};


// ==========================================
// Loader
// ==========================================

const ld = document.getElementById('loader');

setTimeout(() => {
ld.classList.add('hide');
document.body.classList.add('ready');
}, 1100);


// ==========================================
// Logo Animation
// ==========================================

const lg = document.querySelector('.logos');
const tr = document.createElement('div');

tr.className = 'track';
tr.innerHTML = lg.innerHTML + lg.innerHTML;

lg.innerHTML = '';
lg.appendChild(tr);


// ==========================================
// Split Heading Words
// ==========================================

let wi = 0;

const split = (n) => {
[...n.childNodes].forEach((c) => {
    if (c.nodeType === 3) {
        const f = document.createDocumentFragment();

        c.textContent
            .split(/(\s+)/)
            .forEach((t) => {
                if (!t.trim()) {
                    f.append(t);
                    return;
                }

                const w = document.createElement('span');

                w.className = 'w';
                w.innerHTML = `
                    <span style="--i:${wi++}">
                        ${t}
                    </span>
                `;

                f.append(w);
            });

        c.replaceWith(f);
    } else if (
        c.classList &&
        c.classList.contains('g')
    ) {
        split(c);
    }
});
};

document
.querySelectorAll(
    '.head h2, .thead h2, .bhead h2, .about h2'
)
.forEach((t) => {
    wi = 0;
    split(t);
});


// ==========================================
// Scroll Progress + Back To Top
// ==========================================

const bar = document.getElementById('bar');
const up = document.getElementById('up');

addEventListener(
'scroll',
() => {
    const m =
        document.documentElement.scrollHeight -
        innerHeight;

    bar.style.transform =
        `scaleX(${scrollY / m})`;

    up.classList.toggle(
        'show',
        scrollY > 600
    );
},
{
    passive: true
}
);

up.onclick = () => {
scrollTo({
    top: 0,
    behavior: 'smooth'
});
};


// ==========================================
// Testimonials Auto Play
// ==========================================

let ap;

const play = () => {
clearInterval(ap);

ap = setInterval(() => {
    if (
        s.scrollLeft + s.clientWidth >=
        s.scrollWidth - 10
    ) {
        s.scrollTo({
            left: 0
        });
    } else {
        s.scrollBy({
            left: step()
        });
    }
}, 4500);
};

play();

s.onmouseenter = () => {
clearInterval(ap);
};

s.onmouseleave = play;

s.addEventListener(
'touchstart',
() => {
    clearInterval(ap);
},
{
    passive: true
}
);


// ==========================================
// Scroll-Driven Effects
// ==========================================

(() => {
const hero = document.querySelector('.hero');
const nav = hero.querySelector('nav');
const lk = document.getElementById('links');

nav.classList.add('fx');

document
    .querySelectorAll(
        '.hero>.bgimg, ' +
        '.cband>.bgimg, ' +
        '.post>.bgimg, ' +
        '.tcard>.bgimg, ' +
        '.mem>img, ' +
        '.case .im img'
    )
    .forEach((i) => {
        i.classList.add('px');
    });


// Reveal Directions
const dir = {
    '.s1': 'left',
    '.s2': 'zoom',
    '.s3': 'right',
    '.s4': 'right',
    '.thead': 'left',
    '.bhead': 'left',
    '.cband': 'zoom',
    '.contact': 'zoom'
};

for (const k in dir) {
    document
        .querySelectorAll(k + '.rv')
        .forEach((e) => {
            e.dataset.r = dir[k];
        });
}


// Scroll Elements
const px = [
    ...document.querySelectorAll('.px')
];

const words = [
    ...document.querySelectorAll(
        '.about h2 .w>span'
    )
];

const steps = [
    ...document.querySelectorAll('.step')
];

const sp = document.querySelector('.steps');
const line = document.createElement('div');

line.className = 'pline';
line.innerHTML = '<i></i>';

sp.appendChild(line);


// Scroll State
let last = 0;
let tick = false;


// Scroll Animation
const run = () => {
    tick = false;

    const y = scrollY;
    const vh = innerHeight;


    // Navbar
    nav.classList.toggle(
        'scrolled',
        y > 80
    );

    nav.classList.toggle(
        'hide',
        y > 300 &&
        y > last &&
        !lk.classList.contains('open')
    );

    last = y;


    // Hero Scale
    hero.style.setProperty(
        '--s',
        Math.min(y / vh, 1)
    );


    // Parallax Images
    px.forEach((i) => {
        const r =
            i.parentElement.getBoundingClientRect();

        if (
            r.bottom < -100 ||
            r.top > vh + 100
        ) {
            return;
        }

        const p = Math.max(
            -1,
            Math.min(
                1,
                (
                    r.top +
                    r.height / 2 -
                    vh / 2
                ) / vh
            )
        );

        i.style.translate =
            `0 ${-p * r.height * 0.1}px`;
    });


    // About Heading Words
    if (words.length) {
        const b =
            words[0]
                .closest('h2')
                .getBoundingClientRect();

        const p =
            (vh * 0.85 - b.top) /
            (b.height + vh * 0.3);

        words.forEach((w, i) => {
            w.classList.toggle(
                'lit',
                p * words.length * 1.1 > i
            );
        });
    }


    // Steps Progress Line
    const r = sp.getBoundingClientRect();

    const q = Math.max(
        0,
        Math.min(
            1,
            (vh * 0.8 - r.top) /
            (r.height + vh * 0.2)
        )
    );

    line.style.setProperty(
        '--p',
        q
    );

    steps.forEach((s, i) => {
        s.classList.toggle(
            'on',
            q * steps.length > i + 0.3
        );
    });
};


// Request Animation Frame
const req = () => {
    if (!tick) {
        tick = true;
        requestAnimationFrame(run);
    }
};


// Events
addEventListener(
    'scroll',
    req,
    {
        passive: true
    }
);

addEventListener(
    'resize',
    req
);


// Initial Run
run();
})();