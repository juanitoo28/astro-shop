# 🛍️ Astro Shop — Netlify Edition

Template e-commerce Astro avec interface admin et déploiement Netlify automatique.

---

## ⚡ Architecture

```
Client modifie via /admin/
        ↓
Netlify Function écrit dans data.json via GitHub API
        ↓
GitHub détecte le commit → déclenche rebuild Netlify
        ↓
Boutique mise à jour automatiquement (~1-2 min) ✓
```

---

## 🚀 Mise en place (20 minutes)

### Étape 1 — Préparer le repo GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "initial commit"

# Créer un repo sur github.com puis :
git remote add origin https://github.com/TON-USERNAME/astro-shop.git
git push -u origin main
```

### Étape 2 — Créer un GitHub Token

1. Aller sur https://github.com/settings/tokens/new
2. Note : `Netlify Admin Shop`
3. Expiration : `No expiration` (ou 1 an)
4. Permissions : cocher **`repo`** (accès complet)
5. Cliquer **Generate token** → copier le token `ghp_xxx...`

### Étape 3 — Déployer sur Netlify

1. Aller sur https://app.netlify.com/start
2. **"Import an existing project"** → GitHub → sélectionner ton repo
3. Build settings (auto-détectés) :
   - Build command : `npm run build`
   - Publish directory : `dist`
4. Cliquer **Deploy**

### Étape 4 — Configurer les variables d'environnement

Dans Netlify → ton site → **Site configuration > Environment variables** :

| Variable | Valeur |
|---|---|
| `ADMIN_PASSWORD` | `ton-mot-de-passe-secret` |
| `GITHUB_TOKEN` | `ghp_xxxxx` (token créé à l'étape 2) |
| `GITHUB_REPO` | `ton-username/astro-shop` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_DATA_PATH` | `admin/data.json` |

Puis **Trigger deploy** pour que les variables soient actives.

### Étape 5 — Accéder à l'admin

```
https://ton-site.netlify.app/admin/
```

---

## 💻 Développement local

```bash
npm install

# Copier et remplir les variables
cp .env.example .env

# Lancer avec Netlify CLI (fonctions + Astro ensemble)
npm run dev
# → http://localhost:8888
# → /admin/ disponible avec les fonctions

# OU lancer Astro seul (sans les fonctions)
npm run dev:astro
# → http://localhost:4321
```

---

## 📁 Structure

```
/
├── admin/
│   ├── index.html          ← Interface admin
│   └── data.json           ← Source de vérité (produits, marque…)
├── netlify/
│   └── functions/
│       ├── _utils.mjs      ← Auth + GitHub API
│       ├── auth.mjs        ← Login / logout / check
│       ├── data.mjs        ← Lecture complète
│       ├── products.mjs    ← CRUD produits + réordonnement
│       ├── settings.mjs    ← Marque, hero, about, catégories
│       └── upload.mjs      ← Upload images → GitHub
├── src/                    ← Code Astro (boutique)
├── netlify.toml            ← Config Netlify
└── .env.example            ← Variables à configurer
```

---

## 🔁 Workflow quotidien

Le client modifie ses produits via `/admin/` → les changements sont commitées sur GitHub → Netlify rebuild automatiquement → la boutique est mise à jour en **1-2 minutes**, sans intervention de ta part.

---

## 🔒 Sécurité

- Auth par token signé (8h) stocké en cookie HttpOnly
- Variables sensibles uniquement côté serveur (Netlify Functions)
- GitHub Token jamais exposé au client
- Pour renforcer : ajouter Netlify Identity ou une protection par mot de passe HTTP au niveau du site
# astro-shop
