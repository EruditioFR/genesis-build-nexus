import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { normalizeBlogLang } from "@/lib/blogArticles";
import SEOHead from "@/components/seo/SEOHead";
import { getCoverAlt } from "@/lib/blogCoverAlt";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  translation_group?: string | null;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}


const LABELS: Record<string, { intro: string; all: string; empty: string; more: string; desc: string; locale: string }> = {
  fr: { intro: "Conseils, inspirations et actualités Family Garden", all: "Tous", empty: "Aucun article pour le moment.", more: "Lire la suite", desc: "Conseils, inspirations et actualités pour préserver vos souvenirs de famille.", locale: "fr-FR" },
  en: { intro: "Tips, inspiration and news from Family Garden", all: "All", empty: "No articles yet.", more: "Read more", desc: "Tips, inspiration and news to preserve and pass on your family memories.", locale: "en-GB" },
  es: { intro: "Consejos, inspiración y novedades de Family Garden", all: "Todos", empty: "Aún no hay artículos.", more: "Leer más", desc: "Consejos e inspiración para conservar y transmitir tus recuerdos de familia.", locale: "es-ES" },
  it: { intro: "Consigli, ispirazioni e novità di Family Garden", all: "Tutti", empty: "Nessun articolo per ora.", more: "Continua a leggere", desc: "Consigli e ispirazioni per conservare e tramandare i ricordi di famiglia.", locale: "it-IT" },
  pt: { intro: "Conselhos, inspirações e novidades da Family Garden", all: "Todos", empty: "Ainda não há artigos.", more: "Ler mais", desc: "Conselhos e inspirações para preservar e transmitir as memórias de família.", locale: "pt-PT" },
  ko: { intro: "Family Garden의 팁과 영감, 소식", all: "전체", empty: "아직 게시글이 없습니다.", more: "더 읽기", desc: "가족의 추억을 보관하고 물려주기 위한 팁과 영감.", locale: "ko-KR" },
  zh: { intro: "Family Garden 的建议、灵感与动态", all: "全部", empty: "暂无文章。", more: "阅读更多", desc: "保存并传承家庭回忆的建议与灵感。", locale: "zh-CN" },
};

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();
  const lang = normalizeBlogLang(i18n.language);
  const L = LABELS[lang] ?? LABELS.fr;

  useEffect(() => {
    const fetch = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, category_id, published_at, created_at, translation_group")
          .eq("status", "published")
          .eq("lang", lang)
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("*").order("order_index"),
      ]);
      if (postsRes.data) setPosts(postsRes.data as unknown as BlogPost[]);
      if (catsRes.data) setCategories(catsRes.data as unknown as BlogCategory[]);
      setLoading(false);
    };
    fetch();
  }, [lang]);

  const filtered = selectedCat ? posts.filter((p) => p.category_id === selectedCat) : posts;
  const getCat = (id: string | null) => categories.find((c) => c.id === id);

  return (
    <>
      <SEOHead
        title="Blog - Family Garden"
        description={L.desc}
      />
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Blog</h1>
          <p className="text-muted-foreground mb-8">{L.intro}</p>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {L.all}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCat === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{L.empty}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => {
                const cat = getCat(post.category_id);
                return (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={getCoverAlt(post.translation_group, post.title, lang)}
                          loading="lazy"
                          width={1200}
                          height={675}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {cat && (
                            <Badge variant="secondary" className="text-xs" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                              {cat.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at || post.created_at).toLocaleDateString(L.locale, {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                        )}
                        <span className="text-sm text-primary font-medium inline-flex items-center gap-1">
                          {L.more} <ArrowRight className="h-3 w-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
