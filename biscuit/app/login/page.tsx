"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import currentUserData from "@/data/currentUser.json";
import { SESSION_KEY, SessionUser } from "@/lib/auth";
import { motion, AnimatePresence, Variants } from "framer-motion";

// ==========================================
// VARIANTS DE ANIMACIÓN (Framer Motion)
// ==========================================
const pageLoadVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const formVariant: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function LoginPage() {
  const router = useRouter();
  
  // Navigation protection: if already logged in, redirect to /profile
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auth toggle: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState(""); // username or email
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // OAuth Loading States
  const [oauthProvider, setOauthProvider] = useState<"google" | "facebook" | null>(null);

  // Check active session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSession = localStorage.getItem(SESSION_KEY);
      if (activeSession) {
        try {
          const parsed = JSON.parse(activeSession);
          if (parsed && parsed.isAuthenticated) {
            router.push("/profile");
            return;
          }
        } catch (e) {
          // invalid json, clear it
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setCheckingAuth(false);
    }
  }, [router]);

  // Handle Traditional Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError("Por favor completa todos los campos requeridos.");
      return;
    }

    // 1. Check in hardcoded currentUserData
    const staticUsers = currentUserData.users;
    let foundUser = staticUsers.find(
      (u) =>
        u.username.toLowerCase() === loginIdentifier.toLowerCase() ||
        (u.username.toLowerCase() + "@biscuit.com") === loginIdentifier.toLowerCase()
    );

    // 2. Check in localStorage simulated registered users
    if (!foundUser) {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw) as any[];
          foundUser = localUsers.find(
            (u) =>
              u.username.toLowerCase() === loginIdentifier.toLowerCase() ||
              u.email.toLowerCase() === loginIdentifier.toLowerCase()
          );
        } catch (e) {
          console.error("Error parsing localRegisteredUsers", e);
        }
      }
    }

    if (!foundUser) {
      setLoginError("Usuario no encontrado.");
      return;
    }

    if (foundUser.password !== loginPassword) {
      setLoginError("Contraseña incorrecta.");
      return;
    }

    // Success: Store non-sensitive data
    const sessionUser: SessionUser = {
      id: foundUser.id,
      name: foundUser.name,
      username: foundUser.username,
      email: foundUser.username.toLowerCase() + "@biscuit.com", // Mock email
      avatar_url: foundUser.avatar_url || "/images/spike.png",
      isAuthenticated: true
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event("sessionChanged"));
    router.push("/profile");
  };

  // Handle Simulated Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setRegError("Todos los campos son obligatorios.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Las contraseñas no coinciden.");
      return;
    }

    // Check if username already exists in static JSON or localStorage
    const staticUsers = currentUserData.users;
    const usernameTakenStatic = staticUsers.some(
      (u) => u.username.toLowerCase() === regUsername.toLowerCase()
    );

    let usernameTakenLocal = false;
    let emailTakenLocal = false;
    const localUsersRaw = localStorage.getItem("localRegisteredUsers");
    let localUsers: any[] = [];
    if (localUsersRaw) {
      try {
        localUsers = JSON.parse(localUsersRaw);
        usernameTakenLocal = localUsers.some(
          (u) => u.username.toLowerCase() === regUsername.toLowerCase()
        );
        emailTakenLocal = localUsers.some(
          (u) => u.email.toLowerCase() === regEmail.toLowerCase()
        );
      } catch (e) {
        console.error("Error parsing localRegisteredUsers", e);
      }
    }

    if (usernameTakenStatic || usernameTakenLocal) {
      setRegError("El nombre de usuario ya está en uso.");
      return;
    }

    if (emailTakenLocal) {
      setRegError("El correo electrónico ya está registrado.");
      return;
    }

    // Save new user mock in localStorage to enable logging in later
    const newUser = {
      id: `usr_${Date.now()}`,
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      avatar_url: "/images/spike.png",
      bio: "¡Hola! Soy un nuevo melómano coleccionista en Biscuit.",
      location: "Desconocida",
      stats: {
        albums_logged: 0,
        reviews_written: 0,
        followers: 0,
        following: 0
      },
      favorite_albums: []
    };

    localUsers.push(newUser);
    localStorage.setItem("localRegisteredUsers", JSON.stringify(localUsers));

    setRegSuccess("¡Registro exitoso! Iniciando sesión...");
    
    // Create active session immediately
    const sessionUser: SessionUser = {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      avatar_url: newUser.avatar_url,
      isAuthenticated: true
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event("sessionChanged"));

    // Clear registration form fields
    setRegName("");
    setRegUsername("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");

    // Redirect to profile
    setTimeout(() => {
      router.push("/profile");
    }, 1200);
  };

  // Handle Mock OAuth (Google / Facebook)
  const handleMockOAuth = (provider: "google" | "facebook") => {
    setOauthProvider(provider);

    // Simulated delay of 1.5 seconds to show visual feedback
    setTimeout(() => {
      const mockOauthUser: SessionUser = {
        id: `usr_oauth_${provider}_${Math.floor(Math.random() * 10000)}`,
        name: provider === "google" ? "Google User" : "Facebook User",
        username: provider === "google" ? "google_user" : "facebook_user",
        email: provider === "google" ? "google.user@gmail.com" : "facebook.user@outlook.com",
        avatar_url: "/images/spike.png", // Fallback avatar from JSON assets
        isAuthenticated: true,
        bio: `Usuario autenticado a través de ${provider === "google" ? "Google" : "Facebook"}.`,
        location: "Internet",
        stats: {
          albums_logged: 0,
          reviews_written: 0,
          followers: 0,
          following: 0
        },
        favorite_albums: []
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(mockOauthUser));
      window.dispatchEvent(new Event("sessionChanged"));
      setOauthProvider(null);
      router.push("/profile");
    }, 1500);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#E23C3C] rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageLoadVariant}
      className="min-h-screen bg-[#050505] text-white pt-32 pb-16 px-6 flex items-center justify-center"
    >
      <motion.div 
        layout // Esta es la propiedad clave para animar el cambio de altura de la caja
        className="w-full max-w-md bg-[#111112] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-8"
      >
        
        {/* Tab Toggle */}
        <motion.div layout className="flex border-b border-white/10 mb-8 font-(family-name:--font-bayon) text-sm uppercase tracking-widest">
          <button
            onClick={() => {
              setActiveTab("login");
              setLoginError("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider text-center transition-all ${
              activeTab === "login"
                ? "border-b-2 border-[#E23C3C] text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            Iniciar Sesion
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setRegError("");
              setRegSuccess("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold uppercase tracking-wider text-center transition-all ${
              activeTab === "register"
                ? "border-b-2 border-[#E23C3C] text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            Registrarse
          </button>
        </motion.div>

        {/* AnimatePresence envuelve los formularios para animar entrada y salida */}
        <AnimatePresence mode="wait">
          
          {/* Tab: LOGIN */}
          {activeTab === "login" && (
            <motion.form 
              key="login"
              variants={formVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleLoginSubmit} 
              className="space-y-6"
            >
              <h2 className="text-3xl font-biscuit text-center uppercase tracking-wide">
                Ingresa
              </h2>

              {loginError && (
                <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 text-red-200 text-xs">
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="login-username" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                  Username / Email
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="ej. Estebankito"
                  disabled={oauthProvider !== null}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="current-password" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {showLoginPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  id="current-password"
                  name="password"
                  type={showLoginPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="••••••••"
                  disabled={oauthProvider !== null}
                />
              </div>

              <button
                type="submit"
                disabled={oauthProvider !== null}
                className="w-full bg-[#b32f2f] hover:bg-[#c12f2f] text-white py-3 rounded-xl font-(family-name:--font-bayon) text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-lg shadow-red-950/20 disabled:opacity-50"
              >
                Sign In
              </button>
            </motion.form>
          )}

          {/* Tab: REGISTER */}
          {activeTab === "register" && (
            <motion.form 
              key="register"
              variants={formVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleRegisterSubmit} 
              className="space-y-5"
            >
              <h2 className="text-3xl font-biscuit text-center uppercase tracking-wide">
                Crea tu Cuenta
              </h2>

              {regError && (
                <div className="bg-red-950/50 border border-red-500/50 rounded-xl p-4 text-red-200 text-xs">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl p-4 text-emerald-200 text-xs">
                  {regSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="reg-name" className="font-(family-name:--font-bayon) text-sm block uppercase tracking-widest text-gray-400 font-semibold">
                  Nombre Completo
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="ej. Esteban Ortega"
                  disabled={oauthProvider !== null}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-username" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                  Username
                </label>
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="ej. Estebankito"
                  disabled={oauthProvider !== null}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                  Email
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="ej. esteban@example.com"
                  disabled={oauthProvider !== null}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="new-password" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {showRegPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <input
                  id="new-password"
                  name="password"
                  type={showRegPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="Mínimo 6 caracteres"
                  disabled={oauthProvider !== null}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="confirm-password" className="block font-(family-name:--font-bayon) text-sm uppercase tracking-widest text-gray-400 font-semibold">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showRegPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#E23C3C] rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-gray-600"
                  placeholder="Repite la contraseña"
                  disabled={oauthProvider !== null}
                />
              </div>

              <button
                type="submit"
                disabled={oauthProvider !== null}
                className="w-full bg-[#b32f2f] hover:bg-[#c12f2f] text-white py-3 rounded-xl font-bold uppercase tracking-widest font-(family-name:--font-bayon) text-sm transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                Sign Up
              </button>
            </motion.form>
          )}

        </AnimatePresence>

        {/* Divider */}
        <motion.div layout className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-white/10"></div>
          <span className="relative bg-[#111112] px-4 text-[10px] text-gray-500 uppercase tracking-widest">
            O continuar con
          </span>
        </motion.div>

        {/* OAuth Buttons */}
        <motion.div layout className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleMockOAuth("google")}
            disabled={oauthProvider !== null}
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 py-3 rounded-xl font-(family-name:--font-bayon) text-sm uppercase tracking-wider font-semibold transition-all hover:bg-white/10 cursor-pointer disabled:opacity-50"
          >
            {oauthProvider === "google" ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.5 1.7l2.4-2.4C17.3 1.5 14.9 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 9.8-4.15 9.8-10 0-.6-.05-1.2-.16-1.7H12.24z"/>
              </svg>
            )}
            Google
          </button>
          
          <button
            type="button"
            onClick={() => handleMockOAuth("facebook")}
            disabled={oauthProvider !== null}
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 py-3 rounded-xl font-(family-name:--font-bayon) text-sm uppercase tracking-wider font-semibold transition-all hover:bg-white/10 cursor-pointer disabled:opacity-50"
          >
            {oauthProvider === "facebook" ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            )}
            Facebook
          </button>
        </motion.div>

      </motion.div>
    </motion.main>
  );
}