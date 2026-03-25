

## Emotion Reactions on Shared Capsules

### Summary
Add an emoji-based "emotion reaction" system to capsules, allowing circle members to express emotions (not just a simple like). This includes a new database table, a React component with 30 categorized emotions, and integration into the capsule detail page.

### 30 Emotions (6 categories, 5 each)

| Category | Emotions |
|----------|----------|
| **Joy** | 😊 Touched, 😂 Amused, 🥰 In love, 🤩 Amazed, 😄 Happy |
| **Tenderness** | 🥹 Moved, 💕 Affection, 🫶 Grateful, 🤗 Warm, 😌 Serene |
| **Nostalgia** | 🥲 Nostalgic, 💭 Dreamy, 🕰️ Memories, 🌅 Melancholic, 📸 Flashback |
| **Admiration** | 👏 Bravo, 💪 Inspiring, ✨ Magnificent, 🌟 Impressive, 🎯 Brilliant |
| **Emotion** | 😢 Tearful, 💔 Heartbreaking, 🙏 Respectful, 😮 Speechless, 💫 Overwhelming |
| **Fun** | 😜 Playful, 🎉 Festive, 😅 Awkward, 🤭 Mischievous, 😏 Cheeky |

### Database Changes

1. **New table `capsule_reactions`**:
   - `id` (uuid, PK)
   - `capsule_id` (uuid, not null)
   - `user_id` (uuid, not null)
   - `emotion_key` (varchar, not null) — e.g. "touched", "amused"
   - `created_at` (timestamptz)
   - Unique constraint on `(capsule_id, user_id, emotion_key)` — one reaction per emotion per user

2. **RLS Policies**:
   - SELECT: `user_can_view_capsule(auth.uid(), capsule_id)` — anyone who can see the capsule can see reactions
   - INSERT: `user_can_view_capsule(auth.uid(), capsule_id) AND auth.uid() = user_id` — circle members can react
   - DELETE: `auth.uid() = user_id` — users can remove their own reactions

3. **Enable realtime** on `capsule_reactions` for live updates

### Frontend Changes

1. **New component `EmotionReactions.tsx`** (`src/components/capsule/`):
   - Displays aggregated emotion counts as small pills below the capsule content
   - A "+" button opens a popover/drawer with the 30 emotions organized by category
   - Clicking an emotion toggles it (insert/delete)
   - User's own reactions are highlighted
   - Realtime subscription for live updates

2. **Integration in `CapsuleDetail.tsx`**:
   - Place the `EmotionReactions` component between the content and the comments section
   - Visible to both owner and circle members (anyone who can view the capsule)

3. **Translations**: Add emotion labels and category names in all 5 languages (FR, EN, ES, KO, ZH) under the `capsules` namespace

### Technical Details

- Emotion definitions stored as a static constant (key, emoji, category, translationKey)
- The component fetches reactions on mount + subscribes to realtime changes
- Toggle logic: check if user already reacted with that emotion → DELETE if yes, INSERT if no
- Aggregation done client-side from the reaction rows
- Mobile-friendly: popover on desktop, drawer on mobile (use `useIsMobile` hook)

