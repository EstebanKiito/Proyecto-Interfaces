"use client";
import { useState, useMemo, useTransition, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import albumsJson from "@/data/albums.json";
import currentUserData from "@/data/currentUser.json";
import { useRouter, usePathname } from "next/navigation";
import { handleLogout, SESSION_KEY, SessionUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// — 1. Exportamos la interfaz para que el padre la conozca —
export interface NavbarHandle {
  openSearch: () => void;
}

// — tipos —
interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
}

const SUGGESTED_ALBUMS = [
  {
    id: "mockMetal02_masterofpuppets",
    name: "Master of Puppets",
    artists: [{ name: "Metallica" }],
    images: [{ url: "https://www.rollingstone.com/wp-content/uploads/2018/06/metallica-puppets-d7382ca6-9e72-4770-b2f5-8b57922d57fb.jpg?w=1280" }]
  },
  {
    id: "mock07_rumours",
    name: "Rumours",
    artists: [{ name: "Fleetwood Mac" }],
    images: [{ url: "https://www.rollingstone.com/wp-content/uploads/2020/09/R1344-007-Fleetwood-Mac-RUMOURS.jpg?w=1000" }]
  },
  {
    id: "mockJRock16_thatswhyigaveuponmusic",
    name: "だかろ僕は音楽を辞めた [That's Why I Gave Up on Music]",
    artists: [{ name: "ヨルシカ [Yorushika]" }],
    images: [{ url: "/images/jrock-albums/16.jpg" }]
  },
  {
    id: "mock19_tpab",
    name: "To Pimp a Butterfly",
    artists: [{ name: "Kendrick Lamar" }],
    images: [{ url: "https://www.rollingstone.com/wp-content/uploads/2020/09/R1344-019-Kendrick-Lamar-To-Pimp-a-Butterfly.jpg?w=1000" }]
  },
  {
    id: "mockMetal26_dirt",
    name: "Dirt",
    artists: [{ name: "Alice in Chains" }],
    images: [{ url: "https://www.rollingstone.com/wp-content/uploads/2018/06/alice-in-chains-dirt-a495466c-700f-47b7-85d7-40d3d514d947.jpg?w=1280" }]
  }
];

// — 2. Envolvemos el componente en forwardRef —
const Navbar = forwardRef<NavbarHandle, {}>((props, ref) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<SessionUser | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const albumsData: Album[] = albumsJson.albums.items;

  // — 3. Declaramos useImperativeHandle ANTES del return —
  useImperativeHandle(ref, () => ({
    openSearch: () => {
      setIsSearchActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }));

  const [activeSearchTab, setActiveSearchTab] = useState<"albums" | "users">("albums");

  // Obtener lista consolidada de usuarios para la búsqueda
  const allUsers = useMemo(() => {
    if (typeof window === "undefined") return currentUserData.users;
    
    // 1. Obtener usuarios estáticos con sus overrides aplicados
    const staticUsers = currentUserData.users.map(u => {
      const overrideRaw = localStorage.getItem(`profileOverride_${u.id}`);
      if (overrideRaw) {
        try {
          const override = JSON.parse(overrideRaw);
          return { ...u, ...override };
        } catch (e) {}
      }
      return u;
    });

    // 2. Obtener usuarios locales registrados
    let localUsers: any[] = [];
    const localUsersRaw = localStorage.getItem("localRegisteredUsers");
    if (localUsersRaw) {
      try {
        localUsers = JSON.parse(localUsersRaw);
        localUsers = localUsers.map((u: any) => {
          const overrideRaw = localStorage.getItem(`profileOverride_${u.id}`);
          if (overrideRaw) {
            try {
              const override = JSON.parse(overrideRaw);
              return { ...u, ...override };
            } catch (e) {}
          }
          return u;
        });
      } catch (e) {}
    }

    // Unir ambos arreglos sin duplicados de ID
    const merged = [...staticUsers];
    localUsers.forEach(u => {
      if (!merged.some(existing => existing.id === u.id)) {
        merged.push(u);
      }
    });

    return merged;
  }, []);

  // Close mobile hamburger menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchActive(false);
    setSearchQuery("");
    startTransition(() => setFilterQuery(""));
  }, [pathname]);

  const filteredAlbums = useMemo(() => {
    if (!filterQuery.trim()) return [];
    const q = filterQuery.toLowerCase();
    return albumsData.filter((album) =>
      album.name.toLowerCase().includes(q) ||
      album.artists[0].name.toLowerCase().includes(q)
    );
  }, [filterQuery, albumsData]);

  const filteredUsers = useMemo(() => {
    if (!filterQuery.trim()) return [];
    const q = filterQuery.toLowerCase();
    return allUsers.filter((user) =>
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q)
    );
  }, [filterQuery, allUsers]);

  useEffect(() => {
    const checkSession = () => {
      const activeSession = localStorage.getItem(SESSION_KEY);
      if (activeSession) {
        try {
          const parsed = JSON.parse(activeSession) as SessionUser;
          if (parsed && parsed.isAuthenticated) {
            setSession(parsed);
            return;
          }
        } catch (e) {
          console.error("Error parsing session in navbar", e);
        }
      }
      setSession(null);
    };

    checkSession();
    window.addEventListener("sessionChanged", checkSession);
    window.addEventListener("storage", checkSession);

    const handleOpenSearch = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.innerWidth < 768) {
        setIsMobileMenuOpen(true);
        setTimeout(() => {
          const mobileInput = document.querySelector('input[placeholder="SEARCH ALBUMS OR USERS"]') as HTMLInputElement;
          if (mobileInput) mobileInput.focus();
        }, 300);
      } else {
        setIsSearchActive(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener("openSearchModal", handleOpenSearch);

    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("sessionChanged", checkSession);
      window.removeEventListener("storage", checkSession);
      window.removeEventListener("openSearchModal", handleOpenSearch);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    startTransition(() => setFilterQuery(val));
  }

  function handleOverlayClick() {
    setIsSearchActive(false);
    setSearchQuery("");
    startTransition(() => setFilterQuery(""));
  }

  return (
    <>
      {/* ── Overlay blur cuando la búsqueda o el menú móvil está activo ── */}
      <div
        className={`fixed inset-0 z-20 transition-all duration-500 ease-in-out ${
          isSearchActive || isMobileMenuOpen
            ? "backdrop-blur-md bg-black/60 opacity-100 pointer-events-auto"
            : "backdrop-blur-none bg-transparent opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      />

      {/* ── Navbar ── */}
      <header className="absolute top-[0.7rem] w-full z-30 px-6 md:px-10 py-1 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto max-w-7xl mx-auto">

          {/* Logo (Siempre a la izquierda) */}
          {!(!session && pathname === "/") ? (
            <Link
              href="/"
              className="flex items-center gap-3 group w-fit"
            >
              <span className="mt-1 text-3xl md:text-4xl font-biscuit tracking-[0.12em] group-hover:tracking-[0.15em] transition-all duration-300">
                Biscuit
              </span>
            </Link>
          ) : (
            <div className="w-fit h-10" />
          )}

          {/* ── CENTRO: Searchbar (Solo en Desktop) ── */}
          {pathname !== "/login" ? (
            <div className="hidden md:flex flex-col items-center relative">
              <div className="relative flex items-center">
                {/* Icono lupa */}
                <svg
                  className="absolute left-3 w-3.5 h-3.5 text-gray-500 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="SEARCH"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchActive(true)}
                  className="bg-white/5 border border-white/10 focus:border-white/30 rounded-full text-white placeholder-gray-200 outline-none pl-9 pr-4 py-2 w-[220px] focus:w-[320px] transition-all duration-300 text-xs text-center uppercase tracking-widest cursor-text"
                />

                {/* Spinner cuando está filtrando */}
                {isPending && (
                  <div className="absolute right-3 w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                )}
              </div>

              {/* Resultados (Desktop) */}
              {isSearchActive && (
                <div
                  className={`absolute top-full mt-3 w-[320px] bg-[#111]/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col z-50 shadow-2xl transition-opacity duration-150 ${
                    isPending ? "opacity-50" : "opacity-100"
                  }`}
                >
                  {searchQuery.trim() === "" ? (
                    // SUGERENCIAS
                    <div className="flex flex-col text-left">
                      <div className="px-4 py-2.5 border-b border-white/10 bg-white/5 font-[family-name:var(--font-bayon)] text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                        Sugerencias de la semana
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {SUGGESTED_ALBUMS.map((album) => (
                          <Link
                            key={album.id}
                            href={`/album/${album.id}`}
                            onClick={() => {
                              setIsSearchActive(false);
                              setSearchQuery("");
                              startTransition(() => setFilterQuery(""));
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/8 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                          >
                            <img
                              src={album.images[0].url}
                              alt={album.name}
                              className="w-9 h-9 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-white text-xs font-semibold tracking-normal truncate">
                                {album.name}
                              </span>
                              <span className="text-[#E23C3C] text-[10px] uppercase tracking-wider truncate">
                                {album.artists[0].name}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // RESULTADOS DE BÚSQUEDA REAL
                    <>
                      {/* Tabs de Selección */}
                      <div className="flex border-b border-white/10 text-[9px] uppercase tracking-wider font-semibold font-[family-name:var(--font-bayon)] bg-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveSearchTab("albums")}
                          className={`flex-1 py-2.5 text-center transition-all ${
                            activeSearchTab === "albums"
                              ? "bg-white/10 text-white border-b-2 border-[#E23C3C]"
                              : "text-gray-500 hover:text-white"
                          }`}
                        >
                          Álbumes ({filteredAlbums.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSearchTab("users")}
                          className={`flex-1 py-2.5 text-center transition-all ${
                            activeSearchTab === "users"
                              ? "bg-white/10 text-white border-b-2 border-[#E23C3C]"
                              : "text-gray-500 hover:text-white"
                          }`}
                        >
                          Usuarios ({filteredUsers.length})
                        </button>
                      </div>

                      {/* Contenedor de Resultados con Scroll */}
                      <div className="max-h-[300px] overflow-y-auto">
                        {activeSearchTab === "albums" ? (
                          filteredAlbums.length > 0 ? (
                            filteredAlbums.map((album) => (
                              <Link
                                key={album.id}
                                href={`/album/${album.id}`}
                                onClick={() => {
                                  setIsSearchActive(false);
                                  setSearchQuery("");
                                  startTransition(() => setFilterQuery(""));
                                }}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/8 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                              >
                                <img
                                  src={album.images[0].url}
                                  alt={album.name}
                                  className="w-9 h-9 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-white text-xs font-semibold tracking-normal truncate">
                                    {album.name}
                                  </span>
                                  <span className="text-gray-500 text-[10px] uppercase tracking-wider truncate">
                                    {album.artists[0].name}
                                  </span>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="p-5 text-center text-gray-600 text-[10px] uppercase tracking-widest">
                              No se encontraron álbumes
                            </div>
                          )
                        ) : (
                          filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                              const isSelf = session && session.id === user.id;
                              const profilePath = isSelf ? "/profile" : `/profile/${user.id}`;
                              return (
                                <Link
                                  key={user.id}
                                  href={profilePath}
                                  onClick={() => {
                                    setIsSearchActive(false);
                                    setSearchQuery("");
                                    startTransition(() => setFilterQuery(""));
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/8 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                >
                                  <img
                                    src={user.avatar_url || "/images/spike.png"}
                                    alt={user.name}
                                    className="w-9 h-9 object-cover rounded-full flex-shrink-0"
                                  />
                                  <div className="flex flex-col text-left min-w-0">
                                    <span className="text-white text-xs font-semibold tracking-normal truncate">
                                      {user.name}
                                    </span>
                                    <span className="text-[#E23C3C] text-[10px] tracking-normal truncate">
                                      @{user.username} {isSelf && <span className="text-zinc-500 text-[9px] uppercase tracking-widest">(Tú)</span>}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })
                          ) : (
                            <div className="p-5 text-center text-gray-600 text-[10px] uppercase tracking-widest">
                              No se encontraron usuarios
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:block" />
          )}

          {/* ── DERECHA: Perfil o Login (Solo en Desktop) ── */}
          <div className="hidden md:flex justify-end items-center" ref={profileRef}>
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 group cursor-pointer font-sans"
                >
                  <span className="text-gray-500 text-[11px] uppercase tracking-[0.2em] group-hover:text-gray-300 transition-colors duration-200 hidden sm:block">
                    {session.name}
                  </span>
                  <div className="relative">
                    <img
                      src={session.avatar_url}
                      alt={session.name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20 group-hover:ring-white/50 transition-all duration-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full ring-1 ring-[#050505]" />
                  </div>
                </button>

                {/* Dropdown de perfil */}
                {isProfileOpen && (
                  <div className="absolute top-full mt-3 right-0 w-52 bg-[#111]/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 font-sans">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                      <img
                        src={session.avatar_url}
                        alt={session.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-white text-xs font-semibold truncate text-left">{session.name}</span>
                        <span className="text-gray-500 text-[10px] truncate text-left">@{session.username}</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-xs uppercase tracking-widest border-b border-white/5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                      My Profile
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout(router);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-400 hover:bg-white/5 transition-colors text-xs uppercase tracking-widest cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-all duration-200 font-(family-name:--font-bayon) text-sm  uppercase tracking-widest px-4 py-2 border border-white/10 hover:border-white/30 rounded-full bg-white/5 cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>

          {/* ── MOBILE: Botón de Hamburguesa (Solo en Mobile/Tablet) ── */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-white hover:text-red-500 focus:outline-none p-2 cursor-pointer z-50"
            >
              {isMobileMenuOpen ? (
                /* Icono cerrar */
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Icono hamburguesa */
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* ── MOBILE: Menú Desplegable Slide-Down ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-[#111112]/95 backdrop-blur-md border-b border-white/10 px-6 py-6 flex flex-col gap-6 pointer-events-auto shadow-2xl z-40"
            >
              {/* Mobile Search input */}
              {pathname !== "/login" && (
                <div className="flex flex-col relative w-full">
                  <div className="relative flex items-center w-full">
                    <svg
                      className="absolute left-3 w-4 h-4 text-gray-500 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>

                    <input
                      type="text"
                      placeholder="SEARCH ALBUMS OR USERS"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setIsSearchActive(true)}
                      className="bg-white/5 border border-white/10 focus:border-[#E23C3C] rounded-full text-white placeholder-gray-500 outline-none pl-10 pr-4 py-2.5 w-full transition-all duration-300 text-xs text-center uppercase tracking-widest cursor-text"
                    />

                    {isPending && (
                      <div className="absolute right-3 w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin" />
                    )}
                  </div>

                  {/* Resultados Mobile Dropdown */}
                  {isSearchActive && (
                    <div
                      className={`mt-2 w-full bg-[#161617] border border-white/10 rounded-2xl overflow-hidden flex flex-col z-50 shadow-xl ${
                        isPending ? "opacity-50" : "opacity-100"
                      }`}
                    >
                      {searchQuery.trim() === "" ? (
                        // SUGERENCIAS
                        <div className="flex flex-col text-left">
                          <div className="px-4 py-2 border-b border-white/5 bg-white/5 font-[family-name:var(--font-bayon)] text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
                            Sugerencias de la semana
                          </div>
                          <div className="max-h-[220px] overflow-y-auto">
                            {SUGGESTED_ALBUMS.map((album) => (
                              <Link
                                key={album.id}
                                href={`/album/${album.id}`}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsSearchActive(false);
                                  setSearchQuery("");
                                  startTransition(() => setFilterQuery(""));
                                }}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                              >
                                <img
                                  src={album.images[0].url}
                                  alt={album.name}
                                  className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                />
                                <div className="flex flex-col text-left min-w-0">
                                  <span className="text-white text-xs font-semibold truncate">
                                    {album.name}
                                  </span>
                                  <span className="text-[#E23C3C] text-[9px] uppercase tracking-wider truncate">
                                    {album.artists[0].name}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // BÚSQUEDA REAL
                        <>
                          <div className="flex border-b border-white/5 text-[9px] uppercase tracking-wider font-semibold font-[family-name:var(--font-bayon)] bg-white/5">
                            <button
                              type="button"
                              onClick={() => setActiveSearchTab("albums")}
                              className={`flex-1 py-2 text-center transition-all ${
                                activeSearchTab === "albums"
                                  ? "bg-white/5 text-white border-b border-[#E23C3C]"
                                  : "text-gray-500"
                              }`}
                            >
                              Álbumes ({filteredAlbums.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSearchTab("users")}
                              className={`flex-1 py-2 text-center transition-all ${
                                activeSearchTab === "users"
                                  ? "bg-white/5 text-white border-b border-[#E23C3C]"
                                  : "text-gray-500"
                              }`}
                            >
                              Usuarios ({filteredUsers.length})
                            </button>
                          </div>

                          <div className="max-h-[220px] overflow-y-auto">
                            {activeSearchTab === "albums" ? (
                              filteredAlbums.length > 0 ? (
                                filteredAlbums.map((album) => (
                                  <Link
                                    key={album.id}
                                    href={`/album/${album.id}`}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      setIsSearchActive(false);
                                      setSearchQuery("");
                                      startTransition(() => setFilterQuery(""));
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                  >
                                    <img
                                      src={album.images[0].url}
                                      alt={album.name}
                                      className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                    />
                                    <div className="flex flex-col text-left min-w-0">
                                      <span className="text-white text-xs font-semibold truncate">
                                        {album.name}
                                      </span>
                                      <span className="text-gray-500 text-[9px] uppercase tracking-wider truncate">
                                        {album.artists[0].name}
                                      </span>
                                    </div>
                                  </Link>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-600 text-[9px] uppercase tracking-widest">
                                  No se encontraron álbumes
                                </div>
                              )
                            ) : (
                              filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                  const isSelf = session && session.id === user.id;
                                  const profilePath = isSelf ? "/profile" : `/profile/${user.id}`;
                                  return (
                                    <Link
                                      key={user.id}
                                      href={profilePath}
                                      onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsSearchActive(false);
                                        setSearchQuery("");
                                        startTransition(() => setFilterQuery(""));
                                      }}
                                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                    >
                                      <img
                                        src={user.avatar_url || "/images/spike.png"}
                                        alt={user.name}
                                        className="w-8 h-8 object-cover rounded-full flex-shrink-0"
                                      />
                                      <div className="flex flex-col text-left min-w-0">
                                        <span className="text-white text-xs font-semibold truncate">
                                          {user.name}
                                        </span>
                                        <span className="text-[#E23C3C] text-[9px] truncate">
                                          @{user.username} {isSelf && <span className="text-zinc-500 text-[8px] uppercase tracking-widest">(Tú)</span>}
                                        </span>
                                      </div>
                                    </Link>
                                  );
                                })
                              ) : (
                                <div className="p-4 text-center text-gray-600 text-[9px] uppercase tracking-widest">
                                  No se encontraron usuarios
                                </div>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Navigation links */}
              <div className="flex flex-col text-center divide-y divide-white/5 font-[family-name:var(--font-bayon)] tracking-[0.2em] uppercase text-sm">
                {session ? (
                  <>
                    <div className="flex items-center justify-center gap-3 py-3 pb-5">
                      <img
                        src={session.avatar_url}
                        alt={session.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                      />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="text-white text-xs font-semibold truncate">{session.name}</span>
                        <span className="text-gray-500 text-[10px] truncate">@{session.username}</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-4 text-zinc-300 hover:text-white transition-colors"
                    >
                      My Profile
                    </Link>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout(router);
                      }}
                      className="py-4 text-red-500 hover:text-red-400 transition-colors w-full text-center cursor-pointer"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-4 text-[#E23C3C] hover:text-red-400 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>
    </>
  );
});

// — 4. Exportación limpia —
Navbar.displayName = "Navbar";
export default Navbar;