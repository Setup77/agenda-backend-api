# Agenda Backend API 📡

L'API REST sécurisée, performante et scalable qui propulse l'application de gestion d'agendas et d'événements. Conçue selon une architecture modulaire stricte avec le framework **NestJS**.

## 🚀 Fonctionnalités & Spécifications
- **Architecture Modulaire** : Isolation complète des modules (Auth, Users, Events).
- **Persistance Cloud** : Base de données MongoDB hébergée sur un cluster managé **MongoDB Atlas**.
- **Sécurité Intégrée** : Protection contre les attaques CSRF et gestion avancée des sessions utilisateur.
- **Validation Strict** : Sécurisation des données entrantes via des classes DTO (Data Transfer Objects) avec `class-validator`.
- **Gestion des Médias** : Système d'upload sécurisé des avatars via Multer.

## 🛠️ Stack Technique
- **Framework Core** : Node.js, NestJS (TypeScript)
- **Base de Données** : MongoDB, Mongoose ORM
- **Gestion des Sessions** : Express-session, Passport.js

## 📦 Installation Locale

### 1. Cloner le projet
```bash
git clone <URL_DE_VOTRE_NOUVEAU_DEPOT_BACKEND>
cd agenda-backend-api
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Variables d'environnement
Créez un fichier `.env` à la racine :
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agenda_db
SESSION_SECRET=votre_clef_secrete_locale
NODE_ENV=development
```

### 4. Lancement du serveur
```bash
# Mode développement (Watch mode)
npm run start:dev

# Mode production (Compilation)
npm run build
npm run start:prod
```

## 🚀 Déploiement en Production
Cette API est configurée pour fonctionner sur des environnements conteneurisés modernes comme **Hostinger Web Apps**, exploitant l'injection dynamique des ports réseau via `process.env.PORT`.
