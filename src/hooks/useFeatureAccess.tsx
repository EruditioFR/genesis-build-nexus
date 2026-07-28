import { useMemo } from 'react';
import { useSubscription } from './useSubscription';

export interface FeatureLimits {
  // Storage
  storageLimit: number; // in MB
  
  // Capsule types
  canCreateTextCapsule: boolean;
  canCreatePhotoCapsule: boolean;
  canCreateVideoCapsule: boolean;
  canCreateAudioCapsule: boolean;
  canCreateMixedCapsule: boolean;
  
  // Family tree
  canAccessFamilyTree: boolean;
  maxFamilyTreePersons: number;
  
  // Sharing
  maxCircles: number;
  maxMembersPerCircle: number;
  canShareUnlimited: boolean;
  
  // Advanced features
  canAccessTimeline: boolean;
  canAccessLegacyCapsules: boolean;
  canAccessPodcast: boolean;
  hasVIPSupport: boolean;
  hasAds: boolean;
  
  // Plan info
  planName: string;
  planNameFr: string;
}

const FREE_LIMITS: FeatureLimits = {
  storageLimit: 250,
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: false,
  canCreateAudioCapsule: false,
  canCreateMixedCapsule: false,
  canAccessFamilyTree: false,
  maxFamilyTreePersons: 0,
  maxCircles: -1,
  maxMembersPerCircle: -1,
  canShareUnlimited: true,
  canAccessTimeline: true,
  canAccessLegacyCapsules: false,
  canAccessPodcast: false,
  hasVIPSupport: false,
  hasAds: true,
  planName: 'free',
  planNameFr: 'Gratuit',
};

// New default paid plan (2,99€/mo)
const ESSENTIAL_LIMITS: FeatureLimits = {
  storageLimit: 20480, // 20 Go
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: true,
  canCreateAudioCapsule: true,
  canCreateMixedCapsule: true,
  canAccessFamilyTree: false, // add-on required
  maxFamilyTreePersons: 0,
  maxCircles: -1,
  maxMembersPerCircle: -1,
  canShareUnlimited: true,
  canAccessTimeline: true,
  canAccessLegacyCapsules: true,
  canAccessPodcast: true,
  hasVIPSupport: false,
  hasAds: false,
  planName: 'essential',
  planNameFr: 'Essentiel',
};

// Grandfathered Premium (4,99€) — kept unchanged
const PREMIUM_LIMITS: FeatureLimits = {
  storageLimit: 10240,
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: true,
  canCreateAudioCapsule: true,
  canCreateMixedCapsule: true,
  canAccessFamilyTree: false,
  maxFamilyTreePersons: 0,
  maxCircles: -1,
  maxMembersPerCircle: -1,
  canShareUnlimited: true,
  canAccessTimeline: true,
  canAccessLegacyCapsules: true,
  canAccessPodcast: false,
  hasVIPSupport: false,
  hasAds: false,
  planName: 'premium',
  planNameFr: 'Premium',
};

// Grandfathered Heritage (9,99€) — kept unchanged, includes family tree
const HERITAGE_LIMITS: FeatureLimits = {
  storageLimit: 20480,
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: true,
  canCreateAudioCapsule: true,
  canCreateMixedCapsule: true,
  canAccessFamilyTree: true,
  maxFamilyTreePersons: -1,
  maxCircles: -1,
  maxMembersPerCircle: -1,
  canShareUnlimited: true,
  canAccessTimeline: true,
  canAccessLegacyCapsules: true,
  canAccessPodcast: true,
  hasVIPSupport: true,
  hasAds: false,
  planName: 'heritage',
  planNameFr: 'Héritage',
};

export type CapsuleTypeKey = 'text' | 'photo' | 'video' | 'audio' | 'mixed';

export const useFeatureAccess = () => {
  const { tier, subscribed, loading, hasFamilyTreeAddon, trialing } = useSubscription();

  const limits = useMemo((): FeatureLimits => {
    let base: FeatureLimits;
    switch (tier) {
      case 'heritage':
        base = HERITAGE_LIMITS;
        break;
      case 'premium':
        base = PREMIUM_LIMITS;
        break;
      case 'essential':
        base = ESSENTIAL_LIMITS;
        break;
      default:
        base = FREE_LIMITS;
    }
    // Derived: family tree access when add-on is active or grandfathered heritage
    const treeAccess = base.canAccessFamilyTree || Boolean(hasFamilyTreeAddon);
    return {
      ...base,
      canAccessFamilyTree: treeAccess,
      maxFamilyTreePersons: treeAccess ? -1 : 0,
    };
  }, [tier, hasFamilyTreeAddon]);

  const canCreateCapsuleType = (type: CapsuleTypeKey): boolean => {
    switch (type) {
      case 'text':
        return limits.canCreateTextCapsule;
      case 'photo':
        return limits.canCreatePhotoCapsule;
      case 'video':
        return limits.canCreateVideoCapsule;
      case 'audio':
        return limits.canCreateAudioCapsule;
      case 'mixed':
        return limits.canCreateMixedCapsule;
      default:
        return false;
    }
  };

  const getUpgradePathForFeature = (feature: keyof FeatureLimits): 'essential' | 'family_tree_addon' | null => {
    // Family tree: always needs the add-on (unless grandfathered heritage)
    if (feature === 'canAccessFamilyTree') {
      return limits.canAccessFamilyTree ? null : 'family_tree_addon';
    }

    // Everything else is included in Essentiel
    const essentialFeatures: (keyof FeatureLimits)[] = [
      'canCreateVideoCapsule',
      'canCreateAudioCapsule',
      'canCreateMixedCapsule',
      'canAccessLegacyCapsules',
      'canAccessPodcast',
    ];

    if (essentialFeatures.includes(feature) && tier === 'free') {
      return 'essential';
    }

    return null;
  };

  const getFeatureBlockedMessage = (feature: keyof FeatureLimits): string => {
    const upgradePath = getUpgradePathForFeature(feature);
    if (!upgradePath) return '';

    if (upgradePath === 'family_tree_addon') {
      return "L'arbre généalogique est disponible en option à 5 €/mois.";
    }

    const featureMessages: Record<string, string> = {
      canCreateVideoCapsule: 'Les souvenirs vidéo sont disponibles avec l\'abonnement Essentiel (2,99 €/mois).',
      canCreateAudioCapsule: 'Les souvenirs audio sont disponibles avec l\'abonnement Essentiel (2,99 €/mois).',
      canCreateMixedCapsule: 'Les souvenirs mixtes sont disponibles avec l\'abonnement Essentiel (2,99 €/mois).',
      canAccessLegacyCapsules: 'Les souvenirs testament sont disponibles avec l\'abonnement Essentiel (2,99 €/mois).',
      canAccessPodcast: 'Le podcast de vos souvenirs est disponible avec l\'abonnement Essentiel (2,99 €/mois).',
    };

    return featureMessages[feature] || 'Cette fonctionnalité nécessite l\'abonnement Essentiel (2,99 €/mois).';
  };

  return {
    tier,
    subscribed,
    loading,
    hasFamilyTreeAddon,
    trialing,
    limits,
    canCreateCapsuleType,
    getUpgradePathForFeature,
    getFeatureBlockedMessage,
    isPremiumOrHigher: tier === 'essential' || tier === 'premium' || tier === 'heritage',
    isEssential: tier === 'essential',
    isHeritage: tier === 'heritage',
    isFree: tier === 'free',
    isGrandfathered: tier === 'premium' || tier === 'heritage',
  };
};

export default useFeatureAccess;
