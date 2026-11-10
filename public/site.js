const toggle = document.getElementById('nav-toggle');
const menu = document.getElementById('primary-menu');
function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); toggle.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header-right-wrapper')) closeMenu(); });
matchMedia('(min-width: 1141px)').addEventListener('change', closeMenu);
