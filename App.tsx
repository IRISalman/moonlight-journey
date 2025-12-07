import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// --- ASSET IMPORTS ---
import musicFile from './assets/music/music.mp3';
import moonImg from './assets/pictures/moon.png';
import cloudsImg from './assets/pictures/clouds.png';
import pillarTallImg from './assets/pictures/pillar_tall.png';
import archBrokenImg from './assets/pictures/arch_broken.png';
import craneImg from './assets/pictures/crane.png';
import palaceImg from './assets/pictures/palace.png';
import girlImg from './assets/pictures/girl.png';
import reedsImg from './assets/pictures/reeds.png';
import orbsImg from './assets/pictures/orbs.png';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  // --- DEBUGGING LOGS ---
  // این لاگ‌ها را در کنسول مرورگر چک کن
  console.log("Moon Path:", moonImg);
  console.log("Music Path:", musicFile);

  const componentRef = useRef<HTMLDivElement>(null); 
  
  // Layers
  const sliderRef = useRef<HTMLDivElement>(null);    
  const moonRef = useRef<HTMLImageElement>(null);    
  const cloudsRef = useRef<HTMLDivElement>(null);    
  const girlRef = useRef<HTMLImageElement>(null);    
  const reedsRef = useRef<HTMLDivElement>(null);     
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

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error("Audio playback error:", error);
            });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Image Preloading & Intro Sequence
  useEffect(() => {
    const imagesToLoad = [
      moonImg,
      cloudsImg,
      pillarTallImg,
      archBrokenImg,
      craneImg,
      palaceImg,
      girlImg,
      reedsImg,
      orbsImg
    ];

    let loadedCount = 0;
    const totalImages = imagesToLoad.length;
    
    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        runIntroSequence();
      }
    };

    imagesToLoad.forEach(src => {
      const img = new Image();
      img.src = src; 
      img.onload = onImageLoad;
      img.onerror = (e) => {
          console.error("Failed to load image:", src, e);
          onImageLoad(); // Continue anyway
      };
    });

    const runIntroSequence = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          ScrollTrigger.refresh();
        }
      });

      // 1. Counter
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
        tl.to(counterRef.current, { opacity: 0, duration: 0.5 });
      }

      // 2. Name
      if (nameRef.current) {
        tl.to(nameRef.current, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, "-=0.2");
        tl.to(nameRef.current, { opacity: 0, duration: 1, ease: "power2.inOut" }, "+=1.5");
      }

      // 3. Preloader Exit
      if (preloaderRef.current) {
        tl.to(preloaderRef.current, { opacity: 0, duration: 1.5, ease: "power2.inOut" });
      }

      if (contentRef.current) {
        tl.fromTo(contentRef.current, 
          { opacity: 0 }, 
          { opacity: 1, duration: 2, ease: "power2.out" }, 
          "<" 
        );
      }
    };

  }, []);

  // Keyboard Navigation
  useEffect(() => {
    if (isLoading) return; 

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
      
      let worldTween: gsap.core.Timeline | undefined;
      if (sliderRef.current) worldTween = tl.to(sliderRef.current, { x: "-400vw", ease: "none", duration: DURATION }, 0);
      
      if (reedsRef.current) tl.to(reedsRef.current, { x: "-600vw", ease: "none", duration: DURATION }, 0);

      // Narrative
      if (text1Ref.current) {
        gsap.set(text1Ref.current, { opacity: 0, y: 10 });
        tl.to(text1Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 2.6)
          .to(text1Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 4.0);
      }
      if (text2Ref.current) {
        gsap.set(text2Ref.current, { opacity: 0, y: 10 });
        tl.to(text2Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 5.1)
          .to(text2Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 6.5);
      }
      if (text3Ref.current) {
        gsap.set(text3Ref.current, { opacity: 0, y: 10 });
        tl.to(text3Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 7.6)
          .to(text3Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 8.8);
      }
      if (text4Ref.current) {
        gsap.set(text4Ref.current, { opacity: 0, y: 10 });
        tl.to(text4Ref.current, { opacity: 1, y: 0, duration: 0.5 }, 9.5)
          .to(text4Ref.current, { opacity: 0, y: -10, duration: 0.5 }, 9.95);
      }

      if (ctaRef.current) {
        gsap.set(ctaRef.current, { autoAlpha: 0, y: 20 });
        tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 9.8);
      }

      if (girlRef.current) {
        gsap.to(girlRef.current, {
          y: -15, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut",
        });
      }

      if (worldTween) {
        const orbs = gsap.utils.toArray<HTMLElement>(".orb-target");
        orbs.forEach((orb) => {
          gsap.to(orb, {
            scale: 1.3, opacity: 1, filter: "grayscale(0%) drop-shadow(0 0 25px rgba(255, 255, 255, 1))",
            duration: 0.8, ease: "power2.out",
            scrollTrigger: {
              trigger: orb, containerAnimation: worldTween,
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
      {/* --- DEBUG IMAGE (این عکس باید همیشه دیده شود) --- */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, background: 'rgba(0,0,0,0.5)', padding: '5px' }}>
          <p style={{color: 'white', fontSize: '10px', margin: 0}}>DEBUG MODE</p>
          <img src={moonImg} alt="Debug Moon" style={{ width: '50px', height: '50px' }} />
      </div>

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
        className="opacity-0 relative" 
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
          
          <audio ref={audioRef} src={musicFile} loop preload="auto" />

          {/* NARRATIVE OVERLAY */}
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
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

          {/* FINAL CTA */}
          <a 
            ref={ctaRef}
            href="https://splus.ir/IRI_Salman"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto opacity-0 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/20 rounded-full hover:bg-white/15 hover:border-white/40 transition-all group backdrop-blur-sm"
          >
            <span className="text-sm uppercase tracking-widest text-white/90">Waiting for your answer</span>
          </a>

          {/* MOON */}
          <img ref={moonRef} src={moonImg} alt="Moon" className="absolute top-[10vh] right-[10vw] w-[20vh] h-[20vh] object-contain z-0 opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />

          {/* CLOUDS */}
          <div ref={cloudsRef} className="absolute bottom-0 left-0 h-1/2 flex z-10 opacity-60 pointer-events-none mix-blend-screen" style={{ width: '200vw' }}>
            <img src={cloudsImg} alt="Clouds" className="w-screen h-full object-cover" />
            <img src={cloudsImg} alt="Clouds" className="w-screen h-full object-cover scale-x-[-1]" />
            <img src={cloudsImg} alt="Clouds" className="w-screen h-full object-cover" />
          </div>

          {/* WORLD */}
          <div ref={sliderRef} className="relative flex h-full w-[500vw] z-20 pointer-events-none">
            <img src={pillarTallImg} alt="Ancient Pillar" className="absolute bottom-0 left-[15%] h-[65vh] object-contain opacity-80 brightness-75" />
            <img src={orbsImg} alt="Memory Orb" className="orb-target absolute bottom-[30vh] left-[25%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90" />
            <img src={archBrokenImg} alt="Broken Arch" className="absolute bottom-0 left-[35%] h-[50vh] object-contain opacity-80 brightness-75" />
            <img src={orbsImg} alt="Memory Orb" className="orb-target absolute top-[40vh] left-[45%] w-[10vh] h-[10vh] object-contain opacity-50 grayscale scale-90" />
            <img src={pillarTallImg} alt="Ancient Pillar" className="absolute bottom-0 left-[50%] h-[60vh] object-contain opacity-80 brightness-75 scale-x-[-1]" />
            <img src={craneImg} alt="Paper Crane" className="absolute top-[15%] left-[60%] w-[15vh] object-contain opacity-90 drop-shadow-lg" />
            <img src={orbsImg} alt="Memory Orb" className="orb-target absolute bottom-[20vh] left-[65%] w-[7vh] h-[7vh] object-contain opacity-50 grayscale scale-90" />
            <img src={orbsImg} alt="Memory Orb" className="orb-target absolute top-[25vh] left-[75%] w-[9vh] h-[9vh] object-contain opacity-50 grayscale scale-90" />
            <img src={orbsImg} alt="Memory Orb" className="orb-target absolute bottom-[45vh] left-[80%] w-[8vh] h-[8vh] object-contain opacity-50 grayscale scale-90" />
            <img src={palaceImg} alt="Moon Palace" className="absolute bottom-0 left-[90%] h-[75vh] object-contain drop-shadow-[0_0_80px_rgba(200,200,255,0.6)] brightness-110" />
          </div>

          {/* GIRL */}
          <img ref={girlRef} src={girlImg} alt="The Girl" className="absolute top-[45%] left-[20%] w-[18vh] object-contain z-30 opacity-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" />

          {/* REEDS */}
          <div ref={reedsRef} className="absolute bottom-0 left-0 h-[45vh] flex z-40 pointer-events-none" style={{ width: '800vw' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <img key={i} src={reedsImg} alt="Reeds" className="w-screen h-full object-cover object-bottom opacity-100" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
