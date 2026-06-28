"use client";
import Spline from '@splinetool/react-spline';
import { useEffect, useRef } from 'react';

export default function Home() {

  useEffect(() => {

      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
      const section = document.getElementById('scroll-section');
      const vinyl = document.getElementById('vinyl-element');
      const text = document.getElementById('text-element');
      

      if (!section || !vinyl || !text) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // El progreso inicia cuando el tope de la sección llega arriba (0)
      // y termina cuando bajamos una pantalla completa extra (windowHeight)
      let progress = 0;
      if (rect.top <= 0) {
        progress = Math.abs(rect.top) / windowHeight;
      }

      // Limitamos el progreso estrictamente entre 0 y 1
      progress = Math.max(0, Math.min(1, progress));

      // 1. Matemáticas del Vinilo
      // Entra desde la derecha (100vw) y llega al centro (0)
      const translateX = (1 - progress) * 100;
      const rotation = progress * 360;
      vinyl.style.transform = `translateX(${translateX}vw) rotate(${rotation}deg)`;

      // 2. Matemáticas del Texto
      // Sube desde abajo y aparece gradualmente
      const textTranslateY = (1 - progress) * 100;
      const textOpacity = progress;
      text.style.transform = `translate(-50%, calc(-50% + ${textTranslateY}px))`;
      text.style.opacity = textOpacity.toString();

      ticking = false;
    });
  ticking = true;
}};

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-white font-sans">
      <section className="relative w-full h-screen overflow-hidden">

        {/* ---------------- CAPA 1: FONDO 3D ---------------- */}
        <div id="spline-container" className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <Spline
              scene="https://prod.spline.design/d4AyP6PVdmmGLKzX/scene.splinecode"
              style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* CAPA DE SOMBRA DEGRADADA DE DERECHA A IZQUIERDA (FIGURA-FONDO GESTALT) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 from-[30%] via-black/0 via-[45%] to-transparent to-[100%] z-10 pointer-events-none" />

        {/* ---------------- HERO TEXT ---------------- */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-6">
          <h1 className="text-8xl font-biscuit tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            BISCUIT
          </h1>
          <p className="text-2xl max-w-[280px] font-light tracking-widest leading-snug">
            MADE FOR TRUE MUSIC LOVERS
          </p>
        </div>

        <div className="absolute bottom-10 w-full text-center z-10">
          <p className="text-sm tracking-[0.2em] text-gray-300">
            SCROLL TO CONTINUE
          </p>
        </div>
      </section>

      {/* ---------------- SECCIÓN SCROLL CON VINILO (STICKY) ---------------- */}
      <section
        id="scroll-section"
        className="relative w-full h-[200vh] bg-[#050505] border-t border-white/5"
      >
        {/* Contenedor Sticky */}
        <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">

          <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full">

            {/* El Vinilo */}
            <img
              id="vinyl-element"
              src="images/pngegg.png"
              alt="Vinilo rodando"
              className="w-100 h-100 md:w-[800px] md:h-[5000px] object-contain z-10"
              style={{
                willChange: "transform",
                transform: "translateX(100vw) rotate(0deg)"
              }}
            />

            {/* El Texto Ascendente */}
            <div
              id="text-element"
              className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center w-full"
              style={{
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translate(-50%, calc(-50% + 100px))"
              }}
            >
              <h2 className="text-6xl md:text-8xl font-black font-[family-name:var(--font-bayon)] uppercase tracking-[0.1em] text-[#E23C3C] drop-shadow-2xl text-center">
                YOUR NEW WAY OF COLLECTING MUSIC
              </h2>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- SECCIÓN FINAL: START NOW ---------------- */}
      <section className="relative w-full h-screen bg-[#050505] flex items-center justify-center">
        <button
          onClick={() => window.dispatchEvent(new Event("openSearchModal"))}
          className="group relative flex flex-col items-center gap-4 cursor-pointer"
        >
          <span
            className="text-[12vw] font-black uppercase tracking-tight text-white leading-none
                       transition-colors duration-300 group-hover:text-[#E23C3C]"
          >
            START NOW
          </span>
          <span className="text-sm tracking-[0.3em] text-gray-500 group-hover:text-gray-300 transition-colors duration-300">
            ↑ EMPIEZA A CALIFICAR
          </span>
        </button>
      </section>
    </main>
  );
}