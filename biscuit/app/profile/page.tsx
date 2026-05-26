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
    <main className="bg-[#000000] min-h-screen text-white pt-24 pb-12 px-6 md:px-12 lg:px-24 selection:bg-[#E23C3C] selection:text-black">
      {/* GRILLA PRINCIPAL DE 2 COLUMNAS (IZQUIERDA Y DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 max-w-6xl mx-auto items-start">
        {/* COLUMNA IZQUIERDA: TITULO Y TOP RANKED     */}
        <div className="flex flex-col w-full mt-10">
          <h1 className="font-biscuit text-5xl xl:text-7xl text-[#ffffff] uppercase m-0 p-0 leading-tight">
            {user.username}'s
          </h1>
          <h2 className="font-biscuit text-4xl xl:text-7xl text-[#E23C3C] tracking-wide uppercase leading-none mb-5">
            COLLECTION
          </h2>

          {/* NUEVO ENVOLTORIO: Agrupa la caja y el botón. Fija el ancho a 30rem aquí */}
          <div className="flex flex-col w-[30rem]">
            {/* Caja contenedora rojo oscuro (#8E0B0B) */}
            {/* Nota: Cambié w-[30rem] a w-full, porque ahora hereda el tamaño del envoltorio padre */}
            <div className="relative bg-[#8E0B0B] px-3 rounded-[1.5rem] flex flex-col h-[22rem] overflow-hidden w-full">
              <span className="absolute top-2 right-2 z-10 bg-[#470808] text-[#fdfdfd] font-[family-name:var(--font-bayon)] text-sm px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
                TOP RATED
              </span>
              {/* CONTENEDOR DE LA LISTA: Flex Columna */}
              <div className="flex flex-col w-full font-[family-name:var(--font-bayon)] px-4 py-4">
                {topRankedReviews.slice(0, 3).map((review, index) => {
                  const albumDetail = albumsData.albums.items.find(
                    (item) => item.id === review.album_id,
                  );

                  return (
                    <div
                      key={review.id}
                      className="flex flex-row items-center justify-between py-2 last:border-0 hover:bg-black/10 transition-colors px-2 rounded-lg group"
                    >
                      {/* LADO IZQUIERDO: Posición, Portada, Título y Artista */}
                      <div className="flex items-center gap-4 overflow-hidden ">
                        <img
                          src={
                            albumDetail?.images[0]?.url ||
                            "https://via.placeholder.com/150"
                          }
                          alt={albumDetail?.name || "Album Cover"}
                          className="w-22 h-22 object-cover flex-shrink-0 shadow-md"
                        />

                        <div className="flex flex-col justify-center truncate">
                          <p className="font-[family-name:var(--font-bayon)] text-sm text-[#fdfdfd]/70 truncate">
                            {albumDetail?.artists[0]?.name || "Unknown Artist"}
                          </p>
                          <p className="font-[family-name:var(--font-bayon)] text-[1.5rem] text-[#fdfdfd] uppercase tracking-wide truncate leading-tight">
                            {albumDetail?.name || "Unknown Album"}
                          </p>
                        </div>
                      </div>

                      {/* LADO DERECHO: Calificación (Rating) */}
                      <div className="flex items-center gap-1 pl-4 flex-shrink-0">
                        <span className="font-[family:var(--font-bayon)] text-2xl text-white mr-8 w-4 text-center group-hover:text-white transition-colors">
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

            {/* BOTÓN VIEW ALL: Ahora vive afuera de la caja roja, centrado con mt-4 (margen superior) */}
            <div className="flex justify-center mt-4">
              <button className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer">
                VIEW ALL
              </button>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUMNA DERECHA: AVATAR, BIO Y ESTADÍSTICAS*/}
        {/* ========================================== */}
        <div className="flex flex-col gap-4">
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
      <div className="flex flex-col items-center font-[family-name:var(--font-bayon)] text-sm text-[#939090] tracking-widest mt-2 uppercase">
        <div>DISCOVER COLLECTION</div>
        <button
          className="mt-1 bg-[#8E0B0B] hover:bg-[#470808] text-[#000000] font-[family-name:var(--font-bayon)] text-sm px-2 py-2 rounded-full uppercase tracking-widest shadow-inner mb-5 hover:text-white transition-colors cursor-pointer"
          onClick={() => {
            const section = document.getElementById("discover-section");
            if (section) section.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </div>

      {/* NUEVA SECCIÓN DE PANTALLA COMPLETA CON FONDO BLANCO */}
      <section
        id="discover-section"
        className=" min-h-screen bg-[#111112] flex   mt-20 rounded-3xl shadow-lg"
      >
        <div className="mt-20 bg-[#40404b]  rounded-3xl shadow-lg flex flex-col  w-full">
          <div className="font-biscuit text-5xl text-[#ffffff] tracking-wide uppercase leading-none ">
            MY
          </div>
          <div className="flex items-center gap-6 ">
            <div className="font-biscuit text-6xl text-[#E23C3C] tracking-wide uppercase leading-none ">
              COLLECTION
            </div>
            <div className=" w-16 h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden border-3 border-[#a39999] shadow-xl bg-[#111112] ">
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
          <div className="bg-[#525287] rounded-3xl shadow-lg  h-[24rem] w-full flex items-center ">
            Seccion de los albums favoritos
          </div>
          <div>
            <div className="font-biscuit text-6xl mt-4 mb-4 text-[#E23C3C] tracking-wide uppercase leading-none justify-end flex">
              PLAYLISTS
            </div>
          </div>
          <div className="bg-[#525287] rounded-3xl shadow-lg  h-full w-full flex items-center justify-center">
            Seccion de las playlists favoritas
          </div>
        </div>
      </section>
    </main>
  );
}
