// Localized <title> / meta description for the homepage.
// Brand name first (query "family garden"), concrete benefit + price for CTR.

export interface HomeSeoMeta {
  title: string;
  description: string;
}

const HOME_SEO: Record<string, HomeSeoMeta> = {
  fr: {
    title: 'Family Garden — Journal de famille privé, 2,99 €/mois',
    description:
      "Réunissez tous vos souvenirs de famille (photos, vidéos, voix, récits) dans un journal de famille privé et sécurisé. 2,99 €/mois, 14 jours d'essai gratuit, RGPD.",
  },
  en: {
    title: 'Family Garden — Private family journal, €2.99/month',
    description:
      'Bring all your family memories together — photos, videos, voices and stories — in one private, secure family journal. €2.99/month, 14-day free trial, EU hosting.',
  },
  es: {
    title: 'Family Garden — Diario familiar privado, 2,99 €/mes',
    description:
      'Reúna todos sus recuerdos de familia (fotos, vídeos, voces y relatos) en un diario familiar privado y seguro. 2,99 €/mes, 14 días de prueba gratis, RGPD.',
  },
  it: {
    title: 'Family Garden — Diario di famiglia privato, 2,99 €/mese',
    description:
      'Riunisca tutti i suoi ricordi di famiglia (foto, video, voci e racconti) in un diario di famiglia privato e sicuro. 2,99 €/mese, 14 giorni di prova gratuita, GDPR.',
  },
  pt: {
    title: 'Family Garden — Diário de família privado, 2,99 €/mês',
    description:
      'Reúna todas as suas memórias de família (fotos, vídeos, vozes e relatos) num diário de família privado e seguro. 2,99 €/mês, 14 dias de teste grátis, RGPD.',
  },
  ko: {
    title: 'Family Garden — 비공개 가족 일기, 월 2.99유로',
    description:
      '사진, 영상, 목소리, 이야기 등 가족의 모든 추억을 안전한 비공개 가족 일기에 모으세요. 월 2.99유로, 14일 무료 체험, 유럽 GDPR 준수 호스팅.',
  },
  zh: {
    title: 'Family Garden — 私密家庭日记，每月 2.99 欧元',
    description:
      '将照片、视频、声音与故事等全部家庭回忆，汇聚于安全的私密家庭日记中。每月 2.99 欧元，14 天免费试用，欧盟 GDPR 合规托管。',
  },
};

export const getHomeSeoMeta = (lang?: string): HomeSeoMeta =>
  HOME_SEO[(lang || 'fr').split('-')[0]] ?? HOME_SEO.fr;
