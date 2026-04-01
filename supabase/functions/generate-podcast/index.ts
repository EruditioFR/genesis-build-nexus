import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { capsuleId } = await req.json();
    if (!capsuleId) {
      return new Response(JSON.stringify({ error: "capsuleId requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch capsule data
    const { data: capsule, error: capsuleError } = await supabase
      .from("capsules")
      .select("*")
      .eq("id", capsuleId)
      .single();

    if (capsuleError || !capsule) {
      return new Response(JSON.stringify({ error: "Souvenir introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch media descriptions
    const { data: medias } = await supabase
      .from("capsule_medias")
      .select("file_type, file_name, caption")
      .eq("capsule_id", capsuleId)
      .order("position", { ascending: true });

    const mediaDescriptions = (medias || [])
      .filter((m) => m.caption)
      .map((m) => `- ${m.caption}`)
      .join("\n");

    const capsuleContext = `
Titre du souvenir : ${capsule.title}
${capsule.description ? `Description : ${capsule.description}` : ""}
${capsule.memory_date ? `Date du souvenir : ${capsule.memory_date}` : ""}
${capsule.content ? `Récit : ${capsule.content.replace(/<[^>]*>/g, "")}` : ""}
${mediaDescriptions ? `Descriptions des médias :\n${mediaDescriptions}` : ""}
${capsule.tags?.length ? `Mots-clés : ${capsule.tags.join(", ")}` : ""}
    `.trim();

    // Step 1: Generate narrative script with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY non configurée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating narrative script...");
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
            content: `Tu es un narrateur chaleureux et émouvant qui transforme des souvenirs de famille en récits audio captivants. 
Ton style est intime, poétique mais naturel, comme si tu racontais une histoire au coin du feu.
Tu dois créer un texte fluide et agréable à écouter, pensé pour être lu à voix haute.
Le texte doit durer environ 2-3 minutes à la lecture (400-600 mots).
N'utilise PAS de markdown, de titres, de puces ou de mise en forme. Écris uniquement du texte narratif continu.
Commence directement par le récit, sans introduction type "Voici l'histoire de...".
Ajoute des pauses naturelles avec des points de suspension ou des phrases courtes.
Termine par une phrase douce et évocatrice.`,
          },
          {
            role: "user",
            content: `Transforme ce souvenir en un récit audio narratif :\n\n${capsuleContext}`,
          },
        ],
      }),
    });

    if (!scriptResponse.ok) {
      const errorText = await scriptResponse.text();
      console.error("AI script generation failed:", scriptResponse.status, errorText);
      if (scriptResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (scriptResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits AI insuffisants" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erreur lors de la génération du script" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scriptData = await scriptResponse.json();
    const narrativeScript = scriptData.choices?.[0]?.message?.content;

    if (!narrativeScript) {
      return new Response(JSON.stringify({ error: "Script narratif vide" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Script generated: ${narrativeScript.length} chars`);

    // Step 2: Get OAuth2 access token from service account
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    if (!serviceAccountJson) {
      return new Response(JSON.stringify({ error: "GOOGLE_SERVICE_ACCOUNT_JSON non configurée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Create JWT for token exchange
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const base64url = (data: object | Uint8Array) => {
      const str = typeof data === "object" && !(data instanceof Uint8Array)
        ? new TextEncoder().encode(JSON.stringify(data))
        : data;
      return btoa(String.fromCharCode(...str))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const signingInput = `${base64url(jwtHeader)}.${base64url(jwtPayload)}`;

    // Import the private key and sign
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
      await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        cryptoKey,
        new TextEncoder().encode(signingInput)
      )
    );

    const jwt = `${signingInput}.${base64url(signature)}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Token exchange error:", tokenError);
      return new Response(JSON.stringify({ error: "Erreur d'authentification Google" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { access_token } = await tokenResponse.json();

    // Split text into chunks under 4800 bytes for TTS limit
    const encoder = new TextEncoder();
    const splitTts = (text: string, max = 4800): string[] => {
      const parts: string[] = [];
      let cur = "";
      for (const s of text.match(/[^.!?\n]+[.!?\n]*/g) || [text]) {
        if (encoder.encode(cur + s).length > max) {
          if (cur) parts.push(cur.trim());
          cur = s;
        } else {
          cur += s;
        }
      }
      if (cur.trim()) parts.push(cur.trim());
      return parts;
    };

    const chunks = splitTts(narrativeScript);
    console.log(`Calling Google Cloud TTS with OAuth2... (${chunks.length} chunks)`);

    const ttsVoice = { languageCode: "fr-FR", name: "fr-FR-Wavenet-C", ssmlGender: "FEMALE" };
    const ttsAudioConfig = { audioEncoding: "MP3", speakingRate: 0.95, pitch: 0, effectsProfileId: ["headphone-class-device"] };

    const audioParts: Uint8Array[] = [];
    for (const chunk of chunks) {
      const ttsResponse = await fetch(
        "https://texttospeech.googleapis.com/v1/text:synthesize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            input: { text: chunk },
            voice: ttsVoice,
            audioConfig: ttsAudioConfig,
          }),
        }
      );

      if (!ttsResponse.ok) {
        const ttsError = await ttsResponse.text();
        console.error("Google TTS error:", ttsResponse.status, ttsError);
        return new Response(JSON.stringify({ error: "Erreur lors de la synthèse vocale", details: ttsError }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ttsData = await ttsResponse.json();
      if (!ttsData.audioContent) {
        return new Response(JSON.stringify({ error: "Audio vide retourné par Google TTS" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const bin = atob(ttsData.audioContent);
      const part = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) part[i] = bin.charCodeAt(i);
      audioParts.push(part);
    }

    // Merge all audio parts
    const totalLength = audioParts.reduce((n, a) => n + a.length, 0);
    const bytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const a of audioParts) {
      bytes.set(a, offset);
      offset += a.length;
    }

    const fileName = `podcasts/${capsuleId}/${Date.now()}.mp3`;

    const { error: uploadError } = await adminSupabase.storage
      .from("capsule-medias")
      .upload(fileName, bytes, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Erreur lors du stockage du podcast" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 4: Save as capsule media
    const { error: mediaError } = await adminSupabase
      .from("capsule_medias")
      .insert({
        capsule_id: capsuleId,
        file_url: fileName,
        file_type: "audio/mpeg",
        file_name: `Podcast - ${capsule.title}.mp3`,
        caption: "🎙️ Podcast généré automatiquement",
      });

    if (mediaError) {
      console.error("Media insert error:", mediaError);
    }

    console.log("Podcast generated successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        script: narrativeScript,
        audioPath: fileName,
        charCount: narrativeScript.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Podcast generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});