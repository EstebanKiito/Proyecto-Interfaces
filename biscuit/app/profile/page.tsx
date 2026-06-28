"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

// IMPORTACIÓN DE DATOS REALES DESDE TUS ARCHIVOS JSON
import currentUserData from "@/data/currentUser.json";
import reviewsData from "@/data/reviews.json";
import albumsData from "@/data/albums.json";
import playlistsData from "@/data/playlists.json";
import PlaylistModal from "@/components/playlistModal";
import CreatePlaylistModal from "@/components/createPlaylistModal";
import FriendsModal from "@/components/friendsModal";
import EditProfileModal from "@/components/editProfileModal";
import noPhoto from "../../public/images/no-photo.jpg";

// ==========================================
// VARIANTS DE ANIMACIÓN (Clean Architecture)
// ==========================================
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

export default function ProfilePage() {
  const router = useRouter();
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. ESTADOS INICIALES BASADOS EN JSON
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [collectionAlbums, setCollectionAlbums] = useState<string[]>([]);
  const [profileTop3, setProfileTop3] = useState<any[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [friendsModalMode, setFriendsModalMode] = useState<"followers" | "following">("followers");

  // Effect to authenticate and load user session
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

        // Find user details in static users
        let fullUser = currentUserData.users.find((u) => u.id === sessionData.id);

        // If not found in static users, look in locally registered users
        if (!fullUser) {
          const localUsersRaw = localStorage.getItem("localRegisteredUsers");
          if (localUsersRaw) {
            const localUsers = JSON.parse(localUsersRaw);
            fullUser = localUsers.find((u: any) => u.id === sessionData.id);
          }
        }

        // Apply local profile override if exists
        if (fullUser) {
          const overrideRaw = localStorage.getItem(`profileOverride_${fullUser.id}`);
          if (overrideRaw) {
            try {
              const override = JSON.parse(overrideRaw);
              fullUser = { ...fullUser, ...override };
            } catch (e) {}
          }
        }

        // Fallback for OAuth mock user
        if (!fullUser) {
          fullUser = {
            id: sessionData.id,
            name: sessionData.name || "OAuth User",
            username: sessionData.username || "oauth_user",
            password: "",
            avatar_url: sessionData.avatar_url || "/images/spike.png",
            bio: sessionData.bio || "Usuario autenticado a través de OAuth en Biscuit.",
            location: sessionData.location || "Internet",
            stats: sessionData.stats || {
              albums_logged: 0,
              reviews_written: 0,
              followers: 0,
              following: 0
            },
            favorite_albums: sessionData.favorite_albums || []
          };
        }

        setUser(fullUser);
        setLoading(false);
      } catch (e) {
        console.error("Error setting up profile session", e);
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (window.location.hash !== "#discover-section") return;

    const scrollToDiscover = () => {
      document
        .getElementById("discover-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.requestAnimationFrame(scrollToDiscover);
  }, [loading, user]);

  // Effect to merge reviews and playlists when user is loaded
  useEffect(() => {
    if (!user) return;

    // --- LECTURA DE RESEÑAS ---
    const initialReviews = reviewsData.reviews.filter((r) => r.user_id === user.id);
    const localReviewsRaw = JSON.parse(localStorage.getItem(`albumReviews_${user.id}`) || "{}");
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
          user_id: user.id,
          album_id: albumId,
          rating: rating,
          review_text: reviewText,
          created_at: new Date().toISOString(),
          likes: 0
        });
      }
    });
    setUserReviews(mergedReviews);

    // --- LECTURA DE PLAYLISTS ---
    const localPlaylistItems = JSON.parse(localStorage.getItem(`playlistItems_${user.id}`) || "{}");
    const initialPlaylists = playlistsData.playlists.filter(p => p.owner_id === user.id);

    const mergedPlaylists = initialPlaylists.map(playlist => {
      if (localPlaylistItems[playlist.id]) {
        return { ...playlist, items: localPlaylistItems[playlist.id] };
      }
      return playlist;
    });

    const hasToListen = mergedPlaylists.some(p => p.title.toLowerCase() === "to-listen");
    if (!hasToListen) {
      const defaultToListenId = `pl_to_listen_${user.id}`;
      mergedPlaylists.push({
        id: defaultToListenId,
        owner_id: user.id,
        title: "To-Listen",
        description: "Mis álbumes para escuchar más tarde.",
        is_public: true,
        type: "tier_list",
        items: localPlaylistItems[defaultToListenId] || []
      });
    }
    
    // Load user's custom playlists
    const customPlaylistsKey = `customPlaylists_${user.id}`;
    const customPlaylists = JSON.parse(localStorage.getItem(customPlaylistsKey) || "[]");
    const mergedCustomPlaylists = customPlaylists.map((playlist: any) => {
      if (localPlaylistItems[playlist.id]) {
        return { ...playlist, items: localPlaylistItems[playlist.id] };
      }
      return playlist;
    });

    const combinedPlaylists = [...mergedPlaylists, ...mergedCustomPlaylists];
    setUserPlaylists(combinedPlaylists);

    // --- LECTURA DE ALBUMS GUSTADOS (COLECCIÓN) ---
    const likedKey = `likedAlbums_${user.id}`;
    const likedAlbums: string[] = JSON.parse(localStorage.getItem(likedKey) || "[]");
    const reviewedAlbumIds = mergedReviews.map((r) => r.album_id);
    const combined = Array.from(new Set([...user.favorite_albums, ...likedAlbums, ...reviewedAlbumIds]));
    setCollectionAlbums(combined);

    // --- LECTURA DE FOLLOWERS Y FOLLOWING ---
    const followers = JSON.parse(localStorage.getItem(`followers_${user.id}`) || "[]");
    const following = JSON.parse(localStorage.getItem(`following_${user.id}`) || "[]");
    setFollowerCount(followers.length);
    setFollowingCount(following.length);

    // --- LECTURA DE CUSTOM TOP 3 ---
    const customTop3Key = `customTop3_${user.id}`;
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

  }, [user]);

  const refreshRelations = () => {
    if (!user) return;
    const followers = JSON.parse(localStorage.getItem(`followers_${user.id}`) || "[]");
    const following = JSON.parse(localStorage.getItem(`following_${user.id}`) || "[]");
    setFollowerCount(followers.length);
    setFollowingCount(following.length);
  };

  // 3. Cálculos dinámicos
  const sortedReviews = [...userReviews].sort((a, b) => b.rating - a.rating);
  const topRankedReviews = sortedReviews.slice(0, 6);

  // Ahora leemos el conteo directamente de nuestro estado reactivo
  const totalPlaylists = userPlaylists.length;

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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-400">Cargando colección...</p>
        </div>
      </div>
    );
  }

  return (
    // Transformamos el <main> en <motion.main> para animar la carga inicial de la página
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageLoadVariant}
      id="main-page"
      className="bg-[#000000] min-h-screen text-white pt-24 pb-12 px-6 md:px-12 lg:px-24 selection:bg-[#E23C3C] selection:text-black"
    >

      {/* GRILLA PRINCIPAL DE 2 COLUMNAS (IZQUIERDA Y DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 max-w-6xl mx-auto items-start">
        {/* COLUMNA IZQUIERDA */}
        <div className="flex flex-col w-full mt-10">
          <h1 className="font-biscuit text-5xl xl:text-7xl text-[#ffffff] uppercase m-0 p-0 leading-tight">
            {user.username}'s
          </h1>
          <h2 className="font-biscuit text-4xl xl:text-7xl text-[#E23C3C] tracking-wide uppercase leading-none mb-5">
            COLLECTION
          </h2>

          <div className="flex flex-col w-[30rem]">
            {/* Animación Hover en la caja del Ranking */}
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
                href="/profile/ranking"
                className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
              >
                VIEW ALL
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="flex flex-col gap-4">
          <div className="w-full flex justify-center lg:justify-center">
            {/* Animación Hover en el Avatar y rotación sutil */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-72 h-72 xl:w-80 xl:h-80 rounded-full overflow-hidden border-4 border-[#1a1a1a] shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-[#111112]"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg";
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
                <p className=" text-sm font-medium text-zinc-400 leading-relaxed">
                  {user.bio}
                </p>
              </div>
              <span className="text-xs text-zinc-600 font-[family-name:var(--font-bayon)] tracking-wider block mt-4 uppercase">
                LOCATION: {user.location}
              </span>
            </div>

            <div className="bg-[#111112] p-5 rounded-3xl grid grid-cols-2 gap-2 items-center text-center">
              <div className="border-r border-zinc-800 py-2 hover:bg-white/5 transition-colors rounded-l-xl">
                <Link
                  href="/profile/ranking"
                  className="font-[family-name:var(--font-biscuit)] text-4xl text-[#E23C3C] leading-none mb-1 cursor-pointer block"
                >
                  {userReviews.length}
                </Link>
                <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-500 tracking-widest uppercase ">
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

          {/* BOTÓN EDIT PROFILE */}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
            >
              EDIT PROFILE
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center font-(family-name:--font-bayon) text-sm text-[#939090] tracking-widest mt-2 uppercase">
        <div>DISCOVER COLLECTION</div>
        {/* Animación continua en el botón de bajar */}
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
          <div className="font-biscuit text-6xl text-[#ffffff] tracking-wide uppercase leading-none ">
            MY
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="font-biscuit text-6xl text-[#E23C3C] tracking-wide uppercase leading-none ">
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
                src={user.avatar_url}
                alt={user.name}
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

            {/* CARRUSEL ANIMADO: Aparecen desde la derecha uno por uno a medida que haces scroll en la página */}
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
                  (item) => item.id === albumId,
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
              href="/profile/collection"
              className="bg-[#ffffff] text-[#000000] font-[family-name:var(--font-bayon)] text-sm md:text-base px-5 py-1.5 rounded-full uppercase tracking-widest shadow-inner hover:bg-[#5c0d0d] hover:text-white transition-colors cursor-pointer"
            >
              VIEW COLLECTION
            </Link>
          </div>

          <div>
            <div className="font-[family-name:var(--font-biscuit)] text-6xl text-[#E23C3C] tracking-wide uppercase leading-none justify-end flex mt-12 mb-4">
              <div className="text-[#ffffff] mr-4">MY </div>
              SHELVES
            </div>
          </div>

          {/* PLAYLISTS ANIMADAS: Suben desde abajo en efecto cascada al llegar a esta sección */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="shadow-lg w-full flex flex-col p-6 gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                    <h3 className="font-[family-name:var(--font-bayon)] uppercase truncate leading-none text-center text-lg text-zinc-500 group-hover:text-white transition-colors tracking-widest mt-2">
                      CREATE A SHELF
                    </h3>
                  </div>
                </div>
              </motion.div>

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

                    <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#962828] group-hover:bg-[#E23C3C] transition-colors rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer">
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
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
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

      {isCreateModalOpen && (
        <CreatePlaylistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={user}
          collectionAlbums={collectionAlbums}
          albumsData={albumsData.albums.items}
          onPlaylistCreated={(newPlaylist) => {
            setUserPlaylists((prev) => [...prev, newPlaylist]);
            window.location.reload();
          }}
        />
      )}

      {isFriendsModalOpen && (
        <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          userId={user.id}
          mode={friendsModalMode}
          currentUserId={user.id}
          onRelationsChanged={refreshRelations}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={user}
          onProfileUpdated={(updatedUser) => {
            setUser(updatedUser);
            window.location.reload();
          }}
        />
      )}
    </motion.main>
  );
}
