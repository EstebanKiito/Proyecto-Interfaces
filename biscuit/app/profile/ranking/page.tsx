import React from "react";
import Link from "next/link";

// 1. Importamos la data directamente como hicimos en profile/page.tsx
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";

export default function RankingPage() {
  // 2. Filtramos y preparamos la data del usuario actual
  const user = currentUserData.users[0];
  const userReviews = reviewsData.reviews.filter(
    (review) => review.user_id === user.id,
  );

  return (
    // CONTENEDOR PRINCIPAL DE LA PÁGINA
    <main className="min-h-screen bg-[#000000] pt-32 pb-12 px-6 md:px-12 lg:px-24 text-white">
      {/* CAJA CENTRALIZADA PARA MANTENER LA LEGIBILIDAD */}
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* HEADER DE LA VISTA */}
        <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
          <h1 className="font-[family-name:var(--font-biscuit)] text-5xl md:text-6xl text-[#E23C3C] tracking-wide uppercase leading-none">
            ALL RANKED ALBUMS
          </h1>

          {/* BOTÓN PARA VOLVER AL PERFIL (Reemplaza al botón de cerrar el modal) */}
          <Link
            href="/profile"
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 font-[family-name:var(--font-bayon)] tracking-widest text-lg mb-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
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

        {/* LISTA COMPLETA DE RESEÑAS */}
        <div className="flex flex-col gap-4">
          {[...userReviews]
            .sort((a, b) => b.rating - a.rating)
            .map((review, index) => {
              const albumDetail = albumsData.albums.items.find(
                (a: any) => a.id === review.album_id,
              );
              if (!albumDetail) return null;

              return (
                <div
                  key={review.id}
                  className="flex flex-col md:flex-row items-center justify-between p-4 bg-[#111112] rounded-xl border border-zinc-900 hover:border-[#E23C3C]/50 transition-colors group gap-4 shadow-lg"
                >
                  {/* PARTE IZQUIERDA: Puesto, Foto, Título y Artista */}
                  <div className="flex items-center gap-6 w-full md:w-auto overflow-hidden">
                    <span className="font-[family-name:var(--font-biscuit)] text-4xl text-zinc-600 group-hover:text-[#E23C3C] transition-colors w-10 text-center shrink-0">
                      {index + 1}
                    </span>

                    <img
                      src={
                        albumDetail.images[0]?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={albumDetail.name}
                      className="w-20 h-20 object-cover rounded-md shadow-lg"
                    />

                    <div className="flex flex-col justify-center truncate">
                      <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-widest truncate leading-tight">
                        {albumDetail.name}
                      </p>
                      <p className="font-sans text-sm text-zinc-400 truncate mt-1">
                        {albumDetail.artists[0]?.name}
                      </p>
                      {/* Estrellas/Rating numérico debajo del artista */}
                      <div className="flex items-center gap-1 mt-1">
                        <svg
                          className="w-4 h-4 text-[#E23C3C]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-lg tracking-wider">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PARTE DERECHA: Botón que redirige a la vista del álbum con la review */}
                  <div className="shrink-0 w-full md:w-auto flex justify-end">
                    <Link
                      href={`/album/${review.album_id}`}
                      className="bg-black/40 border border-zinc-700 text-zinc-300 font-[family-name:var(--font-bayon)] px-6 py-2.5 rounded-full tracking-widest text-sm hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all flex items-center gap-2"
                    >
                      READ REVIEW
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
}
