// Textes alternatifs descriptifs des images de couverture des articles du blog.
// Clé = translation_group de l'article, valeur = description par langue.

type Lang = "fr" | "en" | "es" | "it" | "pt" | "ko" | "zh";

const ALT: Record<string, Partial<Record<Lang, string>>> = {
  "photos-conservation": {
    fr: "Albums photo anciens et tirages papier posés sur une table en bois",
    en: "Vintage photo albums and paper prints laid out on a wooden table",
    es: "Álbumes de fotos antiguos y copias en papel sobre una mesa de madera",
    it: "Vecchi album fotografici e stampe su un tavolo di legno",
    pt: "Álbuns de fotografias antigos e provas em papel sobre uma mesa de madeira",
    ko: "나무 탁자 위에 놓인 오래된 사진 앨범과 인화 사진",
    zh: "木桌上摆放的旧相册与纸质照片",
  },
  cousinade: {
    fr: "Grande famille réunie dans un jardin lors d'une cousinade",
    en: "Extended family gathered in a garden for a family reunion",
    es: "Familia numerosa reunida en un jardín durante un encuentro familiar",
    it: "Famiglia allargata riunita in giardino per un raduno di famiglia",
    pt: "Família alargada reunida num jardim durante um encontro de família",
    ko: "정원에 모인 대가족의 친척 모임",
    zh: "家族成员在花园中举行的亲族聚会",
  },
  mariage: {
    fr: "Alliances de mariage et fleurs séchées posées sur du lin",
    en: "Wedding rings and pressed flowers resting on linen",
    es: "Alianzas de boda y flores secas sobre lino",
    it: "Fedi nuziali e fiori secchi su un tessuto di lino",
    pt: "Alianças de casamento e flores secas sobre linho",
    ko: "린넨 위에 놓인 결혼반지와 말린 꽃",
    zh: "亚麻布上的结婚戒指与干花",
  },
  naissance: {
    fr: "Main d'un parent tenant la main d'un nouveau-né",
    en: "A parent's hand holding a newborn's hand",
    es: "La mano de un padre sosteniendo la mano de un recién nacido",
    it: "La mano di un genitore che tiene la mano di un neonato",
    pt: "A mão de um pai a segurar a mão de um recém-nascido",
    ko: "갓난아기의 손을 잡은 부모의 손",
    zh: "父母握着新生儿小手的画面",
  },
  "medical-memoire": {
    fr: "Soignante feuilletant un album photo avec une personne âgée",
    en: "Caregiver looking through a photo album with an elderly person",
    es: "Cuidadora hojeando un álbum de fotos con una persona mayor",
    it: "Operatrice che sfoglia un album di foto con una persona anziana",
    pt: "Cuidadora a folhear um álbum de fotografias com uma pessoa idosa",
    ko: "어르신과 함께 사진 앨범을 넘겨 보는 돌봄 종사자",
    zh: "护理人员与长者一起翻看相册",
  },
  voyage: {
    fr: "Appareil photo ancien, carte routière et coquillages de vacances",
    en: "Vintage camera, road map and holiday seashells",
    es: "Cámara antigua, mapa de carreteras y conchas de vacaciones",
    it: "Macchina fotografica d'epoca, mappa stradale e conchiglie delle vacanze",
    pt: "Máquina fotográfica antiga, mapa e conchas de férias",
    ko: "빈티지 카메라와 지도, 여행에서 주운 조개껍데기",
    zh: "复古相机、地图与度假带回的贝壳",
  },
  ancetres: {
    fr: "Portraits sépia d'ancêtres dans des cadres anciens",
    en: "Sepia portraits of ancestors in vintage frames",
    es: "Retratos en sepia de antepasados en marcos antiguos",
    it: "Ritratti seppia di antenati in cornici d'epoca",
    pt: "Retratos em sépia de antepassados em molduras antigas",
    ko: "고풍스러운 액자에 담긴 조상들의 세피아 초상 사진",
    zh: "复古相框中的先祖棕褐色肖像照",
  },
  enfance: {
    fr: "Vieux vélo d'enfant et ours en peluche dans un grenier ensoleillé",
    en: "Old child's bicycle and teddy bear in a sunlit attic",
    es: "Bicicleta antigua de niño y osito de peluche en un desván soleado",
    it: "Vecchia bicicletta da bambino e orsetto in una soffitta illuminata dal sole",
    pt: "Bicicleta antiga de criança e urso de peluche num sótão soalheiro",
    ko: "햇살이 드는 다락방의 낡은 어린이 자전거와 곰 인형",
    zh: "阳光洒落的阁楼里的旧童车与泰迪熊",
  },
  "partage-securise": {
    fr: "Famille regardant ensemble des photos sur une tablette",
    en: "Family looking at photos together on a tablet",
    es: "Familia mirando fotos juntas en una tableta",
    it: "Famiglia che guarda insieme delle foto su un tablet",
    pt: "Família a ver fotografias em conjunto num tablet",
    ko: "태블릿으로 함께 사진을 보는 가족",
    zh: "一家人一起用平板电脑翻看照片",
  },
  "vs-reseaux-sociaux": {
    fr: "Album photo dans une boîte en bois face à un smartphone allumé",
    en: "Photo album in a wooden box beside a glowing smartphone",
    es: "Álbum de fotos en una caja de madera frente a un móvil encendido",
    it: "Album fotografico in una scatola di legno accanto a uno smartphone acceso",
    pt: "Álbum de fotografias numa caixa de madeira ao lado de um smartphone aceso",
    ko: "나무 상자 속 사진 앨범과 켜져 있는 스마트폰",
    zh: "木盒中的相册与亮着屏幕的手机",
  },
  "arbre-genealogique-en-ligne-photos-et-souvenirs": {
    fr: "Arbre généalogique dessiné à la main avec photos de famille",
    en: "Hand-drawn family tree with family photographs",
    es: "Árbol genealógico dibujado a mano con fotos de familia",
    it: "Albero genealogico disegnato a mano con fotografie di famiglia",
    pt: "Árvore genealógica desenhada à mão com fotografias de família",
    ko: "가족사진과 함께 손으로 그린 가계도",
    zh: "手绘家谱与家庭照片",
  },
  "capsule-temporelle-numerique-comment-en-creer-une": {
    fr: "Boîte en bois ancienne utilisée comme capsule temporelle",
    en: "Vintage wooden box used as a time capsule",
    es: "Caja de madera antigua utilizada como cápsula del tiempo",
    it: "Vecchia scatola di legno usata come capsula del tempo",
    pt: "Caixa de madeira antiga usada como cápsula do tempo",
    ko: "타임캡슐로 쓰인 오래된 나무 상자",
    zh: "作为时光胶囊使用的复古木盒",
  },
  "conserver-transmettre-souvenirs-de-famille": {
    fr: "Grand-mère et petite-fille regardant un album de famille",
    en: "Grandmother and granddaughter looking at a family album",
    es: "Abuela y nieta mirando un álbum familiar",
    it: "Nonna e nipote guardano un album di famiglia",
    pt: "Avó e neta a ver um álbum de família",
    ko: "가족 앨범을 함께 보는 할머니와 손녀",
    zh: "祖母与孙女一起翻看家庭相册",
  },
  "raconter-sa-vie-a-ses-enfants-methode": {
    fr: "Parent racontant une histoire à ses enfants sur un canapé",
    en: "Parent telling a story to their children on a sofa",
    es: "Padre contando una historia a sus hijos en el sofá",
    it: "Genitore che racconta una storia ai figli sul divano",
    pt: "Pai a contar uma história aos filhos no sofá",
    ko: "소파에서 아이들에게 이야기를 들려주는 부모",
    zh: "父母在沙发上给孩子讲故事",
  },
};

const SUFFIX: Record<Lang, string> = {
  fr: "illustration de l'article",
  en: "article illustration",
  es: "ilustración del artículo",
  it: "illustrazione dell'articolo",
  pt: "ilustração do artigo",
  ko: "기사 일러스트레이션",
  zh: "文章配图",
};

/** Texte alternatif descriptif d'une image de couverture d'article. */
export function getCoverAlt(
  translationGroup: string | null | undefined,
  title: string,
  lang: string | null | undefined = "fr",
): string {
  const l = ((lang ?? "fr").split("-")[0] as Lang) || "fr";
  const described = translationGroup ? ALT[translationGroup]?.[l] ?? ALT[translationGroup]?.fr : undefined;
  if (described) return `${described} — ${title}`;
  return `${title} — ${SUFFIX[l] ?? SUFFIX.fr} Family Garden`;
}
