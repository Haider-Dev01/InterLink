import { useLayoutEffect } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useReactPageAnimations(rootRef: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      root.querySelectorAll('.page-particle').forEach((element, index) => {
        gsap.to(element, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-20, 20),
          duration: gsap.utils.random(3, 5),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.25,
        });
      });

      root.querySelectorAll('[data-animate="hero"]').forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: index * 0.08,
            ease: 'power3.out',
          },
        );
      });

      root.querySelectorAll('[data-animate="card"]').forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            delay: Math.min(index * 0.06, 0.36),
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        );
      });

      root.querySelectorAll('.progress-bar-fill-react').forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') ?? '0';
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${targetWidth}%`,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: bar,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, root);

    const hoverTargets = root.querySelectorAll('.interactive-scale, aside .nav-link');
    const enterHandlers: Array<{ element: Element; handleEnter: () => void }> = [];
    const leaveHandlers: Array<{ element: Element; handleLeave: () => void }> = [];

    hoverTargets.forEach((element) => {
      const handleEnter = () => {
        gsap.to(element, { x: element.classList.contains('nav-link') ? 4 : 0, scale: element.classList.contains('interactive-scale') ? 1.03 : 1, duration: 0.25, ease: 'power2.out' });
      };
      const handleLeave = () => {
        gsap.to(element, { x: 0, scale: 1, duration: 0.2, ease: 'power2.out' });
      };

      enterHandlers.push({ element, handleEnter });
      leaveHandlers.push({ element, handleLeave });
      element.addEventListener('mouseenter', handleEnter);
      element.addEventListener('mouseleave', handleLeave);
    });

    ScrollTrigger.refresh();

    return () => {
      enterHandlers.forEach(({ element, handleEnter }) => element.removeEventListener('mouseenter', handleEnter));
      leaveHandlers.forEach(({ element, handleLeave }) => element.removeEventListener('mouseleave', handleLeave));
      ctx.revert();
    };
  }, [rootRef]);
}
