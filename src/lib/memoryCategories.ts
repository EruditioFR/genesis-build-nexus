import { Baby, GraduationCap, Music, Users, Heart } from 'lucide-react';

export interface MemoryPrompt {
  id: string;
  question: string;
}

export interface MemoryCategory {
  id: string;
  title: string;
  emoji: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
  bgColor: string;
  prompts: MemoryPrompt[];
}

export const memoryCategories: MemoryCategory[] = [
  {
    id: 'enfance',
    title: 'Enfance',
    emoji: '🌱',
    icon: Baby,
    description: 'Se souvenir sans effort',
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    prompts: [
      { id: 'enfance-1', question: 'Ferme les yeux quelques secondes… Où étais-tu quand tu avais 6 ans ?' },
      { id: 'enfance-2', question: 'À quoi ressemblait la maison de ton enfance ?' },
      { id: 'enfance-3', question: 'Quel objet te rendait heureux quand tu étais enfant ?' },
      { id: 'enfance-4', question: 'Raconte une bêtise qui te fait encore sourire aujourd\'hui.' },
      { id: 'enfance-5', question: 'De quoi avais-tu peur, et comment tu l\'as surmonté ?' },
      { id: 'enfance-6', question: 'Qui était la personne qui te rassurait le plus ?' },
      { id: 'enfance-7', question: 'Décris un moment simple où tu te sentais en sécurité.' },
      { id: 'enfance-8', question: 'Quel était ton endroit préféré pour jouer ?' },
      { id: 'enfance-9', question: 'Quelle phrase entendais-tu souvent à la maison ?' },
      { id: 'enfance-10', question: 'Quel souvenir te revient quand tu penses à "enfance" ?' },
    ],
  },
  {
    id: 'ecole',
    title: 'École & adolescence',
    emoji: '🎒',
    icon: GraduationCap,
    description: 'Identité en construction',
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    prompts: [
      { id: 'ecole-1', question: 'Rappelle-toi ton premier jour d\'école. Qu\'as-tu ressenti ?' },
      { id: 'ecole-2', question: 'Un professeur t\'a marqué. Pourquoi ?' },
      { id: 'ecole-3', question: 'Qui était ton meilleur ami à cette époque ?' },
      { id: 'ecole-4', question: 'Quel moment d\'école n\'oublieras-tu jamais ?' },
      { id: 'ecole-5', question: 'Quelle matière aimais-tu (ou détestais-tu) secrètement ?' },
      { id: 'ecole-6', question: 'Raconte un fou rire impossible à oublier.' },
      { id: 'ecole-7', question: 'Quel rêve avais-tu adolescent ?' },
      { id: 'ecole-8', question: 'Quelle musique tournait en boucle dans ta chambre ?' },
      { id: 'ecole-9', question: 'Qu\'y avait-il sur les murs de ta chambre ?' },
      { id: 'ecole-10', question: 'Quelle émotion te revient quand tu repenses à ces années ?' },
    ],
  },
  {
    id: 'musiques',
    title: 'Musiques & films',
    emoji: '🎵',
    icon: Music,
    description: 'Mémoire émotionnelle',
    gradient: 'from-purple-500 to-fuchsia-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    prompts: [
      { id: 'musiques-1', question: 'Quelle chanson te ramène instantanément en arrière ?' },
      { id: 'musiques-2', question: 'À quel moment cette musique est-elle liée ?' },
      { id: 'musiques-3', question: 'Quel film as-tu regardé encore et encore ?' },
      { id: 'musiques-4', question: 'Une scène de film t\'a marqué pour toujours. Laquelle ?' },
      { id: 'musiques-5', question: 'Quel générique te donne encore des frissons ?' },
      { id: 'musiques-6', question: 'Quelle musique est associée à une personne précise ?' },
      { id: 'musiques-7', question: 'Raconte ton premier concert ou spectacle.' },
      { id: 'musiques-8', question: 'Quelle chanson parle encore de toi aujourd\'hui ?' },
      { id: 'musiques-9', question: 'Un film t\'a fait pleurer pour la première fois… lequel ?' },
      { id: 'musiques-10', question: 'Si tu devais transmettre une musique, laquelle serait-ce ?' },
    ],
  },
  {
    id: 'famille',
    title: 'Famille',
    emoji: '👨‍👩‍👧‍👦',
    icon: Users,
    description: 'Transmission & racines',
    gradient: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    prompts: [
      { id: 'famille-1', question: 'Quel souvenir te relie le plus à ta famille ?' },
      { id: 'famille-2', question: 'Quelle habitude familiale a disparu mais te manque ?' },
      { id: 'famille-3', question: 'Une phrase typique d\'un parent te revient en tête ?' },
      { id: 'famille-4', question: 'Quel souvenir précieux as-tu avec tes grands-parents ?' },
      { id: 'famille-5', question: 'Raconte une recette qui raconte ton histoire.' },
      { id: 'famille-6', question: 'Un objet de famille a une histoire… laquelle ?' },
      { id: 'famille-7', question: 'Décris une fête de famille inoubliable.' },
      { id: 'famille-8', question: 'Quelle photo résume bien ta famille ?' },
      { id: 'famille-9', question: 'Quelle tradition aimerais-tu transmettre ?' },
      { id: 'famille-10', question: 'Quel conseil de vie as-tu reçu d\'un proche ?' },
    ],
  },
  {
    id: 'vie-personnelle',
    title: 'Vie personnelle',
    emoji: '❤️',
    icon: Heart,
    description: 'Sens & héritage',
    gradient: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    prompts: [
      { id: 'vie-1', question: 'Quel moment a changé le cours de ta vie ?' },
      { id: 'vie-2', question: 'Raconte une grande joie, même toute simple.' },
      { id: 'vie-3', question: 'Quelle épreuve t\'a fait grandir ?' },
      { id: 'vie-4', question: 'Quel choix t\'a rendu fier de toi ?' },
      { id: 'vie-5', question: 'Si tu écrivais une lettre à quelqu\'un, que dirais-tu ?' },
      { id: 'vie-6', question: 'Y a-t-il un souvenir que tu n\'as jamais raconté ?' },
      { id: 'vie-7', question: 'Quel lieu te fait te sentir "chez toi" ?' },
      { id: 'vie-8', question: 'Un moment ordinaire mais parfait… raconte-le.' },
      { id: 'vie-9', question: 'Qu\'aimerais-tu que tes proches comprennent de toi ?' },
      { id: 'vie-10', question: 'Si ce souvenir devait rester, lequel choisirais-tu ?' },
    ],
  },
];
