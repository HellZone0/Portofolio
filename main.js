// main.js
// ====== Util kecil ======
const $ = (s,sc=document)=>sc.querySelector(s);
const $$ = (s,sc=document)=>Array.from(sc.querySelectorAll(s));

/* Feather icons */
document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) feather.replace({ 'aria-hidden': 'true' });
});

/* Tahun footer */
$('#year').textContent = new Date().getFullYear();

/* ========== Theme toggle (localStorage) ========== */
(function initTheme(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);
  const btn = $('#themeToggle');

  const setIcon = () => {
    const theme = root.getAttribute('data-theme');
    // Toggle visibility via CSS class
    $('.theme-icon--sun').style.display = theme === 'dark' ? 'block' : 'none';
    $('.theme-icon--moon').style.display = theme === 'dark' ? 'none' : 'block';
  };
  setIcon();

  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setIcon();
  });
})();

/* ========== Smooth scroll offset fix (native CSS already smooth) ========== */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    // Biarkan default scroll-behavior, cukup close mobile nav jika ada
  });
});

/* ========== Parallax halus pada hero (respect reduced motion) ========== */
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion){
  const orbs = $$('.orb');
  const parallax = () => {
    const y = window.scrollY || window.pageYOffset;
    // Translate berbeda agar subtle
    orbs.forEach((el, idx)=>{
      const speed = [0.2, 0.1, 0.15][idx] || 0.12;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  };
  parallax();
  window.addEventListener('scroll', parallax, {passive:true});
}

/* ========== Scroll reveal (IntersectionObserver) ========== */
(() => {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1, rootMargin: '0px 0px -10% 0px'});
  $$('.reveal').forEach(el=>io.observe(el));
})();

/* ========== Project filter tags ========== */
(() => {
  const chips = $$('.chip');
  const cards = $$('.project');
  const setActive = (chip) => {
    chips.forEach(c=>c.classList.toggle('is-active', c===chip));
    chips.forEach(c=>c.setAttribute('aria-selected', c===chip ? 'true' : 'false'));
  };
  const applyFilter = (key) => {
    cards.forEach(card=>{
      const tags = (card.getAttribute('data-tags')||'').split(/\s+/);
      const show = key==='all' || tags.includes(key);
      card.style.display = show ? '' : 'none';
    });
  };
  chips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      setActive(chip);
      applyFilter(chip.dataset.filter);
    });
  });
})();

/* ========== 3D hover tilt (subtle, dengan fallback) ========== */
(() => {
  if (reduceMotion) return;
  const maxDeg = 6; // ringan agar tidak pusing
  const tiltItems = $$('.tilt');
  tiltItems.forEach(card=>{
    let bounds = null;
    const calc = (e) => {
      bounds = bounds || card.getBoundingClientRect();
      const cx = bounds.left + bounds.width/2;
      const cy = bounds.top + bounds.height/2;
      const dx = (e.clientX - cx) / (bounds.width/2);
      const dy = (e.clientY - cy) / (bounds.height/2);
      const rx = (-dy * maxDeg).toFixed(2);
      const ry = (dx * maxDeg).toFixed(2);
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const reset = () => { card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; bounds=null; };
    card.addEventListener('mousemove', calc);
    card.addEventListener('mouseleave', reset);
    window.addEventListener('scroll', ()=>{bounds=null;}, {passive:true});
    window.addEventListener('resize', ()=>{bounds=null;});
  });
})();

/* ========== Form validation + toast sukses ========== */
(() => {
  const form = $('#contactForm');
  const toast = $('#toast');

  const showError = (input, message) => {
    const small = $('#err-'+input.id);
    small.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    let ok = true;

    const name = $('#name');
    const email = $('#email');
    const message = $('#message');

    if(!name.value.trim()){ ok=false; showError(name, 'Nama wajib diisi.'); }
    else showError(name, '');

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
    if(!email.value.trim() || !emailValid){ ok=false; showError(email, 'Email tidak valid.'); }
    else showError(email, '');

    if(!message.value.trim()){ ok=false; showError(message, 'Pesan tidak boleh kosong.'); }
    else showError(message, '');

    if(!ok) return;

    // Demo sukses (tanpa server)
    form.reset();
    showToast('Terima kasih! Pesanmu sudah terkirim (demo).');
  });

  function showToast(text){
    toast.textContent = text;
    toast.classList.add('show');
    // Auto hide setelah 3.5s
    setTimeout(()=>toast.classList.remove('show'), 3500);
  }
})();

/* ========== Minor: restore hash focus untuk a11y ========== */
window.addEventListener('hashchange', ()=>{
  const el = document.getElementById(location.hash.slice(1));
  if (el) el.setAttribute('tabindex','-1'), el.focus({preventScroll:true});
}, {passive:true});