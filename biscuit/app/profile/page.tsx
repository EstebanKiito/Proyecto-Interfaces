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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-7xl mx-auto items-start">
        {/* COLUMNA IZQUIERDA: TITULO Y TOP RANKED     */}
        <div className="flex flex-col w-full mt-32 ">
          <h1 className="font-biscuit text-5xl xl:text-7xl text-[#ffffff]  uppercase m-0 p-0 leading-tight">
            {user.username}'s
          </h1>
          <h2 className="font-biscuit text-4xl xl:text-7xl text-[#E23C3C] tracking-wide uppercase leading-none mb-5">
            COLLECTION
          </h2>

          {/* Caja contenedora rojo oscuro (#8E0B0B) de los álbumes con más ranking */}
          <div className="bg-[#8E0B0B] px-3 rounded-[2rem] flex flex-col h-[26rem] overflow-hidden w-[32rem] ">
            {/* Header: Etiqueta TOP RATED alineada a la derecha */}
            <div className="flex justify-end pt-3">
              <span className="bg-[#470808] text-[#fdfdfd] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner ">
                TOP RATED
              </span>
            </div>

            {/* CONTENEDOR DE LA LISTA: Flex Columna */}
            <div className="flex flex-col w-full font-[family-name:var(--font-bayon)] px-6 py-2">
              {/* Tomamos solo los top 3 para que calce con tu idea de 3 filas */}
              {topRankedReviews.slice(0, 3).map((review, index) => {
                const albumDetail = albumsData.albums.items.find(
                  (item) => item.id === review.album_id,
                );

                return (
                  <div
                    key={review.id}
                    // flex-row, justify-between separa la info del álbum a la izquierda y el rating a la derecha.
                    // border-b y border-white/10 crean la línea separadora sutil.
                    // last:border-0 quita la línea del último elemento.
                    className="flex flex-row items-center justify-between py-2  last:border-0 hover:bg-black/10 transition-colors px-2 rounded-lg group"
                  >
                    {/* LADO IZQUIERDO: Posición, Portada, Título y Artista */}
                    <div className="flex items-center gap-4 overflow-hidden ">
                      {/* Indicador numérico */}

                      {/* Portada del Álbum (Cuadrada pequeña) */}
                      <img
                        src={
                          albumDetail?.images[0]?.url ||
                          "https://via.placeholder.com/150"
                        }
                        alt={albumDetail?.name || "Album Cover"}
                        className="w-24 h-24 object-cover  flex-shrink-0 shadow-md"
                      />

                      {/* Textos: Título y Artista */}
                      <div className="flex flex-col justify-center truncate mt-0 ">
                        <p className="font-[family-name:var(--font-bayon)] text-lg text-[#fdfdfd]/70 truncate">
                          {albumDetail?.artists[0]?.name || "Unknown Artist"}
                        </p>
                        <p className="font-[family-name:var(--font-bayon)] text-3xl text-[#fdfdfd] uppercase tracking-wide truncate leading-tight">
                          {albumDetail?.name || "Unknown Album"}
                        </p>
                      </div>
                    </div>

                    {/* LADO DERECHO: Calificación (Rating) */}
                    <div className="flex items-center gap-1 pl-4 flex-shrink-0">
                      <span className="font-[family:var(--font-bayon)] text-3xl text-white mr-8 w-4 text-center group-hover:text-white transition-colors">
                        #{index + 1}
                      </span>
                      <span className="font-[family:var(--font-bayon)] text-lg text-[#939090] tracking-wider">
                        {review.rating.toFixed(1)}
                      </span>
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
        <div className="flex flex-col gap-6 w-full mt-16">
          {/* Fila del Avatar (Imagen de Perfil superior con borde rojo) */}
          <div className="w-full flex justify-center lg:justify-center">
            <div className="w-72 h-72 xl:w-90 xl:h-90 rounded-full overflow-hidden border-6 border-[#a39999] shadow-xl bg-[#111112]">
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
            <div className="bg-[#111112] p-5 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="font-[family-name:var(--font-bayon)] text-lg text-[#ffffff] tracking-widest mb-2">
                  BIOGRAPHY
                </h3>
                <p className="font-[family-name:var(--font-neue)] text-sm font-medium text-zinc-400 leading-relaxed">
                  {user.bio}
                </p>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono tracking-wider block mt-4 uppercase">
                LOCATION: {user.location}
              </span>
            </div>

            {/* Caja de Stats Superiores (Reviews escritas y Favoritos en JSON) */}
            <div className="bg-[#111112] p-5 rounded-3xl grid grid-cols-2 gap-2 items-center text-center">
              <div className="border-r border-zinc-800 py-2">
                <p className="font-[family:var(--font-biscuit)] text-4xl text-[#ffffff] leading-none mb-1">
                  {userReviews.length}
                </p>
                <p className="font-[family:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  REVIEWS
                </p>
              </div>
              <div className="py-2">
                <p className="text-4xl text-[#ffffff] leading-none mb-1">
                  {user.favorite_albums.length}
                </p>
                <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  FAVORITES
                </p>
              </div>
            </div>
          </div>

          {/* Caja inferior ancha: Estadísticas globales de listas, followers y following */}
          <div className=" p-2  grid grid-cols-3 text-center shadow-md px-30">
            <div className="border-r border-zinc-800">
              <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-wider">
                {totalPlaylists}
              </p>
              <p className="font-[family-name:var(--font-bayon)] text-xs text-[#ffffff] tracking-widest">
                LISTS
              </p>
            </div>
            <div className="border-r border-zinc-800">
              <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-wider">
                {user.stats.followers}
              </p>
              <p className="font-[family-name:var(--font-bayon)] text-xs text-[#ffffff] tracking-widest">
                FOLLOWERS
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-wider">
                {user.stats.following}
              </p>
              <p className="font-[family-name:var(--font-bayon)] text-xs text-[#ffffff] tracking-widest">
                FOLLOWING
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
