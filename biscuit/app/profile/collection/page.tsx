"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// IMPORT DATA
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";

function CollectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [collectionAlbums, setCollectionAlbums] = useState<string[]>([]);

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

    setTargetUser(fullUser);
  }, [queryUserId, currentUser]);

  // Load user collection and reviews
  useEffect(() => {
    if (!targetUser) return;

    // Load reviews
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

    // Load collection albums (favorites + liked + reviewed)
    const likedKey = `likedAlbums_${targetUser.id}`;
    const likedAlbums: string[] = JSON.parse(localStorage.getItem(likedKey) || "[]");
    const reviewedAlbumIds = mergedReviews.map((r) => r.album_id);
    const combined = Array.from(new Set([...targetUser.favorite_albums, ...likedAlbums, ...reviewedAlbumIds]));
    setCollectionAlbums(combined);

    setLoading(false);
  }, [targetUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-400">Loading collection...</p>
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

  const isOwner = currentUser && targetUser && currentUser.id === targetUser.id;

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
            {targetUser.username.toUpperCase()}’S COLLECTION
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

      {/* RESPONSIBLE GRID OF FULL COLLECTION */}
      <div className="max-w-6xl mx-auto px-6">
        {collectionAlbums.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 font-[family-name:var(--font-bayon)] text-2xl tracking-widest uppercase">
            No albums in this collection.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {collectionAlbums.map((albumId) => {
              const albumDetail = albumsData.albums.items.find(
                (a: any) => a.id === albumId
              );
              if (!albumDetail) return null;

              // Find if this album has a rating
              const reviewForAlbum = userReviews.find(
                (r) => r.album_id === albumId
              );

              return (
                <Link
                  href={`/album/${albumId}`}
                  key={albumId}
                  className="flex flex-col gap-2 group cursor-pointer"
                >
                  {/* Cover image container */}
                  <div className="w-full aspect-square overflow-hidden rounded-xl border-2 border-transparent group-hover:border-[#E23C3C] transition-colors relative shadow-lg bg-[#111112]">
                    <img
                      src={albumDetail.images[0]?.url || "https://via.placeholder.com/150"}
                      alt={albumDetail.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="font-[family-name:var(--font-bayon)] text-white tracking-widest text-lg">
                        VIEW
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars/Display */}
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
                      <span className="text-transparent">-</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}
