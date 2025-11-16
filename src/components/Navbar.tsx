/**
 * Reusable Navbar Component
 * Shared navigation bar for both Admin and Teacher layouts
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/auth.service';
import { Menu, LogOut, User, Settings, type LucideIcon } from 'lucide-react';

export interface NavGroup {
  label?: string;
  items: readonly {
    readonly path: string;
    readonly label: string;
    readonly icon: LucideIcon;
  }[];
}

interface NavbarProps {
  navGroups?: readonly NavGroup[];
  logoText: string;
  logoIcon: ReactNode;
  homePath: string;
  profilePath: string;
  settingsPath: string;
}

export function Navbar({
  navGroups,
  logoText,
  logoIcon,
  homePath,
  profilePath,
  settingsPath,
}: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  const MobileNavLinks = () => (
    <div className="flex flex-col gap-1">
      {navGroups &&
        navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Group separator and label */}
            {groupIndex > 0 && (
              <div className="mt-4 mb-2">
                <div className="border-t border-border" />
              </div>
            )}

            {group.label && (
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              </div>
            )}

            {/* Group items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <Button
                    key={item.path}
                    variant={active ? 'default' : 'ghost'}
                    className={`justify-start w-full h-10 ${active ? '' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Link to={item.path}>
                      <Icon className="h-4 w-4 mr-3 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );

  const DesktopNavLinks = () => (
    <>
      {navGroups &&
        navGroups.map((group, groupIndex) => {
          // If group has a label, show as dropdown
          if (group.label && group.items.length > 1) {
            // Check if any item in this group is active
            const isGroupActive = group.items.some((item) => isActivePath(item.path));
            const GroupIcon = group.items[0]?.icon;

            return (
              <DropdownMenu key={groupIndex}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isGroupActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-1.5"
                  >
                    {GroupIcon && <GroupIcon className="h-4 w-4" />}
                    <span className="hidden lg:inline">{group.label}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 opacity-50"
                    >
                      <path
                        d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        <Link to={item.path}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          // Otherwise, show as regular buttons
          return group.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item.path);
            return (
              <Button
                key={item.path}
                variant={active ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className="gap-1.5"
              >
                <Link to={item.path}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              </Button>
            );
          });
        })}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-14 px-4 max-w-[100vw]">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    {logoIcon}
                    <div className="flex-1 min-w-0">
                      <SheetTitle className="text-left text-base font-bold truncate">
                        {logoText}
                      </SheetTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Navigation Menu</p>
                    </div>
                  </div>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-4">
                  <MobileNavLinks />
                </nav>
                {/* User info footer */}
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to={homePath} className="flex items-center gap-2 cursor-pointer group min-w-0">
              {logoIcon}
              <h1 className="text-base sm:text-lg font-bold truncate">{logoText}</h1>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-end mr-2">
            <DesktopNavLinks />
          </nav>

          {/* Right: User Menu */}
          <div className="flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profilePath)}>
                  <Link to={profilePath}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
