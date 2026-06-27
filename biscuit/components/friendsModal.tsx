"use client";

import React from "react";
import { useRouter } from "next/navigation";
import currentUserData from "@/data/currentUser.json";

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // The owner of the profile we are inspecting
  mode: "followers" | "following";
  currentUserId: string; // The currently logged-in user
  onRelationsChanged: () => void;
}

export default function FriendsModal({
  isOpen,
  onClose,
  userId,
  mode,
  currentUserId,
  onRelationsChanged,
}: FriendsModalProps) {
  const router = useRouter();

  if (!isOpen || !userId) return null;

  // Retrieve followers or following list
  const storageKey = `${mode}_${userId}`;
  const listIds: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

  // Helper to lookup user details by ID
  const getUserDetails = (id: string) => {
    // 1. Check static users
    let found = currentUserData.users.find((u) => u.id === id);
    
    // 2. Check local registered users
    if (!found && typeof window !== "undefined") {
      const localUsersRaw = localStorage.getItem("localRegisteredUsers");
      if (localUsersRaw) {
        try {
          const localUsers = JSON.parse(localUsersRaw);
          found = localUsers.find((u: any) => u.id === id);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 3. Fallback/Default mock info
    if (!found) {
      found = {
        id,
        name: "User " + id.substring(0, 5),
        username: "user_" + id.substring(0, 5),
        avatar_url: "https://www.svgrepo.com/show/335455/profile-default.svg",
      } as any;
    }

    return found;
  };

  const usersList = listIds.map((id) => getUserDetails(id)).filter(Boolean) as any[];

  const handleRemove = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation(); // Prevent navigating to profile on button click

    if (mode === "following") {
      // Unfollow targetId:
      // Remove targetId from my following list
      const myFollowingKey = `following_${currentUserId}`;
      const myFollowing: string[] = JSON.parse(localStorage.getItem(myFollowingKey) || "[]");
      const updatedFollowing = myFollowing.filter((id) => id !== targetId);
      localStorage.setItem(myFollowingKey, JSON.stringify(updatedFollowing));

      // Remove currentUserId from targetId's followers list
      const targetFollowersKey = `followers_${targetId}`;
      const targetFollowers: string[] = JSON.parse(localStorage.getItem(targetFollowersKey) || "[]");
      const updatedFollowers = targetFollowers.filter((id) => id !== currentUserId);
      localStorage.setItem(targetFollowersKey, JSON.stringify(updatedFollowers));
    } else {
      // Remove targetId from my followers:
      // Remove targetId from my followers list
      const myFollowersKey = `followers_${currentUserId}`;
      const myFollowers: string[] = JSON.parse(localStorage.getItem(myFollowersKey) || "[]");
      const updatedFollowers = myFollowers.filter((id) => id !== targetId);
      localStorage.setItem(myFollowersKey, JSON.stringify(updatedFollowers));

      // Remove currentUserId from targetId's following list
      const targetFollowingKey = `following_${targetId}`;
      const targetFollowing: string[] = JSON.parse(localStorage.getItem(targetFollowingKey) || "[]");
      const updatedFollowing = targetFollowing.filter((id) => id !== currentUserId);
      localStorage.setItem(targetFollowingKey, JSON.stringify(updatedFollowing));
    }

    onRelationsChanged();
  };

  const handleUserClick = (targetId: string) => {
    onClose();
    // If it's the current user, navigate to /profile, otherwise /profile/id
    if (targetId === currentUserId) {
      router.push("/profile");
    } else {
      router.push(`/profile/${targetId}`);
    }
  };

  return (
    // OVERLAY CONTAINER
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    >
      {/* MODAL CARD */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#111112] w-full max-w-md rounded-[2rem] border border-zinc-800 shadow-2xl flex flex-col max-h-[75vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-start p-6 border-b border-zinc-900 bg-[#8E0B0B]/10">
          <div className="flex flex-col gap-1 overflow-hidden">
            <h2 className="font-[family-name:var(--font-biscuit)] text-3xl text-[#E23C3C] tracking-wide uppercase truncate leading-none mt-2">
              {mode}
            </h2>
            <p className="font-[family-name:var(--font-bayon)] text-xs text-zinc-400 tracking-widest uppercase mt-1">
              {usersList.length} {usersList.length === 1 ? "user" : "users"}
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
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* LIST BODY */}
        <div className="flex flex-col p-6 overflow-y-auto gap-3">
          {usersList.length === 0 ? (
            <div className="text-zinc-600 font-[family-name:var(--font-bayon)] text-center py-8 tracking-wide uppercase">
              No users found in this list.
            </div>
          ) : (
            usersList.map((usr) => (
              <div
                key={usr.id}
                onClick={() => handleUserClick(usr.id)}
                className="flex items-center justify-between p-3 bg-black/40 border border-zinc-900 rounded-xl hover:border-zinc-700 transition-colors group cursor-pointer"
              >
                {/* User avatar & info */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={usr.avatar_url || "https://www.svgrepo.com/show/335455/profile-default.svg"}
                    alt={usr.name}
                    className="w-10 h-10 object-cover rounded-full border border-zinc-800"
                    onError={(e) => {
                      e.currentTarget.src = "https://www.svgrepo.com/show/335455/profile-default.svg";
                    }}
                  />
                  <div className="flex flex-col truncate">
                    <p className="font-[family-name:var(--font-bayon)] text-lg text-white tracking-wider uppercase truncate leading-tight">
                      {usr.name}
                    </p>
                    <p className="font-sans text-[10px] text-zinc-500 truncate">
                      @{usr.username}
                    </p>
                  </div>
                </div>

                {/* Remove button (Only if inspecting own profile) */}
                {userId === currentUserId && (
                  <button
                    onClick={(e) => handleRemove(e, usr.id)}
                    className="bg-[#111112] border border-zinc-800 text-[#E23C3C] hover:bg-[#8E0B0B]/20 hover:border-[#E23C3C] font-[family-name:var(--font-bayon)] text-[10px] px-3 py-1.5 rounded-full tracking-widest transition-all uppercase font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
