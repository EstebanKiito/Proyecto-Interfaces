"use client";

import React from "react";
import Link from "next/link";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: any; // La playlist seleccionada actual
  usersData: any[]; // El arreglo de usuarios de users.json
  albumsData: any[]; // El arreglo de álbumes de albums.json
}

export default function PlaylistModal({
  isOpen,
  onClose,
  playlist,
  usersData,
  albumsData,
}: PlaylistModalProps) {
  // Si no está abierto o no hay una playlist seleccionada, no renderiza nada
  if (!isOpen || !playlist) return null;

  // Hacemos el match para buscar al dueño de la playlist según el owner_id
  let owner = usersData.find((u) => u.id === playlist.owner_id);
  if (!owner && typeof window !== "undefined") {
    const activeSession = localStorage.getItem("activeSession");
    if (activeSession) {
      try {
        const parsed = JSON.parse(activeSession);
        if (parsed && parsed.id === playlist.owner_id) {
          owner = parsed;
        }
      } catch (e) {}
    }
    if (!owner) {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw);
          owner = localUsers.find((u: any) => u.id === playlist.owner_id);
        } catch (e) {}
      }
    }
  }

  return (
    // CONTENEDOR OVERLAY: Cierra el modal al presionar fuera de la caja
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    >
      {/* CAJA INTERNA DEL MODAL: Detiene la propagación del clic */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#111112] w-full max-w-2xl rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* HEADER DEL MODAL: Título de la Playlist y Botón de Cerrar */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
          <div className="flex flex-col gap-1 overflow-hidden">
            <h2 className="font-[family-name:var(--font-biscuit)] text-3xl md:text-4xl text-[#E23C3C] tracking-wide uppercase truncate leading-none mt-2">
              {playlist.title}
            </h2>

            {/* MATCH DEL DUEÑO: Muestra el nombre y username de quien la creó */}
            {owner && (
              <p className="font-[family-name:var(--font-bayon)] text-sm text-zinc-400 tracking-widest uppercase mt-1">
                BY {owner.name}{" "}
                <span className="text-[#E23C3C]">@{owner.username}</span>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 shrink-0"
            title="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* CUERPO DEL MODAL */}
        <div className="flex flex-col p-6 overflow-y-auto gap-6">
          {/* DESCRIPCIÓN DE LA PLAYLIST */}
          {playlist.description && (
            <div className="bg-black/30 p-4 border border-zinc-900 rounded-xl">
              <p className="font-sans text-sm text-zinc-400 leading-relaxed">
                {playlist.description}
              </p>
            </div>
          )}

          {/* LISTA DE ÁLBUMES CONTENIDOS EN LA PLAYLIST */}
          <div className="flex flex-col gap-3">
            <h4 className="font-[family-name:var(--font-bayon)] text-xl text-zinc-400 tracking-wider uppercase border-b border-zinc-900 pb-1">
              ALBUMS IN THIS LIST ({playlist.items.length})
            </h4>

            {playlist.items.map((albumId: string, index: number) => {
              // Buscamos los datos completos del álbum usando el string ID directo del JSON
              const albumDetail = albumsData.find((a) => a.id === albumId);

              if (!albumDetail) return null;

              return (
                <div
                  key={albumId}
                  className="flex items-center justify-between p-3 bg-black/40 border border-zinc-900 rounded-xl hover:border-zinc-700 transition-colors group"
                >
                  {/* Info e Imagen a la izquierda */}
                  <div className="flex items-center gap-4 overflow-hidden">
                    <span className="font-[family-name:var(--font-bayon)] text-lg text-zinc-600 group-hover:text-white w-4 text-center shrink-0 transition-colors">
                      {index + 1}
                    </span>
                    <img
                      src={
                        albumDetail.images[0]?.url ||
                        "https://via.placeholder.com/150"
                      }
                      alt={albumDetail.name}
                      className="w-14 h-14 object-cover rounded-md shadow-md shrink-0"
                    />
                    <div className="flex flex-col justify-center truncate">
                      <p className="font-[family-name:var(--font-bayon)] text-xl text-white tracking-widest uppercase truncate leading-tight">
                        {albumDetail.name}
                      </p>
                      <p className="font-sans text-xs text-zinc-400 truncate">
                        {albumDetail.artists[0]?.name}
                      </p>
                    </div>
                  </div>

                  {/* Botón de acceso a la vista del álbum a la derecha */}
                  <Link
                    href={`/album/${albumId}`}
                    className="bg-[#111112] border border-zinc-800 text-zinc-400 font-[family-name:var(--font-bayon)] text-xs px-4 py-2 rounded-full tracking-widest hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all"
                  >
                    VIEW
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
