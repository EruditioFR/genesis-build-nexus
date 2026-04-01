import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function errorResponse(message: string, status: number, details?: string) {
  return new Response(
    JSON.stringify({ error: message, ...(details ? { details } : {}) }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const base64url = (data: object | Uint8Array) => {
    const bytes = data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(JSON.stringify(data));
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const signingInput = `${base64url(header)}.${base64url(payload)}`;

  const pemContent = serviceAccount.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput))
  );

  const jwt = `${signingInput}.${base64url(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

interface DialogueLine {
  speaker: "Camille" | "Julien";
  text: string;
}

function parseDialogue(script: string): DialogueLine[] {
  const lines: DialogueLine[] = [];
  for (const raw of script.split("\n")) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(Camille|Julien)\s*:\s*(.+)/i);
    if (match) {
      lines.push({
        speaker: match[1] === "Camille" || match[1] === "camille" ? "Camille" : "Julien",
        text: match[2].trim(),
      });
    }
  }
  return lines;
}

async function synthesizeLine(
  text: string,
  voice: { languageCode: string; name: string; ssmlGender: string },
  accessToken: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  // Split if over 4800 bytes
  const splitTts = (t: string, max = 4800): string[] => {
    const parts: string[] = [];
    let cur = "";
    for (const s of t.match(/[^.!?\n]+[.!?\n]*/g) || [t]) {
      if (encoder.encode(cur + s).length > max) {
        if (cur) parts.push(cur.trim());
        cur = s;
      } else cur += s;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  };

  const chunks = splitTts(text);
  const audioParts: Uint8Array[] = [];

  for (const chunk of chunks) {
    const resp = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        input: { text: chunk },
        voice,
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.95,
          pitch: 0,
          effectsProfileId: ["headphone-class-device"],
        },
      }),
    });

    if (!resp.ok) {
      throw new Error(`TTS error ${resp.status}: ${await resp.text()}`);
    }

    const data = await resp.json();
    if (!data.audioContent) throw new Error("Empty audio from TTS");

    const bin = atob(data.audioContent);
    const part = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) part[i] = bin.charCodeAt(i);
    audioParts.push(part);
  }

  if (audioParts.length === 1) return audioParts[0];
  const total = audioParts.reduce((n, a) => n + a.length, 0);
  const merged = new Uint8Array(total);
  let off = 0;
  for (const a of audioParts) { merged.set(a, off); off += a.length; }
  return merged;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("Non autorisé", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return errorResponse("Non autorisé", 401);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleData) return errorResponse("Accès réservé aux administrateurs", 403);

    const { capsuleId } = await req.json();
    if (!capsuleId) return errorResponse("capsuleId requis", 400);

    // Fetch capsule
    const { data: capsule, error: capsuleError } = await supabase
      .from("capsules")
      .select("*")
      .eq("id", capsuleId)
      .single();
    if (capsuleError || !capsule) return errorResponse("Souvenir introuvable", 404);

    // Fetch medias with their tags
    const { data: medias } = await supabase
      .from("capsule_medias")
      .select("id, file_type, file_name, caption")
      .eq("capsule_id", capsuleId)
      .order("position", { ascending: true });

    // Fetch all person tags for these medias
    const mediaIds = (medias || []).map((m) => m.id);
    let tagsByMedia: Record<string, string[]> = {};
    if (mediaIds.length > 0) {
      const { data: tags } = await supabase
        .from("media_person_tags")
        .select("media_id, person_id")
        .in("media_id", mediaIds);

      if (tags && tags.length > 0) {
        const personIds = [...new Set(tags.map((t) => t.person_id))];
        const { data: persons } = await supabase
          .from("family_persons")
          .select("id, first_names, last_name")
          .in("id", personIds);

        const personMap: Record<string, string> = {};
        (persons || []).forEach((p) => {
          personMap[p.id] = `${p.first_names} ${p.last_name}`;
        });

        tags.forEach((t) => {
          if (!tagsByMedia[t.media_id]) tagsByMedia[t.media_id] = [];
          const name = personMap[t.person_id];
          if (name) tagsByMedia[t.media_id].push(name);
        });
      }
    }

    // Build rich media descriptions
    const mediaDescriptions = (medias || [])
      .map((m, i) => {
        const type = m.file_type?.startsWith("image/") ? "Photo" :
                     m.file_type?.startsWith("video/") ? "Vidéo" :
                     m.file_type?.startsWith("audio/") ? "Audio" : "Fichier";
        const caption = m.caption ? ` — "${m.caption}"` : "";
        const tagged = tagsByMedia[m.id];
        const taggedStr = tagged?.length ? ` (personnes taguées : ${tagged.join(", ")})` : "";
        return `- ${type} ${i + 1}: ${m.file_name || "sans nom"}${caption}${taggedStr}`;
      })
      .join("\n");

    const capsuleContext = `
Titre du souvenir : ${capsule.title}
${capsule.description ? `Description : ${capsule.description.replace(/<[^>]*>/g, "")}` : ""}
${capsule.memory_date ? `Date du souvenir : ${capsule.memory_date}` : ""}
${capsule.content ? `Récit : ${capsule.content.replace(/<[^>]*>/g, "")}` : ""}
${mediaDescriptions ? `Médias associés :\n${mediaDescriptions}` : "Aucun média associé."}
${capsule.tags?.length ? `Mots-clés : ${capsule.tags.join(", ")}` : ""}
    `.trim();

    // Step 1: Generate dialogue script
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return errorResponse("LOVABLE_API_KEY non configurée", 500);

    console.log("Generating dialogue script...");
    const scriptResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un scénariste de podcast intime et chaleureux. Tu écris des dialogues naturels entre deux animateurs : Camille (femme) et Julien (homme).

Règles strictes :
- Écris UNIQUEMENT un dialogue entre Camille et Julien, 10 à 16 répliques courtes au total.
- Style conversationnel, intime, comme deux amis qui découvrent et commentent un souvenir de famille.
- Ils se posent des questions, rebondissent sur les détails, expriment des émotions.
- Quand des médias sont mentionnés (photos, vidéos), ils les décrivent naturellement : "Regarde cette photo...", "On voit bien sur cette image que..."
- Quand des personnes sont taguées sur les médias, cite-les explicitement et naturellement dans la conversation.
- N'utilise AUCUN markdown, titre, puce, mise en forme. Uniquement du dialogue.
- Format strict obligatoire, chaque ligne commence par le nom du locuteur :
Camille: [texte]
Julien: [texte]
- Commence directement par une réplique de Camille, sans introduction.
- Termine par une réplique douce et évocatrice.
- Le dialogue doit durer environ 2-3 minutes à la lecture.`,
          },
          {
            role: "user",
            content: `Transforme ce souvenir en un dialogue de podcast entre Camille et Julien :\n\n${capsuleContext}`,
          },
        ],
      }),
    });

    if (!scriptResponse.ok) {
      const errorText = await scriptResponse.text();
      console.error("AI script generation failed:", scriptResponse.status, errorText);
      if (scriptResponse.status === 429) return errorResponse("Trop de requêtes, réessayez dans quelques instants", 429);
      if (scriptResponse.status === 402) return errorResponse("Crédits AI insuffisants", 402);
      return errorResponse("Erreur lors de la génération du script", 500);
    }

    const scriptData = await scriptResponse.json();
    const narrativeScript = scriptData.choices?.[0]?.message?.content;
    if (!narrativeScript) return errorResponse("Script narratif vide", 500);

    console.log(`Script generated: ${narrativeScript.length} chars`);

    // Parse dialogue lines
    const dialogueLines = parseDialogue(narrativeScript);
    if (dialogueLines.length < 2) {
      console.error("Failed to parse dialogue, falling back to single voice");
    }

    // Step 2: Get Google OAuth2 access token
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) return errorResponse("GOOGLE_SERVICE_ACCOUNT_JSON non configurée", 500);

    const accessToken = await getGoogleAccessToken(serviceAccountJson);

    // Step 3: Synthesize each dialogue line with appropriate voice
    const voiceCamille = { languageCode: "fr-FR", name: "fr-FR-Wavenet-C", ssmlGender: "FEMALE" };
    const voiceJulien = { languageCode: "fr-FR", name: "fr-FR-Wavenet-B", ssmlGender: "MALE" };

    console.log(`Synthesizing ${dialogueLines.length} dialogue lines...`);

    const audioParts: Uint8Array[] = [];
    for (const line of dialogueLines) {
      const voice = line.speaker === "Camille" ? voiceCamille : voiceJulien;
      const audio = await synthesizeLine(line.text, voice, accessToken);
      audioParts.push(audio);
    }

    // Merge all audio
    const totalLength = audioParts.reduce((n, a) => n + a.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const a of audioParts) { bytes.set(a, offset); offset += a.length; }

    // Step 4: Upload
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const fileName = `podcasts/${capsuleId}/${Date.now()}.mp3`;

    const { error: uploadError } = await adminSupabase.storage
      .from("capsule-medias")
      .upload(fileName, bytes, { contentType: "audio/mpeg", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return errorResponse("Erreur lors du stockage du podcast", 500);
    }

    // Step 5: Save as capsule media
    const { error: mediaError } = await adminSupabase
      .from("capsule_medias")
      .insert({
        capsule_id: capsuleId,
        file_url: fileName,
        file_type: "audio/mpeg",
        file_name: `Podcast - ${capsule.title}.mp3`,
        caption: "🎙️ Podcast généré automatiquement",
      });

    if (mediaError) console.error("Media insert error:", mediaError);

    console.log("Podcast generated successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        script: narrativeScript,
        audioPath: fileName,
        charCount: narrativeScript.length,
        dialogueLines: dialogueLines.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Podcast generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
