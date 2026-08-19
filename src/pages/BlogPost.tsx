import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin, Link2, Share2 } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
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

        // Maillage interne : autres articles de la même langue
        const { data: others } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt")
          .eq("status", "published")
          .eq("lang", (typedData as { lang?: string }).lang ?? "fr")
          .neq("id", typedData.id)
          .order("published_at", { ascending: false })
          .limit(3);
        if (others) setRelated(others as unknown as RelatedPost[]);
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


  const videoId = post.video_url ? extractYouTubeId(post.video_url) : null;
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEOHead
        title={post.meta_title || `${post.title} - Family Garden`}
        description={post.meta_description || post.excerpt || ""}
      />
      <Header />
      <main className="min-h-screen bg-background pt-20">
        {/* Cover */}
        {post.cover_image_url && (
          <div className="w-full h-64 md:h-96 relative">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
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
            <div
              className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-a:text-primary prose-a:underline mb-10"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          <div className="border-t pt-6 mt-8">
            <SocialShareButtons title={post.title} url={pageUrl} shareLabel={shareLabel} copyLabel={copyLabel} />
          </div>

          {related.length > 0 && (
            <section className="border-t pt-8 mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {relatedTitle}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/blog/${r.slug}`}
                      className="group flex items-start gap-2 rounded-xl border bg-card p-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary"
                    >
                      <span className="flex-1 leading-snug">{r.title}</span>
                      <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
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
        </article>
      </main>
      <Footer />
    </>
  );
}
