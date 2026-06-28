"use client";

import Spline from '@splinetool/react-spline';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="relative group flex flex-col gap-2 md:gap-3 py-4 md:py-6 px-4 md:px-12 overflow-hidden w-full">
      {/* Título de la sección */}
      <h3 className="font-[family-name:var(--font-bayon)] text-xl md:text-3xl text-zinc-300 tracking-wider uppercase">
        {title}
      </h3>

      {/* Fila del Carrusel */}
      <div className="relative flex items-center w-full">
        {/* Flecha izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 border border-zinc-800 text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shadow-lg font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Lista horizontal */}
        <div
          ref={containerRef}
          className="w-full flex items-center overflow-x-auto gap-4 md:gap-8 scroll-smooth no-scrollbar py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {albums.map((album, idx) => (
            <div
              key={`${album.id}-${idx}`}
              className="w-32 md:w-55 group/item cursor-pointer shrink-0"
            >
              <Link href={`/album/${album.id}`}>
                <div className="w-32 h-32 md:w-55 md:h-55 overflow-hidden shadow-lg border-2 border-transparent group-hover/item:border-[#E23C3C] transition-colors relative rounded-md">
                  <img
                    src={album.images?.[0]?.url || "https://www.svgrepo.com/show/335455/profile-default.svg"}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay en hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 p-2">
                    <p className="font-[family-name:var(--font-bayon)] text-xs md:text-base text-white tracking-wide truncate text-center w-full">
                      {album.name}
                    </p>
                    <p className="font-sans text-[9px] md:text-[11px] text-[#E23C3C] truncate text-center w-full mt-1">
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
          className="absolute right-2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 border border-zinc-800 text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 shadow-lg font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const SPOTLIGHT_SLIDES = [
  {
    id: "mockMetal02_masterofpuppets",
    title: "Master of Puppets",
    artist: "METALLICA",
    year: "1986",
    tag: "★ RECOMENDACIÓN DE LA SEMANA",
    description: "Lanzado en 1986, esta legendaria obra maestra del thrash metal es considerada uno de los álbumes más influyentes y aclamados de todos los tiempos. Explora el tracklist completo, dale una calificación y escribe tu reseña.",
    cover: "https://www.rollingstone.com/wp-content/uploads/2018/06/metallica-puppets-d7382ca6-9e72-4770-b2f5-8b57922d57fb.jpg?w=1280"
  },
  {
    id: "mock07_rumours",
    title: "Rumours",
    artist: "FLEETWOOD MAC",
    year: "1977",
    tag: "★ CLÁSICO ATEMPORAL",
    description: "El legendario éxito pop-rock de 1977 escrito en medio de turbulencias sentimentales de la banda. Un testimonio de sinergia musical, armonías vocales perfectas y emoción a flor de piel.",
    cover: "https://www.rollingstone.com/wp-content/uploads/2020/09/R1344-007-Fleetwood-Mac-RUMOURS.jpg?w=1000"
  },
  {
    id: "mockJRock16_thatswhyigaveuponmusic",
    title: "[That's Why I Gave Up on Music]",
    artist: "ヨルシカ [Yorushika]",
    year: "2004",
    tag: "★ J-ROCK ESENCIAL",
    description: "El aclamado álbum de estudio de 2019 de Yorushika. Con guitarras enérgicas, melodías vibrantes y letras introspectivas que definieron un nuevo estándar en el J-Rock moderno, consolidando a la banda como un referente del género.",
    cover: "/images/jrock-albums/16.jpg"
  },
  {
    id: "mock19_tpab",
    title: "To Pimp a Butterfly",
    artist: "KENDRICK LAMAR",
    year: "2015",
    tag: "★ MÁXIMA CALIFICACION",
    description: "Una obra maestra que fusiona hip-hop, jazz libre, funk y poesía hablada para entregar una declaración social, política y personal sobre la cultura afroamericana moderna.",
    cover: "https://www.rollingstone.com/wp-content/uploads/2020/09/R1344-019-Kendrick-Lamar-To-Pimp-a-Butterfly.jpg?w=1000"
  },
  {
    id: "mockMetal26_dirt",
    title: "Dirt",
    artist: "ALICE IN CHAINS",
    year: "1992",
    tag: "★ PIEZA DE CULTO GRUNGE",
    description: "El disco multiplatino insignia de Alice in Chains lanzado en 1992. Cargado de riffs pesados y una atmósfera oscura y melancólica, representa la cumbre creativa del sonido de Seattle.",
    cover: "https://www.rollingstone.com/wp-content/uploads/2018/06/alice-in-chains-dirt-a495466c-700f-47b7-85d7-40d3d514d947.jpg?w=1280"
  }
];

export default function Home() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isBiscuitModalOpen, setIsBiscuitModalOpen] = useState(false);

  // Auto-rotar recomendación de la semana cada 5 segundos
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SPOTLIGHT_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [session]);

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
          const splineContainer = document.getElementById('spline-container');

          // Elementos del nuevo carrusel parallax
          const carouselSection = document.getElementById('scroll-carousel-section');
          const card1 = document.getElementById('feature-card-1');
          const card2 = document.getElementById('feature-card-2');
          const card3 = document.getElementById('feature-card-3');
          const dot1 = document.getElementById('feature-dot-1');
          const dot2 = document.getElementById('feature-dot-2');
          const dot3 = document.getElementById('feature-dot-3');

          const windowHeight = window.innerHeight;
          const scrollY = window.scrollY || window.pageYOffset;

          // Optimización de rendimiento: Ocultar el lienzo 3D de Spline cuando se sale del viewport
          if (splineContainer) {
            if (scrollY > windowHeight - 50) {
              splineContainer.style.display = 'none';
            } else {
              splineContainer.style.display = 'flex';
            }
          }

          // Animación 1: Vinilo rodando y texto ascendente
          if (section && vinyl && text) {
            const rect = section.getBoundingClientRect();
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
          }

          // Animación 2: Revelado secuencial tipo vinilo/parlante de tarjetas de características
          if (carouselSection && card1 && card2 && card3) {
            const cRect = carouselSection.getBoundingClientRect();
            let carouselProgress = 0;
            if (cRect.top <= 0) {
              carouselProgress = Math.abs(cRect.top) / (windowHeight * 2); // Espacio scrolleable total es 200vh (300vh - 100vh)
            }
            carouselProgress = Math.max(0, Math.min(1, carouselProgress));

            // Card 1 Logic (Aparece 0.0 -> 0.1, Se queda -> 0.22, Desaparece -> 0.32)
            let opacity1 = 0;
            let translateY1 = 40;
            if (carouselProgress >= 0 && carouselProgress < 0.1) {
              const p = carouselProgress / 0.1;
              opacity1 = p;
              translateY1 = 40 - (p * 40);
            } else if (carouselProgress >= 0.1 && carouselProgress <= 0.22) {
              opacity1 = 1;
              translateY1 = 0;
            } else if (carouselProgress > 0.22 && carouselProgress <= 0.32) {
              const p = (carouselProgress - 0.22) / 0.1;
              opacity1 = 1 - p;
              translateY1 = -p * 40;
            }

            // Card 2 Logic (Aparece 0.35 -> 0.45, Se queda -> 0.57, Desaparece -> 0.67)
            let opacity2 = 0;
            let translateY2 = 40;
            if (carouselProgress > 0.35 && carouselProgress < 0.45) {
              const p = (carouselProgress - 0.35) / 0.1;
              opacity2 = p;
              translateY2 = 40 - (p * 40);
            } else if (carouselProgress >= 0.45 && carouselProgress <= 0.57) {
              opacity2 = 1;
              translateY2 = 0;
            } else if (carouselProgress > 0.57 && carouselProgress <= 0.67) {
              const p = (carouselProgress - 0.57) / 0.1;
              opacity2 = 1 - p;
              translateY2 = -p * 40;
            }

            // Card 3 Logic (Aparece 0.7 -> 0.8, Se queda -> 1.0)
            let opacity3 = 0;
            let translateY3 = 40;
            if (carouselProgress > 0.7 && carouselProgress < 0.8) {
              const p = (carouselProgress - 0.7) / 0.1;
              opacity3 = p;
              translateY3 = 40 - (p * 40);
            } else if (carouselProgress >= 0.8) {
              opacity3 = 1;
              translateY3 = 0;
            }

            // Aplicar estilos a las tarjetas
            card1.style.opacity = opacity1.toString();
            card1.style.transform = `translateY(${translateY1}px)`;
            card1.style.pointerEvents = opacity1 > 0.1 ? 'auto' : 'none';

            card2.style.opacity = opacity2.toString();
            card2.style.transform = `translateY(${translateY2}px)`;
            card2.style.pointerEvents = opacity2 > 0.1 ? 'auto' : 'none';

            card3.style.opacity = opacity3.toString();
            card3.style.transform = `translateY(${translateY3}px)`;
            card3.style.pointerEvents = opacity3 > 0.1 ? 'auto' : 'none';

            // Actualizar indicadores (puntos de posición)
            if (dot1 && dot2 && dot3) {
              dot1.style.backgroundColor = (carouselProgress >= 0 && carouselProgress < 0.32) ? '#E23C3C' : 'rgba(255,255,255,0.15)';
              dot1.style.transform = (carouselProgress >= 0 && carouselProgress < 0.32) ? 'scale(1.2)' : 'scale(1)';

              dot2.style.backgroundColor = (carouselProgress >= 0.32 && carouselProgress < 0.67) ? '#E23C3C' : 'rgba(255,255,255,0.15)';
              dot2.style.transform = (carouselProgress >= 0.32 && carouselProgress < 0.67) ? 'scale(1.2)' : 'scale(1)';

              dot3.style.backgroundColor = (carouselProgress >= 0.67) ? '#E23C3C' : 'rgba(255,255,255,0.15)';
              dot3.style.transform = (carouselProgress >= 0.67) ? 'scale(1.2)' : 'scale(1)';
            }
          }

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

  // VISTA CON SESIÓN ACTIVA 
  if (session) {
    return (
      <main className="w-full min-h-screen bg-[#050505] text-white pt-20 pb-20 font-sans">
        {(() => {
          const activeSlide = SPOTLIGHT_SLIDES[currentSlideIndex];
          return (
            <section className="relative w-full h-[70vh] flex items-center overflow-hidden border-b border-zinc-900 bg-black">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full flex items-center"
                >
                  {/* Imagen de fondo gigantesca */}
                  <div className="absolute inset-0 grayscale-[40%] opacity-40">
                    <img
                      src={activeSlide.cover}
                      alt={`${activeSlide.title} Spotlight Cover`}
                      className="w-full h-full object-cover object-center scale-105"
                    />
                  </div>

                  {/* Degradado negro de fondo (Figura-Fondo) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent z-10" />

                  {/* Contenido en Spotlight */}
                  <div className="relative z-20 max-w-4xl px-12 flex flex-col gap-2 mt-8">
                    <motion.span
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="text-[10px] md:text-xs text-[#E23C3C] tracking-[0.3em] font-bold uppercase font-[family-name:var(--font-bayon)]"
                    >
                      {activeSlide.tag}
                    </motion.span>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-4xl md:text-6xl font-bold font-[family-name:var(--font-bayon)] uppercase tracking-wide text-white drop-shadow-2xl leading-none"
                    >
                      {activeSlide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="text-lg md:text-xl text-zinc-300 font-semibold tracking-wider font-[family-name:var(--font-bayon)]"
                    >
                      {activeSlide.artist} <span className="text-zinc-500 font-sans text-xs ml-2">{activeSlide.year}</span>
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="max-w-xl text-zinc-400 text-xs md:text-sm leading-relaxed tracking-wide mt-1 line-clamp-3 md:line-clamp-none"
                    >
                      {activeSlide.description}
                    </motion.p>

                    {/* Acciones */}
                    <div className="flex gap-4 mt-6">
                      <Link
                        href={`/album/${activeSlide.id}`}
                        className="bg-white text-black font-[family-name:var(--font-bayon)] text-xs md:text-sm px-6 py-2 rounded-full uppercase tracking-widest hover:bg-[#E23C3C] hover:text-white transition-all shadow-lg font-bold"
                      >
                        Ver Album
                      </Link>
                      <Link
                        href="/profile"
                        className="bg-transparent border border-zinc-500 text-white font-[family-name:var(--font-bayon)] text-xs md:text-sm px-6 py-2 rounded-full uppercase tracking-widest hover:bg-zinc-800 transition-all font-bold"
                      >
                        Mi Perfil
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Indicadores de posición de carrusel (5 líneas con animación de estirado/achicado) */}
              <div className="absolute bottom-6 right-12 z-30 flex gap-2 py-2 items-center">
                {SPOTLIGHT_SLIDES.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    animate={{
                      width: idx === currentSlideIndex ? 40 : 16,
                      backgroundColor: idx === currentSlideIndex ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.25)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="h-1.5 rounded-full cursor-pointer border-none outline-none"
                    title={`Recomendación ${idx + 1}`}
                  />
                ))}
              </div>
            </section>
          );
        })()}

        {/* SECCIÓN DE CARRUSELES */}
        <div className="flex flex-col mt-4 gap-14 px-4 ">
          
          {/* ── 1. HISTORIAL: Continuar escuchando (Dinámico) ── */}
          {historyAlbums.length > 0 && (
            <CatalogueCarousel
              title="Continuar Escuchando"
              albums={historyAlbums}
            />
          )}

          {/* ── 2. TU COLECCIÓN (Dinámico) ── */}
          {collectionAlbums.length > 0 && (
            <CatalogueCarousel
              title="Tu Coleccion"
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
        <div id="spline-container" className="absolute inset-0 flex items-center justify-center scale-[0.8] md:scale-100 transition-transform duration-500">
          <div className="w-full h-full">
            <Spline
              scene="https://prod.spline.design/d4AyP6PVdmmGLKzX/scene.splinecode"
              style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* CAPA DE SOMBRA DEGRADADA DE DERECHA A IZQUIERDA (FIGURA-FONDO GESTALT) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 from-[30%] via-black/0 via-[45%] to-transparent to-[100%] z-10 pointer-events-none" />

        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4 md:gap-6 max-w-[90%] md:max-w-none">
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-biscuit tracking-wider uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            BISCUIT
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-2xl max-w-[280px] font-light tracking-widest leading-snug"
          >
            MADE FOR TRUE MUSIC LOVERS
          </motion.p>
        </div>

        <div className="absolute bottom-6 md:bottom-10 w-full text-center z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, delay: 2, duration: 2 }}
            className="text-[10px] md:text-sm tracking-[0.15em] md:tracking-[0.2em] text-gray-400 md:text-gray-300"
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
              onClick={() => setIsBiscuitModalOpen(true)}
              src="images/pngegg.png"
              alt="Vinilo rodando"
              className="w-100 h-100 md:w-[800px] md:h-[5000px] object-contain z-10 cursor-pointer hover:[scale:1.1] transition-[scale] duration-300"
              title="Haz click para descubrir qué significa Biscuit"
              style={{
                willChange: "transform",
                transform: "translateX(100vw) rotate(0deg)"
              }}
            />

            {/* El Texto Ascendente */}
            <div
              id="text-element"
              onClick={() => setIsBiscuitModalOpen(true)}
              className="absolute top-1/2 left-1/2 z-20 flex flex-col items-center w-full cursor-pointer group"
              style={{
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translate(-50%, calc(-50% + 100px))"
              }}
            >
              <h2 className="text-6xl md:text-8xl font-black font-[family-name:var(--font-bayon)] uppercase tracking-[0.1em] text-[#E23C3C] hover:text-[#2d2626] transition-colors duration-300 drop-shadow-2xl text-center">
                YOUR NEW WAY OF COLLECTING MUSIC
              </h2>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------- SECCIÓN SCROLL CON CARUSEL PARALLAX (STICKY) ---------------- */}
      <section
        id="scroll-carousel-section"
        className="relative w-full h-[300vh] bg-[#050505] border-t border-white/5"
      >
        {/* Contenedor Sticky */}
        <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-center items-center px-8 md:px-24">
          
          <div className="max-w-xl w-full mb-10 text-center">
            <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm md:text-base uppercase tracking-[0.3em] font-semibold">
              FUNCIONES CLAVE
            </span>
            <h2 className="font-[family-name:var(--font-bayon)] text-4xl md:text-6xl text-white uppercase mt-2 tracking-wider">
              WHY BISCUIT 
            </h2>
          </div>

          {/* Contenedor de Tarjetas Apiladas (Absolute Stack) */}
          <div className="relative w-full max-w-[600px] h-[400px] md:h-[460px] flex items-center justify-center">
            
            {/* Card 1 */}
            <div
              id="feature-card-1"
              className="absolute bg-[#111112] border border-white/5 backdrop-blur-md rounded-[3rem] p-10 md:p-14 flex flex-col justify-between w-full h-full shadow-2xl overflow-hidden group hover:border-[#E23C3C]/40 transition-colors"
              style={{
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translateY(40px)",
                pointerEvents: "none"
              }}
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#E23C3C]/10 rounded-full blur-xl group-hover:bg-[#E23C3C]/20 transition-all duration-500" />
              <div className="flex flex-col gap-6">
                <span className="font-[family-name:var(--font-bayon)] text-7xl md:text-8xl text-white/5 group-hover:text-[#E23C3C]/20 transition-colors duration-500 leading-none">
                  01
                </span>
                <h3 className="font-[family-name:var(--font-bayon)] text-4xl md:text-5xl text-white uppercase tracking-wider leading-tight">
                  Califica Musica
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-medium">
                  Califica tus álbumes y canciones favoritas. Deja reseñas detalladas de los lanzamientos que marcan tu vida y mantén un registro de tu evolución musical.
                </p>
              </div>
              <div className="w-fit border-b border-[#E23C3C]/50 pb-1 text-[#E23C3C] font-[family-name:var(--font-bayon)] text-xs tracking-widest uppercase">
                Calificar & Reseñar
              </div>
            </div>

            {/* Card 2 */}
            <div
              id="feature-card-2"
              className="absolute bg-[#111112] border border-white/5 backdrop-blur-md rounded-[3rem] p-10 md:p-14 flex flex-col justify-between w-full h-full shadow-2xl overflow-hidden group hover:border-[#E23C3C]/40 transition-colors"
              style={{
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translateY(40px)",
                pointerEvents: "none"
              }}
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#E23C3C]/10 rounded-full blur-xl group-hover:bg-[#E23C3C]/20 transition-all duration-500" />
              <div className="flex flex-col gap-6">
                <span className="font-[family-name:var(--font-bayon)] text-7xl md:text-8xl text-white/5 group-hover:text-[#E23C3C]/20 transition-colors duration-500 leading-none">
                  02
                </span>
                <h3 className="font-[family-name:var(--font-bayon)] text-4xl md:text-5xl text-white uppercase tracking-wider leading-tight">
                  Arma tu Repisa
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-medium">
                  Crea estanterías temáticas personalizadas (Shelves). Agrupa tus vinilos virtuales según su género, estado de ánimo o época para tener tu colección siempre organizada.
                </p>
              </div>
              <div className="w-fit border-b border-[#E23C3C]/50 pb-1 text-[#E23C3C] font-[family-name:var(--font-bayon)] text-xs tracking-widest uppercase">
                Organizar Colección
              </div>
            </div>

            {/* Card 3 */}
            <div
              id="feature-card-3"
              className="absolute bg-[#111112] border border-white/5 backdrop-blur-md rounded-[3rem] p-10 md:p-14 flex flex-col justify-between w-full h-full shadow-2xl overflow-hidden group hover:border-[#E23C3C]/40 transition-colors"
              style={{
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translateY(40px)",
                pointerEvents: "none"
              }}
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#E23C3C]/10 rounded-full blur-xl group-hover:bg-[#E23C3C]/20 transition-all duration-500" />
              <div className="flex flex-col gap-6">
                <span className="font-[family-name:var(--font-bayon)] text-7xl md:text-8xl text-white/5 group-hover:text-[#E23C3C]/20 transition-colors duration-500 leading-none">
                  03
                </span>
                <h3 className="font-[family-name:var(--font-bayon)] text-4xl md:text-5xl text-white uppercase tracking-wider leading-tight">
                  Comparte con Amigos
                </h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans font-medium">
                  Busca a tus amigos dentro de la plataforma. Explora sus colecciones, revisa sus listas 'To-Listen', curiosea sus Top 3 y descubre nueva música a través de sus opiniones.
                </p>
              </div>
              <div className="w-fit border-b border-[#E23C3C]/50 pb-1 text-[#E23C3C] font-[family-name:var(--font-bayon)] text-xs tracking-widest uppercase">
                Red Social Musical
              </div>
            </div>

          </div>

          {/* Indicadores de Posición */}
          <div className="flex gap-4 mt-10 justify-center">
            <div
              id="feature-dot-1"
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <div
              id="feature-dot-2"
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <div
              id="feature-dot-3"
              className="w-3 h-3 rounded-full transition-all duration-300"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
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

      {/* ── MODAL EXPLICATIVO DE BISCUIT ── */}
      <AnimatePresence>
        {isBiscuitModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setIsBiscuitModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-[#111112] w-full max-w-5xl h-[85vh] md:h-[65vh] rounded-[2.5rem] border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200"
            >
              {/* Botón de Cerrar */}
              <button
                onClick={() => setIsBiscuitModalOpen(false)}
                className="absolute top-6 right-6 z-20 text-zinc-500 hover:text-white transition-colors text-2xl font-bold bg-black/50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              {/* Columna Izquierda: Texto */}
              <div className="flex-1 p-10 md:p-16 flex flex-col justify-center gap-6 text-left">
                <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm uppercase tracking-[0.3em] font-semibold mt-6 md:mt-0">
                  Materia Prima
                </span>
                <h2 className="font-[family-name:var(--font-biscuit)] text-6xl md:text-8xl text-white uppercase tracking-wider leading-none m-0 p-0">
                  BISCUIT
                </h2>
                <div className="w-16 h-[2px] bg-[#E23C3C]" />
                <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-sans font-medium tracking-wide">
                  Un <strong>biscuit</strong> es el bloque de PVC caliente antes de convertirse en música. Es la materia prima que, tras pasar por la prensa, se transforma en el vinilo que gira en tu tocadiscos. Pura pasión texturizada.
                </p>
              </div>

              {/* Columna Derecha: Imagen */}
              <div className="flex-1 relative h-64 md:h-full w-full">
                <img
                  src="/images/turntable.jpg"
                  alt="Biscuit Turntable"
                  className="w-full h-full object-cover filter grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#111112] via-transparent to-transparent z-10 pointer-events-none" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}