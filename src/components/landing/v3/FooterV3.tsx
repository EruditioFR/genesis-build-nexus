import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Linkedin, Heart } from "lucide-react";
import logo from "@/assets/logo.png";
import LanguageSelector from "@/components/LanguageSelector";

const FooterV3 = () => {
  const { t } = useTranslation('landing');
  const currentYear = new Date().getFullYear();

  const essentialLinks = [
    { labelKey: "footer.links.about", href: "/about", isRoute: true },
    { labelKey: "footer.links.faq", href: "/faq", isRoute: true },
    { labelKey: "footer.links.privacy", href: "/privacy", isRoute: true },
    { labelKey: "footer.links.terms", href: "/cgv", isRoute: true },
    { labelKey: "footer.links.legalNotice", href: "/mentions-legales", isRoute: true },
  ];

  const socials = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-[hsl(var(--navy))] text-white border-t border-white/5">
      {/* Main row */}
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Brand */}
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <img
                src={logo}
                alt="Family Garden"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-xl font-display font-semibold text-white">
                Family<span className="text-[hsl(var(--gold-light))]">Garden</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            {/* Socials + Language */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[hsl(var(--gold))]/20 border border-white/10 hover:border-[hsl(var(--gold))]/40 flex items-center justify-center text-white/70 hover:text-[hsl(var(--gold-light))] transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
              <div className="h-5 w-px bg-white/10 mx-1" />
              <LanguageSelector variant="footer" />
            </div>
          </div>

          {/* Essential Links */}
          <div className="md:justify-self-end">
            <h4 className="font-display text-sm uppercase tracking-widest text-[hsl(var(--gold-light))] mb-5">
              {t('footer.categories.legal', 'Liens')}
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              {essentialLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-[hsl(var(--gold-light))] transition-colors text-sm"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-white/50">
              © {currentYear} Family Garden. {t('footer.copyright')}
            </p>
            <p className="text-xs sm:text-sm text-white/50 flex items-center gap-1.5">
              {t('footer.madeWith')}
              <Heart className="w-3.5 h-3.5 text-[hsl(var(--terracotta-light))] fill-[hsl(var(--terracotta-light))]" />
              {t('footer.toPreserve')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV3;
