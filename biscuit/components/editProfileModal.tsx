"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
      setError("");
    }
  }, [user, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setError("Image size exceeds 1.5MB. Please choose a smaller file.");
        return;
      }
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setError("Name and Username are required.");
      return;
    }

    try {
      // 1. Prepare updated user object
      const updatedUser = {
        ...user,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        isAuthenticated: true, // PRESERVE AUTHENTICATION
      };

      // 2. Save inside activeSession
      localStorage.setItem("activeSession", JSON.stringify(updatedUser));

      // 2b. Save profile override for user ID (persists across login/logout)
      localStorage.setItem(`profileOverride_${user.id}`, JSON.stringify({
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        avatar_url: updatedUser.avatar_url
      }));

      // 3. Save inside localRegisteredUsers (for database persistence)
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        const localUsers = JSON.parse(localUsersRaw);
        const updatedUsers = localUsers.map((u: any) => {
          if (u.id === user.id) {
            return {
              ...u,
              name: updatedUser.name,
              username: updatedUser.username,
              bio: updatedUser.bio,
              avatar_url: updatedUser.avatar_url,
            };
          }
          return u;
        });
        localStorage.setItem("localRegisteredUsers", JSON.stringify(updatedUsers));
      }

      onProfileUpdated(updatedUser);
      onClose();
    } catch (err) {
      console.error("Error saving profile details", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#111112] w-full max-w-lg rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
          <div className="flex flex-col gap-1 overflow-hidden">
            <h2 className="font-[family-name:var(--font-biscuit)] text-3xl text-[#E23C3C] tracking-wide uppercase leading-none mt-2">
              Edit Profile
            </h2>
            <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mt-1">
              Update your personal info and avatar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors text-xl font-bold p-2"
          >
            ✕
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="flex flex-col overflow-y-auto">
          <div className="flex flex-col p-6 gap-6">
            {error && (
              <div className="bg-[#8E0B0B]/20 border border-[#E23C3C] text-red-200 text-xs px-4 py-3 rounded-xl font-[family-name:var(--font-bayon)] tracking-wider uppercase">
                {error}
              </div>
            )}

            {/* Profile Avatar Selection */}
            <div className="flex flex-col items-center gap-4 border-b border-zinc-900 pb-6">
              <span className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase">
                Profile Photo
              </span>
              <div className="relative group">
                <img
                  src={avatarUrl || "https://www.svgrepo.com/show/335455/profile-default.svg"}
                  alt="Profile Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-zinc-800 shadow-lg"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="modal-avatar-upload"
                />
                <label
                  htmlFor="modal-avatar-upload"
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-[family-name:var(--font-bayon)] text-xs px-5 py-2 rounded-full cursor-pointer uppercase tracking-widest transition-colors font-bold shadow-md border border-zinc-700"
                >
                  Upload File
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="bg-transparent border border-zinc-800 text-zinc-500 hover:text-[#E23C3C] hover:border-[#E23C3C] font-[family-name:var(--font-bayon)] text-xs px-4 py-2 rounded-full uppercase tracking-widest transition-all font-bold cursor-pointer"
                  >
                    Clear Photo
                  </button>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                Files under 1.5MB recommended (saves to browser)
              </p>
            </div>

            {/* Name Input */}
            <div className="flex flex-col">
              <label className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Full Name <span className="text-[#E23C3C]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#E23C3C] transition-colors font-sans text-sm shadow-inner"
                required
              />
            </div>

            {/* Username Input */}
            <div className="flex flex-col">
              <label className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Username <span className="text-[#E23C3C]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-[family-name:var(--font-bayon)] text-[#E23C3C] text-sm select-none">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/30 border border-zinc-800 rounded-xl p-4 pl-8 text-white focus:outline-none focus:border-[#E23C3C] transition-colors font-sans text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Bio Input */}
            <div className="flex flex-col">
              <label className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Biography
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full bg-black/30 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#E23C3C] transition-colors font-sans text-sm shadow-inner h-24 resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-6 bg-black/40 border-t border-zinc-900 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-4 border border-zinc-800 hover:bg-zinc-800/50 text-white font-[family-name:var(--font-bayon)] text-lg tracking-widest rounded-full uppercase transition-all cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-4 bg-[#E23C3C] hover:bg-[#8E0B0B] text-black hover:text-white font-[family-name:var(--font-bayon)] text-lg tracking-widest rounded-full uppercase transition-all shadow-lg font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
