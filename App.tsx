import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// --- DYNAMIC PATH CONFIGURATION ---
const BASE_PATH = import.meta.env.BASE_URL + 'media';

const getPath = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_PATH}/${cleanPath}`;
};

const App: React.FC = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Layers
  const sliderRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLImageElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const reedsRef = useRef<HTMLDivElement>(null);
  
  // Girl Refs (New Structure)
  const girlContainerRef = useRef<HTMLDivElement>(null); // Follows Mouse
  const girlInnerRef = useRef<HTMLImageElement>(null);   // Does Floating Animation

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
  const contentRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- AUDIO LOGIC ---
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    const playAudio = () => {
        if (audioRef.current && !isPlaying) {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    document.removeEventListener('click', playAudio);
                    document.removeEventListener('keydown', playAudio);
                })
                .catch(() => console.log("Waiting for interaction..."));
        }
    };
    playAudio();
    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);
    return () => {
        document.removeEventListener('click', playAudio);
        document.removeEventListener('keydown', playAudio);
    };
  }, [isLoading]);

  // Image Preloading
  useEffect(() => {
    const images = [
      getPath('/pictures/moon.png'),
      getPath('/pictures/clouds.png'),
      getPath('/pictures/pillar_tall.png'),
      getPath('/pictures/arch_broken.png'),
      getPath('/pictures/crane.png'),
      getPath('/pictures/palace.png'),
      getPath('/pictures/girl.png'),
      getPath('/pictures/reeds.png'),
      getPath('/pictures/orbs.png')
    ];

    let loadedCount = 0;
    const totalImages = images.length;
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) runIntroSequence();
    };

    images.forEach(src => {
      const img = new Image();
      img.src = src; 
      img.onload = onImageLoad;
      img.onerror = onImageLoad;
    });

    const runIntroSequence = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          ScrollTrigger.refresh();
        }
      });

      if (counterRef.current) {
        tl.to(counterRef.current, { 
          innerText: 100, duration: 2, ease: "power2.out", snap: { innerText: 1 },
          onUpdate: function() { if(counterRef.current) counterRef.current.innerText = Math.round(this.targets()[0].innerText) + "%"; }
        });
        tl.to(counterRef.current, { opacity: 0, duration: 0.5 });
      }

      if (nameRef.current) {
        tl.to(nameRef.current, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, "-=0.2");
        tl.to(nameRef.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, "+=1.5");
      }

      if (preloaderRef.current) tl.to(preloaderRef.current, { opacity: 0, duration: 1.5, ease: "power2.inOut" });
      if (contentRef.current) tl.fromTo(contentRef.current, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" }, "<");
    };
  }, []);

  // Keyboard Nav
  useEffect(() => {
    if (isLoading) return; 
    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollStep = 100;
      if (e.key === 'ArrowRight') window.scrollBy({ top: scrollStep, behavior: 'smooth' });
      else if (e.key === 'ArrowLeft') window.scrollBy({ top: -scrollStep, behavior: 'smooth' });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading]);

  // --- MOUSE FOLLOWER LOGIC ---
  useEffect(() => {
    if (isLoading || !girlContainerRef.current) return;

    // تنظیمات اولیه برای وسط قرار دادن پوینت موس روی دختر
    gsap.set(girlContainerRef.current, { xPercent: -50, yPercent: -50 });

    // استفاده از quickTo برای پرفورمنس بالا در حرکت موس
    const xTo = gsap.quickTo(girlContainerRef.current, "x", { duration: 1.5, ease: "power3.out" }); // تاخیر 1.5 ثانیه برای حس روحی
    const yTo = gsap.quickTo(girlContainerRef.current, "y", { duration: 1.5, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // اگر کاربر موس نداشت (موبایل)، دختر وسط صفحه بماند (به صورت پیش فرض CSS)
    
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLoading]);


  useLayoutEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
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

      if (moonRef.current) tl.to(moonRef.current, { xPercent: -20, ease: "none", duration: DURATION }, 0);
      if (cloudsRef.current) tl.to(cloudsRef.current, { xPercent: -40, ease: "none", duration: DURATION }, 0);
      if (sliderRef.current) tl.to(sliderRef.current, { x: "-400vw", ease: "none", duration: DURATION }, 0);
      if (reedsRef.current) tl.to(reedsRef.current, { x: "-600vw", ease: "none", duration: DURATION }, 0);

      // Narrative
      const narrativeTimeline = [
          { ref: text1Ref, start: 2.6, end: 4.0 },
          { ref: text2Ref, start: 5.1, end: 6.5 },
          { ref: text3Ref, start: 7.6, end: 8.8 },
          { ref: text4Ref, start: 9.5, end: 9.95 }
      ];

      narrativeTimeline.forEach(item => {
          if (item.ref.current) {
            gsap.set(item.ref.current, { opacity: 0, y: 10 });
            tl.to(item.ref.current, { opacity: 1, y: 0, duration: 0.5 }, item.start)
              .to(item.ref.current, { opacity: 0, y: -10, duration: 0.5 }, item.end);
          }
      });

      if (ctaRef.current) {
        gsap.set(ctaRef.current, { autoAlpha: 0, y: 20 });
        tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 9.8);
      }

      // --- GIRL LOCAL ANIMATION (Floating & Breathing) ---
      // این انیمیشن روی تصویر داخلی اعمال می‌شود، نه کانتینر اصلی
      if (girlInnerRef.current) {
        gsap.to(girlInnerRef.current, {
          y: -15, // دامنه حرکت کمتر برای ظرافت
          duration: 3, 
          repeat: -1, 
          yoyo: true, 
          ease: "sine.inOut",
        });
        
        gsap.to(girlInnerRef.current, {
            filter: "drop-shadow(0 0 25px rgba(255,255,255,0.8))",
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // چرخش خیلی ملایم
        gsap.to(girlInnerRef.current, {
            rotation: 2,
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
      }

      // Orbs
      if (sliderRef.current) {
        const orbs = gsap.utils.toArray<HTMLElement>(".orb-target");
        orbs.forEach((orb) => {
          gsap.to(orb, {
            scale: 1.3, opacity: 1, filter: "grayscale(0%) drop-shadow(0 0 25px rgba(255, 255, 255, 1))",
            duration: 0.8, ease: "power2.out",
            scrollTrigger: {
              trigger: orb, containerAnimation: tl.getTween(sliderRef.current), // Fix: accessing timeline tween
              start: "left 22%", end: "right 5%", toggleActions: "play reverse play reverse",
            }
          });
        });
      }

    }, componentRef);

    return () => ctx.revert();
  }, [isLoading]);

  return (
    <>
      <div ref={preloaderRef} className={`fixed inset-0 z-[100] bg-[#020024] flex items-center justify-center ${!isLoading ? 'pointer-events-none' : ''}`}>
        <span ref={counterRef} className="absolute bottom-8 right-8 text-white/50 text-xl font-light font-['Cormorant_Garamond']">0%</span>
        <h1 ref={nameRef} className="text-6xl md:text-8xl text-white/90 font-['Cormorant_Garamond'] opacity-0 tracking-widest uppercase">Zahra</h1>
      </div>

      <div ref={contentRef} className="opacity-0 relative">
        <div ref={componentRef} className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#020024] to-[#1a1a40] font-['Cormorant_Garamond']">
          
          <button onClick={toggleMusic} className="fixed top-8 left-8 z-50 flex items-center gap-2 group opacity-70 hover:opacity-100 transition-opacity">
            <div className={`w-3 h-3 rounded-full border border-white ${isPlaying ? 'bg-white shadow-[0_0_10px_white]' : 'bg-transparent'}`}></div>
            <span className="text-xs uppercase tracking-[0.2em] text-white font-light">{isPlaying ? "Sound On" : "Sound Off"}</span>
          </button>
          
          <audio ref={audioRef} src={getPath('/music/music.mp3')} loop />

          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
             {/* TEXTS */}
            <div ref={text1Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">"My first love wasn’t a story <br/>— it was you."</h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">And even distance couldn’t rewrite that.</p>
            </div>
            <div ref={text2Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">"I stepped away not because <br/> my feelings disappeared..."</h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">...but because I didn’t know how to protect what mattered too much.</p>
            </div>
            <div ref={text3Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">"To the strange, beautiful little <br/> world we built..."</h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">A kingdom means nothing if the Queen is gone.</p>
            </div>
            <div ref={text4Ref} className="absolute flex flex-col items-center text-center opacity-0 px-4">
              <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-4 leading-tight">"If your world still has space for me..."</h2>
              <p className="text-lg md:text-xl text-white/80 italic font-light tracking-wide">I know the way back.</p>
            </div>
          </div>

          <a ref={ctaRef} href="https://splus.ir/IRI_Salman" target="_blank" rel="noopener noreferrer" className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto opacity-0 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/20 rounded-full hover:bg-white/15 hover:border-white/40 transition-all group backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-white/90" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            <span className="text-sm uppercase tracking-widest text-white/90">Waiting for your answer</span>
          </a>

          {/* BACKGROUND LAYERS */}
          <img ref={moonRef} src={getPath('/pictures/moon.png')} alt="Moon" className="absolute top-[10vh] right-[10vw] w-[20vh] h-[20vh] object-contain z-0 opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />

          <div ref={cloudsRef} className="absolute bottom-0 left-0 h-1/2 flex z-10 opacity-60 pointer-events-none mix-blend-screen" style={{ width: '200vw' }}>
            <img src={getPath('/pictures/clouds.png')} alt="Clouds" className="w-screen h-full object-cover" />
            <img src={getPath('/pictures/clouds.png')} alt="Clouds" className="w-screen h-full object-cover scale-x-[-1]" />
            <img src={getPath('/pictures/clouds.png')} alt="Clouds" className="w-screen h-full object-cover" />
          </div>

          <div ref={sliderRef} className="relative flex h-full w-[500vw] z-20 pointer-events-none">
            <img src={getPath('/pictures/pillar_tall.png')} alt="Ancient Pillar" className="absolute bottom-0 left-[15%] h-[65vh] object-contain opacity-80 brightness-75"/>
            <img src={getPath('/pictures/orbs.png')} alt="Memory Orb" className="orb-target absolute bottom-[30vh] left-[25%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90"/>
            <img src={getPath('/pictures/arch_broken.png')} alt="Broken Arch" className="absolute bottom-0 left-[35%] h-[50vh] object-contain opacity-80 brightness-75"/>
            <img src={getPath('/pictures/orbs.png')} alt="Memory Orb" className="orb-target absolute top-[40vh] left-[45%] w-[10vh] h-[10vh] object-contain opacity-50 grayscale scale-90"/>
            <img src={getPath('/pictures/pillar_tall.png')} alt="Ancient Pillar" className="absolute bottom-0 left-[50%] h-[60vh] object-contain opacity-80 brightness-75 scale-x-[-1]"/>
            <img src={getPath('/pictures/crane.png')} alt="Paper Crane" className="absolute top-[15%] left-[60%] w-[15vh] object-contain opacity-90 drop-shadow-lg"/>
            <img src={getPath('/pictures/orbs.png')} alt="Memory Orb" className="orb-target absolute bottom-[20vh] left-[65%] w-[7vh] h-[7vh] object-contain opacity-50 grayscale scale-90"/>
            <img src={getPath('/pictures/orbs.png')} alt="Memory Orb" className="orb-target absolute top-[25vh] left-[75%] w-[9vh] h-[9vh] object-contain opacity-50 grayscale scale-90"/>
            <img src={getPath('/pictures/orbs.png')} alt="Memory Orb" className="orb-target absolute bottom-[45vh] left-[80%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90"/>
            <img src={getPath('/pictures/palace.png')} alt="Moon Palace" className="absolute bottom-0 left-[90%] h-[75vh] object-contain drop-shadow-[0_0_80px_rgba(200,200,255,0.6)] brightness-110"/>
          </div>

          {/* --- THE GIRL (Interactive Ghost) --- */}
          {/* کانتینر برای دنبال کردن موس */}
          <div 
            ref={girlContainerRef}
            className="fixed top-0 left-0 z-30 pointer-events-none"
            style={{ 
              x: "50vw", // شروع از وسط صفحه
              y: "50vh"
            }}
          >
             {/* تصویر داخلی برای انیمیشن شناور */}
            <img
              ref={girlInnerRef}
              src={getPath('/pictures/girl.png')}
              alt="The Girl"
              className="w-[18vh] object-contain opacity-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]" 
            />
          </div>
          {/* --- END GIRL --- */}

          <div ref={reedsRef} className="absolute bottom-0 left-0 h-[45vh] flex z-40 pointer-events-none" style={{ width: '800vw' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <img key={i} src={getPath('/pictures/reeds.png')} alt="Reeds" className="w-screen h-full object-cover object-bottom opacity-100" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;