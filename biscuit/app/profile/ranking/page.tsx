import React from "react";
import Link from "next/link";

// 1. Importamos la data
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";

export default function RankingPage() {
  // 2. Filtramos la data del usuario actual
  const user = currentUserData.users[0];

  // Reseñas del usuario
  const userReviews = reviewsData.reviews.filter(
    (review) => review.user_id === user.id,
  );

  // Ordenamos y sacamos solo el TOP 5
  const top5Reviews = [...userReviews]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // 3. Combinamos Favoritos + Reseñados sin repetir IDs (Set)
  const collectionIds = Array.from(
    new Set([...user.favorite_albums, ...userReviews.map((r) => r.album_id)]),
  );

  return (
    <main className="min-h-screen bg-[#000000] pt-32 pb-12 px-6 md:px-12 lg:px-24 text-white">
      {/* HEADER DE LA VISTA */}
      <div className="max-w-7xl mx-auto flex justify-between items-end border-b border-zinc-800 pb-6 mb-10">
        <h1 className="font-[family-name:var(--font-biscuit)] text-5xl md:text-5xl text-[#E23C3C] tracking-wide uppercase leading-none">
          {user.username.toUpperCase()}’S COLLECTION
        </h1>

        <Link
          href="/profile"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-[family-name:var(--font-bayon)] tracking-widest text-lg mb-1 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          BACK TO PROFILE
        </Link>
      </div>

      {/* CONTENEDOR PRINCIPAL DIVIDIDO EN 2 (1/3 y 2/3) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* ========================================== */}
        {/* LADO IZQUIERDO: TOP 5 ALBUMS               */}
        {/* ========================================== */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <h2 className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-widest uppercase border-b border-zinc-900 pb-2">
            TOP 5 RATED
          </h2>

          <div className="flex flex-col gap-4">
            {top5Reviews.map((review, index) => {
              const albumDetail = albumsData.albums.items.find(
                (a: any) => a.id === review.album_id,
              );
              if (!albumDetail) return null;

              return (
                <Link
                  href={`/album/${review.album_id}`}
                  key={review.id}
                  className="flex items-center gap-4 p-3 bg-[#111112] rounded-xl border border-zinc-900 hover:border-[#E23C3C]/50 transition-colors group shadow-lg"
                >
                  <span className="font-[family-name:var(--font-biscuit)] text-xl text-zinc-600 group-hover:text-[#E23C3C] transition-colors w-6 text-center shrink-0">
                    {index + 1}
                  </span>

                  <img
                    src={
                      albumDetail.images[0]?.url ||
                      "https://via.placeholder.com/150"
                    }
                    alt={albumDetail.name}
                    className="w-16 h-16 object-cover rounded-md shadow-lg"
                  />

                  <div className="flex flex-col justify-center truncate w-full">
                    <p className="font-[family-name:var(--font-bayon)] text-xl text-white tracking-widest truncate leading-tight">
                      {albumDetail.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-sans text-xs text-zinc-400 truncate max-w-[100px]">
                        {albumDetail.artists[0]?.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3 text-[#E23C3C]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm tracking-wider">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ========================================== */}
        {/* LADO DERECHO: GRILLA DE COLECCIÓN COMPLETA */}
        {/* ========================================== */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <h2 className="font-[family-name:var(--font-bayon)] text-2xl text-zinc-500 tracking-widest uppercase border-b border-zinc-900 pb-2">
            FULL COLLECTION
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {collectionIds.map((albumId) => {
              const albumDetail = albumsData.albums.items.find(
                (a: any) => a.id === albumId,
              );
              if (!albumDetail) return null;

              // Buscamos si este disco tiene un rating en las reseñas del usuario
              const reviewForAlbum = userReviews.find(
                (r) => r.album_id === albumId,
              );

              return (
                <Link
                  href={`/album/${albumId}`}
                  key={albumId}
                  className="flex flex-col gap-2 group cursor-pointer"
                >
                  {/* Contenedor de la Portada */}
                  <div className="w-full aspect-square overflow-hidden rounded-xl border-2 border-transparent group-hover:border-[#E23C3C] transition-colors relative shadow-lg">
                    <img
                      src={
                        albumDetail.images[0]?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={albumDetail.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay oscuro en hover con un ícono de ojo o "View" */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="font-[family-name:var(--font-bayon)] text-white tracking-widest text-lg">
                        VIEW
                      </span>
                    </div>
                  </div>

                  {/* Contenedor Inferior: Solo Estrellas (Si existen) o espacio vacío */}
                  <div className="flex justify-center items-center h-6">
                    {reviewForAlbum ? (
                      <div className="flex items-center gap-1 bg-[#111112] px-3 py-0.5 rounded-full border border-zinc-800">
                        <svg
                          className="w-3 h-3 text-[#E23C3C]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm tracking-widest">
                          {reviewForAlbum.rating.toFixed(1)}
                        </span>
                      </div>
                    ) : (
                      // Si no tiene review (es solo favorito), podemos dejar el espacio
                      // o poner un corazón discreto. Dejémoslo vacío según tu solicitud.
                      <span className="text-transparent">-</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
