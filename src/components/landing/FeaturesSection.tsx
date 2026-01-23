import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Shield, 
  Download,
  Image,
  Video,
  Mic
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation('landing');

  const features = [
    {
      icon: BookOpen,
      titleKey: "features.items.capsules.title",
      descriptionKey: "features.items.capsules.description",
      color: "bg-secondary text-white",
    },
    {
      icon: Clock,
      titleKey: "features.items.timeline.title",
      descriptionKey: "features.items.timeline.description",
      color: "bg-accent text-white",
    },
    {
      icon: Users,
      titleKey: "features.items.circles.title",
      descriptionKey: "features.items.circles.description",
      color: "bg-violet-600 text-white",
    },
    {
      icon: Shield,
      titleKey: "features.items.security.title",
      descriptionKey: "features.items.security.description",
      color: "bg-emerald-600 text-white",
    },
    {
      icon: Download,
      titleKey: "features.items.export.title",
      descriptionKey: "features.items.export.description",
      color: "bg-rose-500 text-white",
    },
  ];

  const mediaTypes = [
    { icon: Image, labelKey: "features.mediaTypes.photos" },
    { icon: Video, labelKey: "features.mediaTypes.videos" },
    { icon: Mic, labelKey: "features.mediaTypes.audio" },
    { icon: BookOpen, labelKey: "features.mediaTypes.texts" },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-[#1a1a2e] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-semibold mb-3 sm:mb-4">
            {t('features.badge')}
          </span>
          <h2 className="text-3xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-4 sm:mb-6">
            {t('features.title')}
            <span className="text-secondary block sm:inline"> {t('features.titleHighlight')}</span>
          </h2>
          <p className="text-base sm:text-lg text-white/80 px-2 leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Media Types Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-4 sm:gap-6 md:gap-12 mb-10 sm:mb-16"
        >
          {mediaTypes.map((type) => (
            <div key={type.labelKey} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 shadow-lg flex items-center justify-center">
                <type.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <span className="text-sm font-semibold text-white/90">{t(type.labelKey)}</span>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-white/10 hover:border-secondary/40 hover:bg-white/10 transition-all duration-300">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-xl font-display font-bold text-white mb-2 sm:mb-3">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-base sm:text-base text-white/75 leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;