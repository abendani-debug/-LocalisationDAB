# Nettoyage BDD — LocalisationDAB
# Procédure complète de nettoyage après import Google Places
# Dernière exécution : 2026-05-02 (VPS Octenium)

---

## Contexte

Après chaque import Google Places (`syncGooglePlaces()`), la BDD contient :
- Des faux ATMs (assurances, télécoms, administrations, cafés...)
- Des entrées sans `banque_id` (noms en arabe ou variantes orthographiques)
- Des banques manquantes dans le référentiel

Cette procédure remet la BDD dans un état propre.

---

## Connexion à la BDD (VPS)

```bash
sudo -u postgres psql -d localisation_dab
```

---

## ÉTAPE 1 — Ajouter les banques manquantes

```sql
INSERT INTO banques (nom) VALUES
  ('ABC Banque'),
  ('Fransabank'),
  ('Housing Bank'),
  ('Trust Bank Algeria'),
  ('Arab Bank Algeria'),
  ('Natixis Algérie')
ON CONFLICT DO NOTHING;

SELECT id, nom FROM banques ORDER BY id;
```

---

## ÉTAPE 2 — Lier Algérie Poste (banque_id = 8)

```sql
UPDATE dabs SET banque_id = 8 WHERE banque_id IS NULL AND (
  nom ILIKE '%algerie poste%' OR nom ILIKE '%algérie poste%'
  OR nom ILIKE '%alger poste%' OR nom ILIKE '%la poste%'
  OR nom ILIKE '%gab poste%' OR nom ILIKE '%dab poste%'
  OR nom ILIKE '%dab - poste%' OR nom ILIKE '%dab ap %'
  OR nom ILIKE '%distributeur%poste%' OR nom ILIKE '%distributaire%poste%'
  OR nom ILIKE '%bureau de poste%' OR nom ILIKE '%centre de poste%'
  OR nom ILIKE '%poste atm%' OR nom ILIKE '%ptt%'
  OR nom ILIKE '%ccp%' OR nom ILIKE '%eddahabia%' OR nom ILIKE '%dahabia%'
  OR nom ILIKE '%post office%' OR nom ILIKE '%postal %'
  OR nom ILIKE 'Poste %' OR nom ILIKE '%agence clic%'
  OR nom ILIKE '%بريد الجزائر%' OR nom ILIKE '%مركز البريد%'
  OR nom ILIKE '%مكتب بريد%' OR nom ILIKE '%صراف آلي بريد%'
  OR nom ILIKE '%قابض البريد%' OR nom ILIKE '%مركز بريد%'
  OR nom ILIKE '%صرافة تابعة للمركز بريد%'
  OR nom ILIKE '%ماكنتة صراف ألي بريد%' OR nom ILIKE '%صراف الي ، بريد%'
  OR nom ILIKE '%صندوق التوفير الإحتياط%'
  OR nom ILIKE '%البريد الرئيسي%' OR nom ILIKE '%البريد المركزي%'
  OR nom ILIKE '%صراف الألي بريد%'
  OR nom IN ('Poste', 'LA POSTE', 'la poste')
);
```

---

## ÉTAPE 3 — Supprimer les faux ATMs

```sql
-- Assurances, télécoms, voyages, administrations
DELETE FROM dabs WHERE banque_id IS NULL AND (
  nom ILIKE '%djezzy%' OR nom ILIKE '%mobilis%' OR nom ILIKE '%ooredoo%'
  OR nom ILIKE '%assurance%' OR nom ILIKE '%CAAT%' OR nom ILIKE '%CIAR%'
  OR nom ILIKE '%télécom%' OR nom ILIKE '%telecom%'
  OR nom ILIKE '%voyage%' OR nom ILIKE '%tourisme%'
  OR nom ILIKE '%impôt%' OR nom ILIKE '%impot%'
  OR nom ILIKE '%CNAS%' OR nom ILIKE '%CASNOS%' OR nom ILIKE '%CNAC%'
  OR nom ILIKE '%trésor%' OR nom ILIKE '%tresor%'
  OR nom ILIKE '%leasing%' OR nom ILIKE '%sofinance%'
  OR nom ILIKE '%café%' OR nom ILIKE '%cnl agence%'
  OR nom ILIKE '%ترامواي%' OR nom ILIKE '%tramway%'
  OR nom ILIKE '%quinquaillerie%' OR nom ILIKE '%residence vacance%'
  OR nom ILIKE '%torchi tours%' OR nom ILIKE '%youmid tour%'
  OR nom ILIKE '%money exchange%' OR nom ILIKE '%moneygram%'
  OR nom ILIKE '%mutualite%' OR nom ILIKE '%fgar%'
  OR nom ILIKE '%fonds de garantie%' OR nom ILIKE '%gateaux%'
  OR nom ILIKE '%imprimerie%' OR nom ILIKE '%kiosque%'
  OR nom ILIKE '%sae exact%' OR nom ILIKE '%fsie%'
  OR nom ILIKE '%dar el affroun%' OR nom ILIKE '%mla blida%'
  OR nom ILIKE '%اتصالات الجزائر%' OR nom ILIKE '%اصلاح الهواتف%'
  OR nom ILIKE '%قطع غيار%' OR nom ILIKE '%خزينة%'
  OR nom ILIKE '%الصندوق الوطني للتقاعد%' OR nom ILIKE '%سونلغاز%'
  OR nom ILIKE '%محجرة%' OR nom ILIKE '%تغليف السيارات%'
  OR nom ILIKE '%مستودع%' OR nom ILIKE '%مكتبة%'
  OR nom ILIKE '%جرافيولا%' OR nom ILIKE '%دار الصحافة%'
  OR nom ILIKE '%تطبيقات%' OR nom ILIKE '%gare routière%'
  OR nom ILIKE '%التعاون الفلاحي%' OR nom ILIKE '%الصندوق الجهوي للتعاون%'
  OR nom ILIKE '%المحيط الفلاحي%' OR nom ILIKE '%المنطقة الصناعية%'
  OR nom ILIKE '%صندوق الضمان الفلاحي%' OR nom ILIKE '%مركز دعم تشغيل%'
  OR nom ILIKE '%المصرف الجهوي للمطاط%' OR nom ILIKE '%محطة الفيراج%'
  OR nom ILIKE '%كشك متعدّد%' OR nom ILIKE '%حاسي السوق%'
  OR nom ILIKE '%البيرو بحيا%' OR nom ILIKE '%fni /%'
);

-- Banque d'Algérie (banque centrale, pas de DABs publics)
DELETE FROM dabs WHERE banque_id IS NULL AND (
  nom ILIKE '%bank of algeria%' OR nom ILIKE '%banque d''algerie%'
  OR nom ILIKE '%banque d''algérie%' OR nom ILIKE '%banque centrale%'
  OR nom ILIKE '%crma%' OR nom ILIKE '%banco sabadell%'
  OR nom ILIKE '%بنك الجزائر%' OR nom ILIKE '%البنك المركزي%'
);
```

---

## ÉTAPE 4 — Lier les banques (français + arabe)

```sql
-- CPA (ID 1)
-- IMPORTANT : faire cette étape AVANT BNA pour éviter que "Algerian Popular Loan" soit mappé sur BNA
UPDATE dabs SET banque_id = 1 WHERE banque_id IS NULL AND (
  nom ILIKE '%cpa%' OR nom ILIKE '%crédit populaire%' OR nom ILIKE '%credit populaire%'
  OR nom ILIKE '%c p a%' OR nom ILIKE '%c.p.a%'
  OR nom ILIKE '%popular credit of algeria%' OR nom ILIKE '%algerian communal credit%'
  OR nom ILIKE '%algerian popular%' OR nom ILIKE '%popular loan%'
  OR nom ILIKE '%القرض الشعبي الجزائري%' OR nom ILIKE '%بنك القرض الشعبي%'
);
-- Correction post-BNA : si "Algerian Popular" a été mappé sur BNA par erreur
UPDATE dabs SET banque_id = 1 WHERE banque_id = 2 AND nom ILIKE '%algerian popular%';

-- BNA (ID 2)
UPDATE dabs SET banque_id = 2 WHERE banque_id IS NULL AND (
  nom ILIKE '%bna%' OR nom ILIKE '%banque nationale%' OR nom ILIKE '%banque national%'
  OR nom ILIKE '%b.n.a%' OR nom ILIKE '%البنك الوطني الجزائري%'
  OR nom ILIKE '%المصرف الوطني الجزائري%'
);

-- BEA (ID 3)
UPDATE dabs SET banque_id = 3 WHERE banque_id IS NULL AND (
  nom ILIKE '%bea%' OR nom ILIKE '%banque extérieure%' OR nom ILIKE '%banque exterieure%'
  OR nom ILIKE '%b.e.a%' OR nom ILIKE '%banque exterieur%' OR nom ILIKE '%banque extérieur%'
  OR nom ILIKE '%algeria%external bank%' OR nom ILIKE '%banque exrérieure%'
  OR nom ILIKE '%بنك الجزائر الخارجي%' OR nom ILIKE '%البنك الخارجي%'
);

-- CNEP (ID 4)
UPDATE dabs SET banque_id = 4 WHERE banque_id IS NULL AND (
  nom ILIKE '%cnep%' OR nom ILIKE '%c.n.e.p%'
  OR nom ILIKE '%الصندوق الوطني للتوفير%'
  OR nom ILIKE '%national fund%provision%' OR nom ILIKE '%national endowment%provision%'
  OR nom ILIKE '%the national fund%provision%'
);

-- BADR (ID 5)
UPDATE dabs SET banque_id = 5 WHERE banque_id IS NULL AND (
  nom ILIKE '%badr%' OR nom ILIKE '%agricult%' OR nom ILIKE '%b.a.d.r%'
  OR nom ILIKE '%bdr banque%' OR nom ILIKE '%national rural%bank%'
  OR nom ILIKE '%rural development bank%'
  OR nom ILIKE '%بنك الفلاحة%' OR nom ILIKE '%بنك التنمية الريفية%'
  OR nom ILIKE '%البنك الفلاحي%' OR nom ILIKE '%بنك الفلاحه%'
  OR nom ILIKE '%البنك المركزي الفلاحي%' OR nom ILIKE '%التنمية الفلاحية%'
);

-- BDL (ID 6)
UPDATE dabs SET banque_id = 6 WHERE banque_id IS NULL AND (
  nom ILIKE '%bdl%' OR nom ILIKE '%b.d.l%'
  OR nom ILIKE '%développement local%' OR nom ILIKE '%developpement local%'
  OR nom ILIKE '%banque de development%' OR nom ILIKE '%local development bank%'
  OR nom ILIKE '%بنك التنمية المحلية%' OR nom ILIKE '%مصرف التنمية المحلية%'
);

-- AGB (ID 7)
UPDATE dabs SET banque_id = 7 WHERE banque_id IS NULL AND (
  nom ILIKE '%agb%' OR nom ILIKE '%gulf bank%' OR nom ILIKE '%a.g.b%'
  OR nom ILIKE '%banka general%'
  OR nom ILIKE '%بنك الخليج الجزائر%' OR nom ILIKE '%بنك الخليج%'
);

-- SGA (ID 9)
UPDATE dabs SET banque_id = 9 WHERE banque_id IS NULL AND (
  nom ILIKE '%société générale%' OR nom ILIKE '%societe generale%' OR nom ILIKE '%sga%'
  OR nom ILIKE '%banque societ%générale%' OR nom = 'SG'
  OR nom ILIKE '%societe general%' OR nom ILIKE '%société general%'
  OR nom ILIKE '%societé generale%'
  OR nom ILIKE '%سوسيتي جنرال%' OR nom ILIKE '%سوسيتيه جنرال%'
  OR nom ILIKE '%سوسيتي جينيرال%'
);

-- BNP Paribas (ID 10)
UPDATE dabs SET banque_id = 10 WHERE banque_id IS NULL AND (
  nom ILIKE '%bnp%' OR nom ILIKE '%paribas%' OR nom ILIKE '%البنك الفرنسي%'
);

-- Banque Salam (ID 11) — après Es Salam
UPDATE dabs SET banque_id = 11 WHERE banque_id IS NULL AND (
  nom ILIKE '%salam%' OR nom ILIKE '%بنك السلام%' OR nom ILIKE '%مصرف السلام%'
);

-- Al Baraka (ID 13)
UPDATE dabs SET banque_id = 13 WHERE banque_id IS NULL AND (
  nom ILIKE '%baraka%' OR nom ILIKE '%al baraka%' OR nom ILIKE '%بنك البركة%'
);

-- ABC Banque (ID 15)
UPDATE dabs SET banque_id = 15 WHERE banque_id IS NULL AND nom ILIKE '%abc%';

-- Fransabank (ID 16)
UPDATE dabs SET banque_id = 16 WHERE banque_id IS NULL AND nom ILIKE '%fransa%';

-- Housing Bank (ID 17)
UPDATE dabs SET banque_id = 17 WHERE banque_id IS NULL AND nom ILIKE '%housing%';

-- Trust Bank Algeria (ID 18)
UPDATE dabs SET banque_id = 18 WHERE banque_id IS NULL AND (
  nom ILIKE '%trust bank%' OR nom ILIKE '%trust-banque%' OR nom ILIKE '%trust banque%'
  OR nom ILIKE '%ترست بنك%' OR nom ILIKE '%بنك ترست%'
);

-- Arab Bank Algeria (ID 19)
UPDATE dabs SET banque_id = 19 WHERE banque_id IS NULL AND nom ILIKE '%arab bank%';

-- Natixis Algérie (ID 20)
UPDATE dabs SET banque_id = 20 WHERE banque_id IS NULL AND nom ILIKE '%natixis%';
```

---

## ÉTAPE 5 — Vérification finale

```sql
-- Total et sans banque
SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE banque_id IS NULL) as sans_banque FROM dabs;

-- Répartition par banque
SELECT b.nom, COUNT(d.id) as nb_dabs
FROM banques b
LEFT JOIN dabs d ON d.banque_id = b.id
GROUP BY b.id, b.nom
ORDER BY nb_dabs DESC;
```

---

## Résultats attendus après nettoyage

| Indicateur | Valeur |
|---|---|
| Total DABs | ~1 100-1 200 |
| Sans banque_id | ~100 (ATMs génériques) |
| Banques actives | 18 |

---

*Créé le 2026-05-02 — Session Claude Code*
*À relancer après chaque import Google Places*
