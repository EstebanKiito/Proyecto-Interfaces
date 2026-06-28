"use client";

import React, { useState, useEffect } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [error, setError] = useState("");

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

  // Look up current user session to determine owner status and load their collection
  let currentUser: any = null;
  if (typeof window !== "undefined") {
    const activeSession = localStorage.getItem("activeSession");
    if (activeSession) {
      try {
        currentUser = JSON.parse(activeSession);
      } catch (e) {}
    }
  }

  const isOwner = currentUser && playlist && currentUser.id === playlist.owner_id;

  // Sync state with playlist details on toggle edit
  useEffect(() => {
    if (playlist) {
      setEditedTitle(playlist.title || "");
      setEditedDescription(playlist.description || "");
      setSelectedAlbums(playlist.items || []);
    }
  }, [playlist, isEditing]);

  // Load collection albums (liked and mockup favorites)
  let collectionDetails: any[] = [];
  if (currentUser) {
    let favoriteAlbums: string[] = [];
    const staticUser = usersData.find((u) => u.id === currentUser.id);
    if (staticUser) {
      favoriteAlbums = staticUser.favorite_albums || [];
    } else {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw);
          const localUser = localUsers.find((u: any) => u.id === currentUser.id);
          if (localUser) {
            favoriteAlbums = localUser.favorite_albums || [];
          }
        } catch (e) {}
      }
    }
    const likedAlbums: string[] = JSON.parse(localStorage.getItem(`likedAlbums_${currentUser.id}`) || "[]");
    const combinedCollection = Array.from(new Set([...favoriteAlbums, ...likedAlbums]));
    collectionDetails = combinedCollection
      .map((id) => albumsData.find((a) => a.id === id))
      .filter(Boolean);
  }

  const toggleAlbum = (albumId: string) => {
    setSelectedAlbums((prev) =>
      prev.includes(albumId)
        ? prev.filter((id) => id !== albumId)
        : [...prev, albumId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTitle.trim()) {
      setError("Please provide a title.");
      return;
    }

    try {
      // 1. If it's a custom playlist (starts with pl_custom_):
      if (playlist.id.startsWith("pl_custom_")) {
        const customKey = `customPlaylists_${currentUser.id}`;
        const customPlaylists: any[] = JSON.parse(localStorage.getItem(customKey) || "[]");
        const updatedPlaylists = customPlaylists.map(p => {
          if (p.id === playlist.id) {
            return {
              ...p,
              title: editedTitle.trim(),
              description: editedDescription.trim(),
              items: selectedAlbums
            };
          }
          return p;
        });
        localStorage.setItem(customKey, JSON.stringify(updatedPlaylists));
      }

      // 2. Save items override in playlistItems
      const itemsKey = `playlistItems_${currentUser.id}`;
      const savedItems = JSON.parse(localStorage.getItem(itemsKey) || "{}");
      savedItems[playlist.id] = selectedAlbums;
      localStorage.setItem(itemsKey, JSON.stringify(savedItems));

      setIsEditing(false);
      window.location.reload(); // Reload page to reflect changes instantly
    } catch (err) {
      console.error("Error saving playlist", err);
      setError("Failed to save changes.");
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 animate-fade-in"
    >
      {/* CAJA INTERNA DEL MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#111112] w-[95%] sm:w-full max-w-2xl rounded-2xl md:rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
      >
        {/* HEADER DEL MODAL */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <h2 className="font-[family-name:var(--font-biscuit)] text-2xl md:text-4xl text-[#E23C3C] tracking-wide uppercase truncate leading-none mt-1">
              {isEditing ? "EDIT SHELF" : playlist.title}
            </h2>

            {/* MATCH DEL DUEÑO */}
            {!isEditing && owner && (
              <p className="font-[family-name:var(--font-bayon)] text-[11px] md:text-sm text-zinc-400 tracking-widest uppercase mt-0.5">
                BY {owner.name}{" "}
                <span className="text-[#E23C3C]">@{owner.username}</span>
              </p>
            )}
          </div>

          <div className="flex items-center shrink-0">
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-[10px] md:text-xs px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-widest hover:bg-[#E23C3C] hover:text-black transition-colors mr-2 cursor-pointer font-bold shadow-md"
              >
                Edit
              </button>
            )}

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-1 md:p-2 shrink-0"
              title="Cerrar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6 md:w-7 md:h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* CUERPO DEL MODAL */}
        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col overflow-y-auto">
            <div className="flex flex-col p-4 md:p-6 gap-4 md:gap-6">
              {error && (
                <div className="bg-[#8E0B0B]/20 border border-[#E23C3C] text-red-200 text-xs px-4 py-3 rounded-xl font-[family-name:var(--font-bayon)] tracking-wider uppercase">
                  {error}
                </div>
              )}

              {/* TITLE FIELD */}
              <div className="flex flex-col">
                <label className="font-[family-name:var(--font-bayon)] text-xs md:text-sm text-zinc-400 tracking-widest uppercase mb-1.5">
                  Shelf Title <span className="text-[#E23C3C]">*</span>
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  disabled={!playlist.id.startsWith("pl_custom_")}
                  className="w-full bg-black/30 border border-zinc-800 rounded-xl p-3 md:p-4 text-white focus:outline-none focus:border-[#E23C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans text-xs md:text-sm shadow-inner"
                  required
                />
              </div>

              {/* DESCRIPTION FIELD */}
              <div className="flex flex-col">
                <label className="font-[family-name:var(--font-bayon)] text-xs md:text-sm text-zinc-400 tracking-widest uppercase mb-1.5">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  disabled={!playlist.id.startsWith("pl_custom_")}
                  className="w-full bg-black/30 border border-zinc-800 rounded-xl p-3 md:p-4 text-white focus:outline-none focus:border-[#E23C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans text-xs md:text-sm shadow-inner h-20 md:h-24 resize-none"
                />
              </div>

              {/* ALBUMS SELECTION LIST */}
              <div className="flex flex-col gap-2 md:gap-3">
                <h4 className="font-[family-name:var(--font-bayon)] text-lg md:text-xl text-zinc-400 tracking-wider uppercase border-b border-zinc-900 pb-1">
                  ADD / REMOVE ALBUMS
                </h4>

                {collectionDetails.length === 0 ? (
                  <div className="text-zinc-600 font-[family-name:var(--font-bayon)] text-center py-6 tracking-wide uppercase">
                    Your collection is empty. Like some albums first!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[25vh] md:max-h-[30vh] overflow-y-auto pr-1">
                    {collectionDetails.map((albumDetail: any) => {
                      const isSelected = selectedAlbums.includes(albumDetail.id);
                      return (
                        <div
                          key={albumDetail.id}
                          onClick={() => toggleAlbum(albumDetail.id)}
                          className={`flex items-center justify-between p-2 md:p-3 border rounded-xl hover:border-zinc-700 transition-colors group cursor-pointer ${
                            isSelected
                              ? "bg-[#8E0B0B]/10 border-[#E23C3C]"
                              : "bg-black/40 border-zinc-900"
                          }`}
                        >
                          {/* Info & Image */}
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <img
                              src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                              alt={albumDetail.name}
                              className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-md shadow-md shrink-0"
                            />
                            <div className="flex flex-col justify-center truncate">
                              <p className="font-[family-name:var(--font-bayon)] text-sm md:text-xl text-white tracking-widest uppercase truncate leading-tight">
                                {albumDetail.name}
                              </p>
                              <p className="font-sans text-[10px] md:text-xs text-zinc-400 truncate">
                                {albumDetail.artists[0]?.name}
                              </p>
                            </div>
                          </div>

                          {/* Custom Select Button */}
                          <button
                            type="button"
                            className={`font-[family-name:var(--font-bayon)] text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 rounded-full tracking-widest transition-all font-bold ${
                              isSelected
                                ? "bg-[#E23C3C] text-black border border-[#E23C3C]"
                                : "bg-[#111112] border border-zinc-800 text-zinc-400 hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C]"
                            }`}
                          >
                            {isSelected ? "ADDED" : "ADD"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="p-4 md:p-6 bg-black/40 border-t border-zinc-900 flex gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/2 py-3 md:py-4 border border-zinc-800 hover:bg-zinc-800/50 text-white font-[family-name:var(--font-bayon)] text-base md:text-lg tracking-widest rounded-full uppercase transition-all cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 md:py-4 bg-[#E23C3C] hover:bg-[#8E0B0B] text-black hover:text-white font-[family-name:var(--font-bayon)] text-base md:text-lg tracking-widest rounded-full uppercase transition-all shadow-lg font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col p-4 md:p-6 overflow-y-auto gap-4 md:gap-6">
            {/* DESCRIPCIÓN DE LA PLAYLIST */}
            {playlist.description && (
              <div className="bg-black/30 p-3 md:p-4 border border-zinc-900 rounded-xl">
                <p className="font-sans text-xs md:text-sm text-zinc-400 leading-relaxed">
                  {playlist.description}
                </p>
              </div>
            )}

            {/* LISTA DE ÁLBUMES CONTENIDOS EN LA PLAYLIST */}
            <div className="flex flex-col gap-2 md:gap-3">
              <h4 className="font-[family-name:var(--font-bayon)] text-lg md:text-xl text-zinc-400 tracking-wider uppercase border-b border-zinc-900 pb-1">
                ALBUMS IN THIS LIST ({playlist.items.length})
              </h4>

              {playlist.items.map((albumId: string, index: number) => {
                const albumDetail = albumsData.find((a) => a.id === albumId);

                if (!albumDetail) return null;

                return (
                  <div
                    key={albumId}
                    className="flex items-center justify-between p-2 md:p-3 bg-black/40 border border-zinc-900 rounded-xl hover:border-zinc-700 transition-colors group"
                  >
                    {/* Info e Imagen a la izquierda */}
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                      <span className="font-[family-name:var(--font-bayon)] text-sm md:text-lg text-zinc-600 group-hover:text-white w-4 text-center shrink-0 transition-colors">
                        {index + 1}
                      </span>
                      <img
                        src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                        alt={albumDetail.name}
                        className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-md shadow-md shrink-0"
                      />
                      <div className="flex flex-col justify-center truncate">
                        <p className="font-[family-name:var(--font-bayon)] text-sm md:text-xl text-white tracking-widest uppercase truncate leading-tight">
                          {albumDetail.name}
                        </p>
                        <p className="font-sans text-[10px] md:text-xs text-zinc-400 truncate">
                          {albumDetail.artists[0]?.name}
                        </p>
                      </div>
                    </div>

                    {/* Botón de acceso a la vista del álbum a la derecha */}
                    <Link
                      href={`/album/${albumId}`}
                      className="bg-[#111112] border border-zinc-800 text-zinc-400 font-[family-name:var(--font-bayon)] text-[10px] md:text-xs px-3 py-1.5 md:px-4 md:py-2 rounded-full tracking-widest hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] transition-all"
                    >
                      VIEW
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
