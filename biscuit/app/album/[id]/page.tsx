"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

// Importamos los JSON desde tu carpeta de datos
import albumsJson from "@/data/albums.json";
import tracksJson from "@/data/tracks.json";
import reviewsJson from "@/data/reviews.json";
import playlistsJson from "@/data/playlists.json"; // <-- Añadido

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
    listenlist: false,
  });
  const [reviewText, setReviewText] = useState("");
  const [hasReview, setHasReview] = useState(false);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [trackRatings, setTrackRatings] = useState<Record<string, number>>({});
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  // --- NUEVOS ESTADOS PARA PLAYLISTS ---
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [localPlaylists, setLocalPlaylists] = useState<Record<string, string[]>>({});
  const userPlaylists = playlistsJson.playlists.filter((p) => p.owner_id === "usr_01");

  // --- LÓGICA HÍBRIDA MEJORADA (JSON + LOCALSTORAGE) ---
  useEffect(() => {
    // 1. Reseñas
    const jsonReview = reviewsJson.reviews.find(
      (r) => r.album_id === albumId && r.user_id === "usr_01"
    );
    const savedReviews = JSON.parse(localStorage.getItem("albumReviews") || "{}");
    const localReview = savedReviews[albumId];

    let finalRating = jsonReview ? jsonReview.rating : 0;
    let finalText = jsonReview ? jsonReview.review_text : "";
    let isReviewed = !!jsonReview;

    if (localReview) {
      isReviewed = true;
      if (typeof localReview === "string") {
        finalText = localReview;
      } else {
        finalText = localReview.review_text !== undefined ? localReview.review_text : finalText;
        finalRating = localReview.rating !== undefined ? localReview.rating : finalRating;
      }
    }

    setReviewText(finalText);
    setRating(finalRating);
    
    if (isReviewed) {
      setHasReview(true);
      setActiveActions((prev) => ({ 
        ...prev, 
        reviewed: true,
        liked: jsonReview?.likes ? true : prev.liked 
      }));
    }

    // 2. Canciones
    const savedTrackRatings = JSON.parse(localStorage.getItem("trackRatings") || "{}");
    setTrackRatings(savedTrackRatings);

    // 3. Playlists (Cargar lo que el usuario ha modificado localmente)
    const savedPlaylists = JSON.parse(localStorage.getItem("playlistItems") || "{}");
    setLocalPlaylists(savedPlaylists);

  }, [albumId]);

  // --- MANEJADORES DE EVENTOS ---
  const toggleAction = (action: keyof typeof activeActions) => {
    setActiveActions((prev) => ({ ...prev, [action]: !prev[action] }));
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    const savedReviews = JSON.parse(localStorage.getItem("albumReviews") || "{}");
    const currentLocal = savedReviews[albumId];
    
    let currentText = reviewText;
    if (currentLocal && typeof currentLocal === "object") {
      currentText = currentLocal.review_text || reviewText;
    } else if (typeof currentLocal === "string") {
      currentText = currentLocal;
    }

    savedReviews[albumId] = { review_text: currentText, rating: newRating };
    localStorage.setItem("albumReviews", JSON.stringify(savedReviews));
    setHasReview(true);
    setActiveActions((prev) => ({ ...prev, reviewed: true }));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedReviews = JSON.parse(localStorage.getItem("albumReviews") || "{}");
    savedReviews[albumId] = { review_text: reviewText, rating: rating };
    localStorage.setItem("albumReviews", JSON.stringify(savedReviews));
    setHasReview(true);
    setActiveActions((prev) => ({ ...prev, reviewed: true }));
    setIsReviewModalOpen(false);
  };

  const rateTrack = (score: number) => {
    if (!selectedTrack) return;
    const newRatings = { ...trackRatings, [selectedTrack.id]: score };
    setTrackRatings(newRatings);
    localStorage.setItem("trackRatings", JSON.stringify(newRatings));
    setIsTrackModalOpen(false);
    setSelectedTrack(null);
  };

  // NUEVO: Función para agregar/quitar el disco de una playlist
  const handleTogglePlaylist = (playlistId: string) => {
    // Busca si ya editamos esta lista localmente, o toma la base del JSON
    const currentItems = localPlaylists[playlistId] || 
      userPlaylists.find(p => p.id === playlistId)?.items || [];

    let newItems;
    if (currentItems.includes(albumId)) {
      // Si ya estaba, lo quitamos
      newItems = currentItems.filter(id => id !== albumId);
    } else {
      // Si no estaba, lo añadimos al final
      newItems = [...currentItems, albumId];
    }

    // Actualizamos el estado y el localStorage
    const updatedPlaylists = { ...localPlaylists, [playlistId]: newItems };
    setLocalPlaylists(updatedPlaylists);
    localStorage.setItem("playlistItems", JSON.stringify(updatedPlaylists));
  };

  const albumTrackIds = albumTracks.map((t: any) => t.id);
  const ratedAlbumTracks = albumTrackIds.filter((id: string) => trackRatings[id] !== undefined);
  const averageRating = ratedAlbumTracks.length > 0
    ? (ratedAlbumTracks.reduce((sum: number, id: string) => sum + trackRatings[id], 0) / ratedAlbumTracks.length).toFixed(1)
    : null;

  if (!albumData) {
    return (
      <main className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center font-sans gap-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#939090]">Álbum no encontrado</h1>
        <Link href="/" className="text-[#E23C3C] hover:text-[#E23C3C]/80 transition-colors uppercase tracking-widest text-sm">
          ← Volver al inicio
        </Link>
      </main>
    );
  }

  const albumTitle = albumData.name;
  const artistName = albumData.artists[0].name;
  const releaseYear = albumData.release_date.split("-")[0];
  const coverUrl = albumData.images[0].url;
  const totalTracks = albumData.total_tracks;
  const bandBannerUrl = albumData.images[0].url;

  return (
    <main className="relative min-h-screen bg-[#141414] text-white selection:bg-gray-700 pb-20">
      
      {/* HEADER */}
      <header
        className="w-full h-64 md:h-80 bg-cover bg-center grayscale-[80%] opacity-50 border-b border-white/5"
        style={{ backgroundImage: `url(${bandBannerUrl})` }}
      />      

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-10 mt-6">
          <div className="hidden md:block"></div>
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-bayon)] uppercase tracking-wide text-gray-100">
              {albumTitle}
            </h1>
            <div className="flex items-center gap-4 text-sm md:text-base font-semibold uppercase tracking-wider text-[#939090]">
              <span className="hover:text-white cursor-pointer transition-colors font-[family-name:var(--font-bayon)]">{artistName}</span>
              <span>{releaseYear}</span>
            </div>
          </div>
          <div className="hidden md:block"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] gap-10 items-start">
          <aside className="relative md:-mt-40 z-20 flex flex-col gap-4">
            <img src={coverUrl} alt={`Cover of ${albumTitle}`} className="w-full aspect-square object-cover rounded-md shadow-2xl border border-white/10" />
          </aside>

          <div className="flex flex-col gap-8 w-full">
            <section className="bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a] rounded-lg shadow-xl border border-white/5 overflow-hidden">
              <div className="flex flex-col">
                {albumTracks.length > 0 ? (
                  albumTracks.map((track: any) => (
                    <div key={track.id} className="flex items-center justify-between py-3 px-6 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                      <div className="flex items-center gap-4">
                        <span className="text-[#939090] text-xs font-mono w-4 text-right">{track.track_number}</span>
                        <div className="flex flex-col">
                          <span className="text-gray-200 text-sm font-medium font-[family-name:var(--font-bayon)] group-hover:text-white transition-colors">{track.name}</span>
                          <span className="text-[#939090] text-[10px] uppercase flex items-center gap-1">{track.artists[0]?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[#939090] text-xs font-mono">{formatDuration(track.duration_ms)}</span>
                        <button
                          onClick={() => { setSelectedTrack(track); setIsTrackModalOpen(true); }}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors border ${
                            trackRatings[track.id] ? "bg-[#470808] text-[#E23C3C] border-[#962828]" : "bg-[#222] text-[#939090] border-white/5 hover:text-white hover:bg-[#333]"
                          }`}
                          title="Rate Track"
                        >
                          {trackRatings[track.id] ? trackRatings[track.id] : "+"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[#939090] text-xs uppercase tracking-widest">Tracklist no disponible</div>
                )}
              </div>
            </section>

            {hasReview && reviewText && (
              <section className="bg-[#111111] rounded-lg shadow-xl border border-white/10 p-6 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#E23C3C]"></div>
                <h3 className="text-[#939090] text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <span className="text-[#E23C3C] text-sm">✎</span> My Review
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed italic whitespace-pre-wrap pl-2">"{reviewText}"</p>
              </section>
            )}
          </div>

          <aside className="bg-[#111111] text-gray-200 rounded-lg shadow-2xl overflow-hidden flex flex-col border border-white/10">
            <div className="flex justify-around p-4 border-b border-white/10 bg-[#161616]">
              {["reviewed", "liked", "listenlist"].map((action) => (
                <button
                  key={action}
                  onClick={() => toggleAction(action as keyof typeof activeActions)}
                  className={`flex flex-col items-center gap-2 transition-colors ${activeActions[action as keyof typeof activeActions] ? "text-[#E23C3C]" : "text-[#939090] hover:text-gray-300"}`}
                >
                  <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center ${activeActions[action as keyof typeof activeActions] ? "bg-[#8E0B0B]/40 text-[#E23C3C]" : "bg-[#222] text-[#939090]"}`}>
                    <span className="text-xs">●</span>
                  </div>
                  <span className="text-[9px] uppercase font-bold tracking-widest">{action}</span>
                </button>
              ))}
            </div>

            <div className="p-6 flex flex-col items-center gap-4 bg-[#111]">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#939090]">Rate the whole album</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(star)}
                      className={`text-2xl transition-all active:scale-90 ${star <= rating ? "text-[#E23C3C] drop-shadow-[0_0_8px_rgba(226,60,60,0.4)]" : "text-[#939090] hover:text-gray-600"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {averageRating && (
                <div className="flex flex-col items-center pt-4 border-t border-white/10 w-full">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#939090] mb-1">Track Average</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{averageRating}</span>
                    <span className="text-xs text-[#939090] font-bold">/ 10</span>
                  </div>
                  <span className="text-[9px] text-[#939090] uppercase mt-1">Based on {ratedAlbumTracks.length} tracks</span>
                </div>
              )}
            </div>

            <div className="flex flex-col text-xs font-medium border-t border-white/10 text-[#939090] bg-[#161616]">
              <button className="py-3 hover:bg-white/5 border-b border-white/10 transition-colors hover:text-white">Show your activity</button>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="py-3 hover:bg-white/5 border-b border-white/10 transition-colors text-[#E23C3C] hover:text-[#E23C3C]/80 bg-[#470808]/50 hover:bg-[#8E0B0B]/50"
              >
                {hasReview ? "Edit review..." : "Log / Add review..."}
              </button>
              {/* BOTÓN CONECTADO AL NUEVO MODAL DE PLAYLIST */}
              <button 
                onClick={() => setIsPlaylistModalOpen(true)}
                className="py-3 hover:bg-white/5 transition-colors hover:text-white"
              >
                Add to lists...
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ========================================= */}
      {/* MODAL 1: RESEÑA DE ÁLBUM                  */}
      {/* ========================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-xl shadow-2xl flex flex-col gap-6 w-full max-w-3xl relative animate-in fade-in duration-200">
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-5 text-[#939090] hover:text-white transition-colors text-xl font-bold">✕</button>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <img src={coverUrl} alt={albumTitle} className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-md shadow-lg border border-white/10" />
              <div className="flex flex-col items-center flex-1 text-center mt-2">
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white mb-6">{albumTitle}</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#939090] mb-2">Agrega tu calificación</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className={`text-3xl transition-all active:scale-90 ${star <= rating ? "text-[#E23C3C] drop-shadow-[0_0_8px_rgba(226,60,60,0.4)]" : "text-gray-800 hover:text-[#939090]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center mt-2 w-32">
                <span className="text-[12px] uppercase font-bold tracking-widest text-[#939090] mb-2">Like</span>
                <button type="button" onClick={() => toggleAction("liked")} className="transition-transform active:scale-90">
                  <svg className={`w-12 h-12 ${activeActions.liked ? "text-[#E23C3C] drop-shadow-[0_0_15px_rgba(226,60,60,0.5)]" : "text-[#222] hover:text-gray-700"} transition-colors`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 mt-2">
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Escribe una reseña..." rows={5} className="w-full bg-[#161616] text-gray-200 border border-white/5 rounded-md p-5 text-sm focus:outline-none focus:border-[#E23C3C]/50 focus:bg-[#1a1a1a] transition-colors resize-none placeholder:text-[#939090]" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-[#939090] uppercase tracking-widest font-bold">{reviewText.length} Caracteres</span>
                <button type="submit" disabled={reviewText.trim().length === 0} className="bg-[#470808] text-[#E23C3C] border border-[#962828] hover:bg-[#8E0B0B] hover:text-white disabled:opacity-50 disabled:hover:bg-[#470808] px-8 py-3 rounded-md font-bold uppercase tracking-wider text-xs transition-colors">
                  {hasReview ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 2: PUNTEAR CANCIÓN                  */}
      {/* ========================================= */}
      {isTrackModalOpen && selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111] border border-white/10 p-6 rounded-lg shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-center">
              <h3 className="text-[#939090] text-xs uppercase tracking-widest font-bold mb-1">Rate Track</h3>
              <p className="text-white font-medium text-lg">{selectedTrack.name}</p>
            </div>
            <div className="grid grid-cols-5 gap-3 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button key={num} onClick={() => rateTrack(num)} className={`h-12 rounded-md border transition-all font-mono font-bold text-lg ${trackRatings[selectedTrack.id] === num ? "bg-[#8E0B0B] text-white border-[#E23C3C] shadow-[0_0_15px_rgba(226,60,60,0.5)]" : "bg-[#222] text-[#939090] border-white/5 hover:bg-white/10 hover:text-white"}`}>
                  {num}
                </button>
              ))}
            </div>
            <button onClick={() => { setIsTrackModalOpen(false); setSelectedTrack(null); }} className="mt-2 text-xs uppercase tracking-widest font-bold text-[#939090] hover:text-white transition-colors px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL 3: AÑADIR A PLAYLIST                */}
      {/* ========================================= */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#111112] border border-zinc-800 p-6 rounded-[2rem] shadow-2xl flex flex-col gap-6 w-full max-w-md relative animate-in fade-in duration-200">
            <button
              onClick={() => setIsPlaylistModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-xl font-bold"
            >
              ✕
            </button>
            <div className="text-center border-b border-zinc-900 pb-4">
              <h3 className="text-3xl font-[family-name:var(--font-bayon)] uppercase tracking-widest text-[#E23C3C] mb-1">
                ADD TO LIST
              </h3>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">
                {albumTitle}
              </p>
            </div>
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {userPlaylists.map(playlist => {
                const currentItems = localPlaylists[playlist.id] || playlist.items;
                const isInPlaylist = currentItems.includes(albumId);
                
                return (
                  <button
                    key={playlist.id}
                    onClick={() => handleTogglePlaylist(playlist.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isInPlaylist
                        ? "bg-[#8E0B0B]/30 border-[#E23C3C] text-white"
                        : "bg-black/30 border-zinc-800 hover:border-zinc-500 text-zinc-300"
                    }`}
                  >
                    <span className="font-[family-name:var(--font-bayon)] text-xl tracking-wider uppercase">
                      {playlist.title}
                    </span>
                    {isInPlaylist ? (
                      <svg className="w-6 h-6 text-[#E23C3C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}