import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, Image, Tag, Upload } from "lucide-react";
import RichTextEditor from "@/components/capsule/RichTextEditor";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  order_index: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  video_url: string | null;
  category_id: string | null;
  status: string;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---- Category Manager ----
function CategoryManager({ categories, onRefresh }: { categories: BlogCategory[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1E3A5F");
  const [editId, setEditId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) return;
    const slug = slugify(name);
    if (editId) {
      await supabase.from("blog_categories").update({ name, slug, color }).eq("id", editId);
    } else {
      await supabase.from("blog_categories").insert({ name, slug, color, order_index: categories.length });
    }
    setName(""); setColor("#1E3A5F"); setEditId(null); setOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("blog_categories").delete().eq("id", id);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><Tag className="h-5 w-5" /> Catégories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditId(null); setName(""); setColor("#1E3A5F"); }}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Modifier" : "Nouvelle"} catégorie</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-sm">Couleur :</span>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-12 rounded cursor-pointer" />
              </div>
              <Button onClick={handleSave} className="w-full">{editId ? "Modifier" : "Créer"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1 border rounded-lg px-3 py-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm font-medium">{cat.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditId(cat.id); setName(cat.name); setColor(cat.color); setOpen(true); }}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(cat.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">Aucune catégorie</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Post Editor ----
function PostEditor({
  post,
  categories,
  onSave,
  onCancel,
}: {
  post: Partial<BlogPost> | null;
  categories: BlogCategory[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_image_url || "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url || "");
  const [categoryId, setCategoryId] = useState(post?.category_id || "");
  const [status, setStatus] = useState(post?.status || "draft");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(post?.meta_description || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!post?.slug && title) {
      setSlug(slugify(title));
    }
  }, [title, post?.slug]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
      setCoverUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Titre et slug requis", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title,
      slug,
      excerpt: excerpt || null,
      content: content || null,
      cover_image_url: coverUrl || null,
      video_url: videoUrl || null,
      category_id: categoryId || null,
      status,
      published_at: status === "published" ? (post?.published_at || new Date().toISOString()) : null,
      meta_title: metaTitle || null,
      meta_description: metaDesc || null,
    };

    let error;
    if (post?.id) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", post.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: post?.id ? "Article mis à jour" : "Article créé" });
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{post?.id ? "Modifier l'article" : "Nouvel article"}</h2>
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <Input placeholder="Titre de l'article" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" />
          <Input placeholder="slug-de-l-article" value={slug} onChange={(e) => setSlug(e.target.value)} className="text-sm font-mono" />
          <Textarea placeholder="Extrait / chapô (affiché dans la liste)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
          <div>
            <label className="text-sm font-medium mb-2 block">Contenu</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Rédigez votre article..." minHeight="400px" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Catégorie</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Image de couverture</label>
                {coverUrl && (
                  <img src={coverUrl} alt="cover" className="w-full h-32 object-cover rounded-lg mb-2" />
                )}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Upload..." : "Choisir une image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">URL vidéo (YouTube)</label>
                <Input placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm font-medium">SEO</p>
              <Input placeholder="Meta title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              <Textarea placeholder="Meta description" value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} />
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Enregistrement..." : (post?.id ? "Mettre à jour" : "Créer l'article")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Admin Blog Page ----
export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null | "new">(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [postsRes, catsRes] = await Promise.all([
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_categories").select("*").order("order_index"),
    ]);
    if (postsRes.data) setPosts(postsRes.data as unknown as BlogPost[]);
    if (catsRes.data) setCategories(catsRes.data as unknown as BlogCategory[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    fetchData();
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return null;
    return categories.find((c) => c.id === catId)?.name;
  };

  if (editing !== null) {
    return (
      <PostEditor
        post={editing === "new" ? null : editing}
        categories={categories}
        onSave={() => { setEditing(null); fetchData(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog</h1>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel article
        </Button>
      </div>

      <CategoryManager categories={categories} onRefresh={fetchData} />

      <Card>
        <CardHeader><CardTitle>Articles ({posts.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">Aucun article. Créez le premier !</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.cover_image_url && (
                          <img src={post.cover_image_url} alt="" className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="font-medium">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getCategoryName(post.category_id) && (
                        <Badge variant="secondary">{getCategoryName(post.category_id)}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "outline"}>
                        {post.status === "published" ? "Publié" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
