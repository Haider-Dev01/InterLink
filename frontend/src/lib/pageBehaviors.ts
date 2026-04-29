import Lenis from 'lenis';
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

export function setupLoginPage({ root, onLogin }: { root: HTMLElement; onLogin?: (data: any) => Promise<any>; navigate?: any }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, get, all, on, cleanup } = tools;

  const form = get('form');
  if (form) {
    on(form, 'submit', async (e: Event) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
      const roleSelect = form.querySelector('select[name="role"]') as HTMLSelectElement | null;
      const selectedRole = roleSelect?.value;
      const fallbackRole = useAppStore.getState().userType === 'recruiter' ? 'recruiter' : 'candidate';
      const role = selectedRole || fallbackRole;

      if (emailInput && passwordInput && onLogin) {
        try {
          const res = await onLogin({
            email: emailInput.value,
            password: passwordInput.value,
            role
          });
          if (!res.success && res.message) {
            // Optionnel : injecter l'erreur dans l'UI si un conteneur d'erreur existe
            console.error(res.message);
          }
        } catch (err) {
          console.error("Erreur de connexion", err);
        }
      }
    });
  }

  const switchUser = (type: 'student' | 'recruiter') => {
    const slider = get('#user-slider');
    const btnStudent = get('#tab-student');
    const btnRecruiter = get('#tab-recruiter');
    const roleSelect = get('select[name="role"]') as HTMLSelectElement | null;

    if (!slider || !btnStudent || !btnRecruiter) {
      return;
    }

    if (type === 'student') {
      gsap.to(slider, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnStudent.classList.replace('text-on-surface-variant', 'text-primary');
      btnRecruiter.classList.replace('text-primary', 'text-on-surface-variant');
      useAppStore.getState().setUserType('student');
      useAppStore.getState().setUser({ role: 'Candidat' });
      if (roleSelect) {
        roleSelect.value = 'candidate';
      }
    } else {
      gsap.to(slider, { x: '100%', duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      btnRecruiter.classList.replace('text-on-surface-variant', 'text-primary');
      btnStudent.classList.replace('text-primary', 'text-on-surface-variant');
      useAppStore.getState().setUserType('recruiter');
      useAppStore.getState().setUser({ role: 'Recruteur' });
      if (roleSelect) {
        roleSelect.value = 'recruiter';
      }
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

  all("button[type='button']").forEach((button) => {
    const visibilityIcon = button.querySelector(".material-symbols-outlined[style*='20px']");
    const passwordInput = button.parentElement?.querySelector("input[type='password'], input[type='text']");

    if (visibilityIcon && passwordInput) {
      on(button, 'click', (event) => {
        event.preventDefault();
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        gsap.to(button, { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 });
      });
    }
  });

  on(get('#tab-student'), 'click', (event) => {
    event.preventDefault();
    switchUser('student');
  });
  on(get('#tab-recruiter'), 'click', (event) => {
    event.preventDefault();
    switchUser('recruiter');
  });

  const roleSelect = get('select[name="role"]') as HTMLSelectElement | null;
  if (roleSelect) {
    roleSelect.value = useAppStore.getState().userType === 'recruiter' ? 'recruiter' : 'candidate';
    on(roleSelect, 'change', (event) => {
      const value = (event.target as HTMLSelectElement).value;
      if (value === 'candidate') {
        switchUser('student');
        return;
      }

      switchUser('recruiter');
    });
  }

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

      if (onRegister) {
        try {
          const res = await onRegister(data);
          if (res.success && navigate) {
            const role = useAppStore.getState().userType;
            if (role === 'recruiter') navigate('/dashboard-recruteur');
            else navigate('/dashboard-candidat');
          } else if (res.message) {
             console.error(res.message);
          }
        } catch (err) {
          console.error("Erreur d'inscription", err);
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

  on(form, 'submit', (event) => {
    event.preventDefault();

    submitBtn.classList.add('success-pulse');
    gsap.to(submitBtn, { scale: 0.95, duration: 0.2 });
    submitBtn.innerHTML = "<span class='material-symbols-outlined'>hourglass_empty</span> Création...";
    submitBtn.disabled = true;

    createConfetti();

    timeout(() => {
      submitBtn.innerHTML = "<span class='material-symbols-outlined'>check_circle</span> Compte créé";
      gsap.to(submitBtn, { scale: 1, duration: 0.3 });
      submitBtn.classList.remove('success-pulse');
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAppStore.getState().setUser({
          firstName: authUser.firstName || authUser.profile?.firstName || '',
          lastName: authUser.lastName || authUser.profile?.lastName || '',
          email: authUser.email || '',
          role: authUser.role || '',
        });
      }
    }, 2000);
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
          kpiCards[0].textContent = stats.totalUsers || '--';
          kpiCards[1].textContent = stats.activeOffers || '--';
          kpiCards[2].textContent = stats.totalApplications || '--';
          kpiCards[3].textContent = stats.systemHealth || '--';
        }
      }
    },
  });
}

export function setupAdminUsersPage({ root, users }: { root: HTMLElement; users?: any[] }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, all, cleanup, on, timeout } = tools;

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

    gsap.from('.card-hover-scale', {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.card-hover-scale', start: 'top 85%' },
    });

    animateFloatingParticles(['#p1', '#p2', '#p3', '#p4'], q, 0.5);

    if (users && users.length > 0) {
      // Find the user list container and a template card
      const listContainer = root.querySelector('.space-y-4');
      const templateCard = listContainer?.querySelector('.card-hover-scale');
      
      if (listContainer && templateCard) {
        listContainer.innerHTML = ''; // Clear hardcoded data
        
        users.forEach((user) => {
          const card = templateCard.cloneNode(true) as HTMLElement;
          const nameEl = card.querySelector('h3');
          const roleEl = card.querySelector('.text-primary');
          const emailEl = card.querySelector('.text-sm.text-on-surface-variant');
          
          if (nameEl) nameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`;
          if (roleEl) roleEl.textContent = user.role || 'Utilisateur';
          if (emailEl) emailEl.textContent = user.email || '';
          
          listContainer.appendChild(card);
        });
      }
    }
  }, root);

  setupButtonScale(all, on, '.btn-primary', { ease: 'power2.out', leaveDuration: 0.3 });
  timeout(() => ScrollTrigger.refresh(), 0);

  return () => {
    cleanup();
    ctx.revert();
  };
}

export function setupAdminOffresPage({ root, offers }: { root: HTMLElement; offers?: any[] }): CleanupFn {
  stripInlineHandlers(root);
  const tools = createPageTools(root);
  const { q, all, get, on, cleanup, timeout } = tools;

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

  const draggables = all('.draggable');
  const columns = all('.kanban-col');
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

  if (offers && offers.length > 0) {
    // Populate kanban columns
    const pendingCol = root.querySelector('#col-pending .overflow-y-auto');
    const activeCol = root.querySelector('#col-active .overflow-y-auto');
    const closedCol = root.querySelector('#col-closed .overflow-y-auto');
    
    // Use first draggable card as template
    const templateCard = root.querySelector('.draggable')?.cloneNode(true) as HTMLElement;
    
    if (templateCard && pendingCol && activeCol && closedCol) {
      pendingCol.innerHTML = '';
      activeCol.innerHTML = '';
      closedCol.innerHTML = '';
      
      offers.forEach((offer) => {
        const card = templateCard.cloneNode(true) as HTMLElement;
        const idEl = card.querySelector('.text-xs');
        const titleEl = card.querySelector('h3');
        const companyEl = card.querySelector('.font-bold.text-on-surface-variant');
        
        if (idEl) idEl.textContent = offer.id.substring(0,8);
        if (titleEl) titleEl.textContent = offer.title;
        if (companyEl) companyEl.textContent = offer.company?.name || 'Entreprise';
        
        if (offer.status === 'PUBLISHED') activeCol.appendChild(card);
        else if (offer.status === 'ARCHIVED') closedCol.appendChild(card);
        else pendingCol.appendChild(card);
      });
      updateCounters();
    }
  }

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
