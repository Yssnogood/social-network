# 📋 PLANIFICATION - SOCIAL NETWORK APP

## ✅ PHASE 1 : SYSTÈME DE LIKES/DISLIKES (COMPLÉTÉ)

### Implémentations réalisées :

#### 1. Base de données
- ✅ Créé migration `024_update_post_like_system.sql` 
  - Ajout du champ `reaction_type` (like/dislike)
  - Contrainte UNIQUE sur (post_id, user_id) pour exclusivité
  - Index optimisés pour les performances

#### 2. Backend (Go)
- ✅ Modifié `PostRepository` :
  - `Like()` et `Dislike()` avec logique d'exclusivité
  - `AddReaction()`, `UpdateReaction()`, `DeleteReaction()`
  - `GetLikesCount()`, `GetDislikesCount()`, `GetUserReaction()`
- ✅ Créé `DislikePost()` dans `PostHandler`
- ✅ Ajouté route `/api/dislike`
- ✅ Mis à jour les réponses API pour inclure likes/dislikes

#### 3. Frontend (React/Next.js)
- ✅ Créé hook `usePostLike` pour gérer l'état des réactions
  - Gestion optimiste des mises à jour
  - Exclusivité like/dislike
  - Gestion des erreurs avec rollback
- ✅ Refactoré `post.ts` service :
  - Supprimé manipulation DOM
  - Ajouté support dislikes
  - Retour de promesses propres
- ✅ Mis à jour `AdaptivePostCard` :
  - Boutons J'aime/J'aime pas fonctionnels
  - Indicateurs visuels (vert/rouge)
  - Compteurs de réactions
- ✅ Mis à jour types TypeScript (`GroupPost`)

## 🔧 PHASE 2 : SYSTÈME DE RÉPONSES AUX ÉVÉNEMENTS (À FAIRE)

### 2.1 Base de données
- ⏳ Modifier la contrainte CHECK de `event_responses` pour accepter 'maybe'
- ⏳ Créer migration `025_add_maybe_event_response.sql`

### 2.2 Backend
- ⏳ Modifier `EventHandler.SetEventResponse` pour accepter "maybe"
- ⏳ Mettre à jour la validation dans le handler
- ⏳ Modifier le repository si nécessaire

### 2.3 Frontend
- ⏳ Créer service `events.ts` avec :
  - `respondToEvent(eventId, status: 'going' | 'not_going' | 'maybe')`
  - `getEventResponses(eventId)`
- ⏳ Connecter les 3 boutons dans `AdaptiveEventCard` (déjà présents)
- ⏳ Gérer l'état local des réponses

## 🔗 PHASE 3 : CONNEXION DES FLUX MANQUANTS (À FAIRE)

### 3.1 Posts dans les groupes
- ⏳ Vérifier l'intégration des likes/dislikes pour les posts de groupe
- ⏳ S'assurer que le repository des posts de groupe utilise le nouveau système
- ⏳ Tester la création de posts depuis le contexte groupe

### 3.2 Service d'événements frontend
- ⏳ Créer `/services/event.ts` complet
- ⏳ Intégrer avec les hooks existants
- ⏳ Gérer les mises à jour temps réel

### 3.3 Messages privés
- ⏳ Vérifier l'intégration WebSocket pour les messages privés
- ⏳ Distinguer chat privé vs chat de groupe
- ⏳ Implémenter les indicateurs de saisie

### 3.4 Invitations de groupe
- ⏳ Créer composant `InvitationsList`
- ⏳ Ajouter service pour gérer les invitations
- ⏳ Intégrer dans le panneau principal

## 🏗️ PHASE 4 : AMÉLIORATION DE L'ARCHITECTURE (OPTIONNEL)

### 4.1 Hooks personnalisés
- ⏳ `useEvent()` : gestion complète des événements
- ⏳ `useGroup()` : gestion des groupes et membres
- ⏳ `useMessage()` : gestion des messages avec WebSocket

### 4.2 Contextes React
- ⏳ `PostContext` : état global des posts avec likes/dislikes
- ⏳ `EventContext` : état global des événements
- ⏳ `NotificationContext` : notifications temps réel

### 4.3 Optimisations
- ⏳ Mise en cache des réactions
- ⏳ Batch des requêtes API
- ⏳ Lazy loading des commentaires

## 📊 STATUT GLOBAL

### ✅ Complété
- Système complet de likes/dislikes avec exclusivité
- Migration base de données
- API backend fonctionnelle
- Interface utilisateur réactive
- Gestion optimiste des états

### 🚧 En cours
- Aucune tâche en cours actuellement

### ⏳ À faire
- Système "Peut-être" pour les événements
- Service événements frontend
- Connexion des flux manquants
- Améliorations architecturales

## 🔄 PROCHAINES ÉTAPES RECOMMANDÉES

1. **Priorité 1** : Implémenter le support "maybe" pour les événements (simple)
2. **Priorité 2** : Créer le service événements frontend
3. **Priorité 3** : Vérifier et connecter tous les flux manquants
4. **Priorité 4** : Refactoring architectural si temps disponible

## 📝 NOTES TECHNIQUES

- La migration doit être exécutée avec `go run backend/cmd/tools/migrate.go up`
- Les nouveaux endpoints nécessitent authentification JWT
- Le hook `usePostLike` gère automatiquement l'exclusivité côté client
- Les compteurs sont mis à jour de manière optimiste puis synchronisés avec le serveur