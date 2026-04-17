import gsap from 'gsap';

function getLetters(container: Element | null): Element[] {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll('.logo-letter'));
}

function createAnimationFactories(letters: Element[]) {
  return [
    () =>
      gsap
        .timeline()
        .to(letters, { y: -12, duration: 0.35, ease: 'power2.out', stagger: 0.07 })
        .to(letters, { y: 0, duration: 0.5, ease: 'bounce.out', stagger: 0.07 }),
    () =>
      gsap
        .timeline()
        .to(letters, { rotateY: 180, duration: 0.4, ease: 'power3.inOut', stagger: 0.08 })
        .to(letters, { rotateY: 0, duration: 0.4, ease: 'power3.inOut', stagger: 0.08 }),
    () =>
      gsap
        .timeline()
        .to(letters, {
          scale: 1.4,
          color: '#00288e',
          duration: 0.3,
          ease: 'back.out(2)',
          stagger: 0.06,
        })
        .to(letters, {
          scale: 1,
          color: '',
          duration: 0.4,
          ease: 'elastic.out(1, 0.5)',
          stagger: 0.06,
        }),
    () =>
      gsap
        .timeline()
        .to(letters, { skewX: 20, x: 4, duration: 0.2, ease: 'power3.out', stagger: 0.04 })
        .to(letters, { skewX: 0, x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)', stagger: 0.04 }),
  ];
}

export function startLogoLetterLoop(
  container: Element | null,
  { delay = 1.5, repeatDelay = 2.5 }: { delay?: number; repeatDelay?: number } = {},
): () => void {
  const letters = getLetters(container);

  if (!letters.length) {
    return () => {};
  }

  const animations = createAnimationFactories(letters);
  let activeTimeline: any = null;
  let delayedCall: any = null;
  let index = 0;

  const playNext = () => {
    activeTimeline = animations[index % animations.length]();
    index += 1;
    activeTimeline.eventCallback('onComplete', () => {
      delayedCall = gsap.delayedCall(repeatDelay, playNext);
    });
  };

  delayedCall = gsap.delayedCall(delay, playNext);

  return () => {
    activeTimeline?.kill();
    delayedCall?.kill();
    gsap.set(letters, { clearProps: 'transform,color' });
  };
}

export function bindLogoHoverBounce(trigger: Element | null, container: Element | null): () => void {
  const letters = getLetters(container);

  if (!trigger || !letters.length) {
    return () => {};
  }

  let hovering = false;

  const handleMouseEnter = () => {
    if (hovering) {
      return;
    }

    hovering = true;
    gsap
      .timeline({
        onComplete: () => {
          hovering = false;
        },
      })
      .to(letters, { y: -8, duration: 0.25, ease: 'power2.out', stagger: 0.06 })
      .to(letters, { y: 0, duration: 0.4, ease: 'bounce.out', stagger: 0.06 });
  };

  trigger.addEventListener('mouseenter', handleMouseEnter);

  return () => {
    trigger.removeEventListener('mouseenter', handleMouseEnter);
    gsap.set(letters, { clearProps: 'transform' });
  };
}
