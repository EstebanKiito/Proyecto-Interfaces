"use client";

import React from "react";
import Link from "next/link";

// Definimos qué datos necesita recibir el modal para funcionar
interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: any[]; // Aquí pasarás tu topRankedReviews
  albumsData: any; // Aquí pasarás albumsData.albums.items
}

export default function RankingModal({
  isOpen,
  onClose,
  reviews,
  albumsData,
}: RankingModalProps) {
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    // CONTENEDOR OVERLAY: Fondo oscuro semitransparente que cubre toda la pantalla
    // El z-50 asegura que quede por encima del Navbar y todo lo demás
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* CAJA DEL MODAL */}
      <div className="relative bg-[#111112] w-full max-w-3xl rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* HEADER DEL MODAL */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-900 bg-[#8E0B0B]/20">
          <h2 className="font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C] tracking-wide uppercase leading-none mt-2">
            ALL RANKED ALBUMS
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2"
            title="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* CUERPO SCROLLEABLE: Aquí va la lista completa de reseñas */}
        <div className="flex flex-col p-6 overflow-y-auto gap-4 custom-scrollbar">
          {reviews.map((review, index) => {
            const albumDetail = albumsData.find(
              (a: any) => a.id === review.album_id,
            );
            if (!albumDetail) return null;

            return (
              <div
                key={review.id}
                className="flex flex-col md:flex-row items-center justify-between p-4 bg-black/40 rounded-xl border border-zinc-900 hover:border-[#E23C3C]/50 transition-colors group gap-4"
              >
                {/* PARTE IZQUIERDA: Puesto, Foto, Título y Artista */}
                <div className="flex items-center gap-6 w-full md:w-auto overflow-hidden">
                  <span className="font-[family-name:var(--font-biscuit)] text-3xl text-zinc-600 group-hover:text-[#E23C3C] transition-colors w-8 text-center shrink-0">
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
                    className="bg-[#111112] border border-zinc-700 text-zinc-300 font-[family-name:var(--font-bayon)] px-6 py-2.5 rounded-full tracking-widest text-sm hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all flex items-center gap-2"
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
    </div>
  );
}
