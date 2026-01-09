import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    produit: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Roadmap", href: "#" },
      { label: "Changelog", href: "#" },
    ],
    entreprise: [
      { label: "À propos", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Partenaires", href: "#" },
    ],
    ressources: [
      { label: "Centre d'aide", href: "/faq", isRoute: true },
      { label: "FAQ", href: "/faq", isRoute: true },
      { label: "Guides", href: "#" },
      { label: "Communauté", href: "#" },
    ],
    legal: [
      { label: "CGU", href: "/cgu", isRoute: true },
      { label: "CGV", href: "/cgv", isRoute: true },
      { label: "Confidentialité", href: "/privacy", isRoute: true },
      { label: "Mentions légales", href: "/mentions-legales", isRoute: true },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <span className="text-base sm:text-lg font-display font-bold text-secondary-foreground">M</span>
              </div>
              <span className="text-lg sm:text-xl font-display font-semibold">
                Memoria<span className="text-secondary">Vita</span>
              </span>
            </a>
            <p className="text-sm sm:text-base text-primary-foreground/70 leading-relaxed mb-4 sm:mb-6 max-w-xs">
              Votre histoire mérite de traverser les générations. Transmettez votre héritage aux générations futures.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 sm:gap-4">
              {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-primary-foreground mb-3 sm:mb-4 capitalize text-sm sm:text-base">
                {category}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {items.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-primary-foreground/70 hover:text-secondary transition-colors text-xs sm:text-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-primary-foreground/70 hover:text-secondary transition-colors text-xs sm:text-sm"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-primary-foreground/60 text-center sm:text-left">
              © {currentYear} MemoriaVita. Tous droits réservés.
            </p>
            <p className="text-xs sm:text-sm text-primary-foreground/60 flex items-center gap-1">
              Fait avec <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-accent" /> pour préserver vos souvenirs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
