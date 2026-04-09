"use client"; // Necesario para usar interactividad (botones, estados)

import React, { useState } from 'react';

export default function Home() {
  // Estados para la interactividad
  const [rating, setRating] = useState(0);
  const [activeActions, setActiveActions] = useState({ reviewed: false, liked: false, watchlist: false });

  // Función para alternar los iconos superiores
  const toggleAction = (action: keyof typeof activeActions) => {
    setActiveActions(prev => ({ ...prev, [action]: !prev[action] }));
  };

  // Imagenes //
  // --- URLs de ejemplo (Reemplázalas por las tuyas reales) ---
  // Puedes usar rutas relativas si las imágenes están en la carpeta /public (ej: '/cover.jpg')
  const bandCoverUrl = 'pink.jpg'; 
  const albumCoverUrl = 'darkside.svg.png';
  const reviewsBgUrl = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000";

  return (
    <main className="min-h-screen bg-[oklch(0.9546_0.0086_67.72)] flex flex-col">
      {/* 1. Barra superior (Igual que antes) */}
      <header className="w-full h-100 bg-[#257180] text-white flex items-center justify-center text-2xl font-light uppercase bg-cover bg-center bg-no-repeat border-b-4 border-black/20"
      style={{ backgroundImage: `url(${bandCoverUrl})` }}
      >
        {/*Band cover*/}
      </header>

      {/* 2. Título centrado con Subtítulos absolutos */}
      {/* 2. Título (Fuera de las columnas de abajo, pero imitando su estructura) */}
<div className="w-full bg-[#F4EFEA] border-b border-gray-100">
  {/* Usamos el mismo padding (px-10) y gap (gap-10) que el contenedor de abajo */}
  <div className="flex px-10 py-12 gap-10 items-end">
    
    {/* COLUMNA IZQUIERDA INVISIBLE (flex-1)
        Sirve para empujar el título y que empiece justo donde empieza la columna central
    */}
    <div className="flex-1" />

    <div className="flex-[1.8] relative">
      <h1 className="text-5xl font-[family-name:var(--font-bayon)] font-black text-gray-900 leading-none break-words text-center mx-auto">
        Dark Side of The Moon
      </h1>
      
      {/* Subtítulos a la derecha del título */}
      <nav className="absolute left-full ml-6 bottom-0 hidden lg:flex gap-6 whitespace-nowrap">
        {['Pink Floyd', '1973'].map((t, i) => (
          <a key={i} href="#" className="text-black hover:text-blue-700 font-bold">{t}</a>
        ))}
      </nav>
    </div>

    {/* COLUMNA DERECHA INVISIBLE (flex-1)
        Mantiene el equilibrio para que la columna de al medio no se desplace
    */}
    <div className="flex-1" />
    
  </div>
</div>
      {/* 3. Contenedor de 3 Columnas */}
      <div className="flex-1 flex px-10 py-10 gap-10 items-start">
        
        {/* COLUMNA IZQUIERDA */}
        <aside className="flex-1 flex justify-center">
          
        <div className='flex-column'>
          <div className="relative -mt-100 z-20 w-60 h-60 bg-[#CB6040] text-white flex items-center justify-center font-bold rounded-xl shadow-xl bg-cover bg-center"
          style={{backgroundImage: `url(${albumCoverUrl})`}}
          >  
            {/* Album Cover */}
          </div>

          <div className="relative mt-40 w-80 h-80 bg-[#CB6040] text-white flex items-center justify-center font-bold rounded-2xl shadow-xl">
            Where to listen
          </div>
        </div>
          
        </aside>

        {/* COLUMNA CENTRAL */}
        <section className="flex-[1.8] flex flex-col items-center gap-6">
          <div className="w-full h-150 bg-[#FD8B51] text-white flex items-center justify-center rounded-2xl shadow-lg">
            Tracklist
          </div>
          
          <div className="w-full h-[150px] bg-[#FD8B51] text-white flex items-center justify-center rounded-2xl shadow-lg">
            Reseñas
          </div>
        </section>

        {/* --- COLUMNA DERECHA (Componente tipo Letterboxd) --- */}
        <aside className="flex-1 flex justify-center">
          <div className="w-64 bg-[oklch(0.9_0.01_67.72)] text-[#0f3740] rounded-md shadow-2xl overflow-hidden flex flex-col">
            
            {/* Opciones Superiores */}
            <div className="flex justify-around p-4 border-b border-gray-700">
              <button 
                onClick={() => toggleAction('reviewed')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeActions.reviewed ? 'text-[#FD8B51]' : 'hover:text-white'}`}
              >
                <div className="w-6 h-6 bg-current rounded-full" /> {/* Simulando icono */}
                <span className="text-[10px] uppercase font-bold tracking-tighter">Reviewed</span>
              </button>

              <button 
                onClick={() => toggleAction('liked')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeActions.liked ? 'text-[#257180]' : 'hover:text-white'}`}
              >
                <div className="w-6 h-6 bg-current rounded-full" /> {/* Simulando icono */}
                <span className="text-[10px] uppercase font-bold tracking-tighter">Liked</span>
              </button>

              <button 
                onClick={() => toggleAction('watchlist')}
                className={`flex flex-col items-center gap-1 transition-colors ${activeActions.watchlist ? 'text-[#CB6040]' : 'hover:text-white'}`}
              >
                <div className="w-6 h-6 bg-current rounded-full" /> {/* Simulando icono */}
                <span className="text-[10px] uppercase font-bold tracking-tighter">Watchlist</span>
              </button>
            </div>

            {/* Sistema de Rating (Estrellas) */}
            <div className="p-6 flex flex-col items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Rated</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform active:scale-90 ${star <= rating ? 'text-[#257180]' : 'text-gray-600 hover:text-gray-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones extra de la imagen (Solo visual por ahora) */}
            <div className="flex flex-col text-sm border-t border-gray-700">
              <button className="py-3 hover:bg-[#38424e] border-b border-gray-700/50">Show your activity</button>
              <button className="py-3 hover:bg-[#38424e] border-b border-gray-700/50">Log again / edit review...</button>
              <button className="py-3 hover:bg-[#38424e]">Add to lists...</button>
            </div>

          </div>
        </aside>

      </div>
    </main>
  );
}