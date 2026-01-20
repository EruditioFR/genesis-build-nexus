import { DriveStep } from 'driver.js';

export type TourType = 'dashboard' | 'capsule' | 'familyTree' | 'circles';

export interface TourStep extends DriveStep {
  route?: string;
}

// Dashboard tour steps
export const dashboardTourSteps: TourStep[] = [
  {
    element: '[data-tour="welcome"]',
    popover: {
      title: '👋 Bienvenue sur Family Garden !',
      description: 'Découvrez comment préserver et partager vos souvenirs de famille. Cette visite vous guidera à travers les fonctionnalités principales.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: '🚀 Actions rapides',
      description: 'Créez un nouveau souvenir en un clic ! C\'est le moyen le plus rapide d\'ajouter des photos, vidéos ou textes à votre collection.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: '📊 Vos statistiques',
      description: 'Suivez l\'évolution de votre collection : nombre de souvenirs, fichiers médias et cercles de partage.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: '💾 Espace de stockage',
      description: 'Visualisez votre espace utilisé. Passez à Premium pour un stockage illimité !',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="recent-capsules"]',
    popover: {
      title: '📦 Souvenirs récents',
      description: 'Retrouvez ici vos derniers souvenirs ajoutés. Cliquez sur une carte pour la consulter.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-capsules"]',
    popover: {
      title: '🗂️ Toutes vos capsules',
      description: 'Accédez à l\'ensemble de vos souvenirs, organisés et filtrables par catégorie.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-timeline"]',
    popover: {
      title: '📅 La chronologie',
      description: 'Visualisez vos souvenirs dans le temps, comme un album photo chronologique.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-circles"]',
    popover: {
      title: '👨‍👩‍👧‍👦 Les cercles',
      description: 'Créez des cercles pour partager vos souvenirs avec la famille ou les amis proches.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '🔍 Recherche globale',
      description: 'Retrouvez n\'importe quel souvenir instantanément grâce à la recherche.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: '🔔 Notifications',
      description: 'Restez informé des nouveaux partages et événements importants.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: '👤 Votre profil',
      description: 'Gérez votre profil, vos paramètres et votre abonnement depuis ce menu.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: '🎉 C\'est parti !',
      description: 'Vous êtes prêt à commencer ! Cliquez sur "Nouveau souvenir" pour créer votre première capsule temporelle.',
    },
  },
];

// Capsule creation tour steps
export const capsuleTourSteps: TourStep[] = [
  {
    element: '[data-tour="capsule-category"]',
    popover: {
      title: '📂 Catégorie',
      description: 'Choisissez une catégorie pour organiser votre souvenir. Vous pouvez aussi créer des catégories personnalisées.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-type"]',
    popover: {
      title: '📷 Type de souvenir',
      description: 'Sélectionnez le type de contenu : texte, photo, vidéo, audio ou mixte selon ce que vous souhaitez sauvegarder.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-title"]',
    popover: {
      title: '✏️ Titre et description',
      description: 'Donnez un titre évocateur à votre souvenir et ajoutez une description pour le retrouver facilement.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-media"]',
    popover: {
      title: '📎 Fichiers médias',
      description: 'Ajoutez vos photos, vidéos ou fichiers audio. Vous pouvez glisser-déposer ou cliquer pour sélectionner.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-date"]',
    popover: {
      title: '📅 Date du souvenir',
      description: 'Indiquez quand ce moment a eu lieu. Vous pouvez choisir une date précise ou une période.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="capsule-tags"]',
    popover: {
      title: '🏷️ Tags',
      description: 'Ajoutez des mots-clés pour retrouver facilement ce souvenir plus tard.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="capsule-actions"]',
    popover: {
      title: '💾 Enregistrer',
      description: 'Sauvegardez en brouillon pour continuer plus tard, ou publiez directement votre souvenir.',
      side: 'top',
      align: 'end',
    },
  },
  {
    popover: {
      title: '🎉 À vous de jouer !',
      description: 'Vous connaissez maintenant toutes les étapes pour créer un souvenir. Commencez par choisir une catégorie !',
    },
  },
];

// Family tree tour steps
export const familyTreeTourSteps: TourStep[] = [
  {
    element: '[data-tour="tree-visualization"]',
    popover: {
      title: '🌳 Votre arbre généalogique',
      description: 'Visualisez votre famille sous forme d\'arbre interactif. Cliquez sur une personne pour voir ses détails.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-add-person"]',
    popover: {
      title: '➕ Ajouter une personne',
      description: 'Cliquez ici pour ajouter un nouveau membre à votre arbre familial.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="tree-zoom"]',
    popover: {
      title: '🔍 Zoom et navigation',
      description: 'Utilisez les contrôles de zoom pour ajuster la vue. Vous pouvez aussi faire glisser l\'arbre.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-view-mode"]',
    popover: {
      title: '👁️ Mode de vue',
      description: 'Changez le mode d\'affichage : descendants, ascendants ou vue sablier centrée sur une personne.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-search"]',
    popover: {
      title: '🔎 Rechercher',
      description: 'Trouvez rapidement une personne dans votre arbre grâce à la recherche.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-center"]',
    popover: {
      title: '🎯 Centrer sur...',
      description: 'Sélectionnez une personne pour centrer la vue sur elle.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="tree-import-export"]',
    popover: {
      title: '📥 Import/Export',
      description: 'Importez un fichier GEDCOM ou exportez votre arbre en PDF ou GEDCOM.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-persons-list"]',
    popover: {
      title: '📋 Liste des personnes',
      description: 'Consultez la liste complète de toutes les personnes de votre arbre.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="tree-minimap"]',
    popover: {
      title: '🗺️ Mini-carte',
      description: 'Utilisez la mini-carte pour naviguer rapidement dans un grand arbre.',
      side: 'left',
      align: 'end',
    },
  },
  {
    popover: {
      title: '🎉 Prêt à explorer !',
      description: 'Votre arbre généalogique vous attend. Commencez par ajouter vos proches !',
    },
  },
];

// Circles tour steps
export const circlesTourSteps: TourStep[] = [
  {
    element: '[data-tour="circles-header"]',
    popover: {
      title: '👨‍👩‍👧‍👦 Vos cercles de partage',
      description: 'Les cercles vous permettent de partager vos souvenirs avec des groupes spécifiques : famille, amis, etc.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-create"]',
    popover: {
      title: '➕ Créer un cercle',
      description: 'Cliquez ici pour créer un nouveau cercle de partage.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="circles-list"]',
    popover: {
      title: '📋 Vos cercles',
      description: 'Retrouvez tous vos cercles ici. Cliquez sur un cercle pour voir ses membres.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-details"]',
    popover: {
      title: '👥 Détails du cercle',
      description: 'Consultez et gérez les membres de votre cercle depuis ce panneau.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="circles-invite"]',
    popover: {
      title: '✉️ Inviter des membres',
      description: 'Invitez de nouvelles personnes par email. Elles recevront un lien pour rejoindre votre cercle.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    popover: {
      title: '🎉 Partagez vos souvenirs !',
      description: 'Créez votre premier cercle et invitez vos proches pour partager vos souvenirs en toute intimité.',
    },
  },
];

// Get steps by tour type
export const getTourSteps = (tourType: TourType): TourStep[] => {
  switch (tourType) {
    case 'dashboard':
      return dashboardTourSteps;
    case 'capsule':
      return capsuleTourSteps;
    case 'familyTree':
      return familyTreeTourSteps;
    case 'circles':
      return circlesTourSteps;
    default:
      return dashboardTourSteps;
  }
};

// Get tour title for display
export const getTourTitle = (tourType: TourType): string => {
  switch (tourType) {
    case 'dashboard':
      return 'Découvrir le tableau de bord';
    case 'capsule':
      return 'Créer un souvenir';
    case 'familyTree':
      return 'Arbre généalogique';
    case 'circles':
      return 'Cercles de partage';
    default:
      return 'Visite guidée';
  }
};

// Tour completion storage keys
export const getTourStorageKey = (tourType: TourType): string => {
  return `tour_completed_${tourType}`;
};
