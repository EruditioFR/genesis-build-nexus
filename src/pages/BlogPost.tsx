import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Facebook, Twitter, Linkedin, Link2, Share2 } from "lucide-react";
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

function SocialShareButtons({ title, url }: { title: string; url: string }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Lien copié !" });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Share2 className="h-4 w-4" /> Partager :
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
        <Link2 className="h-4 w-4 mr-1" /> Copier
      </Button>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [category, setCategory] = useState<BlogCategory | null>(null);
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
            <ArrowLeft className="h-4 w-4" /> Retour au blog
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {category && (
              <Badge variant="secondary" style={{ backgroundColor: category.color + "20", color: category.color }}>
                {category.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at || post.created_at).toLocaleDateString("fr-FR", {
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
            <SocialShareButtons title={post.title} url={pageUrl} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
