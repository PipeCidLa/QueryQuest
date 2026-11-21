// Los datos se cargan normalmente. Aquí solo se anima su presentación.
export function iniciarMovimiento() {
  const preferencia = matchMedia('(prefers-reduced-motion: reduce)');
  const observados = new WeakSet();
  let pendiente = false;
  const revelar = elemento => {
    elemento.classList.remove('entrada-pendiente');
    elemento.classList.add('entrada-visible');
  };
  const observador = 'IntersectionObserver' in window ? new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) { revelar(entrada.target); observador.unobserve(entrada.target); }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 30px 0px' }) : null;

  function actualizar() {
    pendiente = false;
    const reducir = preferencia.matches;
    document.querySelectorAll('.panel, .logro, .region, .lista-misiones .mision').forEach(elemento => {
      if (reducir) { revelar(elemento); return; }
      if (!observador || observados.has(elemento) || !elemento.getClientRects().length) return;
      observados.add(elemento);
      if (elemento.getBoundingClientRect().top > innerHeight) {
        elemento.classList.add('entrada-pendiente');
        observador.observe(elemento);
      }
    });
    const escena = document.querySelector('.campamento-escena');
    if (!escena) return;
    const desplazamiento = reducir || innerWidth < 768 || !escena.getClientRects().length
      ? 0 : Math.max(-16, Math.min(16, -escena.getBoundingClientRect().top * 0.055));
    escena.style.setProperty('--parallax-bosque', `${desplazamiento}px`);
  }
  function programar() {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
  }
  addEventListener('scroll', programar, { passive: true });
  addEventListener('resize', programar);
  preferencia.addEventListener('change', programar);
  document.addEventListener('queryquest:vista', programar);
  document.addEventListener('focusin', evento => {
    // Un control enfocado por teclado nunca debe quedar invisible por el efecto.
    let elemento = evento.target;
    while (elemento instanceof Element) {
      if (elemento.classList.contains('entrada-pendiente')) revelar(elemento);
      elemento = elemento.parentElement;
    }
  });
  new MutationObserver(programar).observe(document.body, { childList: true, subtree: true });
  programar();
}
