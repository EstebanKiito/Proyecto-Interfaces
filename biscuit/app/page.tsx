"use client";

import Spline from '@splinetool/react-spline';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// IMPORTACIÓN DE DATOS
import albumsJson from "@/data/albums.json";
import catalogoJson from "@/data/catalogo.json";
import reviewsJson from "@/data/reviews.json";
import currentUserData from "@/data/currentUser.json";

// Tipo de sesión del usuario
interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  isAuthenticated: boolean;
  bio?: string;
  location?: string;
  favorite_albums?: string[];
}

// Componente Carrusel Reutilizable al estilo Netflix
function CatalogueCarousel({ title, albums }: { title: string; albums: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 500;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!albums || albums.length === 0) return null;

  return (
    <div className="relative group flex flex-col gap-3 py-6 px-12 overflow-hidden w-full">
      {/* Título de la sección */}
      <h3 className="font-[family-name:var(--font-bayon)] text-2xl text-zinc-300 tracking-wider uppercase">
        {title}
      </h3>

      {/* Fila del Carrusel */}
      <div className="relative flex items-center w-full">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 z-20 w-10 h-10 rounded-full bg-black/70 border border-zinc-800 text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shadow-lg font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Lista horizontal */}
        <div
          ref={containerRef}
          className="w-full flex items-center overflow-x-auto gap-6 scroll-smooth no-scrollbar py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {albums.map((album, idx) => (
            <div
              key={`${album.id}-${idx}`}
              className="w-40 group/item cursor-pointer shrink-0"
            >
              <Link href={`/album/${album.id}`}>
                <div className="w-40 h-40 overflow-hidden shadow-lg border-2 border-transparent group-hover/item:border-[#E23C3C] transition-colors relative rounded-md">
                  <img
                    src={album.images?.[0]?.url || "https://www.svgrepo.com/show/335455/profile-default.svg"}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 p-2">
                    <p className="font-[family-name:var(--font-bayon)] text-base text-white tracking-wide truncate text-center w-full">
                      {album.name}
                    </p>
                    <p className="font-sans text-[11px] text-[#E23C3C] truncate text-center w-full mt-1">
                      {album.artists?.[0]?.name}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 z-20 w-10 h-10 rounded-full bg-black/70 border border-zinc-800 text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shadow-lg font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Historial y colecciones dinámicas cargadas del frontend
  const [historyAlbums, setHistoryAlbums] = useState<any[]>([]);
  const [collectionAlbums, setCollectionAlbums] = useState<any[]>([]);
  const [toListenAlbums, setToListenAlbums] = useState<any[]>([]);

  // Compilar mapa global de álbumes para resolver IDs rápidamente
  const allAlbumsMap = useMemo(() => {
    const map = new Map<string, any>();
    // Agregar de albums.json
    albumsJson.albums.items.forEach((album: any) => {
      map.set(album.id, album);
    });
    // Agregar de catalogo.json
    catalogoJson.carousels.forEach((carousel: any) => {
      carousel.albums.forEach((album: any) => {
        if (!map.has(album.id)) {
          map.set(album.id, album);
        }
      });
    });
    return map;
  }, []);

  // Verificar la sesión y compilar las playlists personalizadas
  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("activeSession");
      if (active) {
        try {
          const parsed = JSON.parse(active);
          if (parsed && parsed.isAuthenticated) {
            setSession(parsed);

            const userId = parsed.id;

            // 1. CARGAR TU COLECCIÓN
            const likedKey = `likedAlbums_${userId}`;
            const likedAlbums = JSON.parse(localStorage.getItem(likedKey) || "[]") as string[];

            const reviewsKey = `albumReviews_${userId}`;
            let reviewedIds: string[] = [];
            const reviewsRaw = localStorage.getItem(reviewsKey);
            if (reviewsRaw) {
              try {
                reviewedIds = Object.keys(JSON.parse(reviewsRaw));
              } catch (e) {}
            }
            const staticUserReviews = reviewsJson.reviews
              .filter((r: any) => r.user_id === userId)
              .map((r: any) => r.album_id);

            // Obtener favoritos (del override o estáticos)
            let favoriteAlbums: string[] = [];
            const overrideRaw = localStorage.getItem(`profileOverride_${userId}`);
            if (overrideRaw) {
              try {
                const override = JSON.parse(overrideRaw);
                if (override.favorite_albums) favoriteAlbums = override.favorite_albums;
              } catch (e) {}
            }
            if (favoriteAlbums.length === 0) {
              const staticUser = currentUserData.users.find((u: any) => u.id === userId);
              if (staticUser && staticUser.favorite_albums) {
                favoriteAlbums = staticUser.favorite_albums;
              }
            }

            const collectionIds = Array.from(new Set([
              ...favoriteAlbums,
              ...likedAlbums,
              ...reviewedIds,
              ...staticUserReviews
            ]));
            const resolvedCollection = collectionIds
              .map((id: string) => allAlbumsMap.get(id))
              .filter(Boolean);
            setCollectionAlbums(resolvedCollection);

            // 2. CARGAR TO-LISTEN LIST
            const playlistItemsKey = `playlistItems_${userId}`;
            const savedItems = JSON.parse(localStorage.getItem(playlistItemsKey) || "{}");
            const toListenIds = savedItems[`pl_to_listen_${userId}`] || [];
            const resolvedToListen = toListenIds
              .map((id: string) => allAlbumsMap.get(id))
              .filter(Boolean);
            setToListenAlbums(resolvedToListen);

            // 3. CARGAR HISTORIAL DE ESCUCHA (Continuar Escuchando)
            const historyKey = `lastViewedAlbums_${userId}`;
            const historyIds = JSON.parse(localStorage.getItem(historyKey) || "[]") as string[];
            const resolvedHistory = historyIds
              .map((id: string) => allAlbumsMap.get(id))
              .filter(Boolean);
            setHistoryAlbums(resolvedHistory);
          }
        } catch (e) {
          console.error("Error parsing session on landing page", e);
        }
      }
      setLoading(false);
    }
  }, [allAlbumsMap]);

  // Manejar el efecto scroll del fondo Spline en la vista normal deslogueado
  useEffect(() => {
    if (session) return; // No scroll listener needed if logged in

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

          let progress = 0;
          if (rect.top <= 0) {
            progress = Math.abs(rect.top) / windowHeight;
          }
          progress = Math.max(0, Math.min(1, progress));

          // Vinilo
          const translateX = (1 - progress) * 100;
          const rotation = progress * 360;
          vinyl.style.transform = `translateX(${translateX}vw) rotate(${rotation}deg)`;

          // Texto
          const textTranslateY = (1 - progress) * 100;
          const textOpacity = progress;
          text.style.transform = `translate(-50%, calc(-50% + ${textTranslateY}px))`;
          text.style.opacity = textOpacity.toString();

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [session]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-400 font-[family-name:var(--font-bayon)]">Cargando tu catálogo...</p>
        </div>
      </main>
    );
  }

  // VISTA CON SESIÓN ACTIVA (CATÁLOGO AL ESTILO NETFLIX)
  if (session) {
    return (
      <main className="w-full min-h-screen bg-[#050505] text-white pt-20 pb-20 font-sans">
        {/* BANNER SPOTLIGHT / HERO AL ESTILO NETFLIX */}
        <section className="relative w-full h-[65vh] md:h-[75vh] flex items-center overflow-hidden border-b border-zinc-900 bg-black">
          {/* Imagen de fondo gigantesca */}
          <div className="absolute inset-0 grayscale-[40%] opacity-40">
            <img
              src="https://www.rollingstone.com/wp-content/uploads/2018/06/metallica-puppets-d7382ca6-9e72-4770-b2f5-8b57922d57fb.jpg?w=1280"
              alt="Metallica Spotlight Cover"
              className="w-full h-full object-cover object-center scale-105"
            />
          </div>

          {/* Degradado negro de fondo (Figura-Fondo) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent z-10" />

          {/* Contenido en Spotlight */}
          <div className="relative z-20 max-w-4xl px-12 flex flex-col gap-2 mt-20">
            <span className="text-xs text-[#E23C3C] tracking-[0.3em] font-bold uppercase font-[family-name:var(--font-bayon)]">
              ★ RECOMENDACIÓN DE LA SEMANA
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-[family-name:var(--font-bayon)] uppercase tracking-wide text-white drop-shadow-2xl">
              Master of Puppets
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 font-semibold tracking-wider font-[family-name:var(--font-bayon)]">
              METALLICA <span className="text-zinc-500 font-sans text-sm ml-2">1986</span>
            </p>
            <p className="max-w-xl text-zinc-400 text-sm leading-relaxed tracking-wide mt-2">
              Lanzado en 1986, esta legendaria obra maestra del thrash metal es considerada uno de los álbumes más influyentes y aclamados de todos los tiempos. Explora el tracklist completo, dale una calificación y escribe tu reseña.
            </p>

            {/* Acciones */}
            <div className="flex gap-4 mt-6">
              <Link
                href="/album/mockMetal02_masterofpuppets"
                className="bg-white text-black font-[family-name:var(--font-bayon)] text-sm md:text-base px-6 py-2.5 rounded-full uppercase tracking-widest hover:bg-[#E23C3C] hover:text-white transition-all shadow-lg font-bold"
              >
                Ver Álbum
              </Link>
              <Link
                href="/profile"
                className="bg-transparent border border-zinc-500 text-white font-[family-name:var(--font-bayon)] text-sm md:text-base px-6 py-2.5 rounded-full uppercase tracking-widest hover:bg-zinc-800 transition-all font-bold"
              >
                Mi Perfil
              </Link>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE CARRUSELES */}
        <div className="flex flex-col mt-4">
          
          {/* ── 1. HISTORIAL: Continuar escuchando (Dinámico) ── */}
          {historyAlbums.length > 0 && (
            <CatalogueCarousel
              title="Continuar escuchando"
              albums={historyAlbums}
            />
          )}

          {/* ── 2. TU COLECCIÓN (Dinámico) ── */}
          {collectionAlbums.length > 0 && (
            <CatalogueCarousel
              title="Tu Colección"
              albums={collectionAlbums}
            />
          )}

          {/* ── 3. TO-LISTEN LIST (Dinámico) ── */}
          {toListenAlbums.length > 0 && (
            <CatalogueCarousel
              title="Tu Lista To-Listen"
              albums={toListenAlbums}
            />
          )}

          {/* ── 4. LOS 15 CARRUSELES DEL ARCHIVO DE CATÁLOGO ── */}
          {catalogoJson.carousels.map((carousel) => (
            <CatalogueCarousel
              key={carousel.id}
              title={carousel.title}
              albums={carousel.albums}
            />
          ))}

        </div>
      </main>
    );
  }

  // VISTA CON SESIÓN INACTIVA (LANDING CON EFECTO 3D Y PARALLAX)
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
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            className="text-8xl font-biscuit tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            BISCUIT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="text-2xl max-w-[280px] font-light tracking-widest leading-snug"
          >
            MADE FOR TRUE MUSIC LOVERS
          </motion.p>
        </div>

        <div className="absolute bottom-10 w-full text-center z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, delay: 2, duration: 2 }}
            className="text-sm tracking-[0.2em] text-gray-300"
          >
            SCROLL TO CONTINUE
          </motion.p>
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