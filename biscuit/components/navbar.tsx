"use client";
import { useState, useMemo, useTransition, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import albumsJson from "@/data/albums.json";
import currentUserData from "@/data/currentUser.json";
import { useRouter } from "next/navigation";
import { handleLogout, SESSION_KEY, SessionUser } from "@/lib/auth";

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

// — 2. Envolvemos el componente en forwardRef —
const Navbar = forwardRef<NavbarHandle, {}>((props, ref) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const filteredResults = useMemo(() =>
    albumsData.filter((album) => {
      if (!filterQuery.trim()) return false;
      const q = filterQuery.toLowerCase();
      return (
        album.name.toLowerCase().includes(q) ||
        album.artists[0].name.toLowerCase().includes(q)
      );
    }),
    [filterQuery, albumsData]
  );

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
      setIsSearchActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
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
      {/* ── Overlay blur cuando la búsqueda está activa ── */}
      <div
        className={`fixed inset-0 z-20 transition-all duration-500 ease-in-out ${
          isSearchActive
            ? "backdrop-blur-md bg-black/40 opacity-100 pointer-events-auto"
            : "backdrop-blur-none bg-transparent opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      />

      {/* ── Navbar ── */}
<header className="absolute top-0 w-full z-30 px-10 py-1 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-none">
        <div className="grid grid-cols-3 items-center pointer-events-auto">

          {/* ── IZQUIERDA: Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-3 group w-fit"
          >
            <span className="text-4xl font-biscuit tracking-[0.25em] group-hover:tracking-[0.3em] transition-all duration-300">
              Biscuit
            </span>
          </Link>

          {/* ── CENTRO: Searchbar ── */}
          <div className="flex flex-col items-center relative">
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

            {/* Resultados */}
            {isSearchActive && searchQuery.trim() !== "" && (
              <div
                className={`absolute top-full mt-3 w-[320px] bg-[#111]/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col z-50 shadow-2xl transition-opacity duration-150 ${
                  isPending ? "opacity-50" : "opacity-100"
                }`}
              >
                {filteredResults.length > 0 ? (
                  filteredResults.map((album) => (
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
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── DERECHA: Perfil o Login ── */}
          <div className="flex justify-end items-center" ref={profileRef}>
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
                className="text-gray-400 hover:text-white transition-all duration-200 font-(family-name:--font-bayon) text-sm font-semibold uppercase tracking-widest px-4 py-2 border border-white/10 hover:border-white/30 rounded-full bg-white/5 cursor-pointer"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
});

// — 4. Exportación limpia —
Navbar.displayName = "Navbar";
export default Navbar;