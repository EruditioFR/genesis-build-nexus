import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation('landing');
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { labelKey: "footer.links.features", href: "#features" },
      { labelKey: "footer.links.pricing", href: "#pricing" },
      { labelKey: "footer.links.roadmap", href: "#" },
      { labelKey: "footer.links.changelog", href: "#" },
    ],
    company: [
      { labelKey: "footer.links.about", href: "/about", isRoute: true },
      { labelKey: "footer.links.blog", href: "#" },
      { labelKey: "footer.links.careers", href: "#" },
      { labelKey: "footer.links.partners", href: "#" },
    ],
    resources: [
      { labelKey: "footer.links.helpCenter", href: "/faq", isRoute: true },
      { labelKey: "footer.links.faq", href: "/faq", isRoute: true },
      { labelKey: "footer.links.guides", href: "#" },
      { labelKey: "footer.links.community", href: "#" },
    ],
    legal: [
      { labelKey: "footer.links.privacy", href: "/privacy", isRoute: true },
      { labelKey: "footer.links.terms", href: "/cgv", isRoute: true },
      { labelKey: "footer.links.legalNotice", href: "/mentions-legales", isRoute: true },
      { labelKey: "footer.links.gdpr", href: "/privacy", isRoute: true },
    ],
  };

  const categoryKeys: Record<string, string> = {
    product: 'footer.categories.product',
    company: 'footer.categories.company',
    resources: 'footer.categories.resources',
    legal: 'footer.categories.legal',
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <img src={logo} alt="Family Garden" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <span className="text-lg sm:text-xl font-display font-semibold">
                Family<span className="text-secondary">Garden</span>
              </span>
            </a>
            <p className="text-sm sm:text-base text-primary-foreground/70 leading-relaxed mb-4 sm:mb-6 max-w-xs">
              {t('footer.description')}
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
              <h4 className="font-display font-semibold text-primary-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                {t(categoryKeys[category])}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {items.map((link) => (
                  <li key={link.labelKey}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-primary-foreground/70 hover:text-secondary transition-colors text-xs sm:text-sm"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-primary-foreground/70 hover:text-secondary transition-colors text-xs sm:text-sm"
                      >
                        {t(link.labelKey)}
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
              © {currentYear} Family Garden. {t('footer.copyright')}
            </p>
            <p className="text-xs sm:text-sm text-primary-foreground/60 flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent fill-accent" /> {t('footer.toPreserve')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
