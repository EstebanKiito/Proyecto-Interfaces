"use client";
import Spline from '@splinetool/react-spline';
import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';

import albumsJson from "@/data/albums.json";

export default function Home() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");       // urgente: lo que se ve en el input
  const [filterQuery, setFilterQuery] = useState("");       // no urgente: lo que se usa para filtrar
  const [isPending, startTransition] = useTransition();

  const albumsData = albumsJson.albums.items;

  // useMemo evita recalcular el filtro si filterQuery no cambió
  const filteredResults = useMemo(() =>
    albumsData.filter((album) => {
      if (!filterQuery.trim()) return false;
      const q = filterQuery.toLowerCase();
      return (
        album.name.toLowerCase().includes(q) ||
        album.artists[0].name.toLowerCase().includes(q)
      );
    }),
    [filterQuery, albumsData]
  );

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

        {/* ---------------- CAPA 1.5: EFECTO BLUR (OVERLAY) ---------------- */}
        <div 
          className={`absolute inset-0 z-20 transition-all duration-500 ease-in-out ${
            isSearchActive 
              ? 'backdrop-blur-md bg-black/40 opacity-100 pointer-events-auto' 
              : 'backdrop-blur-none bg-transparent opacity-0 pointer-events-none'
          }`}
          onClick={() => {
            setIsSearchActive(false);
            setSearchQuery(""); // Limpia la búsqueda si haces clic fuera
          }} 
        />

        {/* ---------------- CAPA 2: INTERFAZ (UI) ---------------- */}
        <header className="absolute top-0 w-full grid grid-cols-3 items-center px-12 py-10 z-30 text-sm tracking-[0.15em] text-gray-400">
          
          <div></div>

          {/* Centro: Buscador dinámico */}
          <div className="flex flex-col items-center w-full relative">
            {/* Al ser un <input> siempre, el cursor será nativamente de texto (la línea vertical) */}
            <input 
              type="text" 
              placeholder="SEARCH" 
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);                     // urgente: input fluido
                startTransition(() => setFilterQuery(val)); // no urgente: puede esperar
              }}
              onFocus={() => setIsSearchActive(true)}
              className="bg-transparent border-b border-gray-400 text-white placeholder-gray-500 outline-none px-4 py-2 w-[250px] focus:w-[350px] transition-all duration-300 text-center uppercase tracking-widest cursor-text z-40"
            />

            {/* Caja de resultados */}
{isSearchActive && searchQuery.trim() !== "" && (
  <div className={`absolute top-full mt-4 w-[350px] bg-[#111] border border-white/10 rounded-md overflow-hidden flex flex-col z-50 shadow-2xl transition-opacity duration-150 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
    {filteredResults.length > 0 ? (
      filteredResults.map((album) => (
        // CAMBIO AQUÍ: Usamos <Link> en lugar de <div> y agregamos el href
        <Link 
          key={album.id} 
          href={`/album/${album.id}`} // Esto enviará al usuario a /album/mock01_whatsgoingon, por ejemplo
          className="flex items-center gap-4 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
        >
          <img 
            src={album.images[0].url} 
            alt={album.name}
            className="w-10 h-10 object-cover rounded-sm" 
          />
          <div className="flex flex-col text-left">
            <span className="text-white text-sm font-bold tracking-normal">{album.name}</span>
            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{album.artists[0].name}</span>
          </div>
        </Link>
      ))
    ) : (
      <div className="p-4 text-center text-gray-500 text-xs uppercase tracking-widest">
        No results found
      </div>
    )}
  </div>
)}
          </div>

          <div className="flex justify-end gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">LOGIN</span>
            <span className="text-white cursor-pointer">SIGN IN</span>
          </div>
        </header>

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