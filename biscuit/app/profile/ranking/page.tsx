"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// IMPORT DATA
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";

function RankingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // User reviews & Collection
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [collectionAlbums, setCollectionAlbums] = useState<string[]>([]);

  // Top 3 Custom state
  const [top3, setTop3] = useState<string[]>(["", "", ""]);
  const [comments, setComments] = useState<Record<string, string>>({});
  
  // Selector Modal state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search term when modal opens/closes
  useEffect(() => {
    if (!isSelectorOpen) {
      setSearchTerm("");
    }
  }, [isSelectorOpen]);

  // Authenticate current user session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSession = localStorage.getItem("activeSession");
      if (!activeSession) {
        router.push("/login");
        return;
      }
      try {
        const sessionData = JSON.parse(activeSession);
        if (!sessionData || !sessionData.isAuthenticated) {
          router.push("/login");
          return;
        }
        setCurrentUser(sessionData);
      } catch (e) {
        console.error("Error authenticating current session", e);
        router.push("/login");
      }
    }
  }, [router]);

  // Load target user details based on query param or active session
  useEffect(() => {
    if (typeof window === "undefined") return;

    const userId = queryUserId || (currentUser ? currentUser.id : null);
    if (!userId) return;

    // Find user details in static users
    let fullUser = currentUserData.users.find((u) => u.id === userId);

    // Find in locally registered users
    if (!fullUser) {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw);
          fullUser = localUsers.find((u: any) => u.id === userId);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fallback to active session
    if (!fullUser && currentUser && currentUser.id === userId) {
      fullUser = {
        id: currentUser.id,
        name: currentUser.name || "OAuth User",
        username: currentUser.username || "oauth_user",
        password: "",
        avatar_url: currentUser.avatar_url || "https://www.svgrepo.com/show/335455/profile-default.svg",
        bio: currentUser.bio || "Usuario autenticado en Biscuit.",
        location: currentUser.location || "Chile",
        stats: currentUser.stats || { albums_logged: 0, reviews_written: 0, followers: 0, following: 0 },
        favorite_albums: currentUser.favorite_albums || []
      };
    }

    if (!fullUser) {
      setLoading(false);
      return;
    }

    // Apply local profile override if exists
    const overrideRaw = localStorage.getItem(`profileOverride_${fullUser.id}`);
    if (overrideRaw) {
      try {
        const override = JSON.parse(overrideRaw);
        fullUser = { ...fullUser, ...override };
      } catch (e) {}
    }

    setTargetUser(fullUser);
  }, [queryUserId, currentUser]);

  // Load reviews, collections, and custom top 3 rankings
  useEffect(() => {
    if (!targetUser) return;

    // 1. Load reviews
    const initialReviews = reviewsData.reviews.filter((r) => r.user_id === targetUser.id);
    const localReviewsRaw = JSON.parse(localStorage.getItem(`albumReviews_${targetUser.id}`) || "{}");
    let mergedReviews = [...initialReviews];

    Object.keys(localReviewsRaw).forEach((albumId) => {
      const localData = localReviewsRaw[albumId];
      const rating = typeof localData === 'string' ? 0 : (localData.rating || 0);
      const reviewText = typeof localData === 'string' ? localData : localData.review_text;
      const existingIndex = mergedReviews.findIndex((r) => r.album_id === albumId);

      if (existingIndex >= 0) {
        mergedReviews[existingIndex].rating = rating || mergedReviews[existingIndex].rating;
        mergedReviews[existingIndex].review_text = reviewText;
      } else {
        mergedReviews.push({
          id: `local_${albumId}`,
          user_id: targetUser.id,
          album_id: albumId,
          rating: rating,
          review_text: reviewText,
          created_at: new Date().toISOString(),
          likes: 0
        });
      }
    });
    setUserReviews(mergedReviews);

    // 2. Load collection albums (favorites + liked)
    const likedKey = `likedAlbums_${targetUser.id}`;
    const likedAlbums: string[] = JSON.parse(localStorage.getItem(likedKey) || "[]");
    const combined = Array.from(new Set([...targetUser.favorite_albums, ...likedAlbums]));
    setCollectionAlbums(combined);

    // 3. Load custom Top 3
    const customTop3Key = `customTop3_${targetUser.id}`;
    let savedTop3: string[] = JSON.parse(localStorage.getItem(customTop3Key) || "[]");
    const isOwnerUser = currentUser && currentUser.id === targetUser.id;

    // Fallback prepopulate top 3 if empty
    if (savedTop3.length === 0 && mergedReviews.length > 0) {
      const top3Auto = [...mergedReviews]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map((r) => r.album_id);

      while (top3Auto.length < 3) {
        top3Auto.push("");
      }
      savedTop3 = top3Auto;
      if (isOwnerUser) {
        localStorage.setItem(customTop3Key, JSON.stringify(top3Auto));
      }
    } else {
      while (savedTop3.length < 3) {
        savedTop3.push("");
      }
    }
    setTop3(savedTop3);

    // 4. Load top 3 comments
    const commentsKey = `top3Comments_${targetUser.id}`;
    const savedComments = JSON.parse(localStorage.getItem(commentsKey) || "{}");
    setComments(savedComments);

    setLoading(false);
  }, [targetUser, currentUser]);

  const isOwner = currentUser && targetUser && currentUser.id === targetUser.id;

  // Sorting all reviews for the scroll list
  const allRatedReviews = [...userReviews].sort((a, b) => b.rating - a.rating);

  const selectAlbumForSlot = (albumId: string) => {
    if (activeSlotIndex === null || !targetUser) return;

    const updatedTop3 = [...top3];
    updatedTop3[activeSlotIndex] = albumId;
    setTop3(updatedTop3);

    localStorage.setItem(`customTop3_${targetUser.id}`, JSON.stringify(updatedTop3));
    setIsSelectorOpen(false);
    setActiveSlotIndex(null);
  };

  const clearSlot = (index: number) => {
    if (!targetUser) return;
    const updatedTop3 = [...top3];
    updatedTop3[index] = "";
    setTop3(updatedTop3);
    localStorage.setItem(`customTop3_${targetUser.id}`, JSON.stringify(updatedTop3));
  };

  const handleCommentChange = (albumId: string, text: string) => {
    if (!targetUser) return;
    const commentsKey = `top3Comments_${targetUser.id}`;
    const savedComments = JSON.parse(localStorage.getItem(commentsKey) || "{}");
    savedComments[albumId] = text;
    localStorage.setItem(commentsKey, JSON.stringify(savedComments));
    setComments(savedComments);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-400">Loading ranking...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center gap-4">
        <h2 className="font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C] tracking-wide uppercase">USER NOT FOUND</h2>
        <Link href="/profile" className="bg-white text-black font-[family-name:var(--font-bayon)] text-sm px-6 py-2 rounded-full uppercase tracking-wider hover:bg-[#E23C3C] hover:text-black transition-colors">
          Return to Profile
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] pt-32 pb-12 text-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-end border-b border-zinc-800 pb-6 mb-10">
        <div className="flex items-center gap-4">
          <img
            src={targetUser.avatar_url || "https://www.svgrepo.com/show/335455/profile-default.svg"}
            alt={targetUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800 shadow-md shrink-0"
          />
          <h1 className="font-[family-name:var(--font-bayon)] text-2xl md:text-3xl text-[#dad6d6] tracking-wide uppercase leading-none pt-1">
            {targetUser.username.toUpperCase()}’S RANKINGS
          </h1>
        </div>

        <Link
          href={isOwner ? "/profile" : `/profile/${targetUser.id}`}
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

      {/* TWO COLUMN WORKSPACE */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* LEFT COLUMN: CUSTOM TOP 3 EDITABLE CARDS */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <h2 className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-widest uppercase border-b border-zinc-900 pb-2">
            {isOwner ? "EDIT YOUR TOP 3" : "TOP 3 FAVORITES"}
          </h2>

          <div className="flex flex-col gap-6">
            {top3.map((albumId, index) => {
              const albumDetail = albumId
                ? albumsData.albums.items.find((a: any) => a.id === albumId)
                : null;
              const reviewDetail = albumId
                ? userReviews.find((r) => r.album_id === albumId)
                : null;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-[#111112] border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 relative shadow-lg overflow-hidden"
                >
                  {/* Slot Number Label */}
                  <span className="absolute top-3 right-4 font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C]/25 select-none leading-none">
                    #{index + 1}
                  </span>

                  {albumDetail ? (
                    <div className="flex flex-col gap-4">
                      {/* Album details layout */}
                      <div className="flex gap-4 items-center">
                        <img
                          src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                          alt={albumDetail.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-md border border-zinc-950"
                        />
                        <div className="flex flex-col truncate w-[60%]">
                          <p className="font-[family-name:var(--font-bayon)] text-xl text-white tracking-wider truncate uppercase leading-tight">
                            {albumDetail.name}
                          </p>
                          <p className="font-sans text-xs text-zinc-400 truncate mt-1">
                            {albumDetail.artists[0]?.name}
                          </p>
                          {reviewDetail && (
                            <div className="flex items-center gap-1 mt-2">
                              <span className="text-[#E23C3C] text-sm">★</span>
                              <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-xs pt-0.5">
                                {reviewDetail.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Custom comments/notes section */}
                      <div className="flex flex-col bg-black/40 p-4 border border-zinc-900 rounded-2xl gap-1">
                        <span className="font-[family-name:var(--font-bayon)] text-[9px] uppercase tracking-widest text-zinc-500">
                          {isOwner ? "Write your comment/review:" : `Review Note:`}
                        </span>
                        {isOwner ? (
                          <textarea
                            value={comments[albumId] || ""}
                            onChange={(e) => handleCommentChange(albumId, e.target.value)}
                            placeholder="Add details about why this is in your Top 3..."
                            className="bg-transparent border-0 font-sans text-xs text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none h-16 w-full"
                          />
                        ) : (
                          <p className="font-sans text-xs text-zinc-300 italic leading-relaxed whitespace-pre-wrap">
                            {comments[albumId] || "\"No comment left for this album.\""}
                          </p>
                        )}
                      </div>

                      {/* Owner actions */}
                      {isOwner && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setActiveSlotIndex(index);
                              setIsSelectorOpen(true);
                            }}
                            className="bg-zinc-800 text-zinc-300 hover:bg-[#E23C3C] hover:text-black font-[family-name:var(--font-bayon)] text-[10px] tracking-widest px-3 py-1 rounded-full uppercase transition-all font-bold cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            onClick={() => clearSlot(index)}
                            className="bg-transparent border border-zinc-800 text-zinc-500 hover:text-[#E23C3C] hover:border-[#E23C3C] font-[family-name:var(--font-bayon)] text-[10px] tracking-widest px-3 py-1 rounded-full uppercase transition-all font-bold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Placeholder for empty slot */
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-zinc-800 rounded-2xl bg-black/10">
                      {isOwner ? (
                        <button
                          onClick={() => {
                            setActiveSlotIndex(index);
                            setIsSelectorOpen(true);
                          }}
                          className="flex flex-col items-center justify-center gap-2 group cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-zinc-800 group-hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md">
                            <span className="text-xl text-black font-bold group-hover:text-black">+</span>
                          </div>
                          <span className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 group-hover:text-white tracking-widest uppercase transition-colors">
                            Select Album
                          </span>
                        </button>
                      ) : (
                        <span className="font-[family-name:var(--font-bayon)] text-xs text-zinc-600 tracking-widest uppercase">
                          Empty Slot
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: LIST OF ALL RATED ALBUMS (SCROLLABLE) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <h2 className="font-[family-name:var(--font-bayon)] text-2xl text-zinc-500 tracking-widest uppercase border-b border-zinc-900 pb-2">
            ALL RATED ALBUMS ({allRatedReviews.length})
          </h2>

          <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar bg-black/10 rounded-2xl border border-zinc-900 p-4 shadow-inner">
            {allRatedReviews.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 font-[family-name:var(--font-bayon)] text-lg tracking-widest uppercase">
                No albums rated yet.
              </div>
            ) : (
              allRatedReviews.map((review, index) => {
                const albumDetail = albumsData.albums.items.find(
                  (a: any) => a.id === review.album_id
                );
                if (!albumDetail) return null;

                return (
                  <Link
                    href={`/album/${review.album_id}`}
                    key={review.id}
                    className="flex items-center justify-between p-4 bg-[#111112] border border-zinc-900 rounded-xl hover:border-[#E23C3C]/50 transition-colors group shadow-md"
                  >
                    {/* Index, Cover Cover, Details */}
                    <div className="flex items-center gap-4 overflow-hidden w-[70%]">
                      <span className="font-[family-name:var(--font-biscuit)] text-2xl text-zinc-600 group-hover:text-[#E23C3C] transition-colors w-8 text-center shrink-0">
                        {index + 1}
                      </span>
                      <img
                        src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                        alt={albumDetail.name}
                        className="w-14 h-14 object-cover rounded-lg shadow-md border border-zinc-950 shrink-0"
                      />
                      <div className="flex flex-col justify-center truncate">
                        <p className="font-[family-name:var(--font-bayon)] text-xl text-white tracking-widest uppercase truncate leading-tight">
                          {albumDetail.name}
                        </p>
                        <p className="font-sans text-xs text-zinc-400 truncate mt-0.5">
                          {albumDetail.artists[0]?.name}
                        </p>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-zinc-800 shrink-0">
                      <span className="text-[#E23C3C] text-xs">★</span>
                      <span className="font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm tracking-wider leading-none pt-0.5">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ALBUM SELECTOR MODAL */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111112] w-full max-w-lg rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
                <div className="flex flex-col gap-1 overflow-hidden">
                  <h3 className="font-[family-name:var(--font-biscuit)] text-2xl text-[#E23C3C] tracking-wide uppercase leading-none">
                    Select Album for slot #{activeSlotIndex !== null ? activeSlotIndex + 1 : ""}
                  </h3>
                  <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mt-1">
                    CHOOSE FROM YOUR COLLECTION
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsSelectorOpen(false);
                    setActiveSlotIndex(null);
                  }}
                  className="text-zinc-500 hover:text-white transition-colors text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b border-zinc-900 bg-black/20">
                <input
                  type="text"
                  placeholder="Search albums by name or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-[#E23C3C] transition-colors"
                />
              </div>

              {/* Modal scrollable album list */}
              <div className="flex flex-col p-6 overflow-y-auto gap-2">
                {collectionAlbums.length === 0 ? (
                  <div className="text-center py-10 font-[family-name:var(--font-bayon)] text-zinc-500 uppercase tracking-widest">
                    Your collection is empty.
                  </div>
                ) : (() => {
                  const filteredCollection = collectionAlbums.filter((albumId) => {
                    const albumDetail = albumsData.albums.items.find(
                      (a: any) => a.id === albumId
                    );
                    if (!albumDetail) return false;
                    const term = searchTerm.toLowerCase();
                    return (
                      albumDetail.name.toLowerCase().includes(term) ||
                      albumDetail.artists[0]?.name?.toLowerCase().includes(term)
                    );
                  });

                  if (filteredCollection.length === 0) {
                    return (
                      <div className="text-center py-10 font-[family-name:var(--font-bayon)] text-zinc-600 uppercase tracking-widest text-xs">
                        No albums match your search.
                      </div>
                    );
                  }

                  return filteredCollection.map((albumId) => {
                    const albumDetail = albumsData.albums.items.find(
                      (a: any) => a.id === albumId
                    );
                    if (!albumDetail) return null;

                    const isAlreadySelected = top3.some(
                      (id, idx) => id === albumId && idx !== activeSlotIndex
                    );

                    return (
                      <div
                        key={albumId}
                        onClick={() => {
                          if (isAlreadySelected) return;
                          selectAlbumForSlot(albumId);
                        }}
                        className={`flex items-center justify-between p-3 border rounded-xl transition-colors group ${
                          isAlreadySelected
                            ? "bg-zinc-950/20 border-zinc-950/30 opacity-40 cursor-not-allowed"
                            : "bg-black/40 border-zinc-900 hover:border-zinc-700 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                            alt={albumDetail.name}
                            className="w-12 h-12 object-cover rounded-md border border-zinc-800 shrink-0"
                          />
                          <div className="flex flex-col truncate">
                            <p className="font-[family-name:var(--font-bayon)] text-lg text-white tracking-widest uppercase truncate leading-tight">
                              {albumDetail.name}
                            </p>
                            <p className="font-sans text-[10px] text-zinc-400 truncate">
                              {albumDetail.artists[0]?.name}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isAlreadySelected}
                          className={`font-[family-name:var(--font-bayon)] text-[10px] px-4 py-2 rounded-full tracking-widest transition-all uppercase font-bold ${
                            isAlreadySelected
                              ? "bg-zinc-900 border border-[#111112] text-zinc-600"
                              : "bg-[#111112] border border-zinc-800 text-zinc-400 hover:bg-[#E23C3C] hover:text-black hover:border-[#E23C3C] cursor-pointer"
                          }`}
                        >
                          {isAlreadySelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function RankingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
      </div>
    }>
      <RankingContent />
    </Suspense>
  );
}