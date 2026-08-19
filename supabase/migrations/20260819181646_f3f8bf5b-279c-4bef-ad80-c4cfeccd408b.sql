UPDATE public.blog_posts SET cover_image_url = m.url, updated_at = now()
FROM (VALUES
 ('ancetres','/__l5e/assets-v1/f6749bf9-864e-4508-b9d9-d60c0e2d063c/ancetres.jpg'),
 ('arbre-genealogique-en-ligne-photos-et-souvenirs','/__l5e/assets-v1/9552cd57-f7f2-4339-8a70-dbbe6813be3f/arbre.jpg'),
 ('capsule-temporelle-numerique-comment-en-creer-une','/__l5e/assets-v1/5b147eea-95d9-4287-b2af-0a5745bc88ee/capsule.jpg'),
 ('cousinade','/__l5e/assets-v1/e7db52ef-0891-46c5-bd84-bf5335857029/cousinade.jpg'),
 ('enfance','/__l5e/assets-v1/7428ca33-1049-4d3d-acf1-5141a0e87eec/enfance.jpg'),
 ('mariage','/__l5e/assets-v1/45b74aa8-b1de-42a8-9c39-bf03aea3a397/mariage.jpg'),
 ('medical-memoire','/__l5e/assets-v1/fcacf591-b309-4ccc-a336-d396d98df1ab/medical-memoire.jpg'),
 ('naissance','/__l5e/assets-v1/03edefc0-01e0-4e8a-8c50-36b5fe9418c1/naissance.jpg'),
 ('partage-securise','/__l5e/assets-v1/41222bef-1c13-48fe-9508-c71682927871/partage-securise.jpg'),
 ('photos-conservation','/__l5e/assets-v1/e049e715-96d2-4d2b-a9fa-aed6b6ef2c40/photos-conservation.jpg'),
 ('raconter-sa-vie-a-ses-enfants-methode','/__l5e/assets-v1/ae6d0666-5b74-4648-903e-3f2685113276/raconter.jpg'),
 ('conserver-transmettre-souvenirs-de-famille','/__l5e/assets-v1/86b7d7df-c01e-441f-a7a1-bc300764af7a/transmettre.jpg'),
 ('voyage','/__l5e/assets-v1/b4714b1c-a322-46c6-97cd-3d1312fdaeed/voyage.jpg'),
 ('vs-reseaux-sociaux','/__l5e/assets-v1/ef69c915-b092-4410-8bd2-48ee2682442f/vs-reseaux-sociaux.jpg')
) AS m(grp, url)
WHERE public.blog_posts.translation_group = m.grp;