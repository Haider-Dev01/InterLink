import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode, useEffect, useMemo, useRef } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function mergePanelClassName(child: ReactElement<any>, fallbackClassName: string) {
  const existingClassName = (child.props as { className?: string } | undefined)?.className ?? '';
  return existingClassName ? `${existingClassName} ${fallbackClassName}` : fallbackClassName;
}

export default function HorizontalScroll({
  children,
  className = '',
  panelClassName = '',
  trackClassName = '',
  pinStart = 'top top',
  scrub = 1,
}: {
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  trackClassName?: string;
  pinStart?: string;
  scrub?: number;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const panels = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track || panels.length <= 1) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const getMaxShift = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      gsap.set(track, { x: 0 });

      const animation = gsap.to(track, {
        x: () => -getMaxShift(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: pinStart,
          end: () => `+=${getMaxShift()}`,
          pin: true,
          scrub,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      const resizeObserver = new ResizeObserver(() => {
        animation.scrollTrigger?.refresh();
      });

      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
      Array.from(track.children).forEach((panel) => resizeObserver.observe(panel as Element));

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleReducedMotionChange = () => ScrollTrigger.refresh();
      mediaQuery.addEventListener?.('change', handleReducedMotionChange);

      return () => {
        mediaQuery.removeEventListener?.('change', handleReducedMotionChange);
        resizeObserver.disconnect();
      };
    }, section);

    return () => ctx.revert();
  }, [panels.length, pinStart, scrub]);

  return (
    <section ref={sectionRef} className={`relative w-full overflow-visible ${className}`}>
      <div ref={viewportRef} className="relative h-screen overflow-hidden">
        <div ref={trackRef} className={`flex h-full w-max will-change-transform ${trackClassName}`}>
          {panels.map((child, index) => {
            const basePanelClassName = `h-screen w-screen shrink-0 ${panelClassName}`.trim();

            if (isValidElement(child)) {
              return cloneElement(child as ReactElement<{ className?: string }>, {
                key: child.key ?? index,
                className: mergePanelClassName(child, basePanelClassName),
              });
            }

            return (
              <div className={basePanelClassName} key={index}>
                {child}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
