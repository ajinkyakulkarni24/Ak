/* ============================================================
   Nova — interactions
   Particle canvas, scroll reveal, counters, tilt, theme,
   cursor glow, nav, mobile menu, form. Zero dependencies.
   ============================================================ */
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const stored = localStorage.getItem("nova-theme");
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }
  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("nova-theme", next);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f4f5fb" : "#07070f");
  });

  /* ---------- Navbar scroll state + progress ---------- */
  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY || 0;
    navbar?.classList.toggle("scrolled", y > 20);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  const setMenu = (open) => {
    menuToggle?.classList.toggle("open", open);
    mobileMenu?.classList.toggle("open", open);
    menuToggle?.setAttribute("aria-expanded", String(open));
    mobileMenu?.setAttribute("aria-hidden", String(!open));
  };
  menuToggle?.addEventListener("click", () =>
    setMenu(!mobileMenu.classList.contains("open"))
  );
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            const delay = Math.min(i * 60, 240);
            setTimeout(() => e.target.classList.add("in"), delay);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Animated counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const formatNum = (n, decimals) =>
    decimals > 0
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString("en-US");

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    const start = performance.now();
    if (prefersReduced) {
      el.textContent = prefix + formatNum(target, decimals) + suffix;
      return;
    }
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = prefix + formatNum(target * easeOut(p), decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$(".stat-num[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Cursor glow ---------- */
  const glow = $(".cursor-glow");
  if (glow && window.matchMedia("(hover: hover)").matches && !prefersReduced) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let tx = gx, ty = gy, raf = null;
    const render = () => {
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      raf = Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5
        ? requestAnimationFrame(render) : null;
    };
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("active");
      if (!raf) raf = requestAnimationFrame(render);
    });
    document.addEventListener("mouseleave", () => glow.classList.remove("active"));
    $$("a, button, .tilt, input").forEach((el) => {
      el.addEventListener("mouseenter", () => glow.classList.add("grow"));
      el.addEventListener("mouseleave", () => glow.classList.remove("grow"));
    });
  }

  /* ---------- 3D tilt + spotlight ---------- */
  if (window.matchMedia("(hover: hover)").matches && !prefersReduced) {
    $$("[data-tilt]").forEach((card) => {
      const strength = 10;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * strength;
        const ry = (px - 0.5) * strength;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Waitlist form ---------- */
  const form = $("#ctaForm");
  const note = $("#formNote");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#email");
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!valid) {
      note.textContent = "Please enter a valid email address.";
      note.classList.add("error");
      email.focus();
      return;
    }
    note.classList.remove("error");
    note.textContent = "🎉 You're on the list! We'll be in touch soon.";
    form.reset();
  });

  /* ---------- Particle canvas ---------- */
  const canvas = $("#particles");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [], mouse = { x: -9999, y: -9999 };

    const accent = () =>
      getComputedStyle(root).getPropertyValue("--accent").trim() || "#7c5cff";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      const target = Math.min(Math.floor((innerWidth * innerHeight) / 16000), 90);
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr,
      }));
    };

    const hexToRgb = (hex) => {
      const m = hex.replace("#", "");
      const n = m.length === 3
        ? m.split("").map((c) => c + c).join("")
        : m;
      const int = parseInt(n, 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    };

    let rgb = hexToRgb(accent());
    const refreshColor = () => { rgb = hexToRgb(accent()); };

    const linkDist = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ld = linkDist * dpr;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // mouse repulsion
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        const mr = 140 * dpr;
        if (md < mr && md > 0) {
          const f = (1 - md / mr) * 1.2;
          p.x += (mdx / md) * f;
          p.y += (mdy / md) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.7)`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < ld) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.16 * (1 - d / ld)})`;
            ctx.lineWidth = dpr;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    let raf = null;
    const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
    });
    window.addEventListener("mouseout", () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start()
    );
    themeToggle?.addEventListener("click", () => setTimeout(refreshColor, 60));

    resize();
    start();
  }
})();
