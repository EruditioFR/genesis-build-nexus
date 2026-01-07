import { Heart } from "lucide-react";

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
      { label: "Centre d'aide", href: "#" },
      { label: "Guides", href: "#" },
      { label: "API", href: "#" },
      { label: "Communauté", href: "#" },
    ],
    legal: [
      { label: "Confidentialité", href: "#" },
      { label: "CGU", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "RGPD", href: "#" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <span className="text-lg font-display font-bold text-secondary-foreground">M</span>
              </div>
              <span className="text-xl font-display font-semibold">
                Memoria<span className="text-secondary">Vita</span>
              </span>
            </a>
            <p className="text-primary-foreground/70 leading-relaxed mb-6 max-w-xs">
              Préservez l'extraordinaire de votre vie ordinaire et transmettez votre héritage aux générations futures.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary/20 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-primary-foreground mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-3">
                {items.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} MemoriaVita. Tous droits réservés.
            </p>
            <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
              Fait avec <Heart className="w-4 h-4 text-accent fill-accent" /> pour préserver vos souvenirs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
