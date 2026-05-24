"use client";
import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function Home() {

  const [isSearchActive, setIsSearchActive] = useState(false);

  return (
    // Contenedor principal: pantalla completa, fondo oscuro, sin barras de scroll
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

      {/* ---------------- CAPA 1.5: EFECTO BLUR (OVERLAY) ---------------- */}
      {/* Esta capa está entre el modelo 3D y el Header. Solo se ve si isSearchActive es true */}
      <div 
        className={`absolute inset-0 z-20 transition-all duration-500 ease-in-out ${
          isSearchActive 
            ? 'backdrop-blur-md bg-black/40 opacity-100 pointer-events-auto' 
            : 'backdrop-blur-none bg-transparent opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSearchActive(false)} // Cierra el buscador si haces clic fuera de él
      />

      {/* ---------------- CAPA 2: INTERFAZ (UI) ---------------- */}
      
      {/* Header con Grid de 3 columnas para centrado perfecto (z-30 para estar sobre el blur) */}
      <header className="absolute top-0 w-full grid grid-cols-3 items-center px-12 py-10 z-30 text-sm tracking-[0.15em] text-gray-400">
        
        {/* Espacio vacío a la izquierda para equilibrar el grid */}
        <div></div>

        {/* Centro: Lógica del buscador */}
        <div className="flex justify-center items-center w-full">
          {!isSearchActive ? (
            <button 
              onClick={() => setIsSearchActive(true)}
              className="hover:text-white cursor-pointer transition-colors uppercase tracking-[0.15em]"
            >
              Search
            </button>
          ) : (
            <input 
              type="text" 
              autoFocus // Se selecciona automáticamente al aparecer
              placeholder="¿Qué estás buscando?" 
              className="bg-transparent border-b border-gray-400 text-white placeholder-gray-500 outline-none px-4 py-2 w-[250px] focus:w-[350px] transition-all duration-300 text-center"
            />
          )}
        </div>

        {/* Derecha: Botones de sesión */}
        <div className="flex justify-end gap-8">
          <span className="hover:text-white cursor-pointer transition-colors">LOGIN</span>
          <span className="text-white cursor-pointer">SIGN IN</span>
        </div>
      </header>

      {/* Textos Izquierdos */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-6">
        
        {/* ¡Aquí aplicamos font-biscuit! */}
        <h1 className="text-8xl font-biscuit tracking-wider uppercase text-white">
          BISCUIT
        </h1>
        
        <p className="text-2xl max-w-[280px] font-light tracking-widest leading-snug">
          MADE FOR TRUE MUSIC LOVERS
        </p>
      </div>

      {/* Indicador de Scroll Inferior */}
      <div className="absolute bottom-10 w-full text-center z-10">
        <p className="text-sm tracking-[0.2em] text-gray-300">
          SCROLL TO CONTINUE
        </p>
      </div>
</section>


      {/* --- ESTA ES LA NUEVA SECCIÓN DE ABAJO --- */}
      {/* Al agregar esto, el navegador automáticamente habilita el scroll */}
      <section className="w-full min-h-screen bg-[#0a0a0a] flex items-center justify-center border-t border-white/10">
        <h2 className="text-4xl tracking-widest text-gray-500 font-light">
          AQUÍ VA TU PRÓXIMA SECCIÓN
        </h2>
      </section>


    </main>
  );
}