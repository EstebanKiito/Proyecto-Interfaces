"use client";
import Spline from '@splinetool/react-spline';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#050505] text-white font-sans">
      <section className="relative w-full h-screen overflow-hidden">

        {/* ---------------- CAPA 1: FONDO 3D ---------------- */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full">
            <Spline
              scene="https://prod.spline.design/d4AyP6PVdmmGLKzX/scene.splinecode"
              style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* ---------------- NAVBAR ---------------- */}
        <Navbar />

        {/* ---------------- HERO TEXT ---------------- */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-6">
          <h1 className="text-8xl font-biscuit tracking-wider uppercase text-white drop-shadow-lg">
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

      <section className="w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center border-t border-white/10">
        <h2 className="text-4xl tracking-widest text-gray-500 font-light">
          AQUÍ VA TU PRÓXIMA SECCIÓN
        </h2>
      </section>
    </main>
  );
}