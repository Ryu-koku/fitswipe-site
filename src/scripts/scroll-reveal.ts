// Progressive enhancement: HTML remains visible until observation is available.
// Observe whole blocks so copy, diagrams and interactive controls stay together.
function initScrollReveal(): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || typeof IntersectionObserver !== 'function') return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>(
    '.hero-illustration, .section-intro, .feature, .little-grid > div, .faq, .download-inner',
  ));

  const show = (element: Element) => {
    element.classList.remove('reveal-pending');
    observer.unobserve(element);
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) show(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  const showAll = () => {
    observer.disconnect();
    for (const element of elements) element.classList.remove('reveal-pending', 'reveal-ready');
  };

  try {
    for (const element of elements) {
      // Never hide content already on screen, including restored scroll positions.
      if (element.getBoundingClientRect().top < window.innerHeight) continue;
      observer.observe(element);
      element.classList.add('reveal-ready', 'reveal-pending');
    }
  } catch {
    showAll();
    return;
  }

  // Keyboard navigation must never focus an invisible control.
  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest('.reveal-pending');
    if (element) {
      element.classList.remove('reveal-ready');
      show(element);
    }
  });
  motion.addEventListener('change', (event) => {
    if (event.matches) showAll();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) showAll();
  });
}

initScrollReveal();
export {};
