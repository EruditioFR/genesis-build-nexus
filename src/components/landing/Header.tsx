import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";

interface HeaderProps {
  forceSolid?: boolean;
}

const Header = ({ forceSolid = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const isSolid = forceSolid || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/10 ${
        isSolid
          ? "bg-[#1a1a2e]/85 backdrop-blur-xl shadow-lg shadow-black/20 py-3"
          : "bg-[#1a1a2e]/70 backdrop-blur-md py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
          <img src={logo} alt="Family Garden" className="w-10 h-10 object-contain" />
          <span
            className="text-xl font-display font-semibold transition-colors duration-300 hidden sm:inline text-primary-foreground"
          >
            Family<span className="text-secondary">Garden</span>
          </span>
          <span
            className="text-lg font-display font-semibold transition-colors duration-300 sm:hidden text-primary-foreground"
          >
            Family<span className="text-secondary">Garden</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-300 hover:text-secondary text-primary-foreground/90"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA / User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-primary-foreground/10"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-primary-foreground">
                    {profile?.display_name || user.email?.split('@')[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="transition-colors duration-300 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button asChild variant="hero" size="lg">
                <Link to="/signup">Commencer gratuitement</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 transition-colors text-primary-foreground"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu - Enhanced for seniors */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card shadow-elevated"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground font-semibold py-4 px-4 hover:bg-muted rounded-xl transition-colors text-lg flex items-center gap-3 active:bg-muted"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-4 py-3 px-4 bg-muted/50 rounded-xl">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-lg">
                        {profile?.display_name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <Button asChild variant="mobileSecondary" size="mobileLg" className="w-full justify-start">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-6 w-6 mr-3" />
                        Tableau de bord
                      </Link>
                    </Button>
                    <Button asChild variant="mobileSecondary" size="mobileLg" className="w-full justify-start">
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-6 w-6 mr-3" />
                        Mon profil
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="mobileLg"
                      className="w-full justify-start"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-6 w-6 mr-3" />
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="mobileSecondary" size="mobileLg" className="w-full">
                      <Link to="/login">Se connecter</Link>
                    </Button>
                    <Button asChild variant="mobilePrimary" size="mobileLg" className="w-full">
                      <Link to="/signup">Commencer gratuitement</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
