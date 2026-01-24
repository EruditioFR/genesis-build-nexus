import { DriveStep } from 'driver.js';
import i18n from './i18n';

export type TourType = 'dashboard' | 'capsule' | 'familyTree' | 'circles';

export interface TourStep extends DriveStep {
  route?: string;
}

// Helper to get translation
const t = (key: string) => i18n.t(key, { ns: 'common' });

// Dashboard tour steps - dynamically translated
const getDashboardTourSteps = (): TourStep[] => [
  {
    element: '[data-tour="welcome"]',
    popover: {
      title: t('tour.dashboard.welcome.title'),
      description: t('tour.dashboard.welcome.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: t('tour.dashboard.quickActions.title'),
      description: t('tour.dashboard.quickActions.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: t('tour.dashboard.stats.title'),
      description: t('tour.dashboard.stats.description'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: t('tour.dashboard.storage.title'),
      description: t('tour.dashboard.storage.description'),
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="recent-capsules"]',
    popover: {
      title: t('tour.dashboard.recentCapsules.title'),
      description: t('tour.dashboard.recentCapsules.description'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-capsules"]',
    popover: {
      title: t('tour.dashboard.navCapsules.title'),
      description: t('tour.dashboard.navCapsules.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-timeline"]',
    popover: {
      title: t('tour.dashboard.navTimeline.title'),
      description: t('tour.dashboard.navTimeline.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-circles"]',
    popover: {
      title: t('tour.dashboard.navCircles.title'),
      description: t('tour.dashboard.navCircles.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-family-tree"]',
    popover: {
      title: t('tour.dashboard.navFamilyTree.title'),
      description: t('tour.dashboard.navFamilyTree.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: t('tour.dashboard.search.title'),
      description: t('tour.dashboard.search.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: t('tour.dashboard.notifications.title'),
      description: t('tour.dashboard.notifications.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: t('tour.dashboard.userMenu.title'),
      description: t('tour.dashboard.userMenu.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: t('tour.dashboard.complete.title'),
      description: t('tour.dashboard.complete.description'),
    },
  },
];

// Capsule creation tour steps
const getCapsuleTourSteps = (): TourStep[] => [
  {
    element: '[data-tour="capsule-category"]',
    popover: {
      title: t('tour.capsule.category.title'),
      description: t('tour.capsule.category.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-type"]',
    popover: {
      title: t('tour.capsule.type.title'),
      description: t('tour.capsule.type.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-title"]',
    popover: {
      title: t('tour.capsule.title.title'),
      description: t('tour.capsule.title.description'),
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-media"]',
    popover: {
      title: t('tour.capsule.media.title'),
      description: t('tour.capsule.media.description'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-date"]',
    popover: {
      title: t('tour.capsule.date.title'),
      description: t('tour.capsule.date.description'),
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-tags"]',
    popover: {
      title: t('tour.capsule.tags.title'),
      description: t('tour.capsule.tags.description'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-actions"]',
    popover: {
      title: t('tour.capsule.actions.title'),
      description: t('tour.capsule.actions.description'),
      side: 'top',
      align: 'end',
    },
  },
  {
    popover: {
      title: t('tour.capsule.complete.title'),
      description: t('tour.capsule.complete.description'),
    },
  },
];

// Family tree tour steps
const getFamilyTreeTourSteps = (): TourStep[] => [
  {
    element: '[data-tour="tree-visualization"]',
    popover: {
      title: t('tour.familyTree.visualization.title'),
      description: t('tour.familyTree.visualization.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-add-person"]',
    popover: {
      title: t('tour.familyTree.addPerson.title'),
      description: t('tour.familyTree.addPerson.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tree-zoom"]',
    popover: {
      title: t('tour.familyTree.zoom.title'),
      description: t('tour.familyTree.zoom.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-view-mode"]',
    popover: {
      title: t('tour.familyTree.viewMode.title'),
      description: t('tour.familyTree.viewMode.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-search"]',
    popover: {
      title: t('tour.familyTree.search.title'),
      description: t('tour.familyTree.search.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-center"]',
    popover: {
      title: t('tour.familyTree.center.title'),
      description: t('tour.familyTree.center.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-import-export"]',
    popover: {
      title: t('tour.familyTree.importExport.title'),
      description: t('tour.familyTree.importExport.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-persons-list"]',
    popover: {
      title: t('tour.familyTree.personsList.title'),
      description: t('tour.familyTree.personsList.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-minimap"]',
    popover: {
      title: t('tour.familyTree.minimap.title'),
      description: t('tour.familyTree.minimap.description'),
      side: 'left',
      align: 'end',
    },
  },
  {
    popover: {
      title: t('tour.familyTree.complete.title'),
      description: t('tour.familyTree.complete.description'),
    },
  },
];

// Circles tour steps
const getCirclesTourSteps = (): TourStep[] => [
  {
    element: '[data-tour="circles-header"]',
    popover: {
      title: t('tour.circles.header.title'),
      description: t('tour.circles.header.description'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-create"]',
    popover: {
      title: t('tour.circles.create.title'),
      description: t('tour.circles.create.description'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="circles-list"]',
    popover: {
      title: t('tour.circles.list.title'),
      description: t('tour.circles.list.description'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-details"]',
    popover: {
      title: t('tour.circles.details.title'),
      description: t('tour.circles.details.description'),
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-invite"]',
    popover: {
      title: t('tour.circles.invite.title'),
      description: t('tour.circles.invite.description'),
      side: 'bottom',
      align: 'center',
    },
  },
  {
    popover: {
      title: t('tour.circles.complete.title'),
      description: t('tour.circles.complete.description'),
    },
  },
];

// Get steps by tour type - now returns fresh translations
export const getTourSteps = (tourType: TourType): TourStep[] => {
  switch (tourType) {
    case 'dashboard':
      return getDashboardTourSteps();
    case 'capsule':
      return getCapsuleTourSteps();
    case 'familyTree':
      return getFamilyTreeTourSteps();
    case 'circles':
      return getCirclesTourSteps();
    default:
      return getDashboardTourSteps();
  }
};

// Get tour title for display - now translated
export const getTourTitle = (tourType: TourType): string => {
  return t(`tour.titles.${tourType}`);
};

// Tour completion storage keys
export const getTourStorageKey = (tourType: TourType): string => {
  return `tour_completed_${tourType}`;
};
