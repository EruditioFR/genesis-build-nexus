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
  maxCircles: 1,
  maxMembersPerCircle: 1,
  canShareUnlimited: false,
  canAccessTimeline: true,
  canAccessLegacyCapsules: false,
  canAccessPodcast: false,
  hasVIPSupport: false,
  hasAds: true,
  planName: 'free',
  planNameFr: 'Gratuit',
};

const PREMIUM_LIMITS: FeatureLimits = {
  storageLimit: 10240, // 10 GB
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: true,
  canCreateAudioCapsule: true,
  canCreateMixedCapsule: true,
  canAccessFamilyTree: false,
  maxFamilyTreePersons: 0,
  maxCircles: 3,
  maxMembersPerCircle: 5,
  canShareUnlimited: false,
  canAccessTimeline: true,
  canAccessLegacyCapsules: true,
  canAccessPodcast: false,
  hasVIPSupport: false,
  hasAds: false,
  planName: 'premium',
  planNameFr: 'Premium',
};

const HERITAGE_LIMITS: FeatureLimits = {
  storageLimit: 51200, // 50 GB
  canCreateTextCapsule: true,
  canCreatePhotoCapsule: true,
  canCreateVideoCapsule: true,
  canCreateAudioCapsule: true,
  canCreateMixedCapsule: true,
  canAccessFamilyTree: true,
  maxFamilyTreePersons: -1, // unlimited
  maxCircles: -1, // unlimited
  maxMembersPerCircle: -1, // unlimited
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
  const { tier, subscribed, loading } = useSubscription();

  const limits = useMemo((): FeatureLimits => {
    switch (tier) {
      case 'heritage':
        return HERITAGE_LIMITS;
      case 'premium':
        return PREMIUM_LIMITS;
      default:
        return FREE_LIMITS;
    }
  }, [tier]);

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

  const getUpgradePathForFeature = (feature: keyof FeatureLimits): 'premium' | 'heritage' | null => {
    // If user already has heritage, no upgrade needed
    if (tier === 'heritage') return null;

    // Features requiring heritage
    const heritageOnlyFeatures: (keyof FeatureLimits)[] = [
      'canAccessFamilyTree',
      'canAccessPodcast',
      'hasVIPSupport',
      'canShareUnlimited',
    ];

    if (heritageOnlyFeatures.includes(feature)) {
      return 'heritage';
    }

    // Features available in premium
    const premiumFeatures: (keyof FeatureLimits)[] = [
      'canCreateVideoCapsule',
      'canCreateAudioCapsule',
      'canCreateMixedCapsule',
      'canAccessLegacyCapsules',
    ];

    if (premiumFeatures.includes(feature) && tier === 'free') {
      return 'premium';
    }

    return null;
  };

  const getFeatureBlockedMessage = (feature: keyof FeatureLimits): string => {
    const upgradePath = getUpgradePathForFeature(feature);
    
    if (!upgradePath) return '';

    const featureMessages: Record<string, string> = {
      canCreateVideoCapsule: 'Les capsules vidéo sont disponibles avec le forfait Premium.',
      canCreateAudioCapsule: 'Les capsules audio sont disponibles avec le forfait Premium.',
      canCreateMixedCapsule: 'Les capsules mixtes sont disponibles avec le forfait Premium.',
      canAccessFamilyTree: 'L\'arbre généalogique est disponible avec le forfait Héritage.',
      canAccessPodcast: 'Le podcast de vos souvenirs est disponible avec le forfait Héritage.',
      hasVIPSupport: 'Le support VIP WhatsApp est disponible avec le forfait Héritage.',
      canShareUnlimited: 'Le partage illimité est disponible avec le forfait Héritage.',
      canAccessLegacyCapsules: 'Les capsules testament sont disponibles avec le forfait Premium.',
    };

    return featureMessages[feature] || `Cette fonctionnalité nécessite le forfait ${upgradePath === 'heritage' ? 'Héritage' : 'Premium'}.`;
  };

  return {
    tier,
    subscribed,
    loading,
    limits,
    canCreateCapsuleType,
    getUpgradePathForFeature,
    getFeatureBlockedMessage,
    isPremiumOrHigher: tier === 'premium' || tier === 'heritage',
    isHeritage: tier === 'heritage',
    isFree: tier === 'free',
  };
};

export default useFeatureAccess;
