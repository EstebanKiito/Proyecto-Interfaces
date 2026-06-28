"use client";

import React, { useState } from "react";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  collectionAlbums: string[]; // List of album IDs in user's collection
  albumsData: any[]; // Full details of all albums from albums.json
  onPlaylistCreated: (newPlaylist: any) => void;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  currentUser,
  collectionAlbums,
  albumsData,
  onPlaylistCreated,
}: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [error, setError] = useState("");

  if (!isOpen || !currentUser) return null;

  // Find detailed info for the collection albums
  const collectionDetails = collectionAlbums
    .map((id) => albumsData.find((a) => a.id === id))
    .filter(Boolean);

  const toggleAlbum = (albumId: string) => {
    setSelectedAlbums((prev) =>
      prev.includes(albumId)
        ? prev.filter((id) => id !== albumId)
        : [...prev, albumId]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a playlist title.");
      return;
    }

    const playlistId = `pl_custom_${Date.now()}`;
    const newPlaylist = {
      id: playlistId,
      owner_id: currentUser.id,
      title: title.trim(),
      description: description.trim(),
      is_public: true,
      type: "standard",
      items: selectedAlbums,
    };

    // Save to user-specific custom playlists in localStorage
    try {
      const storageKey = `customPlaylists_${currentUser.id}`;
      const existingPlaylists: any[] = JSON.parse(
        localStorage.getItem(storageKey) || "[]"
      );
      
      const updatedPlaylists = [...existingPlaylists, newPlaylist];
      localStorage.setItem(storageKey, JSON.stringify(updatedPlaylists));

      // Also ensure items are synced to playlistItems key just in case
      const itemsKey = `playlistItems_${currentUser.id}`;
      const savedItems = JSON.parse(localStorage.getItem(itemsKey) || "{}");
      savedItems[playlistId] = selectedAlbums;
      localStorage.setItem(itemsKey, JSON.stringify(savedItems));

      onPlaylistCreated(newPlaylist);
      
      // Reset form & Close
      setTitle("");
      setDescription("");
      setSelectedAlbums([]);
      onClose();
    } catch (err) {
      console.error("Error creating custom playlist", err);
      setError("An error occurred while creating the playlist. Please try again.");
    }
  };

  return (
    // OVERLAY CONTAINER
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    >
      {/* MODAL BOX */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#111112] w-full max-w-2xl rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
          <div className="flex flex-col gap-1 overflow-hidden">
            <h2 className="font-[family-name:var(--font-biscuit)] text-3xl md:text-4xl text-[#E23C3C] tracking-wide uppercase truncate leading-none mt-2">
              CREATE SHELF
            </h2>
            <p className="font-[family-name:var(--font-bayon)] text-sm text-zinc-400 tracking-widest uppercase mt-1">
              CURATE YOUR SOUNDS
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-2 shrink-0"
            title="Close"
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

        {/* FORM CONTAINER */}
        <form onSubmit={handleCreate} className="flex flex-col overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            
            {/* ERROR DISPLAY */}
            {error && (
              <div className="bg-[#8E0B0B]/20 border border-[#E23C3C] text-red-200 text-xs px-4 py-3 rounded-xl font-[family-name:var(--font-bayon)] tracking-wider uppercase">
                {error}
              </div>
            )}

            {/* TITLE FIELD */}
            <div className="flex flex-col">
              <label className="font-[family-name:var(--font-bayon)] text-sm text-zinc-400 tracking-widest uppercase mb-2">
                Shelf Title <span className="text-[#E23C3C]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Midnight Melancholy"
                className="w-full bg-black/30 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E23C3C] transition-colors font-sans text-sm shadow-inner"
                required
              />
            </div>

            {/* DESCRIPTION FIELD */}
            <div className="flex flex-col">
              <label className="font-[family-name:var(--font-bayon)] text-sm text-zinc-400 tracking-widest uppercase mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about the vibe of this shelf..."
                className="w-full bg-black/30 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#E23C3C] transition-colors font-sans text-sm shadow-inner h-24 resize-none"
              />
            </div>

            {/* ALBUMS SELECTION LIST */}
            <div className="flex flex-col gap-3">
              <h4 className="font-[family-name:var(--font-bayon)] text-xl text-zinc-400 tracking-wider uppercase border-b border-zinc-900 pb-1">
                ADD FROM COLLECTION ({collectionDetails.length} available)
              </h4>

              {collectionDetails.length === 0 ? (
                <div className="text-zinc-600 font-[family-name:var(--font-bayon)] text-center py-6 tracking-wide uppercase">
                  Your collection is empty. Like some albums first!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto pr-1">
                  {collectionDetails.map((albumDetail: any) => {
                    const isSelected = selectedAlbums.includes(albumDetail.id);
                    return (
                      <div
                        key={albumDetail.id}
                        onClick={() => toggleAlbum(albumDetail.id)}
                        className={`flex items-center justify-between p-3 border rounded-xl hover:border-zinc-700 transition-colors group cursor-pointer ${
                          isSelected
                            ? "bg-[#8E0B0B]/10 border-[#E23C3C]"
                            : "bg-black/40 border-zinc-900"
                        }`}
                      >
                        {/* Info & Image */}
                        <div className="flex items-center gap-4 overflow-hidden">
                          <img
                            src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
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

                        {/* Custom Select Button */}
                        <button
                          type="button"
                          className={`font-[family-name:var(--font-bayon)] text-xs px-4 py-2 rounded-full tracking-widest transition-all font-bold cursor-pointer ${
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

          {/* ACTION BUTTON */}
          <div className="p-6 bg-black/40 border-t border-zinc-900 flex justify-end">
            <button
              type="submit"
              className="w-full py-4 bg-[#a70f0f] hover:bg-[#E23C3C] text-black hover:text-white font-[family-name:var(--font-bayon)] text-lg tracking-widest rounded-full uppercase transition-all shadow-lg font-bold cursor-pointer"
            >
              CREATE SHELF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
