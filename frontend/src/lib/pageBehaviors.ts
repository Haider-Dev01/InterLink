import Lenis from 'lenis';
import { toast } from 'sonner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { bindLogoHoverBounce, startLogoLetterLoop } from './logoAnimations';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

type SelectorFn = (selector: string) => any[];
type GetFn = (selector: string) => any;
type TimeoutFn = (callback: () => void, delay: number) => number;
type IntervalFn = (callback: () => void, delay: number) => number;
type RafFn = (callback: FrameRequestCallback) => number;
type CleanupFn = () => void;

type PageTools = {
  q: SelectorFn;
  get: GetFn;
  all: SelectorFn;
  on: (target: any, eventName: string, handler: (event: any) => void, options?: any) => void;
  onEach: (elements: Element[], eventName: string, createHandler: any, options?: any) => void;
  timeout: TimeoutFn;
  interval: IntervalFn;
  raf: RafFn;
  cleanup: CleanupFn;
};

function createPageTools(root: HTMLElement): PageTools {
  const q = gsap.utils.selector(root);
  const listeners: CleanupFn[] = [];
  const timeouts: number[] = [];
  const intervals: number[] = [];
  const rafs: number[] = [];

  const get: GetFn = (selector) => (q(selector)[0] as Element | undefined) ?? null;
  const all: SelectorFn = (selector) => (q(selector) as Element[]) ?? [];
  const on: PageTools['on'] = (target, eventName, handler, options) => {
    if (!target) {
      return;
    }

    target.addEventListener(eventName, handler, options);
    listeners.push(() => target.removeEventListener(eventName, handler, options));
  };

  const onEach: PageTools['onEach'] = (elements, eventName, createHandler, options) => {
    elements.forEach((element, index) => {
      const handler =
        typeof createHandler === 'function'
          ? createHandler.length >= 2
            ? createHandler(element, index)
            : createHandler
          : createHandler;
      on(element, eventName, handler, options);
    });
  };

  const timeout: TimeoutFn = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timeouts.push(id);
    return id;
  };

  const interval: IntervalFn = (callback, delay) => {
    const id = window.setInterval(callback, delay);
    intervals.push(id);
    return id;
  };

  const raf: RafFn = (callback) => {
    const id = window.requestAnimationFrame(callback);
    rafs.push(id);
    return id;
  };

  const cleanup = () => {
    listeners.forEach((removeListener) => removeListener());
    timeouts.forEach((id) => window.clearTimeout(id));
    intervals.forEach((id) => window.clearInterval(id));
    rafs.forEach((id) => window.cancelAnimationFrame(id));
  };

  return { q, get, all, on, onEach, timeout, interval, raf, cleanup };
}

function stripInlineHandlers(root: HTMLElement) {
  root.querySelectorAll('[onclick],[onchange],[onsubmit],[onmouseenter],[onmouseleave]').forEach((element) => {
    [...element.attributes]
      .filter((attribute) => attribute.name.startsWith('on'))
      .forEach((attribute) => element.removeAttribute(attribute.name));
  });
}

function animateFloatingParticles(ids: string[], q: SelectorFn, delayStep = 0.7) {
  ids.forEach((selector, index) => {
    const element = q(selector)[0];

    if (!element) {
      return;
    }

    gsap.to(element, {
      y: gsap.utils.random(-30, 30),
      x: gsap.utils.random(-20, 20),
      duration: gsap.utils.random(3, 5),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * delayStep,
    });
  });
}

function setupNavHover(all: SelectorFn, on: PageTools['on']) {
  all('aside nav a').forEach((link) => {
    on(link, 'mouseenter', () => {
      gsap.to(link, { x: 4, duration: 0.3, ease: 'power2.out' });
    });
    on(link, 'mouseleave', () => {
      gsap.to(link, { x: 0, duration: 0.3, ease: 'power2.out' });
    });
  });
}

function setupButtonScale(
  all: SelectorFn,
  on: PageTools['on'],
  selector = 'button',
  {
  enterScale = 1.05,
  enterDuration = 0.3,
  leaveScale = 1,
  leaveDuration = 0.2,
  ease = 'back.out',
  filter,
}: {
  enterScale?: number;
  enterDuration?: number;
  leaveScale?: number;
  leaveDuration?: number;
  ease?: string;
  filter?: (button: Element) => boolean;
} = {},
) {
  all(selector).forEach((button) => {
    if (filter && !filter(button)) {
      return;
    }

    on(button, 'mouseenter', () => {
      gsap.to(button, { scale: enterScale, duration: enterDuration, ease });
    });
    on(button, 'mouseleave', () => {
      gsap.to(button, { scale: leaveScale, duration: leaveDuration, ease });
    });
  });
}

function setupLogoSpin(get: GetFn, on: PageTools['on']) {
  const logo = get('[data-icon="hub"]');

  if (!logo) {
    return;
  }

  on(logo, 'mouseenter', () => {
    gsap.to(logo, {
      rotation: 360,
      duration: 0.8,
      ease: 'elastic.out(1, 0.75)',
    });
  });
}

function animateProgressBarsOnLoad(all: SelectorFn, timeout: TimeoutFn, delay = 300) {
  timeout(() => {
    all('.progress-bar-fill').forEach((bar) => {
      const element = bar as HTMLElement;
      const targetWidth = element.style.width;
      element.style.width = '0%';
      timeout(() => {
        element.style.width = targetWidth;
      }, 100);
    });
  }, delay);
}

function setupDashboardAnimations(
  root: HTMLElement,
  {
    particleIds,
    mainContentSelector = '#main-content',
    extraTriggers = () => {},
    progressDelay = 300,
    matchScore,
  }: {
    particleIds: string[];
    mainContentSelector?: string | null;
    extraTriggers?: (args: { q: SelectorFn; all: SelectorFn; get: GetFn; timeout: TimeoutFn }) => void;
    progressDelay?: number;
    matchScore?: number;
  },
): CleanupFn {
  const tools = createPageTools(root);
  const { q, all, get, on, timeout, cleanup } = tools;
  const setMatchScore = useAppStore.getState().setMatchScore;

  const applyUserDataToDashboard = (authUser: any) => {
    if (!authUser) return;

    const firstName = authUser.firstName || authUser.profile?.firstName || '';
    const lastName = authUser.lastName || authUser.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const avatar = authUser.avatar
      || authUser.profile?.avatar
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Utilisateur')}&background=00288e&color=fff&rounded=true`;

    if (fullName) {
      root.querySelectorAll('*').forEach((el) => {
        if (el.textContent?.trim() === 'Thomas Dubois') {
          el.textContent = fullName;
        }
      });
    }

    if (firstName) {
      root.querySelectorAll('*').forEach((el) => {
        const text = el.textContent?.trim() || '';
        if (/^Bonjour,\s*.+$/i.test(text)) {
          el.textContent = `Bonjour, ${firstName}`;
          const element = el as HTMLElement;
          element.style.fontWeight = '900';
          element.style.fontSize = '1.5rem';
          element.style.lineHeight = '1.2';
          element.style.color = '#00288e';
          element.style.display = 'inline-block';
          element.style.paddingBottom = '0';
        }
      });
    }

    const knownDefaultProfileUrls = [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      'https://ui-avatars.com/api/?name=Admin+Nexus&background=00288e&color=fff&rounded=true',
    ];

    root.querySelectorAll('img').forEach((img) => {
      const image = img as HTMLImageElement;
      if (knownDefaultProfileUrls.includes(image.src) || /Profil/i.test(image.alt)) {
        image.src = avatar;
      }
    });
  };

  applyUserDataToDashboard(useAuthStore.getState().user);
  const unsubscribeAuthUser = useAuthStore.subscribe((state) => {
    applyUserDataToDashboard(state.user);
  });

  const ctx = gsap.context(() => {
    animateProgressBarsOnLoad(all, timeout, progressDelay);
    animateFloatingParticles(particleIds, q, 0.7);

    all('#stat-cards > div').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.15,
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    if (mainContentSelector) {
      gsap.fromTo(
        mainContentSelector,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: mainContentSelector, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );

      timeout(() => {
        all(`${mainContentSelector} > div`).forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              delay: index * 0.2,
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
            },
          );
        });
      }, 100);
    }

    extraTriggers({ q, all, get, timeout });
  }, root);

  setupLogoSpin(get, on);
  setupNavHover(all, on);

  if (typeof matchScore === 'number') {
    setMatchScore(matchScore);
  }

  // Bind logout button if exists
  const logoutBtn = get('#logout-button');
  if (logoutBtn) {
    on(logoutBtn, 'click', (e) => {
      e.preventDefault();
      useAuthStore.getState().logout();
    });
  }

  timeout(() => ScrollTrigger.refresh(), 0);

  return () => {
    unsubscribeAuthUser();
    cleanup();
    ctx.revert();
  };
}

export function setupLandingPage({
  root,
  navigate,
}: {
  root: HTMLElement;
  navigate: (path: string) => void;
}): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, get, all, on, timeout, cleanup } = tools;
  const setScrollProgress = useAppStore.getState().setScrollProgress;
  const setMatchScore = useAppStore.getState().setMatchScore;
  const extraCleanup: CleanupFn[] = [];

  const ctx = gsap.context(() => {
    gsap.to('#progress-bar', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self: any) => setScrollProgress(self.progress),
      },
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.7);

    gsap.fromTo(
      '#hero-title .hero-word-inner',
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.12,
        delay: 0.2,
      },
    );

    const heroLogo = get('#hero-link-letters');
    const navbarLogo = get('#logo-animated');
    const footerLogo = get('#footer-logo-animated');
    const stopHeroLoop = startLogoLetterLoop(heroLogo);
    const stopNavbarLoop = startLogoLetterLoop(navbarLogo);
    const stopFooterLoop = startLogoLetterLoop(footerLogo, { delay: 2.2, repeatDelay: 3 });
    const stopNavbarHover = bindLogoHoverBounce(get('#logo-link'), navbarLogo);
    const stopHeroHover = bindLogoHoverBounce(get('#hero-logo-link'), heroLogo);
    const stopFooterHover = bindLogoHoverBounce(get('#footer-logo-link'), footerLogo);

    extraCleanup.push(stopHeroLoop, stopNavbarLoop, stopFooterLoop, stopNavbarHover, stopHeroHover, stopFooterHover);

    all('.reveal-up').forEach((element) => {
      gsap.fromTo(
        element,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    all('.reveal-left').forEach((element) => {
      gsap.fromTo(
        element,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    all('.reveal-right').forEach((element) => {
      gsap.fromTo(
        element,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to('#match-bar', { width: '94%', duration: 1.8, ease: 'power3.out', delay: 1 });
        gsap.to({ val: 0 }, {
          val: 94,
          duration: 1.8,
          delay: 1,
          ease: 'power3.out',
          onUpdate() {
            const value = Math.round((this as any).targets()[0].val);
            const counter = get('#match-counter');
            if (counter) {
              counter.textContent = String(value);
            }
            setMatchScore(value);
          },
        });
      },
    });

    ScrollTrigger.create({
      trigger: '#ring-circle',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const targetOffset = 377 - 377 * 0.88;
        gsap.fromTo('#ring-circle', { strokeDashoffset: 377 }, { strokeDashoffset: targetOffset, duration: 1.6, ease: 'power3.out' });
        gsap.to({ val: 0 }, {
          val: 88,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate() {
            const counter = get('#ring-counter');
            if (counter) {
              counter.textContent = `${Math.round((this as any).targets()[0].val)}%`;
            }
          },
        });
      },
    });

    ScrollTrigger.create({
      trigger: '#stats-bar',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        all('.counter-value').forEach((element) => {
          const target = Number.parseInt(element.dataset.target ?? '0', 10);

          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power3.out',
            onUpdate() {
              const value = Math.round((this as any).targets()[0].val);
              element.textContent =
                value >= 1000
                  ? `${value.toLocaleString('fr')}+`
                  : target === 87
                    ? `${value}%`
                    : `${value}+`;
            },
          });
        });
      },
    });

    ScrollTrigger.create({
      trigger: '#post-horizontal-story',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        all('.premium-counter-value').forEach((element) => {
          const target = Number.parseInt(element.dataset.target ?? '0', 10);
          const prefix = element.dataset.prefix ?? '';
          const suffix = element.dataset.suffix ?? '';

          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.6,
            ease: 'power3.out',
            onUpdate() {
              const value = Math.round((this as any).targets()[0].val);
              element.textContent = `${prefix}${value}${suffix}`;
            },
          });
        });

        all('.premium-bar-fill').forEach((bar) => {
          const width = bar.dataset.width ?? '0';
          gsap.fromTo(bar, { width: '0%' }, { width: `${width}%`, duration: 1.1, ease: 'power3.out', stagger: 0.08 });
        });
      },
    });

    const feedbackRail = get('#feedback-scroll');
    const feedbackShell = get('#feedback-scroll-section');
    const feedbackSection = get('#feedback-section');

    if (feedbackRail && feedbackShell && feedbackSection && window.innerWidth >= 768) {
      const getFeedbackDistance = () => Math.max(0, feedbackRail.scrollWidth - feedbackShell.clientWidth);

      gsap.set(feedbackRail, { x: 0 });

      const feedbackAnimation = gsap.to(feedbackRail, {
        x: () => -getFeedbackDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: feedbackSection,
          start: 'top top',
          end: () => `+=${getFeedbackDistance()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // ResizeObserver to refresh on layout changes
      const feedbackResizeObserver = new ResizeObserver(() => {
        feedbackAnimation.scrollTrigger?.refresh();
      });

      feedbackResizeObserver.observe(feedbackShell);
      feedbackResizeObserver.observe(feedbackRail);
      Array.from(feedbackRail.children as any).forEach((card) => feedbackResizeObserver.observe(card as Element));
    }

    const horizontalSection = get('#horizontal-section');
    const track = get('.horizontal-track');

    if (horizontalSection && track) {
      gsap.to(track, {
        x: () => -track.scrollWidth + window.innerWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: horizontalSection,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          scrub: 1,
          pin: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const circles = all('.step-circle');
            const lines = all('.progress-line');

            circles.forEach((circle, index) => {
              circle.classList.remove('active', 'completed');

              if (progress > (index + 0.5) / 3) {
                circle.classList.add('completed');
                circle.innerHTML = '<span class="check-icon">✓</span>';
              } else if (progress > index / 3) {
                circle.classList.add('active');
              } else {
                circle.textContent = String(index + 1);
              }
            });

            lines.forEach((line, index) => {
              const lineStart = index / 3;
              const lineEnd = (index + 1) / 3;

              if (progress < lineStart) {
                line.style.width = '0%';
              } else if (progress > lineEnd) {
                line.style.width = '100%';
              } else {
                const lineProgress = ((progress - lineStart) / (lineEnd - lineStart)) * 100;
                line.style.width = `${lineProgress}%`;
              }
            });
          },
        },
      });
    }

    ScrollTrigger.create({
      start: 'top -60',
      onUpdate: (self) => {
        const header = get('#main-header');
        if (!header) {
          return;
        }

        header.style.boxShadow = self.direction === 1 ? '0 4px 30px rgba(0,40,142,0.08)' : '';
      },
    });

    all('.feature-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        },
      );
    });

    gsap.to('#scroll-hint svg path', {
      x: 4,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, root);

  timeout(() => ScrollTrigger.refresh(), 0);

  all('.btn-magnetic').forEach((button) => {
    on(button, 'click', (event) => {
      event.preventDefault();
      const text = button.textContent?.toLowerCase() || '';
      if (text.includes('recrute')) {
        useAppStore.getState().setUserType('recruiter');
      } else {
        useAppStore.getState().setUserType('student');
      }
      navigate('/login');
    });
  });

  // Handle Navbar links
  all('header nav a').forEach(link => {
    on(link, 'click', (e) => {
      const href = link.getAttribute('href');
      if (href && (href.includes('register') || href.includes('signup'))) {
        e.preventDefault();
        navigate('/register');
      } else if (href && (href.includes('login') || href.includes('signin'))) {
        e.preventDefault();
        navigate('/login');
      } else if (href && (href === 'index.html' || href === '/')) {
        e.preventDefault();
        navigate('/');
      } else if (href && (href.includes('candidats') || href.includes('recruteurs'))) {
        e.preventDefault();
        useAppStore.getState().setUserType(href.includes('recruteur') ? 'recruiter' : 'student');
        navigate('/login');
      }
    });
  });

  return () => {
    extraCleanup.forEach((fn) => fn?.());
    cleanup();
    ctx.revert();
    setScrollProgress(0);
  };
}

export function setupLoginPage({ root, onLogin, error }: { root: HTMLElement; onLogin?: (data: any) => Promise<any>; error?: string | null; navigate?: any }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, get, all, on, cleanup } = tools;

  // Affichage de l'erreur si présente
  if (error) {
    const errorContainer = get('#error-message');
    const errorText = get('#error-text');
    if (errorContainer && errorText) {
      errorText.textContent = error;
      errorContainer.classList.remove('hidden');
      gsap.fromTo(errorContainer, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 });
    }
  }

  const form = get('form');
  
  if (form) {
    on(form, 'submit', async (e: Event) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement | null;
      const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement | null;
      const roleSelect = form.querySelector('select[name="role"]') as HTMLSelectElement | null;
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      
      const selectedRole = roleSelect?.value;
      const fallbackRole = useAppStore.getState().userType === 'recruiter' ? 'recruiter' : 'candidate';
      const role = selectedRole || fallbackRole;

      // Validation
      if (!emailInput || !passwordInput) {
        console.error('[Login] ❌ Email ou mot de passe champ non trouvé');
        return;
      }

      if (!emailInput.value || !passwordInput.value) {
        console.error('[Login] ❌ Email ou mot de passe vide');
        return;
      }

      if (!onLogin) {
        console.error('[Login] ❌ onLogin callback non défini');
        return;
      }

      // Disable button & show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
      }

      try {
        console.log('[Login] 🔄 Tentative de connexion...', { email: emailInput.value, role });
        const res = await onLogin({
          email: emailInput.value,
          password: passwordInput.value,
          role
        });
        
        console.log('[Login] Response:', res);
        
        if (!res.success) {
          console.error('[Login] ❌ Connexion échouée:', res.message || 'Erreur inconnue');
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
          }
        }
      } catch (err) {
        console.error("[Login] ❌ Erreur de connexion", err);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
        }
      }
    });
  } else {
    console.warn('[Login] ⚠️ Formulaire non trouvé');
  }

  const switchUser = (type: 'student' | 'recruiter' | 'admin') => {
    const slider = get('#user-slider');
    const btnStudent = get('#tab-student');
    const btnRecruiter = get('#tab-recruiter');
    const btnAdmin = get('#tab-admin');
    const roleSelect = get('select[name="role"]') as HTMLSelectElement | null;

    if (!slider || !btnStudent || !btnRecruiter) {
      return;
    }

    // Reset styles
    [btnStudent, btnRecruiter, btnAdmin].forEach(btn => {
      if (btn) btn.classList.replace('text-primary', 'text-on-surface-variant');
    });

    if (type === 'student') {
      gsap.to(slider, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnStudent.classList.replace('text-on-surface-variant', 'text-primary');
      useAppStore.getState().setUserType('student');
      if (roleSelect) roleSelect.value = 'candidate';
    } else if (type === 'recruiter') {
      gsap.to(slider, { x: '100%', duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnRecruiter.classList.replace('text-on-surface-variant', 'text-primary');
      useAppStore.getState().setUserType('recruiter');
      if (roleSelect) roleSelect.value = 'recruiter';
    } else if (type === 'admin') {
      gsap.to(slider, { x: '200%', duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      if (btnAdmin) btnAdmin.classList.replace('text-on-surface-variant', 'text-primary');
      useAppStore.getState().setUserType('admin');
      if (roleSelect) roleSelect.value = 'admin';
    }
  };

  const ctx = gsap.context(() => {
    gsap.from('.reveal-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.5);
  }, root);

  // Tab listeners
  on(get('#tab-student'), 'click', (e) => { e.preventDefault(); switchUser('student'); });
  on(get('#tab-recruiter'), 'click', (e) => { e.preventDefault(); switchUser('recruiter'); });
  on(get('#tab-admin'), 'click', (e) => { e.preventDefault(); switchUser('admin'); });

  // Role select listener
  const roleSelect = get('select[name="role"]') as HTMLSelectElement | null;
  if (roleSelect) {
    on(roleSelect, 'change', (event) => {
      const value = (event.target as HTMLSelectElement).value;
      if (value === 'candidate') switchUser('student');
      else if (value === 'recruiter') switchUser('recruiter');
      else if (value === 'admin') switchUser('admin');
    });
  }

  // Password visibility
  all("button[type='button']").forEach((button) => {
    const visibilityIcon = button.querySelector(".material-symbols-outlined");
    const passwordInput = button.parentElement?.querySelector("input[name='password'], input[type='password'], input[type='text']") as HTMLInputElement | null;

    if (visibilityIcon && visibilityIcon.textContent?.includes('visibility') && passwordInput) {
      on(button, 'click', (event) => {
        event.preventDefault();
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        gsap.to(button, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
      });
    }
  });

  // Global ripples and hover
  all('button').forEach((button) => {
    on(button, 'click', (event) => {
      if (event.target.closest('input')) return;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      button.appendChild(ripple);

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      setTimeout(() => ripple.remove(), 600);
    });

    on(button, 'mouseenter', () => {
      if (button.id !== 'tab-student' && button.id !== 'tab-recruiter' && button.id !== 'tab-admin') {
        gsap.to(button, { scale: 1.02, duration: 0.2 });
      }
    });

    on(button, 'mouseleave', () => {
      if (button.id !== 'tab-student' && button.id !== 'tab-recruiter' && button.id !== 'tab-admin') {
        gsap.to(button, { scale: 1, duration: 0.2 });
      }
    });
  });

  all('button').forEach((button) => {
    on(button, 'click', (event) => {
      if (event.target.closest('input')) {
        return;
      }

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      button.appendChild(ripple);

      const rect = button.getBoundingClientRect();
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      window.setTimeout(() => ripple.remove(), 600);
    });

    on(button, 'mouseenter', () => {
      if (button.id === 'tab-student' || button.id === 'tab-recruiter') {
        return;
      }

      gsap.to(button, { scale: 1.02, duration: 0.2 });
    });

    on(button, 'mouseleave', () => {
      if (button.id === 'tab-student' || button.id === 'tab-recruiter') {
        return;
      }

      gsap.to(button, { scale: 1, duration: 0.2 });
    });
  });

  return () => {
    cleanup();
    ctx.revert();
  };
}

export function setupRegisterPage({ root, onRegister, navigate }: { root: HTMLElement; onRegister?: (data: any) => Promise<any>; navigate?: any }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, get, all, on, cleanup, timeout } = tools;

  const switchUser = (type: 'student' | 'recruiter') => {
    const slider = get('#user-slider');
    const btnStudent = get('#tab-student');
    const btnRecruiter = get('#tab-recruiter');

    if (!slider || !btnStudent || !btnRecruiter) {
      return;
    }

    if (type === 'student') {
      gsap.to(slider, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnStudent.classList.replace('text-on-surface-variant', 'text-primary');
      btnRecruiter.classList.replace('text-primary', 'text-on-surface-variant');
      useAppStore.getState().setUserType('student');
      useAppStore.getState().setUser({ role: 'Candidat' });
    } else {
      gsap.to(slider, { x: '100%', duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnRecruiter.classList.replace('text-on-surface-variant', 'text-primary');
      btnStudent.classList.replace('text-primary', 'text-on-surface-variant');
      useAppStore.getState().setUserType('recruiter');
      useAppStore.getState().setUser({ role: 'Recruteur' });
    }
  };

  const ctx = gsap.context(() => {
    gsap.from('.reveal-card', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.5);
  }, root);

  const passwordInput = get('#password-input') as HTMLInputElement;
  const strengthFill = get('#strength-fill');
  const togglePasswordBtn = get('#toggle-password');
  const submitBtn = get("button[type='submit']");
  const form = get('form');

  if (form) {
    on(form, 'submit', async (e: Event) => {
      e.preventDefault();
      const firstNameInput =
        (form.querySelector('input[name="firstName"]') as HTMLInputElement | null) ||
        (form.querySelector('#input-firstname') as HTMLInputElement | null) ||
        (form.querySelector('input[placeholder*="Prénom"], input[placeholder*="Thomas"]') as HTMLInputElement | null) ||
        (form.querySelectorAll('input[type="text"]')[0] as HTMLInputElement | undefined) ||
        null;

      const lastNameInput =
        (form.querySelector('input[name="lastName"]') as HTMLInputElement | null) ||
        (form.querySelector('#input-lastname') as HTMLInputElement | null) ||
        (form.querySelector('input[placeholder*="Nom"], input[placeholder*="Dubois"]') as HTMLInputElement | null) ||
        (form.querySelectorAll('input[type="text"]')[1] as HTMLInputElement | undefined) ||
        null;

      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement | null;
      const passwordField =
        (form.querySelector('#password-input') as HTMLInputElement | null) ||
        (form.querySelector('input[type="password"]') as HTMLInputElement | null);

      const data: any = {
        firstName: firstNameInput?.value?.trim(),
        lastName: lastNameInput?.value?.trim(),
        email: emailInput?.value?.trim(),
        password: passwordField?.value,
      };

      data.role = useAppStore.getState().userType === 'recruiter' ? 'recruiter' : 'candidate';

      if (submitBtn) {
        submitBtn.classList.add('success-pulse');
        gsap.to(submitBtn, { scale: 0.95, duration: 0.2 });
        submitBtn.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Création...";
        submitBtn.disabled = true;
      }

      if (onRegister) {
        try {
          const res = await onRegister(data);
          if (res.success && navigate) {
            createConfetti();
            if (submitBtn) {
              submitBtn.innerHTML = "<span class='material-symbols-outlined'>check_circle</span> Compte créé";
              gsap.to(submitBtn, { scale: 1, duration: 0.3 });
              submitBtn.classList.remove('success-pulse');
            }
            timeout(() => {
              const role = useAppStore.getState().userType;
              if (role === 'recruiter') navigate('/dashboard-recruteur');
              else navigate('/dashboard-candidat');
            }, 1000);
          } else {
            if (submitBtn) {
              submitBtn.innerHTML = "<span class='material-symbols-outlined'>error</span> Erreur";
              gsap.to(submitBtn, { scale: 1, duration: 0.3 });
              submitBtn.classList.remove('success-pulse');
              submitBtn.disabled = false;
            }
            if (res.message) {
              console.error(res.message);
            }
          }
        } catch (err) {
          console.error("Erreur d'inscription", err);
          if (submitBtn) {
            submitBtn.innerHTML = "<span class='material-symbols-outlined'>error</span> Erreur";
            gsap.to(submitBtn, { scale: 1, duration: 0.3 });
            submitBtn.classList.remove('success-pulse');
            submitBtn.disabled = false;
          }
        }
      }
    });
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  on(passwordInput, 'input', () => {
    const strength = calculatePasswordStrength(passwordInput.value);
    gsap.to(strengthFill, { width: `${strength}%`, duration: 0.4, ease: 'power2.out' });
    strengthFill.style.filter = `hue-rotate(${(strength / 100) * 120}deg)`;
  });

  on(togglePasswordBtn, 'click', (event) => {
    event.preventDefault();
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    gsap.to(togglePasswordBtn, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
  });

  on(get('#tab-student'), 'click', (event) => {
    event.preventDefault();
    switchUser('student');
  });
  on(get('#tab-recruiter'), 'click', (event) => {
    event.preventDefault();
    switchUser('recruiter');
  });

  const createConfetti = () => {
    const colors = ['#00288e', '#4648d4', '#6ffbbe', '#dde1ff', '#e1e0ff', '#f0f4ff'];

    for (let index = 0; index < 50; index += 1) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
      confetti.style.animationDuration = `${Math.random() * 2 + 2.5}s`;
      confetti.style.animationDelay = `${Math.random() * 0.2}s`;
      document.body.appendChild(confetti);
      timeout(() => confetti.remove(), 5000);
    }
  };


  all('button').forEach((button) => {
    on(button, 'click', (event) => {
      if (event.target.closest('input')) {
        return;
      }

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      button.appendChild(ripple);

      const rect = button.getBoundingClientRect();
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      window.setTimeout(() => ripple.remove(), 600);
    });

    on(button, 'mouseenter', () => {
      if (button === submitBtn || button === togglePasswordBtn) {
        return;
      }

      gsap.to(button, { scale: 1.02, duration: 0.2 });
    });

    on(button, 'mouseleave', () => {
      if (button === submitBtn || button === togglePasswordBtn) {
        return;
      }

      gsap.to(button, { scale: 1, duration: 0.2 });
    });
  });

  return () => {
    cleanup();
    ctx.revert();
  };
}

export function setupAssistantPage({ root }: { root: HTMLElement }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, all, on, cleanup, timeout } = tools;

  const ctx = gsap.context(() => {
    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.7);

    timeout(() => {
      document.body.classList.add('loaded');
    }, 500);

    all('.reveal-up').forEach((element, index) => {
      gsap.fromTo(
        element,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: { trigger: element, start: 'top 90%', toggleActions: 'play none none none' },
        },
      );
    });
  }, root);

  setupButtonScale(all, on);
  setupNavHover(all, on);

  return () => {
    cleanup();
    ctx.revert();
    document.body.classList.remove('loaded');
  };
}

export function setupAnalyseCvPage({ root, onUpload, onGetMyCv }: { root: HTMLElement; onUpload?: (file: File) => Promise<any>; onGetMyCv?: () => Promise<any> }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, get, all, on, cleanup, timeout, interval, raf } = tools;
  const setMatchScore = useAppStore.getState().setMatchScore;

  const ctx = gsap.context(() => {
    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.7);

    gsap.fromTo('.reveal', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 });

    all('.reveal-up').forEach((element, index) => {
      gsap.fromTo(
        element,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.15,
          scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    all('.stat-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });

    all('.premium-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.15,
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
    });
  }, root);

  setupButtonScale(all, on);
  setupNavHover(all, on);

  const startScan = async (file?: File) => {
    const uploadZone = get('#upload-zone');
    const scanContainer = get('#scan-container');
    const progress = get('#scan-progress');
    const status = get('#scan-status');
    const percent = get('#scan-percent');
    const confidence = get('#confidence');
    const filePreview = get('#file-preview');

    gsap.to(uploadZone, {
      opacity: 0,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => {
        uploadZone.classList.add('hidden');
        scanContainer.classList.remove('hidden');
        gsap.fromTo(scanContainer, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' });
      },
    });

    if (file && onUpload) {
      status.innerText = 'Upload du document...';
      try {
        await onUpload(file);
        status.innerText = 'Analyse en cours...';

        let pollingInterval = interval(async () => {
          if (onGetMyCv) {
             const res = await onGetMyCv();
             if (res.success && res.data?.cv) {
                const cv = res.data.cv;
                if (cv.parseStatus === 'done') {
                  window.clearInterval(pollingInterval);
                  
                  // Mettre à jour l'UI avec les skills
                  const skillsContainer = root.querySelector('.flex.flex-wrap.gap-2');
                  if (skillsContainer && cv.extractedSkills) {
                     skillsContainer.innerHTML = '';
                     cv.extractedSkills.forEach((extractedSkill: any) => {
                       const span = document.createElement('span');
                       span.className = "bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold";
                       span.textContent = extractedSkill.skill?.name || extractedSkill.skillName || 'Skill';
                       skillsContainer.appendChild(span);
                     });
                  }

                  gsap.to(progress, { width: '100%', duration: 0.5 });
                  percent.innerText = '100%';

                  timeout(() => {
                    scanContainer.classList.add('hidden');
                    filePreview.classList.remove('hidden');
                    gsap.fromTo('#file-preview', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out' });
                    gsap.to(confidence, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
                    setMatchScore(92);
                  }, 500);
                } else if (cv.parseStatus === 'failed') {
                  window.clearInterval(pollingInterval);
                  status.innerText = "Échec de l'analyse.";
                  status.style.color = 'red';
                }
             }
          }
        }, 3000);
      } catch (err) {
        status.innerText = "Erreur lors de l'upload.";
        status.style.color = 'red';
      }
    } else {
      // Fallback
      status.innerText = 'Fichier manquant.';
    }
  };

  const resetUpload = () => {
    const uploadZone = get('#upload-zone');
    const scanContainer = get('#scan-container');
    const filePreview = get('#file-preview');
    const progress = get('#scan-progress');
    const confidence = get('#confidence');

    filePreview.classList.add('hidden');
    scanContainer.classList.add('hidden');

    gsap.to(uploadZone, {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => {
        uploadZone.classList.remove('hidden');
        progress.style.width = '0%';
        confidence.setAttribute('stroke-dashoffset', '377');
        gsap.fromTo(uploadZone, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out' });
      },
    });
  };

  // Cacher le faux bouton et ajouter un vrai input file caché si besoin, ou intercepter
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.pdf,.doc,.docx';
  fileInput.style.display = 'none';
  root.appendChild(fileInput);

  on(fileInput, 'change', (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
       startScan(target.files[0]);
    }
  });

  on(root.querySelector('[onclick*="startScan"]'), 'click', (event) => {
    event.preventDefault();
    fileInput.click();
  });
  on(root.querySelector('[onclick*="resetUpload"]'), 'click', (event) => {
    event.preventDefault();
    resetUpload();
  });

  const zone = get('#upload-zone');
  on(zone, 'dragover', (event) => {
    event.preventDefault();
    gsap.to(zone, {
      scale: 1.02,
      borderColor: '#00288e',
      backgroundColor: 'rgba(0,40,142,0.02)',
      duration: 0.2,
    });
    zone.classList.add('upload-active');
  });
  on(zone, 'dragleave', () => {
    gsap.to(zone, {
      scale: 1,
      borderColor: '#e0e3e5',
      backgroundColor: 'transparent',
      duration: 0.2,
    });
    zone.classList.remove('upload-active');
  });
  on(zone, 'drop', (event: DragEvent) => {
    event.preventDefault();
    gsap.to(zone, {
      scale: 1,
      borderColor: '#e0e3e5',
      backgroundColor: 'transparent',
      duration: 0.2,
    });
    zone?.classList.remove('upload-active');
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      startScan(event.dataTransfer.files[0]);
    }
  });

  const lenis = new Lenis();
  const runLenis = (time: number) => {
    lenis.raf(time);
    raf(runLenis);
  };
  raf(runLenis);

  timeout(() => ScrollTrigger.refresh(), 0);

  return () => {
    cleanup();
    lenis.destroy();
    ctx.revert();
  };
}

export function setupCandidateDashboardPage({
  root,
  navigate,
}: {
  root: HTMLElement;
  navigate: (path: string) => void;
}): CleanupFn {
  const cleanup = setupDashboardAnimations(root, {
    particleIds: ['#p1-1', '#p1-2', '#p1-3', '#p1-4'],
    progressDelay: 300,
    matchScore: 85,
  });

  const actionButton = root.querySelector('#candidate-find-internship-button');
  const handleClick = () => navigate('/dashboard-candidat/trouver-stage');

  actionButton?.addEventListener('click', handleClick);

  return () => {
    actionButton?.removeEventListener('click', handleClick);
    cleanup();
  };
}

export function setupRecruiterDashboardPage({
  root,
  navigate,
  candidates,
}: {
  root: HTMLElement;
  navigate: (path: string) => void;
  candidates?: any[];
}): CleanupFn {
  const cleanup = setupDashboardAnimations(root, {
    particleIds: ['#p1', '#p2', '#p3', '#p4'],
    mainContentSelector: null,
    progressDelay: 300,
    extraTriggers: ({ all, timeout, q }) => {
      // Populate candidates if provided
      if (candidates && candidates.length > 0) {
        // Update "Nexus Actif" card (the top candidate)
        const nexusActifCard = q('.bg-gradient-to-br.from-primary.to-secondary')[0] as HTMLElement | undefined;
        if (nexusActifCard) {
          const topApp = candidates[0];
          const candidateName = nexusActifCard.querySelector('.font-bold.leading-none');
          const matchPercent = nexusActifCard.querySelector('.text-\\[10px\\].font-bold.text-white\\/70');
          const bioText = nexusActifCard.querySelector('.text-sm.font-medium.text-white\\/90');

          if (candidateName) candidateName.textContent = `${topApp.candidate.profile.firstName} ${topApp.candidate.profile.lastName}`;
          if (matchPercent && topApp.candidate.match_scores && topApp.candidate.match_scores[0]) {
            matchPercent.textContent = `Match: ${Math.round(topApp.candidate.match_scores[0].scoreFinal * 100)}%`;
          }
          if (bioText) bioText.innerHTML = `Nouveau profil détecté pour <strong>${topApp.offer.title}</strong>. Ce candidat présente une excellente adéquation.`;
        }

        // Update Pipeline section with real applications
        const pipelineContainer = root.querySelector('#pipeline-section .space-y-4');
        const templateCard = pipelineContainer?.querySelector('.card-hover-scale');
        if (pipelineContainer && templateCard) {
          pipelineContainer.innerHTML = '';
          candidates.forEach((app) => {
            const card = templateCard.cloneNode(true) as HTMLElement;
            const titleEl = card.querySelector('h3');
            const scoreEl = card.querySelector('.text-primary, .text-secondary');
            const progressEl = card.querySelector('.progress-bar-fill') as HTMLElement;
            const refEl = card.querySelector('.text-\\[10px\\].font-bold');

            if (titleEl) titleEl.textContent = `${app.candidate.profile.firstName} ${app.candidate.profile.lastName} - ${app.offer.title}`;
            if (refEl) refEl.textContent = `STATUT: ${app.applicationStatus.toUpperCase()}`;
            
            if (app.candidate.match_scores && app.candidate.match_scores[0]) {
              const score = Math.round(app.candidate.match_scores[0].scoreFinal * 100);
              if (scoreEl) scoreEl.textContent = `${score}%`;
              if (progressEl) progressEl.style.width = `${score}%`;
            }

            pipelineContainer.appendChild(card);
          });
        }
      }

      all('.reveal-up').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
          },
        );
      });

      all('.reveal-left').forEach((element) => {
        gsap.fromTo(
          element,
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
          },
        );
      });

      all('.reveal-right').forEach((element) => {
        gsap.fromTo(
          element,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
          },
        );
      });

      timeout(() => {
        all('#pipeline-section .space-y-4 > div').forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              delay: index * 0.2,
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
            },
          );
        });
      }, 100);

      timeout(() => {
        all('#insights-section > div').forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              delay: (index + 1) * 0.2,
              scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
            },
          );
        });
      }, 100);
    },
  });

  const actionButton = root.querySelector('#recruiter-create-offer-button');
  const handleClick = () => navigate('/dashboard-recruteur/creer-offre');

  actionButton?.addEventListener('click', handleClick);

  return () => {
    actionButton?.removeEventListener('click', handleClick);
    cleanup();
  };
}

export function setupAdminDashboardPage({ root, stats }: { root: HTMLElement; stats?: any }): CleanupFn {
  return setupDashboardAnimations(root, {
    particleIds: ['#p1', '#p2', '#p3', '#p4'],
    progressDelay: 500,
    extraTriggers: ({ all }) => {
      gsap.fromTo(
        '#chart-section',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#chart-section', start: 'top 85%', toggleActions: 'play none none none' },
        },
      );
      
      if (stats) {
        // Inject stats into the DOM
        const kpiCards = all('.card-hover-scale h3');
        if (kpiCards.length >= 4) {
          kpiCards[0].textContent = stats.totalUsers?.toString() || '0';
          kpiCards[1].textContent = stats.totalOffers?.toString() || '0';
          kpiCards[2].textContent = stats.totalCompanies?.toString() || '0';
          kpiCards[3].textContent = stats.totalCandidates?.toString() || '0';
        }

        // Inject recent users
        const recentUsersContainer = root.querySelector('#recent-users .space-y-4');
        const templateRecent = recentUsersContainer?.querySelector('.group');
        if (recentUsersContainer && templateRecent && stats.recentUsers) {
          recentUsersContainer.innerHTML = '';
          stats.recentUsers.forEach((user: any) => {
            const el = templateRecent.cloneNode(true) as HTMLElement;
            const nameEl = el.querySelector('.text-sm.font-bold');
            const roleEl = el.querySelector('.text-xs');
            const imgEl = el.querySelector('img');
            const avatarFallback = el.querySelector('.bg-gradient-to-tr');

            if (nameEl) nameEl.textContent = `${user.profile?.firstName || user.firstName || ''} ${user.profile?.lastName || user.lastName || ''}`;
            if (roleEl) roleEl.textContent = `${user.role === 'candidate' ? 'Étudiant' : 'Recruteur'} • ${user.profile?.bio || 'Nouvel inscrit'}`;
            
            if (imgEl) {
              const avatarUrl = user.profile?.avatarUrl;
              if (avatarUrl) {
                imgEl.src = avatarUrl;
                if (avatarFallback) avatarFallback.remove();
              } else if (avatarFallback) {
                imgEl.remove();
                // If there's a fallback div (JD/initials), we can set initials
                avatarFallback.textContent = (user.profile?.firstName || user.firstName || 'U')[0] + (user.profile?.lastName || user.lastName || '')[0];
              } else {
                imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((user.profile?.firstName || user.firstName || 'U')[0] + (user.profile?.lastName || user.lastName || '')[0])}&background=e0e3e5&color=444653&rounded=true`;
              }
            }
            
            recentUsersContainer.appendChild(el);
          });
        }
      }
    },
  });
}


export function setupAdminUsersPage({ root, navigate, users, stats, totalBanned, activeTab, onTabChange, onBan, onUnban, onVerify, onReject }: { 
  root: HTMLElement; 
  navigate: (path: string) => void;
  users?: any[]; 
  stats?: any; 
  totalBanned?: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onBan?: (id: string) => Promise<any>;
  onUnban?: (id: string) => Promise<any>;
  onVerify?: (id: string) => Promise<any>;
  onReject?: (id: string, reason: string) => Promise<any>;
}): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, all, get, cleanup, on, timeout } = tools;

  const showPremiumConfirm = (title: string, message: string, onConfirm: () => void) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl shadow-primary/20 border border-surface-variant/50';
    modal.innerHTML = `
      <div class="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
        <span class="material-symbols-outlined text-3xl">warning</span>
      </div>
      <h3 class="text-xl font-black text-on-surface mb-2">${title}</h3>
      <p class="text-on-surface-variant text-sm leading-relaxed mb-8">${message}</p>
      <div class="flex gap-4">
        <button id="cancel-confirm" class="flex-1 py-3.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface transition-colors border border-surface-variant">Annuler</button>
        <button id="confirm-action" class="flex-1 py-3.5 rounded-xl font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all">Confirmer</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeModal = () => {
      gsap.to(modal, { y: 20, opacity: 0, duration: 0.2 });
      gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => overlay.remove() });
    };

    modal.querySelector('#cancel-confirm')?.addEventListener('click', closeModal);
    modal.querySelector('#confirm-action')?.addEventListener('click', () => {
      onConfirm();
      closeModal();
    });
  };

  const showActivityHistory = async (user: any) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-[2.5rem] p-0 max-w-2xl w-full shadow-2xl shadow-primary/20 border border-surface-variant/50 overflow-hidden flex flex-col max-h-[80vh]';
    modal.innerHTML = `
      <div class="p-8 border-b border-surface-variant/50 flex justify-between items-center bg-surface/30">
        <div>
          <h3 class="text-xl font-black text-on-surface">Historique d'activité</h3>
          <p class="text-on-surface-variant text-sm mt-1">${user.email}</p>
        </div>
        <button id="close-history" class="w-10 h-10 rounded-full hover:bg-surface flex items-center justify-center text-on-surface-variant transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="logs-container" class="flex-1 overflow-y-auto p-8 space-y-6 bg-white custom-scrollbar">
        <div class="flex items-center justify-center py-20 text-on-surface-variant/30 animate-pulse">
           <span class="material-symbols-outlined text-4xl">pending</span>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const closeHistory = () => {
      gsap.to(modal, { y: 20, opacity: 0, duration: 0.2 });
      gsap.to(overlay, { opacity: 0, duration: 0.2, onComplete: () => overlay.remove() });
    };

    modal.querySelector('#close-history')?.addEventListener('click', closeHistory);

    try {
      const res = await adminService.getUserLogs(user.id);
      const container = modal.querySelector('#logs-container');
      if (container && res.success) {
        if (res.data.length === 0) {
          container.innerHTML = `<div class="py-20 text-center"><span class="material-symbols-outlined text-4xl text-on-surface-variant/20">history_toggle_off</span><p class="text-on-surface-variant text-sm mt-4">Aucune activité enregistrée.</p></div>`;
          return;
        }

        container.innerHTML = res.data.map((log: any) => `
          <div class="flex gap-6 relative">
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center relative z-10 border border-primary/10 shadow-sm">
                <span class="material-symbols-outlined text-[20px]">${log.action.includes('LOGIN') ? 'login' : log.action.includes('BAN') ? 'block' : 'history'}</span>
              </div>
              <div class="w-px flex-1 bg-surface-variant mt-2"></div>
            </div>
            <div class="flex-1 pb-4">
              <div class="flex justify-between items-start mb-1">
                <p class="text-sm font-black text-on-surface uppercase tracking-tight">${log.action.replace(/_/g, ' ')}</p>
                <span class="text-[10px] font-bold text-on-surface-variant/60 bg-surface px-2 py-1 rounded-md">${new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p class="text-xs text-on-surface-variant leading-relaxed">${log.entityType} ID: ${log.entityId || 'N/A'}</p>
              ${log.metadata ? `<pre class="mt-3 p-3 bg-surface rounded-xl text-[10px] text-on-surface-variant/70 border border-surface-variant/30 font-mono overflow-x-auto">${JSON.stringify(log.metadata, null, 2)}</pre>` : ''}
            </div>
          </div>
        `).join('');
      }
    } catch (e) {
      toast.error("Erreur lors du chargement des logs.");
    }
  };

  const ctx = gsap.context(() => {
    const timeline = gsap.timeline({ delay: 0.2 });
    timeline
      .from('aside', { x: -100, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .from('header', { y: -50, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');

    all('.reveal-up').forEach((element) => {
      gsap.fromTo(
        element,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', once: true },
        },
      );
    });

    if (stats) {
      const kpiValues = all('.card-hover-scale h3');
      if (kpiValues.length >= 3) {
        kpiValues[0].textContent = String(stats.totalUsers || 0);
        kpiValues[1].textContent = String(stats.totalCandidates || 0);
        kpiValues[2].textContent = String(stats.totalRecruiters || 0);
      }
    }

    const tabs = all('.flex.gap-4 .bg-white button');
    const tabKeys = ['tous', 'etudiants', 'recruteurs', 'bannis', 'validations'];
    
    // Ensure we have enough buttons in the HTML, or add the 'Validations' one if missing
    const tabsContainer = tabs[0]?.parentElement;
    if (tabsContainer && tabs.length < 5) {
       const vTab = document.createElement('button');
       vTab.className = 'px-6 py-2.5 rounded-full bg-white text-on-surface-variant hover:bg-surface font-bold text-sm transition-all border border-surface-variant/50';
       vTab.setAttribute('data-tab', 'validations');
       tabsContainer.appendChild(vTab);
       // Re-query tabs
       const updatedTabs = all('.flex.gap-4 .bg-white button');
       updatedTabs.forEach((tab: HTMLElement, idx) => {
          const key = tabKeys[idx];
          const isSelected = activeTab === key;
          
          tab.className = isSelected 
            ? 'px-6 py-2.5 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 transition-all'
            : 'px-6 py-2.5 rounded-full bg-white text-on-surface-variant hover:bg-surface font-bold text-sm transition-all border border-surface-variant/50';

          if (key === 'tous') tab.textContent = `Tous (${stats?.totalUsers || 0})`;
          if (key === 'etudiants') tab.textContent = `Étudiants (${stats?.totalCandidates || 0})`;
          if (key === 'recruteurs') tab.textContent = `Recruteurs (${stats?.totalRecruiters || 0})`;
          if (key === 'bannis') tab.textContent = `Bannis (${totalBanned || 0})`;
          if (key === 'validations') {
             tab.textContent = `Validations (${stats?.pendingValidations || 0})`;
             if (stats?.pendingValidations > 0) {
                tab.classList.add('border-orange-200', 'bg-orange-50/30');
             }
          }

          on(tab, 'click', () => { if (onTabChange) onTabChange(key); });
       });
    } else {
      tabs.forEach((tab: HTMLElement, idx) => {
        const key = tabKeys[idx];
        const isSelected = activeTab === key;
        
        tab.className = isSelected 
          ? 'px-6 py-2.5 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 transition-all'
          : 'px-6 py-2.5 rounded-full bg-white text-on-surface-variant hover:bg-surface font-bold text-sm transition-all border border-surface-variant/50';

        if (key === 'tous') tab.textContent = `Tous (${stats?.totalUsers || 0})`;
        if (key === 'etudiants') tab.textContent = `Étudiants (${stats?.totalCandidates || 0})`;
        if (key === 'recruteurs') tab.textContent = `Recruteurs (${stats?.totalRecruiters || 0})`;
        if (key === 'bannis') tab.textContent = `Bannis (${totalBanned || 0})`;
        if (key === 'validations') tab.textContent = `Validations (${stats?.pendingValidations || 0})`;

        on(tab, 'click', () => { if (onTabChange) onTabChange(key); });
      });
    }

    const listContainer = get('.grid.reveal-up');
    if (!listContainer) return;

    // Cache the template card on the container itself so it's not lost when we wipe innerHTML
    let templateCard = (listContainer as any).__templateCard;
    if (!templateCard) {
      templateCard = listContainer.querySelector('.card-hover-scale')?.cloneNode(true);
      if (templateCard) (listContainer as any).__templateCard = templateCard;
    }

    if (templateCard) {
      listContainer.innerHTML = ''; 
      
      if (users && users.length > 0) {
        users.forEach((user) => {
          const card = templateCard.cloneNode(true) as HTMLElement;
          const nameEl = card.querySelector('h3');
          const roleBadge = card.querySelector('span.text-\\[10px\\]');
          const emailEl = card.querySelector('.text-xs.text-on-surface-variant:last-of-type');
          const infoEl = card.querySelector('.text-xs.text-on-surface-variant:first-of-type');
          const imgEl = card.querySelector('img');
          const statusDot = card.querySelector('.absolute.-bottom-1.-right-1');
          
          const isCandidate = user.role === 'candidate';
          if (nameEl) nameEl.textContent = `${user.profile?.firstName || user.firstName || ''} ${user.profile?.lastName || user.lastName || ''}`;
          if (emailEl) emailEl.innerHTML = `<span class="material-symbols-outlined text-[14px]">mail</span> ${user.email || ''}`;
          
          if (roleBadge) {
            roleBadge.textContent = isCandidate ? 'Candidat' : 'Recruteur';
            roleBadge.className = isCandidate 
              ? 'px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg tracking-wider'
              : 'px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase rounded-lg tracking-wider';
          }

          if (infoEl) {
            const icon = isCandidate ? 'school' : 'domain';
            const text = isCandidate ? (user.profile?.school?.name || 'Étudiant') : (user.profile?.company?.name || user.profile?.companyName || 'Recruteur');
            infoEl.innerHTML = `<span class="material-symbols-outlined text-[14px]">${icon}</span> ${text}`;
          }

          if (imgEl) {
            const avatarUrl = user.profile?.avatarUrl || user.profile?.avatar;
            imgEl.src = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.profile?.firstName || user.firstName || 'U')[0])}&background=e0e3e5&color=444653&rounded=true`;
            imgEl.onerror = () => { imgEl.src = `https://ui-avatars.com/api/?name=U&background=e0e3e5&color=444653&rounded=true`; };
          }

          if (statusDot) {
             statusDot.className = `absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-green-500 shadow-lg shadow-green-500/20'}`;
          }

          const scoreContainer = card.querySelector('.flex.flex-col');
          if (scoreContainer && isCandidate) {
            const scoreLabel = scoreContainer.querySelector('span:first-child');
            const scoreValue = scoreContainer.querySelector('span:last-child');
            const latestScore = user.match_scores?.[0];
            if (latestScore) {
              const score = Math.round(latestScore.scoreFinal * 100);
              let label = 'Faible'; let color = 'text-red-600';
              if (score >= 90) { label = 'Excellent'; color = 'text-green-600'; }
              else if (score >= 75) { label = 'Très bon'; color = 'text-emerald-600'; }
              else if (score >= 50) { label = 'Moyen'; color = 'text-orange-600'; }
              if (scoreLabel) scoreLabel.textContent = 'Score IA';
              if (scoreValue) { scoreValue.textContent = `${label} (${score}%)`; scoreValue.className = `text-sm font-black ${color}`; }
            } else {
              if (scoreLabel) scoreLabel.textContent = 'CV non analysé';
              if (scoreValue) { scoreValue.textContent = '--'; scoreValue.className = 'text-sm font-black text-on-surface-variant/30'; }
            }
          }

          const allCardBtns = Array.from(card.querySelectorAll('button'));
          const moreBtn = allCardBtns.find(btn => btn.querySelector('.material-symbols-outlined')?.textContent?.trim() === 'more_vert');
          const banBtn = allCardBtns.find(btn => btn.querySelector('.material-symbols-outlined')?.textContent?.trim() === 'block');

          // Add Validation Buttons if pending
          if (user.isPendingValidation) {
            if (banBtn) banBtn.remove();
            
            const btnGroup = card.querySelector('.flex.gap-2.mt-auto') || card.querySelector('.flex.justify-end');
            if (btnGroup) {
              btnGroup.innerHTML = '';
              
              const approveBtn = document.createElement('button');
              approveBtn.className = 'flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all';
              approveBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">verified</span> Approuver';
              approveBtn.onclick = () => {
                showPremiumConfirm('Approuver l\'accès', `Voulez-vous valider l'accès recruteur pour ${user.companyName} ?`, () => onVerify && onVerify(user.companyId));
              };
              
              const rejectBtn = document.createElement('button');
              rejectBtn.className = 'flex items-center gap-2 px-4 py-2 bg-surface text-red-500 border border-red-100 rounded-xl text-xs font-black hover:bg-red-50 transition-all';
              rejectBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">close</span> Rejeter';
              rejectBtn.onclick = () => {
                const reason = prompt('Motif du rejet :');
                if (reason) onReject && onReject(user.companyId, reason);
              };
              
              btnGroup.appendChild(rejectBtn);
              btnGroup.appendChild(approveBtn);
            }
          }

          allCardBtns.find(btn => btn.querySelector('.material-symbols-outlined')?.textContent?.trim() === 'edit')?.remove();

          if (banBtn && !user.isPendingValidation) {
            if (user.isBanned) {
              banBtn.classList.replace('text-red-500', 'text-emerald-600');
              banBtn.classList.replace('hover:bg-red-50', 'hover:bg-emerald-50');
              const icon = banBtn.querySelector('.material-symbols-outlined');
              if (icon) icon.textContent = 'check_circle';
            }

            banBtn.addEventListener('click', (e) => {
              e.preventDefault(); e.stopPropagation();
              gsap.to(banBtn, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });
              if (user.isBanned) {
                showPremiumConfirm('Réactiver le compte', `Voulez-vous vraiment réactiver le compte de ${user.email} ?`, () => onUnban && onUnban(user.id));
              } else {
                showPremiumConfirm('Bannir l\'utilisateur', `Êtes-vous sûr de vouloir bannir ${user.email} ?`, () => onBan && onBan(user.id));
              }
            });
          }

          if (moreBtn) {
            moreBtn.addEventListener('click', (e) => {
               e.preventDefault(); e.stopPropagation();
               gsap.to(moreBtn, { rotation: 90, duration: 0.2 });
               const existingMenu = document.getElementById('temp-admin-menu');
               if (existingMenu) existingMenu.remove();
               const menu = document.createElement('div');
               menu.id = 'temp-admin-menu';
               menu.className = 'fixed bg-white/80 backdrop-blur-xl border border-surface-variant/50 shadow-2xl rounded-[2rem] p-3 z-[1000] min-w-[200px] animate-in fade-in zoom-in duration-200';
               const rect = moreBtn.getBoundingClientRect();
               menu.style.top = `${rect.bottom + 12}px`;
               menu.style.left = `${rect.right - 200}px`;
               
               [{ icon: 'visibility', label: 'Visiter le profil', color: 'text-primary', action: () => navigate(`/profile/${user.id}`) }, 
                { icon: 'mail', label: 'Envoyer un message', color: 'text-on-surface-variant', action: () => navigate(`/messages/${user.id}`) }, 
                { icon: 'history', label: 'Historique d\'activité', color: 'text-on-surface-variant', action: () => showActivityHistory(user) }
               ].forEach(opt => {
                 const item = document.createElement('button');
                 item.className = 'w-full flex items-center gap-4 px-5 py-3 hover:bg-surface rounded-2xl transition-all text-sm font-black ' + opt.color;
                 item.innerHTML = `<div class="w-8 h-8 rounded-xl bg-current/5 flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">${opt.icon}</span></div> ${opt.label}`;
                 item.onclick = (ev) => { 
                   ev.stopPropagation(); 
                   opt.action();
                   menu.remove(); 
                   gsap.to(moreBtn, { rotation: 0, duration: 0.2 }); 
                 };
                 menu.appendChild(item);
               });
               
               document.body.appendChild(menu);
               const closeMenu = () => { menu.remove(); gsap.to(moreBtn, { rotation: 0, duration: 0.2 }); document.removeEventListener('click', closeMenu); };
               setTimeout(() => document.addEventListener('click', closeMenu), 0);
            });
          }
          listContainer.appendChild(card);
        });
      } else {
        listContainer.innerHTML = `<div class="col-span-full py-20 flex flex-col items-center justify-center text-center"><div class="w-20 h-20 bg-surface rounded-[2rem] flex items-center justify-center mb-4"><span class="material-symbols-outlined text-4xl text-on-surface-variant/30">group_off</span></div><h4 class="text-xl font-black text-on-surface">Aucun utilisateur trouvé</h4><p class="text-on-surface-variant text-sm mt-2">Essayez de changer de filtre.</p></div>`;
      }
    }

    gsap.from('.card-hover-scale', {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.card-hover-scale', start: 'top 85%' },
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.5);
  }, root);

  setupButtonScale(all, on, '.btn-primary', { ease: 'power2.out', leaveDuration: 0.3 });
  timeout(() => ScrollTrigger.refresh(), 0);

  return () => {
    cleanup();
    ctx.revert();
  };
}

export function setupAdminOffresPage({ 
  root, 
  offers, 
  stats,
  onToggleFeatured,
  onUpdateStatus
}: { 
  root: HTMLElement; 
  offers?: any[]; 
  stats?: any;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onUpdateStatus?: (id: string, status: string) => void;
}): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, all, get, on, cleanup, timeout } = tools;

  let dragged: Element | null = null;

  const updateCounters = () => {
    const pending = get('#count-pending');
    const active = get('#count-active');
    const closed = get('#count-closed');
    const pendingCol = root.querySelector('#col-pending .overflow-y-auto');
    const activeCol = root.querySelector('#col-active .overflow-y-auto');
    const closedCol = root.querySelector('#col-closed .overflow-y-auto');

    if (pending && pendingCol) pending.innerText = String(pendingCol.children.length);
    if (active && activeCol) active.innerText = String(activeCol.children.length);
    if (closed && closedCol) closed.innerText = String(closedCol.children.length);
  };

  const ctx = gsap.context(() => {
    timeout(() => {
      gsap.to('#preloader', {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.8,
        ease: 'power2.inOut',
        delay: 0.4,
      });
    }, 0);

    const timeline = gsap.timeline({ delay: 0.2 });
    timeline
      .from('aside', { x: -100, opacity: 0, duration: 0.8, ease: 'power3.out' })
      .from('header', { y: -50, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');

    all('.reveal-up').forEach((element) => {
      gsap.fromTo(
        element,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 85%', once: true },
        },
      );
    });

    // Inject bottom KPI stats
    if (stats) {
      const kpiValues = all('.card-hover-scale h3');
      if (kpiValues.length >= 3) {
        kpiValues[0].textContent = String(stats.totalOffers || 0);
        kpiValues[1].textContent = String(stats.pendingCompanies || 0); // Using pending companies as proxy for pending items
        kpiValues[2].textContent = '88%'; // Placeholder for IA match rate
      }
    }

    if (offers && offers.length > 0) {
      // Populate kanban columns
      const pendingCol = root.querySelector('#col-pending .overflow-y-auto');
      const activeCol = root.querySelector('#col-active .overflow-y-auto');
      const closedCol = root.querySelector('#col-closed .overflow-y-auto');
      
      const templateCard = root.querySelector('.draggable')?.cloneNode(true) as HTMLElement;
      
      if (templateCard && pendingCol && activeCol && closedCol) {
        pendingCol.innerHTML = '';
        activeCol.innerHTML = '';
        closedCol.innerHTML = '';
        
        offers.forEach((offer) => {
          const card = templateCard.cloneNode(true) as HTMLElement;
          const imgEl = card.querySelector('img');
          const logoFallback = card.querySelector('.bg-gradient-to-br');
          const titleEl = card.querySelector('h4');
          const companyEl = card.querySelector('p.text-xs');
          const applicantsEl = card.querySelector('.flex.items-center.gap-1 span.font-bold');
          const timeEl = card.querySelector('span.text-\\[10px\\]:last-of-type');
          const badgeEl = card.querySelector('span.bg-orange-50, span.bg-green-50, span.bg-surface-variant');

          if (titleEl) titleEl.textContent = offer.title;
          if (companyEl) companyEl.textContent = `${offer.company?.name || 'Entreprise'} • ${offer.location || 'Remote'}`;
          if (applicantsEl) applicantsEl.textContent = `${offer._count?.applications || 0} Candidats`;
          
          if (timeEl) {
            const date = new Date(offer.createdAt);
            timeEl.textContent = `Posté le ${date.toLocaleDateString()}`;
          }

          if (imgEl) {
            const logo = offer.company?.logoUrl;
            if (logo) {
              imgEl.src = logo;
              if (logoFallback) logoFallback.remove();
            } else if (logoFallback) {
              imgEl.remove();
              logoFallback.textContent = (offer.company?.name || 'E')[0].toUpperCase();
            } else {
               imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.company?.name || 'E')}&background=00288e&color=fff&rounded=true`;
            }
          }

          // Featured indicator
          if (offer.isFeatured) {
            const star = document.createElement('div');
            star.className = 'absolute -top-2 -right-2 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-white animate-pulse';
            star.innerHTML = '<span class="material-symbols-outlined text-[18px] font-fill">star</span>';
            card.appendChild(star);
            card.classList.add('border-amber-200', 'bg-amber-50/10');
          }

          // Add Spotlight and Audit Buttons
          const actionContainer = document.createElement('div');
          actionContainer.className = 'flex items-center gap-2 mt-4 pt-3 border-t border-surface-variant/50';
          
          // Spotlight Button
          const spotlightBtn = document.createElement('button');
          spotlightBtn.type = 'button';
          spotlightBtn.className = `flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black transition-all ${offer.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-surface text-on-surface-variant hover:bg-amber-50'}`;
          spotlightBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">${offer.isFeatured ? 'star_half' : 'star'}</span> ${offer.isFeatured ? 'En avant' : 'Spotlight'}`;
          spotlightBtn.onclick = (e) => {
             e.preventDefault(); e.stopPropagation();
             console.log('[Admin] Toggle Featured for:', offer.id, 'New state:', !offer.isFeatured);
             if (onToggleFeatured) onToggleFeatured(offer.id, !offer.isFeatured);
          };

          // Status Button
          const statusBtn = document.createElement('button');
          statusBtn.type = 'button';
          if (offer.offerStatus === 'draft') {
            statusBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black hover:scale-105 transition-all shadow-md';
            statusBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">verified</span> Approuver';
            statusBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              console.log('[Admin] Approving offer:', offer.id);
              if (onUpdateStatus) onUpdateStatus(offer.id, 'published');
            };

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-surface text-on-surface-variant border border-surface-variant/30 rounded-xl text-[10px] font-black hover:bg-surface-variant/10 transition-all';
            closeBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">archive</span> Clôturer';
            closeBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              if (confirm('Voulez-vous clôturer ce brouillon ?')) {
                console.log('[Admin] Archiving draft:', offer.id);
                if (onUpdateStatus) onUpdateStatus(offer.id, 'archived');
              }
            };
            actionContainer.appendChild(statusBtn);
            actionContainer.appendChild(closeBtn);
          } else if (offer.offerStatus === 'published') {
            statusBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-surface text-red-500 border border-red-100 rounded-xl text-[10px] font-black hover:bg-red-50 transition-all';
            statusBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">flag</span> Signaler';
            statusBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              const reason = prompt('Motif du signalement (l\'offre passera en brouillon) :');
              if (reason && onUpdateStatus) {
                console.log('[Admin] Rejecting offer:', offer.id, 'Reason:', reason);
                onUpdateStatus(offer.id, 'draft');
              }
            };

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-surface text-on-surface-variant border border-surface-variant/30 rounded-xl text-[10px] font-black hover:bg-surface-variant/10 transition-all';
            closeBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">archive</span> Clôturer';
            closeBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              if (confirm('Voulez-vous clôturer cette offre ? Elle sera déplacée dans les archives.')) {
                console.log('[Admin] Archiving offer:', offer.id);
                if (onUpdateStatus) onUpdateStatus(offer.id, 'archived');
              }
            };
            actionContainer.appendChild(statusBtn);
            actionContainer.appendChild(closeBtn);
          } else if (offer.offerStatus === 'archived') {
            statusBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-surface text-primary border border-primary/10 rounded-xl text-[10px] font-black hover:bg-primary/5 transition-all';
            statusBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">settings_backup_restore</span> Réactiver';
            statusBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              console.log('[Admin] Reactivating offer:', offer.id);
              if (onUpdateStatus) onUpdateStatus(offer.id, 'draft');
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black hover:bg-red-100 transition-all';
            deleteBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">delete</span> Supprimer';
            deleteBtn.onclick = (e) => {
              e.preventDefault(); e.stopPropagation();
              if (confirm('Voulez-vous supprimer définitivement cette offre (soft delete) ?')) {
                 console.log('[Admin] Soft-deleting offer:', offer.id);
                 if (onUpdateStatus) onUpdateStatus(offer.id, 'deleted');
              }
            };
            actionContainer.appendChild(statusBtn);
            actionContainer.appendChild(deleteBtn);
          } else {
             statusBtn.className = 'hidden';
          }

          if (offer.offerStatus !== 'archived') {
            actionContainer.appendChild(spotlightBtn);
            actionContainer.appendChild(statusBtn);
          }
          card.appendChild(actionContainer);

          if (offer.offerStatus === 'published') {
            if (badgeEl) {
              badgeEl.className = 'bg-green-50 text-green-600 text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1';
              badgeEl.innerHTML = '<span class="material-symbols-outlined text-[10px]">auto_awesome</span> En ligne';
            }
            activeCol.appendChild(card);
          } else if (offer.offerStatus === 'archived') {
            if (badgeEl) {
              badgeEl.className = 'bg-surface-variant text-on-surface-variant text-[10px] font-black uppercase px-2 py-1 rounded-md';
              badgeEl.textContent = 'Clôturée';
            }
            card.classList.add('opacity-70');
            closedCol.appendChild(card);
          } else {
            if (badgeEl) {
              badgeEl.className = 'bg-orange-50 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-md';
              badgeEl.textContent = 'En attente';
            }
            pendingCol.appendChild(card);
          }
        });
      }
    }

    gsap.from('.card-hover-scale', {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.card-hover-scale', start: 'top 85%' },
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.5);
    updateCounters();
  }, root);

  setupButtonScale(all, on, '.btn-primary', { ease: 'power2.out', leaveDuration: 0.3 });

  const getDragAfterElement = (column: Element, y: number) => {
    const elements = [...column.querySelectorAll('.draggable:not(.dragging)')];
    return elements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null as Element | null },
    ).element;
  };

  const draggables = all('.draggable');
  const columns = all('.kanban-col');

  draggables.forEach((element) => {
    on(element, 'dragstart', () => {
      dragged = element;
      gsap.to(element, { scale: 1.08, duration: 0.2 });
      element.classList.add('dragging');
    });

    on(element, 'dragend', () => {
      gsap.to(element, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
      element.classList.remove('dragging');
      updateCounters();
    });
  });

  columns.forEach((column) => {
    on(column, 'dragover', (event) => {
      event.preventDefault();

      gsap.to(column, { backgroundColor: 'rgba(0,40,142,0.06)', duration: 0.2 });

      const container = column.querySelector('.overflow-y-auto');
      const afterElement = getDragAfterElement(column, event.clientY);

      if (!container || !dragged) {
        return;
      }

      if (afterElement == null) {
        container.appendChild(dragged);
      } else {
        container.insertBefore(dragged, afterElement);
      }
    });

    on(column, 'dragleave', () => {
      gsap.to(column, { backgroundColor: 'transparent', duration: 0.2 });
    });

    on(column, 'drop', () => {
      if (!dragged) {
        return;
      }

      gsap.fromTo(dragged, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2,0.8)' });
    });
  });

  timeout(() => ScrollTrigger.refresh(), 0);

  return () => {
    cleanup();
    ctx.revert();
  };
}

export function setupUserSettingsPage({ root, profileData, onUpdate }: { root: HTMLElement; profileData?: any; onUpdate?: (data: any) => Promise<any> }): CleanupFn {
  return setupDashboardAnimations(root, {
    particleIds: ['#p1-1', '#p1-2', '#p1-3', '#p1-4'],
    progressDelay: 250,
    matchScore: 92,
    extraTriggers: ({ all }) => {
      all('.reveal-up').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%', toggleActions: 'play none none none' },
          },
        );
      });

      if (profileData) {
        // Remplir les inputs
        const inputs = all('input');
        inputs.forEach((input: HTMLInputElement) => {
          if (input.placeholder?.includes('Prénom') || input.previousElementSibling?.textContent?.includes('Prénom')) {
            input.value = profileData.profile?.firstName || profileData.user?.firstName || '';
            input.id = 'input-firstname';
          }
          if (input.placeholder?.includes('Nom') || input.previousElementSibling?.textContent?.includes('Nom')) {
            input.value = profileData.profile?.lastName || profileData.user?.lastName || '';
            input.id = 'input-lastname';
          }
          if (input.placeholder?.includes('Email') || input.previousElementSibling?.textContent?.includes('Email')) {
            input.value = profileData.user?.email || '';
          }
          if (input.placeholder?.includes('Titre') || input.previousElementSibling?.textContent?.includes('Titre')) {
            input.value = profileData.profile?.bio || '';
            input.id = 'input-bio';
          }
        });

        // Nom en haut à droite et titre
        const nameHeaders = root.querySelectorAll('h1, .text-right p:first-child');
        nameHeaders.forEach((el) => {
          if (el.textContent?.includes('Paramètres de')) {
            el.textContent = `Paramètres de ${profileData.profile?.firstName || 'Utilisateur'}`;
          } else if (el.textContent?.includes('Thomas Dubois')) {
            el.textContent = `${profileData.profile?.firstName || ''} ${profileData.profile?.lastName || ''}`;
          }
        });
      }

      // Attacher handler Enregistrer
      const saveBtn = Array.from(root.querySelectorAll('button')).find(b => b.textContent?.includes('Enregistrer') || b.querySelector('.material-symbols-outlined')?.textContent?.includes('save'));
      if (saveBtn && onUpdate) {
        saveBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const firstNameInput = root.querySelector('#input-firstname') as HTMLInputElement;
          const lastNameInput = root.querySelector('#input-lastname') as HTMLInputElement;
          const bioInput = root.querySelector('#input-bio') as HTMLInputElement;

          const dataToUpdate = {
            firstName: firstNameInput?.value,
            lastName: lastNameInput?.value,
            bio: bioInput?.value
          };

          const oldHtml = saveBtn.innerHTML;
          saveBtn.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Enregistrement...";
          
          try {
            await onUpdate(dataToUpdate);
            saveBtn.innerHTML = "<span class='material-symbols-outlined'>check_circle</span> Enregistré";
            setTimeout(() => { saveBtn.innerHTML = oldHtml; }, 2000);
          } catch (err) {
             console.error("Erreur de mise à jour du profil", err);
             saveBtn.innerHTML = oldHtml;
          }
        });
      }
    },
  });
}
