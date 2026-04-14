import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
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

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [postsRes, catsRes] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image_url, category_id, published_at, created_at")
          .eq("status", "published")
          .order("published_at", { ascending: false }),
        supabase.from("blog_categories").select("*").order("order_index"),
      ]);
      if (postsRes.data) setPosts(postsRes.data as unknown as BlogPost[]);
      if (catsRes.data) setCategories(catsRes.data as unknown as BlogCategory[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = selectedCat ? posts.filter((p) => p.category_id === selectedCat) : posts;
  const getCat = (id: string | null) => categories.find((c) => c.id === id);

  return (
    <>
      <SEOHead
        title="Blog - Family Garden"
        description="Conseils, inspirations et actualités pour préserver vos souvenirs de famille."
      />
      <Header />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Blog</h1>
          <p className="text-muted-foreground mb-8">Conseils, inspirations et actualités Family Garden</p>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCat(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Tous
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
            <p className="text-center text-muted-foreground py-16">Aucun article pour le moment.</p>
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
                          alt={post.title}
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
                            {new Date(post.published_at || post.created_at).toLocaleDateString("fr-FR", {
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
                          Lire la suite <ArrowRight className="h-3 w-3" />
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
