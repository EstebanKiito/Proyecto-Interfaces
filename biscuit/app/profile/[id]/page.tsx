"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

// IMPORT DATA
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";
import playlistsData from "@/data/playlists.json";
import PlaylistModal from "@/components/playlistModal";
import CreatePlaylistModal from "@/components/createPlaylistModal";
import FriendsModal from "@/components/friendsModal";
import noPhoto from "../../../public/images/no-photo.jpg";

// ANIMATION VARIANTS
const pageLoadVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const hoverScaleVariant: Variants = {
  hover: { scale: 1.03, transition: { duration: 0.3, ease: "easeOut" } },
  tap: { scale: 0.98 },
};
const slideInRightVariant: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const fadeInUpVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function TargetProfilePage() {
  const router = useRouter();
  const params = useParams();
  const targetId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [friendsModalMode, setFriendsModalMode] = useState<"followers" | "following">("followers");

  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [collectionAlbums, setCollectionAlbums] = useState<string[]>([]);
  const [profileTop3, setProfileTop3] = useState<any[]>([]);

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

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

  // Load target user details
  useEffect(() => {
    if (typeof window === "undefined" || !targetId) return;

    // 1. Find target user details in static users
    let fullUser = currentUserData.users.find((u) => u.id === targetId);

    // 2. Find in locally registered users
    if (!fullUser) {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw);
          fullUser = localUsers.find((u: any) => u.id === targetId);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 3. Check active session if it matches
    if (!fullUser) {
      const activeSession = localStorage.getItem("activeSession");
      if (activeSession) {
        try {
          const sessionData = JSON.parse(activeSession);
          if (sessionData && sessionData.id === targetId) {
            fullUser = {
              id: sessionData.id,
              name: sessionData.name || "OAuth User",
              username: sessionData.username || "oauth_user",
              password: "",
              avatar_url: sessionData.avatar_url || "/images/spike.png",
              bio: sessionData.bio || "Usuario autenticado en Biscuit.",
              location: sessionData.location || "Chile",
              stats: sessionData.stats || { albums_logged: 0, reviews_written: 0, followers: 0, following: 0 },
              favorite_albums: sessionData.favorite_albums || []
            };
          }
        } catch (e) {}
      }
    }

    if (!fullUser) {
      // User not found
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
  }, [targetId]);

  // Load target user playlists, reviews, collections, followers
  useEffect(() => {
    if (!targetUser) return;

    // --- REVIEWS ---
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

    // --- PLAYLISTS ---
    const localPlaylistItems = JSON.parse(localStorage.getItem(`playlistItems_${targetUser.id}`) || "{}");
    const initialPlaylists = playlistsData.playlists.filter(p => p.owner_id === targetUser.id);

    const mergedPlaylists = initialPlaylists.map(playlist => {
      if (localPlaylistItems[playlist.id]) {
        return { ...playlist, items: localPlaylistItems[playlist.id] };
      }
      return playlist;
    });

    const hasToListen = mergedPlaylists.some(p => p.title.toLowerCase() === "to-listen");
    if (!hasToListen) {
      const defaultToListenId = `pl_to_listen_${targetUser.id}`;
      mergedPlaylists.push({
        id: defaultToListenId,
        owner_id: targetUser.id,
        title: "To-Listen",
        description: "Mis álbumes para escuchar más tarde.",
        is_public: true,
        type: "tier_list",
        items: localPlaylistItems[defaultToListenId] || []
      });
    }

    // Custom playlists
    const customPlaylistsKey = `customPlaylists_${targetUser.id}`;
    const customPlaylists = JSON.parse(localStorage.getItem(customPlaylistsKey) || "[]");
    const mergedCustomPlaylists = customPlaylists.map((playlist: any) => {
      if (localPlaylistItems[playlist.id]) {
        return { ...playlist, items: localPlaylistItems[playlist.id] };
      }
      return playlist;
    });

    const combinedPlaylists = [...mergedPlaylists, ...mergedCustomPlaylists];
    setUserPlaylists(combinedPlaylists);

    // --- ALBUM COLLECTION ---
    const likedKey = `likedAlbums_${targetUser.id}`;
    const likedAlbums: string[] = JSON.parse(localStorage.getItem(likedKey) || "[]");
    const reviewedAlbumIds = mergedReviews.map((r) => r.album_id);
    const combined = Array.from(new Set([...targetUser.favorite_albums, ...likedAlbums, ...reviewedAlbumIds]));
    setCollectionAlbums(combined);

    // --- RELATIONSHIPS ---
    const followers: string[] = JSON.parse(localStorage.getItem(`followers_${targetUser.id}`) || "[]");
    const following: string[] = JSON.parse(localStorage.getItem(`following_${targetUser.id}`) || "[]");
    setFollowerCount(followers.length);
    setFollowingCount(following.length);

    if (currentUser) {
      setIsFollowing(followers.includes(currentUser.id));
    }

    // --- LECTURA DE CUSTOM TOP 3 ---
    const customTop3Key = `customTop3_${targetUser.id}`;
    let savedTop3: string[] = JSON.parse(localStorage.getItem(customTop3Key) || "[]");
    
    if (savedTop3.length === 0 && mergedReviews.length > 0) {
      savedTop3 = [...mergedReviews]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map((r) => r.album_id);
    }
    
    while (savedTop3.length < 3) {
      savedTop3.push("");
    }
    
    const resolvedTop3 = savedTop3.map((albumId) => {
      if (!albumId) return null;
      const albumDetail = albumsData.albums.items.find((a) => a.id === albumId);
      const reviewDetail = mergedReviews.find((r) => r.album_id === albumId);
      return {
        albumId,
        albumDetail,
        rating: reviewDetail ? reviewDetail.rating : 0
      };
    }).filter(Boolean);
    
    setProfileTop3(resolvedTop3);

    setLoading(false);
  }, [targetUser, currentUser]);

  const refreshRelations = () => {
    if (!targetUser) return;
    const followers: string[] = JSON.parse(localStorage.getItem(`followers_${targetUser.id}`) || "[]");
    const following: string[] = JSON.parse(localStorage.getItem(`following_${targetUser.id}`) || "[]");
    setFollowerCount(followers.length);
    setFollowingCount(following.length);
    if (currentUser) {
      setIsFollowing(followers.includes(currentUser.id));
    }
  };

  const handleFollowToggle = () => {
    if (!currentUser || !targetUser) return;

    const myFollowingKey = `following_${currentUser.id}`;
    const targetFollowersKey = `followers_${targetUser.id}`;

    const myFollowing: string[] = JSON.parse(localStorage.getItem(myFollowingKey) || "[]");
    const targetFollowers: string[] = JSON.parse(localStorage.getItem(targetFollowersKey) || "[]");

    if (isFollowing) {
      // Unfollow
      const updatedFollowing = myFollowing.filter((id) => id !== targetUser.id);
      localStorage.setItem(myFollowingKey, JSON.stringify(updatedFollowing));

      const updatedFollowers = targetFollowers.filter((id) => id !== currentUser.id);
      localStorage.setItem(targetFollowersKey, JSON.stringify(updatedFollowers));
      setIsFollowing(false);
    } else {
      // Follow
      if (!myFollowing.includes(targetUser.id)) {
        myFollowing.push(targetUser.id);
      }
      localStorage.setItem(myFollowingKey, JSON.stringify(myFollowing));

      if (!targetFollowers.includes(currentUser.id)) {
        targetFollowers.push(currentUser.id);
      }
      localStorage.setItem(targetFollowersKey, JSON.stringify(targetFollowers));
      setIsFollowing(true);
    }

    refreshRelations();
  };

  const sortedReviews = [...userReviews].sort((a, b) => b.rating - a.rating);
  const topRankedReviews = sortedReviews.slice(0, 6);
  const totalPlaylists = userPlaylists.length;
  const isOwner = currentUser && targetUser && currentUser.id === targetUser.id;

  const carouselRef = React.useRef<HTMLDivElement>(null);

  const handleCarouselScroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
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

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageLoadVariant}
      id="main-page"
      className="bg-[#000000] min-h-screen text-white pt-24 pb-12 px-6 md:px-12 lg:px-24 selection:bg-[#E23C3C] selection:text-black"
    >
      {/* MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 max-w-6xl mx-auto items-start">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col w-full mt-10">
          <h1 className="font-biscuit text-5xl xl:text-7xl text-[#ffffff] uppercase m-0 p-0 leading-tight">
            {targetUser.username}'s
          </h1>
          <h2 className="font-biscuit text-4xl xl:text-7xl text-[#E23C3C] tracking-wide uppercase leading-none mb-5">
            COLLECTION
          </h2>

          <div className="flex flex-col w-[30rem]">
            <motion.div
              variants={hoverScaleVariant}
              whileHover="hover"
              className="relative bg-[#8E0B0B] px-3 rounded-[1.5rem] flex flex-col h-[22rem] overflow-hidden w-full shadow-[0_0_30px_rgba(142,11,11,0.3)] hover:shadow-[0_0_40px_rgba(226,60,60,0.4)] transition-shadow duration-300"
            >
              <span className="absolute top-2 right-2 z-10 bg-[#470808] text-[#fdfdfd] font-[family-name:var(--font-bayon)] text-sm px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
                TOP RATED
              </span>

              <div className="flex flex-col w-full font-[family-name:var(--font-bayon)] px-4 py-4">
                {profileTop3.map((item, index) => {
                  const albumDetail = item.albumDetail;
                  if (!albumDetail) return null;

                  return (
                    <Link
                      href={`/album/${item.albumId}`}
                      key={item.albumId}
                      className="flex flex-row items-center justify-between py-2 last:border-0 hover:bg-black/10 transition-colors px-2 rounded-lg group"
                    >
                      <div className="flex items-center gap-4 overflow-hidden ">
                        <img
                          src={albumDetail.images[0]?.url || noPhoto.src}
                          alt={albumDetail.name || "Album Cover"}
                          className="w-22 h-22 object-cover flex-shrink-0 shadow-md"
                        />
                        <div className="flex flex-col justify-center truncate">
                          <p className="font-[family-name:var(--font-bayon)] text-sm text-[#fdfdfd]/70 truncate">
                            {albumDetail.artists[0]?.name || "Unknown Artist"}
                          </p>
                          <p className="font-[family-name:var(--font-bayon)] text-[1.5rem] text-[#fdfdfd] uppercase tracking-wide truncate leading-tight">
                            {albumDetail.name || "Unknown Album"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 pl-4 flex-shrink-0">
                        <span className="font-[family-name:var(--font-bayon)] text-2xl text-white mr-8 w-4 text-center group-hover:text-white transition-colors">
                          #{index + 1}
                        </span>
                        <span className="font-[family-name:var(--font-bayon)] text-lg text-[#939090] tracking-wider">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            <div className="flex justify-center mt-4">
              <Link
                href={isOwner ? "/profile/ranking" : `/profile/ranking?userId=${targetUser.id}`}
                className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
              >
                VIEW ALL
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <div className="w-full flex flex-col items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-72 h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-6 border-[#c9c9d2] shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-[#111112] mb-4"
            >
              <img
                src={targetUser.avatar_url}
                alt={targetUser.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://www.svgrepo.com/show/335455/profile-default.svg";
                }}
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111112] p-5 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="font-[family-name:var(--font-bayon)] text-lg text-[#ffffff] tracking-widest mb-2">
                  BIOGRAPHY
                </h3>
                <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                  {targetUser.bio}
                </p>
              </div>
              <span className="text-xs text-zinc-600 font-[family-name:var(--font-bayon)] tracking-wider block mt-4 uppercase">
                LOCATION: {targetUser.location}
              </span>
            </div>

            <div className="bg-[#111112] p-5 rounded-3xl grid grid-cols-2 gap-2 items-center text-center">
              <div className="border-r border-zinc-800 py-2 hover:bg-white/5 transition-colors rounded-l-xl">
                <div className="font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C] leading-none mb-1">
                  {userReviews.length}
                </div>
                <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  REVIEWS
                </p>
              </div>
              <div
                className="py-2 hover:bg-white/5 transition-colors rounded-r-xl cursor-pointer"
                onClick={() =>
                  document
                    .getElementById("discover-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <p className="font-biscuit text-4xl text-[#ffffff] leading-none mb-1">
                  {collectionAlbums.length}
                </p>
                <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase">
                  FAVORITES
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 grid grid-cols-3 text-center shadow-md px-30">
            <div
              className="border-r border-zinc-800 hover:text-[#E23C3C] transition-colors cursor-pointer"
              onClick={() =>
                document
                  .getElementById("discover-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <p className="font-(family-name:--font-bayon) text-2xl tracking-wider">
                {totalPlaylists}
              </p>
              <p className="font-(family-name:--font-bayon) text-xs tracking-widest">
                SHELVES
              </p>
            </div>
            
            {/* Clickable followers */}
            <div
              className="border-r border-zinc-800 hover:text-[#E23C3C] cursor-pointer transition-colors"
              onClick={() => {
                setFriendsModalMode("followers");
                setIsFriendsModalOpen(true);
              }}
            >
              <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-wider">
                {followerCount}
              </p>
              <p className="font-[family-name:var(--font-bayon)] text-xs text-[#ffffff] tracking-widest">
                FOLLOWERS
              </p>
            </div>

            {/* Clickable following */}
            <div
              className="hover:text-[#E23C3C] cursor-pointer transition-colors"
              onClick={() => {
                setFriendsModalMode("following");
                setIsFriendsModalOpen(true);
              }}
            >
              <p className="font-[family-name:var(--font-bayon)] text-2xl text-white tracking-wider">
                {followingCount}
              </p>
              <p className="font-[family-name:var(--font-bayon)] text-xs text-[#ffffff] tracking-widest">
                FOLLOWING
              </p>
            </div>
          </div>

          {/* FOLLOW BUTTON OR EDIT PROFILE BUTTON */}
          <div className="flex justify-center mt-2">
            {!isOwner ? (
              <button
                onClick={handleFollowToggle}
                className={`font-[family-name:var(--font-bayon)] text-sm md:text-base px-8 py-2 rounded-full tracking-widest uppercase transition-all shadow-md cursor-pointer border ${
                  isFollowing
                    ? "bg-transparent text-[#E23C3C] border-[#E23C3C] hover:bg-[#8E0B0B]/20"
                    : "bg-[#E23C3C] text-black border-[#E23C3C] hover:bg-[#8E0B0B] hover:text-white"
                }`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            ) : (
              <button
                onClick={() => alert("Editar perfil en desarrollo...")}
                className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
              >
                EDIT PROFILE
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center font-(family-name:--font-bayon) text-sm text-[#939090] tracking-widest mt-2 uppercase">
        <div>DISCOVER COLLECTION</div>
        <motion.button
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-1 bg-[#962828] hover:bg-[#470808] text-[#000000] px-2 py-2 rounded-full shadow-inner mb-5 hover:text-white transition-colors cursor-pointer"
          onClick={() =>
            document
              .getElementById("discover-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
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
        </motion.button>
      </div>

      <section
        id="discover-section"
        className="min-h-screen flex mt-10 shadow-lg w-full"
      >
        <div className="mt-15 rounded-3xl shadow-lg flex flex-col w-full overflow-hidden">
          <div className="font-biscuit text-6xl text-[#ffffff] tracking-wide uppercase leading-none">
            {targetUser.username}'s
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="font-biscuit text-6xl text-[#E23C3C] tracking-wide uppercase leading-none">
              COLLECTION
            </div>
            <div
              className="w-16 h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden border-2 border-[#c9c9d2] shadow-xl bg-[#111112] cursor-pointer hover:border-[#5f5656] transition-colors"
              onClick={() =>
                document
                  .getElementById("main-page")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <img
                src={targetUser.avatar_url}
                alt={targetUser.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="relative w-full group">
            <button
              onClick={() => handleCarouselScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#111112] border border-[#962828] text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center shadow-2xl cursor-pointer opacity-0 group-hover:opacity-100"
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

            {/* COLLECTION CAROUSEL */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              ref={carouselRef}
              className="h-[13rem] w-full flex items-center overflow-x-auto gap-6 scroll-smooth px-14 no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {collectionAlbums.map((albumId: string) => {
                const album = albumsData.albums.items.find(
                  (item) => item.id === albumId
                );
                if (!album) return null;

                return (
                  <motion.div
                    variants={slideInRightVariant}
                    key={albumId}
                    className="w-36 group/item cursor-pointer shrink-0"
                  >
                    <Link href={`/album/${albumId}`}>
                      <div className="w-36 h-36 overflow-hidden shadow-lg border-3 border-transparent group-hover/item:border-[#E23C3C] transition-colors relative">
                        <img
                          src={album.images[0]?.url || noPhoto.src}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                          <p className="font-[family-name:var(--font-bayon)] text-lg text-white tracking-wide truncate px-2 text-center w-full">
                            {album.name}
                          </p>
                          <p className="font-sans text-xs text-[#E23C3C] truncate px-2 text-center w-full">
                            {album.artists[0]?.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            <button
              onClick={() => handleCarouselScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#111112] border border-[#962828] text-[#E23C3C] hover:bg-[#E23C3C] hover:text-black transition-all flex items-center justify-center shadow-2xl cursor-pointer opacity-0 group-hover:opacity-100"
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

          <div className="flex justify-center mt-4">
            <Link
              href={`/profile/collection?userId=${targetUser.id}`}
              className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
            >
              VIEW COLLECTION
            </Link>
          </div>

          <div>
            <div className="font-[family-name:var(--font-biscuit)] text-6xl text-[#E23C3C] tracking-wide uppercase leading-none justify-end flex mt-12 mb-4">
              <div className="text-[#ffffff] mr-4">{targetUser.username}'s </div>
              SHELVES
            </div>
          </div>

          {/* PLAYLISTS LIST */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="shadow-lg w-full flex flex-col p-6 gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Only show CREATE PLAYLIST button if viewing own profile */}
              {isOwner && (
                <motion.div variants={fadeInUpVariant}>
                  <div
                    onClick={() => setIsCreateModalOpen(true)}
                    className="relative bg-[#111112] p-6 rounded-[2rem] border border-zinc-800 hover:border-[#E23C3C] transition-all duration-300 flex flex-col h-[16rem] w-[24rem] shadow-xl group cursor-pointer justify-center items-center"
                  >
                    <div className="flex flex-col items-center justify-center h-full w-full gap-2 hover:scale-105 transition-transform duration-300">
                      <button className="w-16 h-16 bg-[#962828] group-hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3.5}
                          stroke="currentColor"
                          className="w-8 h-8 text-black"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                      <h3 className="font-[family-name:var(--font-bayon)] uppercase truncate leading-none text-center text-lg text-zinc-500 group-hover:text-white transition-colors tracking-widest mt-2">
                        CREATE LIST
                      </h3>
                    </div>
                  </div>
                </motion.div>
              )}

              {userPlaylists.map((playlist) => (
                <motion.div
                  variants={fadeInUpVariant}
                  key={playlist.id}
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="relative bg-[#111112] p-6 rounded-[2rem] border border-[#111112] hover:border-[#E23C3C] transition-all duration-300 flex flex-col h-[16rem] w-[24rem] shadow-xl group cursor-pointer hover:-translate-y-2">
                    <div className="w-full text-left">
                      <h3 className="font-[family-name:var(--font-bayon)] text-xl text-white uppercase leading-none text-center">
                        {playlist.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 my-auto max-w-[70%] mx-auto">
                      {playlist.items
                        .slice(0, 6)
                        .map((albumId: string, index: number) => {
                          const albumDetail = albumsData.albums.items.find(
                            (a) => a.id === albumId
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

                    <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#962828] group-hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-black"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {selectedPlaylist && (
        <PlaylistModal
          usersData={currentUserData.users}
          playlist={selectedPlaylist}
          albumsData={albumsData.albums.items}
          isOpen={!!selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      )}

      {isOwner && isCreateModalOpen && currentUser && (
        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          collectionAlbums={collectionAlbums}
          albumsData={albumsData.albums.items}
          onPlaylistCreated={(newPlaylist) => {
            setUserPlaylists((prev) => [...prev, newPlaylist]);
            window.location.reload();
          }}
        />
      )}

      {isFriendsModalOpen && currentUser && (
        <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          userId={targetUser.id}
          mode={friendsModalMode}
          currentUserId={currentUser.id}
          onRelationsChanged={refreshRelations}
        />
      )}
    </motion.main>
  );
}
