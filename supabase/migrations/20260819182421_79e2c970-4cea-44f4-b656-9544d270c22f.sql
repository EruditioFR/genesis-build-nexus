UPDATE public.blog_posts SET cover_image_url = m.url, updated_at = now()
FROM (VALUES
 ('ancetres','/__l5e/assets-v1/e278410c-cd93-4f79-9cf2-e7d710c92b59/ancetres.jpg'),
 ('arbre-genealogique-en-ligne-photos-et-souvenirs','/__l5e/assets-v1/e5ff3476-1d08-4cee-97b9-5c47246db7a0/arbre.jpg'),
 ('capsule-temporelle-numerique-comment-en-creer-une','/__l5e/assets-v1/fd70d360-8bb5-42f2-9a9c-49bd8ea5cefb/capsule.jpg'),
 ('cousinade','/__l5e/assets-v1/7cd8d671-a634-4845-91e4-3c1987ca2973/cousinade.jpg'),
 ('enfance','/__l5e/assets-v1/454ec7a0-4051-4777-b554-a84a01625ef3/enfance.jpg'),
 ('mariage','/__l5e/assets-v1/4b24ef14-0bd9-416c-b6d7-d1838194a168/mariage.jpg'),
 ('medical-memoire','/__l5e/assets-v1/c6654b46-8aa7-4a8b-a07f-dfb56806b600/medical-memoire.jpg'),
 ('naissance','/__l5e/assets-v1/13dea913-623b-4f35-9add-977af21d68c0/naissance.jpg'),
 ('partage-securise','/__l5e/assets-v1/0696741e-6515-407b-915a-660101b95d4c/partage-securise.jpg'),
 ('photos-conservation','/__l5e/assets-v1/2389055a-88d6-4de4-b9f6-89c67f1aaa63/photos-conservation.jpg'),
 ('raconter-sa-vie-a-ses-enfants-methode','/__l5e/assets-v1/6fd289c2-e6b2-4dec-a398-aea888b9be0b/raconter.jpg'),
 ('conserver-transmettre-souvenirs-de-famille','/__l5e/assets-v1/74664df8-2b9f-40e3-a97c-1449e3beec75/transmettre.jpg'),
 ('voyage','/__l5e/assets-v1/b867de52-1f75-4fdc-b313-3b9e3ab23cc3/voyage.jpg'),
 ('vs-reseaux-sociaux','/__l5e/assets-v1/9159a071-938e-4beb-b8cc-c9ee5a97b278/vs-reseaux-sociaux.jpg')
) AS m(grp, url)
WHERE public.blog_posts.translation_group = m.grp;