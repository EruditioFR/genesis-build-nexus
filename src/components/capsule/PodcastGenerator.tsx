import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { getSignedUrl } from "@/lib/signedUrlCache";

interface PodcastGeneratorProps {
  capsuleId: string;
  capsuleTitle: string;
}

const PodcastGenerator = ({ capsuleId, capsuleTitle }: PodcastGeneratorProps) => {
  const { isAdmin, loading: roleLoading } = useAdminAuth();
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [existingPodcast, setExistingPodcast] = useState<string | null>(null);

  // Check for existing podcast
  useEffect(() => {
    const checkExisting = async () => {
      const { data } = await supabase
        .from("capsule_medias")
        .select("file_url")
        .eq("capsule_id", capsuleId)
        .eq("file_type", "audio/mpeg")
        .like("caption", "%Podcast généré%")
        .maybeSingle();

      if (data?.file_url) {
        setExistingPodcast(data.file_url);
        const url = await getSignedUrl("capsule-medias", data.file_url, 3600);
        if (url) setAudioUrl(url);
      }
    };
    checkExisting();
  }, [capsuleId]);

  if (roleLoading || !isAdmin) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setScript(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ capsuleId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur lors de la génération");
      }

      const result = await response.json();
      setScript(result.script);
      
      // Get signed URL for the new audio
      const url = await getSignedUrl("capsule-medias", result.audioPath, 3600);
      if (url) {
        setAudioUrl(url);
        setExistingPodcast(result.audioPath);
      }

      toast.success(`🎙️ Podcast généré ! (${result.charCount} caractères)`);
    } catch (error: any) {
      console.error("Podcast generation error:", error);
      toast.error(error.message || "Erreur lors de la génération du podcast");
    } finally {
      setGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) return;

    if (audioEl) {
      if (playing) {
        audioEl.pause();
        setPlaying(false);
      } else {
        audioEl.play();
        setPlaying(true);
      }
    } else {
      const audio = new Audio(audioUrl);
      audio.crossOrigin = "anonymous";
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
      setAudioEl(audio);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Mic className="w-4 h-4 text-secondary" />
        🎙️ Podcast AI
        <span className="text-xs font-normal text-muted-foreground">(Admin)</span>
      </div>

      {audioUrl ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={togglePlay}
              className="gap-2"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {playing ? "Pause" : "Écouter le podcast"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2 text-muted-foreground"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Régénérer
            </Button>
          </div>
          {audioUrl && (
            <audio
              src={audioUrl}
              controls
              className="w-full h-10 rounded-lg"
              crossOrigin="anonymous"
            />
          )}
        </div>
      ) : (
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Générer le podcast
            </>
          )}
        </Button>
      )}

      {script && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground transition-colors">
            Voir le script narratif
          </summary>
          <p className="mt-2 p-3 bg-muted rounded-lg whitespace-pre-wrap leading-relaxed">
            {script}
          </p>
        </details>
      )}
    </div>
  );
};

export default PodcastGenerator;
