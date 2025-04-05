"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  CircleDollarSign, 
  LayoutDashboard, 
  Layers, 
  Puzzle,
  Book, 
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/blockchain/WalletConnect';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => (
  <Link href={href} passHref>
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:text-primary",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-primary/5"
      )}
    >
      {icon}
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
    </div>
  </Link>
);

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: '/primitives',
      label: 'Primitives',
      icon: <Puzzle className="h-4 w-4" />,
    },
    {
      href: '/compositions',
      label: 'Compositions',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      href: '/documentation',
      label: 'Documentation',
      icon: <Book className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={toggleMenu}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex items-center gap-2">
          <CircleDollarSign className="h-6 w-6" />
          <span className="text-lg font-semibold">MoveMatrix</span>
        </div>
        <div className="ml-auto">
          <WalletConnect />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform md:static md:translate-x-0",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background p-6">
            <CircleDollarSign className="h-6 w-6" />
            <span className="text-lg font-semibold">MoveMatrix</span>
            {menuOpen && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4 shrink-0 md:hidden"
                onClick={toggleMenu}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            )}
          </div>
          <nav className="flex-1 overflow-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </div>
          </nav>
          <div className="sticky bottom-0 border-t bg-background p-4">
            <WalletConnect />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container max-w-7xl py-6 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
} 