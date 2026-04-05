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
      { id: 'enfance-1', question: 'Fermez les yeux quelques secondes… Où étiez-vous quand vous aviez 6 ans ?' },
      { id: 'enfance-2', question: 'À quoi ressemblait la maison de votre enfance ?' },
      { id: 'enfance-3', question: 'Quel objet vous rendait heureux quand vous étiez enfant ?' },
      { id: 'enfance-4', question: 'Racontez une bêtise qui vous fait encore sourire aujourd\'hui.' },
      { id: 'enfance-5', question: 'De quoi aviez-vous peur, et comment l\'avez-vous surmonté ?' },
      { id: 'enfance-6', question: 'Qui était la personne qui vous rassurait le plus ?' },
      { id: 'enfance-7', question: 'Décrivez un moment simple où vous vous sentiez en sécurité.' },
      { id: 'enfance-8', question: 'Quel était votre endroit préféré pour jouer ?' },
      { id: 'enfance-9', question: 'Quelle phrase entendiez-vous souvent à la maison ?' },
      { id: 'enfance-10', question: 'Quel souvenir vous revient quand vous pensez à "enfance" ?' },
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
      { id: 'ecole-1', question: 'Rappelez-vous votre premier jour d\'école. Qu\'avez-vous ressenti ?' },
      { id: 'ecole-2', question: 'Un professeur vous a marqué. Pourquoi ?' },
      { id: 'ecole-3', question: 'Qui était votre meilleur ami à cette époque ?' },
      { id: 'ecole-4', question: 'Quel moment d\'école n\'oublierez-vous jamais ?' },
      { id: 'ecole-5', question: 'Quelle matière aimiez-vous (ou détestiez-vous) secrètement ?' },
      { id: 'ecole-6', question: 'Racontez un fou rire impossible à oublier.' },
      { id: 'ecole-7', question: 'Quel rêve aviez-vous adolescent ?' },
      { id: 'ecole-8', question: 'Quelle musique tournait en boucle dans votre chambre ?' },
      { id: 'ecole-9', question: 'Qu\'y avait-il sur les murs de votre chambre ?' },
      { id: 'ecole-10', question: 'Quelle émotion vous revient quand vous repensez à ces années ?' },
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
      { id: 'musiques-1', question: 'Quelle chanson vous ramène instantanément en arrière ?' },
      { id: 'musiques-2', question: 'À quel moment cette musique est-elle liée ?' },
      { id: 'musiques-3', question: 'Quel film avez-vous regardé encore et encore ?' },
      { id: 'musiques-4', question: 'Une scène de film vous a marqué pour toujours. Laquelle ?' },
      { id: 'musiques-5', question: 'Quel générique vous donne encore des frissons ?' },
      { id: 'musiques-6', question: 'Quelle musique est associée à une personne précise ?' },
      { id: 'musiques-7', question: 'Racontez votre premier concert ou spectacle.' },
      { id: 'musiques-8', question: 'Quelle chanson parle encore de vous aujourd\'hui ?' },
      { id: 'musiques-9', question: 'Un film vous a fait pleurer pour la première fois… lequel ?' },
      { id: 'musiques-10', question: 'Si vous deviez transmettre une musique, laquelle serait-ce ?' },
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
      { id: 'famille-1', question: 'Quel souvenir vous relie le plus à votre famille ?' },
      { id: 'famille-2', question: 'Quelle habitude familiale a disparu mais vous manque ?' },
      { id: 'famille-3', question: 'Une phrase typique d\'un parent vous revient en tête ?' },
      { id: 'famille-4', question: 'Quel souvenir précieux avez-vous avec vos grands-parents ?' },
      { id: 'famille-5', question: 'Racontez une recette qui raconte votre histoire.' },
      { id: 'famille-6', question: 'Un objet de famille a une histoire… laquelle ?' },
      { id: 'famille-7', question: 'Décrivez une fête de famille inoubliable.' },
      { id: 'famille-8', question: 'Quelle photo résume bien votre famille ?' },
      { id: 'famille-9', question: 'Quelle tradition aimeriez-vous transmettre ?' },
      { id: 'famille-10', question: 'Quel conseil de vie avez-vous reçu d\'un proche ?' },
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
      { id: 'vie-1', question: 'Quel moment a changé le cours de votre vie ?' },
      { id: 'vie-2', question: 'Racontez une grande joie, même toute simple.' },
      { id: 'vie-3', question: 'Quelle épreuve vous a fait grandir ?' },
      { id: 'vie-4', question: 'Quel choix vous a rendu fier de vous ?' },
      { id: 'vie-5', question: 'Si vous écriviez une lettre à quelqu\'un, que diriez-vous ?' },
      { id: 'vie-6', question: 'Y a-t-il un souvenir que vous n\'avez jamais raconté ?' },
      { id: 'vie-7', question: 'Quel lieu vous fait vous sentir "chez vous" ?' },
      { id: 'vie-8', question: 'Un moment ordinaire mais parfait… racontez-le.' },
      { id: 'vie-9', question: 'Qu\'aimeriez-vous que vos proches comprennent de vous ?' },
      { id: 'vie-10', question: 'Si ce souvenir devait rester, lequel choisiriez-vous ?' },
    ],
  },
];
