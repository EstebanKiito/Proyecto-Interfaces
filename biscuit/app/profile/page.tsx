"use client";
import React from "react";

// 1. IMPORTACIÓN DE DATOS REALES DESDE TUS ARCHIVOS JSON
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";
import playlistsData from "@/data/playlists.json";

export default function ProfilePage() {
  // Obtenemos el usuario principal del archivo JSON
  const user = currentUserData.users[0];

  // Filtramos las reviews que pertenecen a este usuario específico
  const userReviews = reviewsData.reviews.filter(
    (review) => review.user_id === user.id,
  );

  // Ordenamos las reviews de mayor a menor puntuación (Ranking) para la sección izquierda
  const sortedReviews = [...userReviews].sort((a, b) => b.rating - a.rating);

  // Tomamos los 6 elementos con mayor ranking para la grilla de 3 filas x 2 columnas
  const topRankedReviews = sortedReviews.slice(0, 6);

  // Calculamos la cantidad total de playlists de este usuario
  const totalPlaylists = playlistsData.playlists.filter(
    (p) => p.owner_id === user.id,
  ).length;

  return (
    <main className="bg-[#000000] min-h-screen text-white pt-28 pb-12 px-6 md:px-12 lg:px-24 selection:bg-[#E23C3C] selection:text-black">
      {/* GRILLA PRINCIPAL DE 2 COLUMNAS (IZQUIERDA Y DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-start">
        {/* ========================================== */}
        {/* COLUMNA IZQUIERDA: TITULO Y TOP RANKED     */}
        {/* ========================================== */}
        <div className="flex flex-col gap-6 w-full">
          {/* Título Principal usando la fuente Monoton (var(--font-biscuit)) */}
          <h1 className="font-biscuit text-4xl xl:text-6xl text-[#E23C3C] tracking-wide uppercase leading-none break-words">
            {user.username} COLLECTIONS
          </h1>

          {/* Caja contenedora gris oscuro (#111112) de los álbumes con más ranking */}
          <div className="bg-[#111112] p-6 rounded-none border border-zinc-900 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-3">
              <h2 className="font-[family-name:var(--font-bayon)] text-2xl text-[#E23C3C] tracking-widest">
                TOP RATED ALBUMS
              </h2>
              <span className="bg-[#8E0B0B] text-black font-[family-name:var(--font-bayon)] text-xs px-3 py-1 uppercase tracking-wider">
                HIGHEST RANK
              </span>
            </div>

            {/* GRILLA INTERNA: 3 FILAS Y 2 COLUMNAS (Para los 6 elementos mapeados) */}
            <div className="grid grid-cols-2 grid-rows-3 gap-4">
              {topRankedReviews.map((review, index) => {
                // Buscamos los detalles visuales del álbum coincidiendo el ID
                const albumDetail = albumsData.albums.items.find(
                  (item) => item.id === review.album_id,
                );

                return (
                  <div
                    key={review.id}
                    className="bg-black/50 border border-zinc-800 p-3 flex gap-3 items-center hover:border-[#E23C3C] transition-colors group"
                  >
                    {/* Indicador numérico de posición */}
                    <span className="font-[family:var(--font-biscuit)] text-xl text-[#8E0B0B] group-hover:text-[#E23C3C] transition-colors w-6 text-center">
                      {index + 1}
                    </span>

                    {/* Portada del Álbum */}
                    <img
                      src={
                        albumDetail?.images[0]?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={albumDetail?.name || "Album Cover"}
                      className="w-16 h-16 object-cover flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300"
                    />

                    {/* Información del Álbum y Nota */}
                    <div className="overflow-hidden flex flex-col justify-center">
                      <p className="font-[family:var(--font-bayon)] text-base text-zinc-100 truncate tracking-wider leading-tight">
                        {albumDetail?.name || "Unknown Album"}
                      </p>
                      <p className="font-sans text-xs text-zinc-500 truncate mb-1">
                        {albumDetail?.artists[0]?.name || "Unknown Artist"}
                      </p>
                      <p className="font-[family:var(--font-bayon)] text-xs text-[#E23C3C] tracking-widest">
                        RATING: {review.rating} / 10
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMNA DERECHA: AVATAR, BIO Y ESTADÍSTICAS*/}
        {/* ========================================== */}
        <div className="flex flex-col gap-6 w-full">
          {/* Fila del Avatar (Imagen de Perfil superior con borde rojo) */}
          <div className="w-full flex justify-center lg:justify-center">
            <div className="w-72 h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-6 border-[#a39999] shadow-xl bg-[#111112]">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500";
                }}
              />
            </div>
          </div>

          {/* Sub-grilla intermedia: 2 columnas (Biography a la izquierda, Stats arriba a la derecha) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Caja de Biografía */}
            <div className="bg-[#111112] p-5 border border-zinc-900 flex flex-col justify-between">
              <div>
                <h3 className="font-[family:var(--font-bayon)] text-lg text-[#E23C3C] tracking-widest mb-2">
                  BIOGRAPHY
                </h3>
                <p className="font-sans text-sm font-medium text-zinc-400 leading-relaxed">
                  {user.bio}
                </p>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono tracking-wider block mt-4 uppercase">
                LOCATION: {user.location}
              </span>
            </div>

            {/* Caja de Stats Superiores (Reviews escritas y Favoritos en JSON) */}
            <div className="bg-[#111112] p-5 border border-zinc-900 grid grid-cols-2 gap-2 items-center text-center">
              <div className="border-r border-zinc-800 py-2">
                <p className="font-[family:var(--font-biscuit)] text-4xl text-[#E23C3C] leading-none mb-1">
                  {userReviews.length}
                </p>
                <p className="font-[family:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  REVIEWS
                </p>
              </div>
              <div className="py-2">
                <p className="font-[family:var(--font-biscuit)] text-4xl text-[#E23C3C] leading-none mb-1">
                  {user.favorite_albums.length}
                </p>
                <p className="font-[family:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  FAVORITES
                </p>
              </div>
            </div>
          </div>

          {/* Caja inferior ancha: Estadísticas globales de listas, followers y following */}
          <div className="bg-[#111112] p-4 border border-zinc-900 grid grid-cols-3 text-center shadow-md">
            <div className="border-r border-zinc-800">
              <p className="font-[family:var(--font-bayon)] text-2xl text-white tracking-wider">
                {totalPlaylists}
              </p>
              <p className="font-[family:var(--font-bayon)] text-xs text-[#E23C3C] tracking-widest">
                LISTS
              </p>
            </div>
            <div className="border-r border-zinc-800">
              <p className="font-[family:var(--font-bayon)] text-2xl text-white tracking-wider">
                {user.stats.followers}
              </p>
              <p className="font-[family:var(--font-bayon)] text-xs text-[#E23C3C] tracking-widest">
                FOLLOWERS
              </p>
            </div>
            <div>
              <p className="font-[family:var(--font-bayon)] text-2xl text-white tracking-wider">
                {user.stats.following}
              </p>
              <p className="font-[family:var(--font-bayon)] text-xs text-[#E23C3C] tracking-widest">
                FOLLOWING
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
