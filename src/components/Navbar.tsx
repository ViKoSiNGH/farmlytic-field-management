
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { GardenIcon, SeedlingIcon } from '@/components/GardenIcon';
import { Cloud, LayoutDashboard, Settings, BarChart, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Define nav items with exact paths that match the router configuration
  const navItems = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
    { name: 'Fields', href: '/fields', icon: <GardenIcon className="h-4 w-4 mr-2" /> },
    { name: 'Crops', href: '/crops', icon: <SeedlingIcon className="h-4 w-4 mr-2" /> },
    { name: 'Weather', href: '/weather', icon: <Cloud className="h-4 w-4 mr-2" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart className="h-4 w-4 mr-2" /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GardenIcon className="h-8 w-8 text-primary transition-transform hover:scale-110 duration-300" />
              <span className="text-xl font-semibold tracking-tight">FarmLytic</span>
            </Link>
          </div>

          {!isMobile && (
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-item flex items-center text-foreground/80 hover:text-foreground hover:bg-muted/50",
                    location.pathname === item.href && "bg-muted text-foreground"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4 mr-1" />
                    {user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                
                <Link to="/register" className="hidden sm:block">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
            
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="nav-item flex items-center text-foreground/80 hover:text-foreground hover:bg-muted/50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-border/50 my-2 pt-2">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="nav-item flex items-center text-foreground/80 hover:text-foreground hover:bg-muted/50 block w-full justify-start px-3 py-2 rounded-md text-base font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="nav-item flex items-center text-foreground/80 hover:text-foreground hover:bg-muted/50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                  
                  <Link
                    to="/register"
                    className="nav-item flex items-center text-foreground/80 hover:text-foreground hover:bg-muted/50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
