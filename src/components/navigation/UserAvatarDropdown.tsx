'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  SignOutIcon,
  UserIcon,
  GearIcon,
} from '@phosphor-icons/react';

interface UserAvatarDropdownProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

export function UserAvatarDropdown({ 
  userName = "John Doe",
  userEmail = "john.doe@transpoco.com",
  avatarUrl,
  onLogout
}: UserAvatarDropdownProps) {
  
  const handleLogout = () => {
    onLogout?.();
    console.log('[Demo] User logout clicked');
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all hover:hover-only:bg-gray-300/20">
        <Avatar className="h-8 w-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        className="w-56"
        collisionPadding={10}
      >
        {/* User Info */}
        <div className="px-3 py-2">
          <div className="text-sm font-medium text-gray-900">{userName}</div>
          <div className="text-xs text-gray-500">{userEmail}</div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Profile Option */}
        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm">Profile</span>
        </DropdownMenuItem>
        
        {/* Settings Option */}
        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
          <GearIcon className="h-4 w-4 text-gray-400" />
          <span className="text-sm">Account Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout Option */}
        <DropdownMenuItem 
          className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleLogout}
        >
          <SignOutIcon className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}