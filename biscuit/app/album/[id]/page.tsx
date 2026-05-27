"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from '@/components/navbar';


// Importamos ambos JSON desde tu carpeta de datos
import albumsJson from "@/data/albums.json";
import tracksJson from "@/data/tracks.json";

// Función auxiliar para formatear los milisegundos a "M:SS"
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Number(((ms % 60000) / 1000).toFixed(0));
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function Album() {
  const params = useParams();
  const albumId = params.id as string;

  const albumData = albumsJson.albums.items.find((a) => a.id === albumId);
  const albumTracks = (tracksJson as Record<string, any>)[albumId]?.items || [];

  // --- ESTADOS DE LA UI Y DATOS LOCALES ---
  const [rating, setRating] = useState(0);
  const [activeActions, setActiveActions] = useState({
    reviewed: false,
    liked: false,
    listenlist: false, // Corregido de watchlist a listenlist para mantener consistencia
  });
  const [reviewText, setReviewText] = useState("");
  const [hasReview, setHasReview] = useState(false);

  // Estados para la puntuación de canciones (Track by Track)
  const [trackRatings, setTrackRatings] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  // --- LÓGICA DE LOCALSTORAGE ---
  // Se ejecuta al montar el componente para evitar errores de hidratación en Next.js
  useEffect(() => {
    // 1. Cargar reseñas previas del álbum
    const savedReviews = JSON.parse(localStorage.getItem("albumReviews") || "{}");
    if (savedReviews[albumId]) {
      setHasReview(true);
      setReviewText(savedReviews[albumId]);
      setActiveActions((prev) => ({ ...prev, reviewed: true }));
    }

    // 2. Cargar puntuaciones previas de las canciones
    const savedTrackRatings = JSON.parse(localStorage.getItem("trackRatings") || "{}");
    setTrackRatings(savedTrackRatings);
  }, [albumId]);

  // --- MANEJADORES DE EVENTOS ---
  const toggleAction = (action: keyof typeof activeActions) => {
    setActiveActions((prev) => ({ ...prev, [action]: !prev[action] }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardamos la reseña en localStorage
    const savedReviews = JSON.parse(localStorage.getItem("albumReviews") || "{}");
    savedReviews[albumId] = reviewText;
    localStorage.setItem("albumReviews", JSON.stringify(savedReviews));
    
    setHasReview(true);
    setActiveActions((prev) => ({ ...prev, reviewed: true }));
    console.log("Reseña guardada localmente:", reviewText);
  };

  const rateTrack = (score: number) => {
    if (!selectedTrack) return;
    const newRatings = { ...trackRatings, [selectedTrack.id]: score };
    
    setTrackRatings(newRatings);
    localStorage.setItem("trackRatings", JSON.stringify(newRatings));
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  // --- CÁLCULO DEL PROMEDIO ---
  // Filtramos las canciones de este álbum que ya tienen una puntuación asignada
  const albumTrackIds = albumTracks.map((t: any) => t.id);
  const ratedAlbumTracks = albumTrackIds.filter((id: string) => trackRatings[id] !== undefined);
  
  const averageRating = ratedAlbumTracks.length > 0
    ? (ratedAlbumTracks.reduce((sum: number, id: string) => sum + trackRatings[id], 0) / ratedAlbumTracks.length).toFixed(1)
    : null;

  // --- MANEJO DE ERRORES ---
  if (!albumData) {
    return (
      <main className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center font-sans gap-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-400">Álbum no encontrado</h1>
        <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest text-sm">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  // --- VARIABLES DINÁMICAS ---
  const albumTitle = albumData.name;
  const artistName = albumData.artists[0].name;
  const releaseYear = albumData.release_date.split("-")[0];
  const coverUrl = albumData.images[0].url;
  const totalTracks = albumData.total_tracks;
  const bandBannerUrl = albumData.images[0].url;

  return (
    <main className="relative min-h-screen bg-[#141414] text-white font-sans selection:bg-gray-700">
      

      {/* HEADER */}
      <header
        className="w-full h-64 md:h-80 bg-cover bg-center grayscale-[80%] opacity-50 border-b border-white/5"
        style={{ backgroundImage: `url(${bandBannerUrl})` }}
      />

      <Navbar />
      

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Fila del Título */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-10 mt-6">
          <div className="hidden md:block"></div>
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-gray-100">
              {albumTitle}
            </h1>
            <div className="flex items-center gap-4 text-sm md:text-base font-semibold uppercase tracking-wider text-gray-400">
              <span className="hover:text-white cursor-pointer transition-colors">{artistName}</span>
              <span>{releaseYear}</span>
              <span className="text-gray-600">•</span>
              <span>{totalTracks} Tracks</span>
            </div>
          </div>
          <div className="hidden md:block"></div>
        </div>

        {/* Columnas de Contenido */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-10 items-start pb-10">
          
          {/* COLUMNA IZQUIERDA (Portada) */}
          <aside className="relative md:-mt-40 z-20 flex flex-col gap-4">
            <img
              src={coverUrl}
              alt={`Cover of ${albumTitle}`}
              className="w-full aspect-square object-cover rounded-md shadow-2xl border border-white/10"
            />
          </aside>

          {/* COLUMNA CENTRAL (Tracklist Real) */}
          <section className="bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-lg shadow-xl border border-white/5 overflow-hidden">
            <div className="flex flex-col">
              {albumTracks.length > 0 ? (
                albumTracks.map((track: any) => (
                  <div 
                    key={track.id} 
                    className="flex items-center justify-between py-3 px-6 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 text-xs font-mono w-4 text-right">
                        {track.track_number}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors">
                          {track.name}
                        </span>
                        <span className="text-gray-500 text-[10px] uppercase flex items-center gap-1">
                          {track.artists[0]?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-xs font-mono">
                        {formatDuration(track.duration_ms)}
                      </span>
                      
                      {/* BOTÓN PARA PUNTEAR CANCIÓN */}
                      <button
                        onClick={() => { setSelectedTrack(track); setIsModalOpen(true); }}
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors border ${
                          trackRatings[track.id] 
                            ? "bg-blue-600/20 text-blue-400 border-blue-500/30" 
                            : "bg-[#222] text-gray-500 border-white/5 hover:text-white hover:bg-[#333]"
                        }`}
                        title="Rate Track"
                      >
                        {trackRatings[track.id] ? trackRatings[track.id] : "+"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 text-xs uppercase tracking-widest">
                  Tracklist no disponible
                </div>
              )}
            </div>
          </section>

          {/* COLUMNA DERECHA (Panel de Interacción) */}
          <aside className="bg-[#111111] text-gray-200 rounded-lg shadow-2xl overflow-hidden flex flex-col border border-white/10">
            <div className="flex justify-around p-4 border-b border-white/10 bg-[#161616]">
              {["reviewed", "liked", "listenlist"].map((action) => (
                <button
                  key={action}
                  onClick={() => toggleAction(action as keyof typeof activeActions)}
                  className={`flex flex-col items-center gap-2 transition-colors ${
                    activeActions[action as keyof typeof activeActions] 
                      ? "text-blue-400" 
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${
                    activeActions[action as keyof typeof activeActions] ? "bg-blue-500/20 text-blue-400" : "bg-[#222] text-gray-600"
                  }`}>
                    <span className="text-xs">●</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-widest">
                    {action}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-6 flex flex-col items-center gap-4 bg-[#111]">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  Rate the whole album
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-all active:scale-90 ${
                        star <= rating 
                          ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]" 
                          : "text-gray-800 hover:text-gray-600"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* MOSTRADOR DEL PROMEDIO DE CANCIONES */}
              {averageRating && (
                <div className="flex flex-col items-center pt-4 border-t border-white/10 w-full">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
                    Track Average
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{averageRating}</span>
                    <span className="text-xs text-gray-500 font-bold">/ 10</span>
                  </div>
                  <span className="text-[9px] text-gray-600 uppercase mt-1">
                    Based on {ratedAlbumTracks.length} tracks
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col text-xs font-medium border-t border-white/10 text-gray-400 bg-[#161616]">
              <button className="py-3 hover:bg-white/5 border-b border-white/10 transition-colors hover:text-white">
                Show your activity
              </button>
              
              {/* CAMBIO DINÁMICO DEL TEXTO LOG */}
              <button className="py-3 hover:bg-white/5 border-b border-white/10 transition-colors hover:text-white">
                {hasReview ? "Log again / edit review..." : "Log / Add review..."}
              </button>
              
              <button className="py-3 hover:bg-white/5 transition-colors hover:text-white">
                Add to lists...
              </button>
            </div>
          </aside>
        </div>

        {/* SECCIÓN DE REVIEWS */}
        <section className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-10 items-start pb-20">
          <div className="hidden md:block"></div>
          
          <div className="bg-[#111111] rounded-lg shadow-xl border border-white/10 p-6">
            <h2 className="text-lg font-bold uppercase tracking-wide text-gray-200 mb-4 border-b border-white/5 pb-2">
              {hasReview ? "Edit your Review" : "Add a Review"}
            </h2>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`What did you think of ${albumTitle}?`}
                rows={4}
                className="w-full bg-[#1c1c1c] text-gray-200 border border-white/5 rounded-md p-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-[#222] transition-colors resize-none placeholder:text-gray-600"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  {reviewText.length} Characters
                </span>
                <button
                  type="submit"
                  disabled={reviewText.trim().length === 0}
                  className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-blue-600/20 disabled:hover:text-blue-400 px-6 py-2 rounded-md font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  {hasReview ? "Update Review" : "Post Review"}
                </button>
              </div>
            </form>
          </div>
          <div className="hidden md:block"></div>
        </section>
      </div>

      {/* MODAL PARA PUNTEAR CANCIÓN (1-10) */}
      {isModalOpen && selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-lg shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-center">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">
                Rate Track
              </h3>
              <p className="text-white font-medium text-lg">
                {selectedTrack.name}
              </p>
            </div>
            
            <div className="grid grid-cols-5 gap-3 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  onClick={() => rateTrack(num)}
                  className={`h-12 rounded-md border transition-all font-mono font-bold text-lg ${
                    trackRatings[selectedTrack.id] === num
                      ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                      : "bg-[#222] text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => { setIsModalOpen(false); setSelectedTrack(null); }}
              className="mt-2 text-xs uppercase tracking-widest font-bold text-gray-500 hover:text-white transition-colors px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}