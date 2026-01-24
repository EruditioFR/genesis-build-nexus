import { DriveStep } from 'driver.js';

export type TourType = 'dashboard' | 'capsule' | 'familyTree' | 'circles';

export interface TourStep extends DriveStep {
  route?: string;
}

// Dashboard tour steps - ENHANCED with better content and tips
export const dashboardTourSteps: TourStep[] = [
  {
    element: '[data-tour="welcome"]',
    popover: {
      title: '👋 Bienvenue sur Family Garden !',
      description: 'Votre espace personnel pour préserver et transmettre vos souvenirs de famille. Suivez cette visite pour découvrir toutes les fonctionnalités en quelques minutes.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="quick-actions"]',
    popover: {
      title: '🚀 Créez votre premier souvenir',
      description: 'C\'est ici que tout commence ! Cliquez sur "Nouveau souvenir" pour ajouter vos photos, vidéos, textes ou enregistrements audio. Chaque souvenir peut contenir plusieurs médias.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: '📊 Votre tableau de bord en chiffres',
      description: 'Visualisez d\'un coup d\'œil l\'évolution de votre collection : nombre de souvenirs créés, fichiers médias stockés et cercles de partage actifs.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="storage"]',
    popover: {
      title: '💾 Votre espace de stockage',
      description: 'Suivez votre consommation d\'espace. L\'offre gratuite inclut 500 Mo, parfait pour commencer. Passez à Premium pour un stockage illimité et des fonctionnalités exclusives !',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '[data-tour="recent-capsules"]',
    popover: {
      title: '📦 Vos souvenirs récents',
      description: 'Retrouvez instantanément vos dernières créations. Cliquez sur une carte pour consulter, modifier ou partager ce souvenir avec vos proches.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-capsules"]',
    popover: {
      title: '🗂️ Bibliothèque complète',
      description: 'Accédez à tous vos souvenirs organisés par catégories : Voyages, Famille, Événements... Utilisez les filtres pour retrouver facilement un moment précis.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-timeline"]',
    popover: {
      title: '📅 Chronologie visuelle',
      description: 'Voyagez dans le temps ! Visualisez vos souvenirs sur une frise chronologique interactive, des années 40 à aujourd\'hui. Parfait pour redécouvrir votre histoire.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-circles"]',
    popover: {
      title: '👨‍👩‍👧‍👦 Cercles de partage',
      description: 'Partagez en toute confidentialité avec vos proches. Créez des cercles (Famille, Amis d\'enfance...) et invitez-les par email. Ils pourront consulter et commenter vos souvenirs.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="nav-family-tree"]',
    popover: {
      title: '🌳 Arbre généalogique',
      description: 'Construisez votre arbre familial interactif ! Ajoutez vos ancêtres, liez les générations et associez des souvenirs à chaque personne. Disponible avec Premium.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '🔍 Recherche intelligente',
      description: 'Retrouvez n\'importe quel souvenir en un instant. Tapez un mot-clé, un nom de personne ou une date pour explorer votre collection.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: '🔔 Restez connecté',
      description: 'Recevez des notifications quand un proche partage un souvenir, commente vos créations ou quand un événement important approche.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: '👤 Votre espace personnel',
      description: 'Gérez votre profil, personnalisez vos paramètres, consultez votre abonnement ou relancez cette visite guidée à tout moment.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    popover: {
      title: '🎉 Vous êtes prêt !',
      description: 'Bravo, vous connaissez maintenant les bases ! Commencez par créer votre premier souvenir — chaque moment compte. Besoin d\'aide ? Retrouvez la visite guidée dans votre profil.',
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
