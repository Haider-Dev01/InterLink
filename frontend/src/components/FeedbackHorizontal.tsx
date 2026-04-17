import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FeedbackHorizontal({ testimonials = [] }: { testimonials?: Array<{ name: string; avatar: string; quote: string; role: string }> }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !viewport || !track || testimonials.length === 0) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      // Calculate horizontal scroll distance
      const getMaxShift = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      // Initialize track position
      gsap.set(track, { x: 0 });

      // Create horizontal scroll animation
      const animation = gsap.to(track, {
        x: () => -getMaxShift(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getMaxShift()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // ResizeObserver to refresh on layout changes
      const resizeObserver = new ResizeObserver(() => {
        animation.scrollTrigger?.refresh();
      });

      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
      Array.from(track.children).forEach((card) => resizeObserver.observe(card as Element));

      // Handle prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleReducedMotionChange = () => ScrollTrigger.refresh();
      mediaQuery.addEventListener?.('change', handleReducedMotionChange);

      return () => {
        mediaQuery.removeEventListener?.('change', handleReducedMotionChange);
        resizeObserver.disconnect();
      };
    }, section);

    return () => ctx.revert();
  }, [testimonials.length]);

  // Stats data
  const stats = [
    { label: 'Placements réussis', value: '320+' },
    { label: 'Temps moyen shortlist', value: '48h' },
    { label: 'Matching moyen', value: '96%' },
    { label: 'Satisfaction', value: '4.9/5' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-visible bg-surface"
    >
      {/* Viewport container - takes full height */}
      <div ref={viewportRef} className="relative h-screen overflow-hidden">
        {/* Horizontal track - flex container */}
        <div
          ref={trackRef}
          className="flex h-full w-max will-change-transform"
        >
          {/* FIRST PANEL: Stats Introduction */}
          <div className="h-screen w-screen shrink-0 flex items-center px-8 py-12">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-12 items-center">
              {/* Left: Title + Text + Stats Grid */}
              <div>
                <h2 className="text-4xl font-black leading-tight mb-6 text-on-surface">
                  La transition du scroll raconte maintenant ce qui se passe après le match.
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed mb-12">
                  Une fois la découverte terminée, InternLink bascule vers une lecture plus analytique : performances, vitesse d'embauche et retours candidats.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/50 rounded-2xl p-6 border border-surface-variant"
                    >
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">
                        {stat.label}
                      </p>
                      <h3 className="text-3xl font-black text-on-surface">
                        {stat.value}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Placeholder for chart/visual */}
              <div className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 text-white h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-sm text-white/80">Performance Chart</p>
                </div>
              </div>
            </div>
          </div>

          {/* TESTIMONIAL CARDS */}
          {testimonials.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="h-screen w-screen shrink-0 flex items-center justify-center px-8"
            >
              <div className="w-full max-w-xl mx-auto bg-surface rounded-[2rem] border border-surface-variant p-10 shadow-lg">
                {/* Avatar */}
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover mb-8"
                />

                {/* Quote */}
                <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                  "{item.quote}"
                </p>

                {/* Name */}
                <h4 className="font-black text-xl text-primary">{item.name}</h4>

                {/* Role */}
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mt-2">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
