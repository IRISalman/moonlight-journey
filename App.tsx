import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null); // Viewport
  
  // Layers
  const sliderRef = useRef<HTMLDivElement>(null);    // Main World (Midground)
  const moonRef = useRef<HTMLImageElement>(null);    // Parallax Layer 1 (Background)
  const cloudsRef = useRef<HTMLDivElement>(null);    // Parallax Layer 2 (Background)
  const girlRef = useRef<HTMLImageElement>(null);    // Player Layer (Fixed)
  const reedsRef = useRef<HTMLDivElement>(null);     // Foreground Layer (Fastest)
  const audioRef = useRef<HTMLAudioElement>(null);

  // Narrative Text Refs
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const text4Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  // Preloader Refs
  const preloaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null); // Wrapper for main content animation

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Image Preloading & Intro Sequence
  useEffect(() => {
    // UPDATED: Removed leading slashes to make paths relative to base URL
    const images = [
      "pictures/moon.png",
      "pictures/clouds.png",
      "pictures/pillar_tall.png",
      "pictures/arch_broken.png",
      "pictures/crane.png",
      "pictures/palace.png",
      "pictures/girl.png",
      "pictures/reeds.png",
      "pictures/orbs.png"
    ];

    let loadedCount = 0;
    const totalImages = images.length;
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        runIntroSequence();
      }
    };

    images.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = onImageLoad;
      img.onerror = onImageLoad; // Continue even if error
    });

    const runIntroSequence = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          // Refresh ScrollTrigger after loading/animations changes
          ScrollTrigger.refresh();
        }
      });

      // 1. Counter 0 to 100
      if (counterRef.current) {
        tl.to(counterRef.current, { 
          innerText: 100, 
          duration: 2, 
          ease: "power2.out", 
          snap: { innerText: 1 },
          onUpdate: function() {
            if(counterRef.current) counterRef.current.innerText = Math.round(this.targets()[0].innerText) + "%";
          }
        });
        // Fade out counter
        tl.to(counterRef.current, { opacity: 0, duration: 0.5 });
      }

      // 2. Name Reveal "Zahra"
      if (nameRef.current) {
        tl.to(nameRef.current, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, "-=0.2");
        tl.to(nameRef.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, "+=1.5");
      }

      // 3. Preloader Exit & World Entrance
      if (preloaderRef.current) {
        tl.to(preloaderRef.current, { opacity: 0, duration: 1.5, ease: "power2.inOut" });
      }

      if (contentRef.current) {
        // IMPORTANT: We only animate opacity here. 
        // Animating 'scale' or 'transform' on a parent of a fixed/pinned element breaks GSAP Pinning.
        tl.fromTo(contentRef.current, 
          { opacity: 0 }, 
          { opacity: 1, duration: 2, ease: "power2.out" }, 
          "<" // Start together with preloader fade out
        );
      }
    };

  }, []);

  // Enable Keyboard Navigation
  useEffect(() => {
    if (isLoading) return; // Disable during loading

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollStep = 100;
      if (e.key === 'ArrowRight') {
        window.scrollBy({ top: scrollStep, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

  useLayoutEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Master Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: componentRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=5000", 
        },
      });

      const DURATION = 10;

      // --- Layer 1: Moon ---
      if (moonRef.current) {
        tl.to(moonRef.current, { xPercent: -20, ease: "none", duration: DURATION }, 0);
      }

      // --- Layer 2: Clouds ---
      if (cloudsRef.current) {
        tl.to(cloudsRef.current, { xPercent: -40, ease: "none", duration: DURATION }, 0);
      }

      // --- Layer 3: World ---
      let worldTween: gsap.core.Timeline | undefined;
      if (sliderRef.current) {
        worldTween = tl.to(sliderRef.current, { x: "-400vw", ease: "none", duration: DURATION }, 0);
      }

      // --- Layer 4: Reeds ---
      if (reedsRef.current) {
        tl.to(reedsRef.current, { x: "-600vw", ease: "none", duration: DURATION }, 0);
      }

      // --- NARRATIVE SYSTEM (Scrollytelling) ---
      // Math: t = 12.5*P - 0.5 (Time when object at P% hits 20% viewport)

      // Text 1: Orb 1 at 25% -> t = 2.625
      if (text1Ref.current) {
        gsap.set(text1Ref.current, { opacity: 0, y: 10 });
        tl.to(text1Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 2.6)
          .to(text1Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 4.0);
      }

      // Text 2: Orb 2 at 45% -> t = 5.125
      if (text2Ref.current) {
        gsap.set(text2Ref.current, { opacity: 0, y: 10 });
        tl.to(text2Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 5.1)
          .to(text2Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 6.5);
      }

      // Text 3: Orb 3 at 65% -> t = 7.625
      if (text3Ref.current) {
        gsap.set(text3Ref.current, { opacity: 0, y: 10 });
        tl.to(text3Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 7.6)
          .to(text3Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 8.8);
      }

      // Text 4: Orb 5 at 80% -> t = 9.5
      // The text appears exactly when Orb 5 lights up.
      if (text4Ref.current) {
        gsap.set(text4Ref.current, { opacity: 0, y: 10 });
        tl.to(text4Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 9.5)
          .to(text4Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 9.95);
      }

      // CTA Button
      if (ctaRef.current) {
        gsap.set(ctaRef.current, { autoAlpha: 0, y: 20 });
        tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 9.8);
      }

      // --- Animation: Girl ---
      if (girlRef.current) {
        gsap.to(girlRef.current, {
          y: -15, 
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // --- Interaction: Orbs ---
      if (worldTween) {
        const orbs = gsap.utils.toArray<HTMLElement>(".orb-target");
        orbs.forEach((orb) => {
          gsap.to(orb, {
            scale: 1.3,
            opacity: 1,
            filter: "grayscale(0%) drop-shadow(0 0 25px rgba(255, 255, 255, 1))",
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: orb,
              containerAnimation: worldTween,
              start: "left 22%", 
              end: "right 5%",
              toggleActions: "play reverse play reverse",
            }
          });
        });
      }

    }, componentRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <>
      {/* PRELOADER */}
      <div 
        ref={preloaderRef}
        className={`fixed inset-0 z-[100] bg-[#020024] flex items-center justify-center ${!isLoading ? 'pointer-events-none' : ''}`}
      >
        <span ref={counterRef} className="absolute bottom-8 right-8 text-white/50 text-xl font-light font-['Cormorant_Garamond']">0%</span>
        <h1 ref={nameRef} className="text-6xl md:text-8xl text-white/90 font-['Cormorant_Garamond'] opacity-0 tracking-widest uppercase">
          Zahra
        </h1>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div 
        ref={contentRef}
        className="opacity-0 relative" // Starts hidden, animated in (Opacity only)
      >
        <div 
          ref={componentRef} 
          className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#020024] to-[#1a1a40] font-['Cormorant_Garamond']"
        >
          {/* MUSIC CONTROLS */}
          <button 
            onClick={toggleMusic}
            className="fixed top-8 left-8 z-50 flex items-center gap-2 group opacity-70 hover:opacity-100 transition-opacity"
          >
            <div className={`w-3 h-3 rounded-full border border-white ${isPlaying ? 'bg-white shadow-[0_0_10px_white]' : 'bg-transparent'}`}></div>
            <span className="text-xs uppercase tracking-[0.2em] text-white font-light">
              {isPlaying ? "Sound On" : "Sound Off"}
            </span>
          </button>
          {/* UPDATED: Removed leading slash */}
          <audio ref={audioRef} src="music/music.mp3" loop />

          {/* NARRATIVE OVERLAY */}
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            
            {/* Segment 1 */}
            <div ref={text1Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">
                "My first love wasn’t a story <br/>— it was you."
              </h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">
                And even distance couldn’t rewrite that.
              </p>
            </div>

            {/* Segment 2 */}
            <div ref={text2Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">
                "I stepped away not because <br/> my feelings disappeared..."
              </h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">
                ...but because I didn’t know how to protect what mattered too much.
              </p>
            </div>

            {/* Segment 3 */}
            <div ref={text3Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">
                "To the strange, beautiful little <br/> world we built..."
              </h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">
                A kingdom means nothing if the Queen is gone.
              </p>
            </div>

            {/* Segment 4 */}
            <div ref={text4Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">
                "If your world still has space for me..."
              </h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">
                I know the way back.
              </p>
            </div>
          </div>

          {/* FINAL CTA */}
          <a 
            ref={ctaRef}
            href="https://splus.ir/IRI_Salman"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto opacity-0 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/20 rounded-full hover:bg-white/15 hover:border-white/40 transition-all group backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-white/90" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            <span className="text-sm uppercase tracking-widest text-white/90">Waiting for your answer</span>
          </a>

          {/* MOON */}
          <img 
            ref={moonRef}
            src="pictures/moon.png" 
            alt="Moon" 
            className="absolute top-[10vh] right-[10vw] w-[20vh] h-[20vh] object-contain z-0 opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          />

          {/* CLOUDS */}
          <div 
            ref={cloudsRef}
            className="absolute bottom-0 left-0 h-1/2 flex z-10 opacity-60 pointer-events-none mix-blend-screen"
            style={{ width: '200vw' }}
          >
            <img src="pictures/clouds.png" alt="Clouds" className="w-screen h-full object-cover" />
            <img src="pictures/clouds.png" alt="Clouds" className="w-screen h-full object-cover scale-x-[-1]" />
            <img src="pictures/clouds.png" alt="Clouds" className="w-screen h-full object-cover" />
          </div>

          {/* WORLD */}
          <div 
            ref={sliderRef} 
            className="relative flex h-full w-[500vw] z-20 pointer-events-none"
          >
            {/* 15% - Pillar */}
            <img 
              src="pictures/pillar_tall.png" 
              alt="Ancient Pillar" 
              className="absolute bottom-0 left-[15%] h-[65vh] object-contain opacity-80 brightness-75"
            />

            {/* 25% - Orb 1 */}
            <img 
              src="pictures/orbs.png"
              alt="Memory Orb"
              className="orb-target absolute bottom-[30vh] left-[25%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90"
            />

            {/* 35% - Broken Arch */}
            <img 
              src="pictures/arch_broken.png" 
              alt="Broken Arch" 
              className="absolute bottom-0 left-[35%] h-[50vh] object-contain opacity-80 brightness-75"
            />

            {/* 45% - Orb 2 */}
            <img 
              src="pictures/orbs.png"
              alt="Memory Orb"
              className="orb-target absolute top-[40vh] left-[45%] w-[10vh] h-[10vh] object-contain opacity-50 grayscale scale-90"
            />

            {/* 50% - Pillar Flipped */}
            <img 
              src="pictures/pillar_tall.png" 
              alt="Ancient Pillar" 
              className="absolute bottom-0 left-[50%] h-[60vh] object-contain opacity-80 brightness-75 scale-x-[-1]"
            />

            {/* 60% - Crane */}
            <img 
              src="pictures/crane.png" 
              alt="Paper Crane" 
              className="absolute top-[15%] left-[60%] w-[15vh] object-contain opacity-90 drop-shadow-lg"
            />

            {/* 65% - Orb 3 */}
            <img 
              src="pictures/orbs.png"
              alt="Memory Orb"
              className="orb-target absolute bottom-[20vh] left-[65%] w-[7vh] h-[7vh] object-contain opacity-50 grayscale scale-90"
            />

            {/* 75% - Orb 4 (Path Start) */}
            <img 
              src="pictures/orbs.png"
              alt="Memory Orb"
              className="orb-target absolute top-[25vh] left-[75%] w-[9vh] h-[9vh] object-contain opacity-50 grayscale scale-90"
            />

            {/* 80% - Orb 5 (Path End) */}
            <img 
              src="pictures/orbs.png"
              alt="Memory Orb"
              className="orb-target absolute bottom-[45vh] left-[80%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90"
            />

            {/* 90% - Moon Palace */}
            <img 
              src="pictures/palace.png" 
              alt="Moon Palace" 
              className="absolute bottom-0 left-[90%] h-[75vh] object-contain drop-shadow-[0_0_80px_rgba(200,200,255,0.6)] brightness-110"
            />
          </div>

          {/* GIRL */}
          <img
            ref={girlRef}
            src="pictures/girl.png"
            alt="The Girl"
            className="absolute top-[45%] left-[20%] w-[18vh] object-contain z-30 opacity-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" 
          />

          {/* REEDS */}
          <div 
            ref={reedsRef}
            className="absolute bottom-0 left-0 h-[45vh] flex z-40 pointer-events-none"
            style={{ width: '800vw' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <img 
                key={i}
                src="pictures/reeds.png" 
                alt="Reeds" 
                className="w-screen h-full object-cover object-bottom opacity-100" 
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
