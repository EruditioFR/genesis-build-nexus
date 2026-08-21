import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowRight, ArrowUp, Facebook, Twitter, Linkedin, Link2, Share2 } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { getCoverAlt } from "@/lib/blogCoverAlt";
import { formatBlogContent, buildArticleToc } from "@/lib/blogContent";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
  meta_title: string | null;
  meta_description: string | null;
  lang?: string | null;
  translation_group?: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url?: string | null;
  translation_group?: string | null;
}


interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
  return match ? match[1] : null;
}

function SocialShareButtons({ title, url, shareLabel, copyLabel }: { title: string; url: string; shareLabel: string; copyLabel: string }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Lien copié !" });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="h-4 w-4" /> {shareLabel}
      </span>
      <Button variant="outline" size="sm" asChild>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4 mr-1" /> Facebook
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4 mr-1" /> X
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        <Link2 className="h-4 w-4 mr-1" /> {copyLabel}
      </Button>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [prevPost, setPrevPost] = useState<RelatedPost | null>(null);
  const [nextPost, setNextPost] = useState<RelatedPost | null>(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alternates, setAlternates] = useState<{ hreflang: string; href: string }[]>([]);


  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      setLoading(true);
      setPrevPost(null);
      setNextPost(null);
      setAlternates([]);

      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (data) {
        const typedData = data as unknown as Post;
        setPost(typedData);
        if (typedData.category_id) {
          const { data: cat } = await supabase.from("blog_categories").select("*").eq("id", typedData.category_id).maybeSingle();
          if (cat) setCategory(cat as unknown as BlogCategory);
        }

        const postLang = (typedData as { lang?: string }).lang ?? "fr";
        const pivot = typedData.published_at || typedData.created_at;

        // Maillage interne : autres articles de la même langue
        const { data: others } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, translation_group")

          .eq("status", "published")
          .eq("lang", postLang)
          .neq("id", typedData.id)
          .order("published_at", { ascending: false })
          .limit(3);
        if (others) setRelated(others as unknown as RelatedPost[]);

        // Article précédent (plus ancien) et suivant (plus récent)
        const [{ data: older }, { data: newer }] = await Promise.all([
          supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt")
            .eq("status", "published")
            .eq("lang", postLang)
            .lt("published_at", pivot)
            .order("published_at", { ascending: false })
            .limit(1),
          supabase
            .from("blog_posts")
            .select("id, title, slug, excerpt")
            .eq("status", "published")
            .eq("lang", postLang)
            .gt("published_at", pivot)
            .order("published_at", { ascending: true })
            .limit(1),
        ]);
        if (older?.[0]) setPrevPost(older[0] as unknown as RelatedPost);
        if (newer?.[0]) setNextPost(newer[0] as unknown as RelatedPost);
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);


  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
          <p className="text-xl text-muted-foreground">Article introuvable</p>
          <Button asChild><Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Retour au blog</Link></Button>
        </div>
        <Footer />
      </>
    );
  }

  const lang = (post.lang ?? "fr").split("-")[0];
  const RELATED_LABELS: Record<string, string> = {
    fr: "À lire aussi", en: "Related reading", es: "Lecturas relacionadas",
    it: "Da leggere anche", pt: "Leituras relacionadas", ko: "함께 읽기", zh: "延伸阅读",
  };
  const CTA_LABELS: Record<string, string> = {
    fr: "Commencer mes 14 jours d'essai gratuit", en: "Start my 14-day free trial",
    es: "Comenzar mi prueba gratuita de 14 días", it: "Inizia la prova gratuita di 14 giorni",
    pt: "Começar o teste gratuito de 14 dias", ko: "14일 무료 체험 시작하기", zh: "开始 14 天免费试用",
  };
  const BACK_LABELS: Record<string, string> = {
    fr: "Retour au blog", en: "Back to blog", es: "Volver al blog", it: "Torna al blog",
    pt: "Voltar ao blog", ko: "블로그로 돌아가기", zh: "返回博客",
  };
  const SHARE_LOCALES: Record<string, string> = {
    fr: "fr-FR", en: "en-GB", es: "es-ES", it: "it-IT", pt: "pt-PT", ko: "ko-KR", zh: "zh-CN",
  };
  const backLabel = BACK_LABELS[lang] ?? BACK_LABELS.fr;
  const dateLocale = SHARE_LOCALES[lang] ?? "fr-FR";
  const SHARE_LABELS: Record<string, [string, string]> = {
    fr: ["Partager :", "Copier"], en: ["Share:", "Copy"], es: ["Compartir:", "Copiar"],
    it: ["Condividi:", "Copia"], pt: ["Partilhar:", "Copiar"], ko: ["공유:", "복사"], zh: ["分享：", "复制"],
  };
  const [shareLabel, copyLabel] = SHARE_LABELS[lang] ?? SHARE_LABELS.fr;
  const relatedTitle = RELATED_LABELS[lang] ?? RELATED_LABELS.fr;
  const ctaLabel = CTA_LABELS[lang] ?? CTA_LABELS.fr;
  const USEFUL_LINKS: Record<string, { title: string; items: { label: string; to: string }[] }> = {
    fr: { title: "Pages utiles", items: [{ label: "Tarifs : 2,99 €/mois", to: "/tarifs" }, { label: "Questions fréquentes", to: "/faq" }, { label: "Essayer la démo", to: "/demo" }, { label: "Tous les articles", to: "/blog" }] },
    en: { title: "Useful pages", items: [{ label: "Pricing: €2.99/month", to: "/tarifs" }, { label: "FAQ", to: "/faq" }, { label: "Try the demo", to: "/demo" }, { label: "All articles", to: "/blog" }] },
    es: { title: "Páginas útiles", items: [{ label: "Precio: 2,99 €/mes", to: "/tarifs" }, { label: "Preguntas frecuentes", to: "/faq" }, { label: "Probar la demo", to: "/demo" }, { label: "Todos los artículos", to: "/blog" }] },
    it: { title: "Pagine utili", items: [{ label: "Prezzo: 2,99 €/mese", to: "/tarifs" }, { label: "Domande frequenti", to: "/faq" }, { label: "Prova la demo", to: "/demo" }, { label: "Tutti gli articoli", to: "/blog" }] },
    pt: { title: "Páginas úteis", items: [{ label: "Preço: 2,99 €/mês", to: "/tarifs" }, { label: "Perguntas frequentes", to: "/faq" }, { label: "Experimentar a demo", to: "/demo" }, { label: "Todos os artigos", to: "/blog" }] },
    ko: { title: "유용한 페이지", items: [{ label: "요금: 월 2,99유로", to: "/tarifs" }, { label: "자주 묻는 질문", to: "/faq" }, { label: "데모 체험", to: "/demo" }, { label: "모든 글 보기", to: "/blog" }] },
    zh: { title: "实用页面", items: [{ label: "价格：每月 2.99 欧元", to: "/tarifs" }, { label: "常见问题", to: "/faq" }, { label: "体验演示", to: "/demo" }, { label: "全部文章", to: "/blog" }] },
  };
  const usefulLinks = USEFUL_LINKS[lang] ?? USEFUL_LINKS.fr;
  const NAV_LABELS: Record<string, [string, string, string]> = {
    fr: ["Article précédent", "Article suivant", "Remonter en haut"],
    en: ["Previous article", "Next article", "Back to top"],
    es: ["Artículo anterior", "Artículo siguiente", "Volver arriba"],
    it: ["Articolo precedente", "Articolo successivo", "Torna su"],
    pt: ["Artigo anterior", "Próximo artigo", "Voltar ao topo"],
    ko: ["이전 글", "다음 글", "맨 위로"],
    zh: ["上一篇", "下一篇", "回到顶部"],
  };
  const [prevLabel, nextLabel, topLabel] = NAV_LABELS[lang] ?? NAV_LABELS.fr;
  const READ_LABELS: Record<string, string> = {
    fr: "Lire l'article", en: "Read the article", es: "Leer el artículo", it: "Leggi l'articolo",
    pt: "Ler o artigo", ko: "글 읽기", zh: "阅读文章",
  };
  const readLabel = READ_LABELS[lang] ?? READ_LABELS.fr;
  const TOC_LABELS: Record<string, string> = {
    fr: "Sommaire", en: "Table of contents", es: "Índice", it: "Indice",
    pt: "Índice", ko: "목차", zh: "目录",
  };
  const tocLabel = TOC_LABELS[lang] ?? TOC_LABELS.fr;
  const { html: tocHtml, headings: tocHeadings } = buildArticleToc(
    formatBlogContent(post.content),
  );





  const videoId = post.video_url ? extractYouTubeId(post.video_url) : null;
  const coverAlt = getCoverAlt(post.translation_group, post.title, lang);

  const SITE_URL = "https://familygarden.fr";
  const articleUrl = `${SITE_URL}/blog/${post.slug}`;
  const publishedIso = post.published_at || post.created_at;
  const plainText = (post.content || post.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const BLOG_LABELS: Record<string, string> = {
    fr: "Blog", en: "Blog", es: "Blog", it: "Blog", pt: "Blog", ko: "블로그", zh: "博客",
  };
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
      headline: post.title.slice(0, 110),
      name: post.title,
      description: post.meta_description || post.excerpt || plainText.slice(0, 200),
      inLanguage: lang,
      url: articleUrl,
      datePublished: publishedIso,
      dateModified: publishedIso,
      wordCount: plainText ? plainText.split(" ").length : undefined,
      articleSection: category?.name || undefined,
      keywords: post.translation_group || undefined,
      image: post.cover_image_url
        ? {
            "@type": "ImageObject",
            url: post.cover_image_url,
            width: 1200,
            height: 675,
            caption: coverAlt,
          }
        : undefined,
      author: {
        "@type": "Organization",
        name: "Family Garden",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Family Garden",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      },
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Family Garden", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: BLOG_LABELS[lang] ?? "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
      ],
    },
  ];

  return (
    <>
      <SEOHead
        title={post.meta_title || `${post.title} - Family Garden`}
        description={post.meta_description || post.excerpt || ""}
        ogType="article"
        ogImage={post.cover_image_url || undefined}
        ogImageAlt={coverAlt}
        jsonLd={jsonLd}
      />

      <Header />
      <main className="min-h-screen bg-background pt-20">
        {/* Cover */}
        {post.cover_image_url && (
          <div className="w-full h-64 md:h-96 relative">
            <img src={post.cover_image_url} alt={coverAlt} className="w-full h-full object-cover" loading="eager" width={1200} height={675} />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-4 py-8">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-6">
            <ArrowLeft className="h-4 w-4" /> {backLabel}
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {category && (
              <Badge variant="secondary" style={{ backgroundColor: category.color + "20", color: category.color }}>
                {category.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString(dateLocale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-muted-foreground">par <strong>Family Garden</strong></span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">{post.title}</h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{post.excerpt}</p>
          )}

          {videoId && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video"
                allowFullScreen
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {post.content && (
            <>
              {tocHeadings.length > 2 && (
                <nav
                  aria-label={tocLabel}
                  className="mb-10 rounded-xl border border-border bg-muted/40 p-5"
                >
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    {tocLabel}
                  </h2>
                  <ol className="space-y-1.5">
                    {tocHeadings.map((h, i) => (
                      <li key={h.id} className={h.level === 3 ? "ml-5" : ""}>
                        <a
                          href={`#${h.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            history.replaceState(null, "", `#${h.id}`);
                          }}
                          className="text-sm text-foreground hover:text-primary hover:underline inline-flex gap-2"
                        >
                          {h.level === 2 && (
                            <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                          )}
                          <span>{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div
                className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:scroll-mt-24 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:scroll-mt-24 prose-p:leading-[1.85] prose-p:mb-6 prose-li:leading-relaxed prose-li:my-1.5 prose-ul:my-6 prose-ol:my-6 prose-strong:text-foreground prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-a:text-primary prose-a:underline mb-10"
                dangerouslySetInnerHTML={{ __html: tocHtml }}
              />
            </>
          )}


          <div className="border-t pt-6 mt-8">
            <SocialShareButtons title={post.title} url={articleUrl} shareLabel={shareLabel} copyLabel={copyLabel} />
          </div>

          {related.length > 0 && (
            <section className="border-t pt-8 mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {relatedTitle}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/blog/${r.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                        {r.cover_image_url ? (
                          <img
                            src={r.cover_image_url}
                            alt={getCoverAlt(r.translation_group, r.title, lang)}
                            loading="lazy"
                            width={400}
                            height={225}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <span className="text-sm font-medium leading-snug text-foreground">{r.title}</span>
                        {r.excerpt && (
                          <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{r.excerpt}</span>
                        )}
                        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-primary">
                          {readLabel}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild>

                  <Link to="/signup">{ctaLabel}</Link>
                </Button>
              </div>
            </section>
          )}

          {(prevPost || nextPost) && (
            <nav aria-label={`${prevLabel} / ${nextLabel}`} className="border-t pt-6 mt-10 grid gap-3 sm:grid-cols-2">
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.slug}`}
                  rel="prev"
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary"
                >
                  <span className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> {prevLabel}
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-snug text-foreground">{prevPost.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {nextPost && (
                <Link
                  to={`/blog/${nextPost.slug}`}
                  rel="next"
                  className="group rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary sm:text-right"
                >
                  <span className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground sm:justify-end">
                    {nextLabel} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-snug text-foreground">{nextPost.title}</span>
                </Link>
              )}
            </nav>
          )}



          <nav aria-label={usefulLinks.title} className="border-t pt-6 mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {usefulLinks.title}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {usefulLinks.items.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-primary underline underline-offset-4 hover:text-secondary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>

      </main>
      {showTopButton && (
        <Button
          type="button"
          size="icon"
          aria-label={topLabel}
          title={topLabel}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
      <Footer />

    </>
  );
}
