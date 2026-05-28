"use client";
import React, { useState } from "react";
import Link from "next/link";

// 1. IMPORTACIÓN DE DATOS REALES DESDE TUS ARCHIVOS JSON
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";
import playlistsData from "@/data/playlists.json";
import RankingModal from "@/components/rankingModal";
import PlaylistModal from "@/components/playlistModal";
import noPhoto from "../../public/images/no-photo.jpg";

export default function ProfilePage() {
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  // Simulación de datos reales
  const user = currentUserData.users[0];
  const userReviews = reviewsData.reviews.filter(
    (review) => review.user_id === user.id,
  );

  // Ordenamos las reviews de mayor a menor  -> TOP RATED
  const sortedReviews = [...userReviews].sort((a, b) => b.rating - a.rating);
  const topRankedReviews = sortedReviews.slice(0, 6);

  const totalPlaylists = playlistsData.playlists.filter(
    (p) => p.owner_id === user.id,
  ).length;

  // Playlist del user
  const userPlaylists = playlistsData.playlists.filter(
    (p) => p.owner_id === user.id,
  );

  // Calculo carusel de Albumes
  // Crea la referencia para apuntar directamente al div que contiene los álbumes
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Función para desplazar el contenedor de forma suave
  const handleCarouselScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;

      // Calculamos el desplazamiento basado en el 75% del ancho de la pantalla actual
      // para mantener siempre el contexto visual del último álbum visto
      const scrollAmount = clientWidth * 0.75;

      const targetScroll =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <main
      id="main-page"
      className="bg-[#000000] min-h-screen text-white pt-24 pb-12 px-6 md:px-12 lg:px-24 selection:bg-[#E23C3C] selection:text-black"
    >
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
                    <Link
                      href={`/album/${review.album_id}`}
                      key={review.id}
                      className="flex flex-row items-center justify-between py-2 last:border-0 hover:bg-black/10 transition-colors px-2 rounded-lg group"
                    >
                      {/* LADO IZQUIERDO: Posición, Portada, Título y Artista */}
                      <div className="flex items-center gap-4 overflow-hidden ">
                        <img
                          src={albumDetail?.images[0]?.url || noPhoto.src}
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
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* BOTÓN VIEW ALL: Ahora vive afuera de la caja roja, centrado con mt-4 (margen superior) */}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsRankingModalOpen(true)}
                className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
              >
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
            <div className="w-72 h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-6 border-[#c9c9d2] shadow-xl bg-[#111112]">
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg";
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
                <p className=" text-sm font-medium text-zinc-400 leading-relaxed">
                  {user.bio}
                </p>
              </div>
              <span className="text-xs text-zinc-600 font-[family-name:var(--font-bayon)] tracking-wider block mt-4 uppercase">
                LOCATION: {user.location}
              </span>
            </div>

            {/* Caja de Stats Superiores (Reviews escritas y Favoritos en JSON) */}
            <div className="bg-[#111112] p-5 rounded-3xl grid grid-cols-2 gap-2 items-center text-center">
              <div className="border-r border-zinc-800 py-2">
                <p
                  onClick={() => setIsRankingModalOpen(true)}
                  className="font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C] leading-none mb-1 cursor-pointer"
                >
                  {userReviews.length}
                </p>
                <p
                  onClick={() => setIsRankingModalOpen(true)}
                  className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase cursor-pointer"
                >
                  REVIEWS
                </p>
              </div>
              <div className="py-2">
                <p
                  className="font-biscuit text-4xl text-[#ffffff] leading-none mb-1 cursor-pointer"
                  onClick={() => {
                    const section = document.getElementById("discover-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {user.favorite_albums.length}
                </p>
                <p
                  className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase cursor-pointer"
                  onClick={() => {
                    const section = document.getElementById("discover-section");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  FAVORITES
                </p>
              </div>
            </div>
          </div>

          {/* Caja inferior ancha: Estadísticas globales de listas, followers y following */}
          <div className=" p-2  grid grid-cols-3 text-center shadow-md px-30">
            <div className="border-r border-zinc-800">
              <p
                className="font-(family-name:--font-bayon) text-2xl text-white tracking-wider cursor-pointer"
                onClick={() => {
                  const section = document.getElementById("discover-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {totalPlaylists}
              </p>
              <p
                className="font-(family-name:--font-bayon) text-xs text-[#ffffff] tracking-widest cursor-pointer"
                onClick={() => {
                  const section = document.getElementById("discover-section");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
              >
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
      <div className="flex flex-col items-center font-(family-name:--font-bayon) text-sm text-[#939090] tracking-widest mt-2 uppercase">
        <div>DISCOVER COLLECTION</div>
        <button
          className="mt-1 bg-[#962828] hover:bg-[#470808] text-[#000000] font-[family-name:var(--font-bayon)] text-sm px-2 py-2 rounded-full uppercase tracking-widest shadow-inner mb-5 hover:text-white transition-colors cursor-pointer"
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

      {/* SECCIÓN DE DESCUBRIMIENTO: Favoritos del usuario y Playlists */}
      <section
        id="discover-section"
        className="min-h-screen flex mt-10 shadow-lg w-full"
      >
        <div className="mt-15 rounded-3xl shadow-lg flex flex-col w-full">
          <div className="font-biscuit text-6xl text-[#ffffff] tracking-wide uppercase leading-none ">
            MY
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="font-biscuit text-6xl text-[#E23C3C] tracking-wide uppercase leading-none ">
              COLLECTION
            </div>
            <div
              className="w-16 h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden border-2 border-[#c9c9d2] shadow-xl bg-[#111112] cursor-pointer hover:border-[#5f5656] transition-colors"
              onClick={() => {
                const section = document.getElementById("main-page");
                if (section) section.scrollIntoView({ behavior: "smooth" });
              }}
            >
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

          {/* CONTENEDOR RELATIVO MAESTRO DEL CARRUSEL (Permite fijar los botones encima) */}
          {/* La clase 'group' sirve para que las flechas solo aparezcan o brillen cuando el cursor entra aquí */}
          <div className="relative w-full group">
            {/* BOTÓN IZQUIERDO (Retroceder) */}
            <button
              onClick={() => handleCarouselScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#111112] border border-[#962828] text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all flex items-center justify-center shadow-2xl cursor-pointer"
              title="Retroceder"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* SECCIÓN DE LOS ALBUMES FAVORITOS CON LA REFERENCIA ASIGNADA */}
            {/* Agregamos 'ref={carouselRef}' y 'scroll-smooth'. Eliminamos barras toscas de navegación */}
            <div
              ref={carouselRef}
              className="h-[13rem] w-full flex items-center overflow-x-auto gap-6 scroll-smooth px-14 no-scrollbar"
              style={{ scrollbarWidth: "none" }} // Oculta la barra nativa en Firefox para mantener estética vintage
            >
              {user.favorite_albums.map((albumId) => {
                const album = albumsData.albums.items.find(
                  (item) => item.id === albumId,
                );

                if (!album) return null;

                return (
                  <Link
                    key={albumId}
                    className="w-36 group/item cursor-pointer shrink-0"
                    href={`/album/${albumId}`}
                  >
                    {/* Portada */}
                    <div className="w-36 h-36 overflow-hidden shadow-lg border-3 border-transparent group-hover/item:border-[#9c9c9c] transition-colors relative">
                      <img
                        src={album.images[0]?.url || noPhoto.src}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      />
                      {/* Título y Artista solo en hover */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                        <p className="font-[family-name:var(--font-bayon)] text-lg text-white tracking-wide truncate px-2 text-center w-full">
                          {album.name}
                        </p>
                        <p className="font-sans text-xs text-zinc-300 truncate px-2 text-center w-full">
                          {album.artists[0]?.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* BOTÓN DERECHO (Avanzar) */}
            <button
              onClick={() => handleCarouselScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#111112] border border-[#962828] text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all flex items-center justify-center shadow-2xl cursor-pointer"
              title="Avanzar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          <div>
            <div className="font-[family-name:var(--font-biscuit)] text-6xl text-[#E23C3C] tracking-wide uppercase leading-none justify-end flex  ">
              <div className="text-[#ffffff] mr-4">MY </div>
              PLAYLISTS
            </div>
          </div>

          {/* SECCIÓN DE LAS PLAYLISTS FAVORITAS */}
          <div className="shadow-lg w-full flex flex-col p-6 gap-4">
            {/* ELIMINADO el h-full de aquí para que las filas se junten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                key="1"
                className="relative bg-[#111112] p-6 rounded-[2rem] border border-[#111112] hover:border-[#E23C3C] transition-all duration-300 flex flex-col h-[16rem] w-[24rem] shadow-xl group cursor-pointer justify-center items-center"
              >
                <div className="flex flex-col items-center justify-center h-full w-full gap-2">
                  <button
                    className="w-12 h-12 bg-[#962828] hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer"
                    title="Añadir álbum a la playlist"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                  <h3 className="font-[family-name:var(--font-bayon)] uppercase truncate leading-none text-center text-sm text-[#939090] tracking-widest mt-2 uppercase">
                    ADD PLAYLIST
                  </h3>
                </div>
              </div>
              {userPlaylists.map((playlist) => (
                <div
                  onClick={() => setSelectedPlaylist(playlist)}
                  key={playlist.id}
                  className="relative bg-[#111112] p-6 rounded-[2rem] border border-[#111112] hover:border-[#E23C3C] transition-all duration-300 flex flex-col h-[16rem] w-[24rem] shadow-xl group cursor-pointer"
                >
                  <div className="w-full text-left">
                    <h3 className="font-[family-name:var(--font-bayon)] text-xl text-white   uppercase  leading-none text-center">
                      {playlist.title}
                    </h3>
                  </div>

                  {/* FOTOS AL MEDIO: Alineadas al centro vertical y horizontal con un máximo de 6 */}
                  <div className="flex flex-wrap items-center justify-center gap-4 my-auto max-w-[70%] mx-auto">
                    {playlist.items.slice(0, 6).map((albumId, index) => {
                      const albumDetail = albumsData.albums.items.find(
                        (a) => a.id === albumId,
                      );

                      return (
                        <div
                          key={index}
                          className="w-14 h-14 xl:w-16 xl:h-16 flex-shrink-0 overflow-hidden shadow-md transition-transform duration-300 group-hover:-translate-y-1"
                        >
                          <img
                            src={albumDetail?.images[0]?.url || noPhoto.src}
                            alt={albumDetail?.name || "Album cover"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* BOTÓN + : Circular y posicionado de forma fija en la esquina inferior derecha */}
                  <button
                    className="absolute bottom-6 right-6 w-12 h-12 bg-[#962828] hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer"
                    title="Añadir álbum a la playlist"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-black"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* MODAL DE RANKING COMPLETO */}
      {isRankingModalOpen && (
        <RankingModal
          isOpen={isRankingModalOpen}
          reviews={userReviews}
          albumsData={albumsData.albums.items}
          onClose={() => setIsRankingModalOpen(false)}
        />
      )}
      {/* MODAL DE PLAYLIST SELECCIONADA */}
      {selectedPlaylist && (
        <PlaylistModal
          usersData={currentUserData.users}
          playlist={selectedPlaylist}
          albumsData={albumsData.albums.items}
          isOpen={!!selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}
    </main>
  );
}
