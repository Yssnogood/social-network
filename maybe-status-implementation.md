# Implémentation du statut "Peut-être" (Maybe) pour les événements

## Résumé des modifications

### 🗄️ Backend (Go)

1. **Migration de base de données** (026_add_maybe_status_to_event_responses)
   - Ajout du statut `'maybe'` à la contrainte CHECK de la table `event_responses`
   - Migration réversible avec conversion de 'maybe' vers 'not_going' en cas de rollback

2. **API Backend**
   - `EventHandler.go` : Mise à jour de la validation pour accepter 'maybe'
   - Commentaire du type `setEventResponseRequest` mis à jour

### 🎨 Frontend (TypeScript/React)

1. **Services**
   - `group.ts` : Fonction `respondToEvent` accepte maintenant 'maybe'

2. **Composants mis à jour**
   - `EventView.tsx` :
     - Type `EventResponse` supporte 'maybe'
     - Fonction `handleResponse` accepte 'maybe'
     - Ajout du bouton "Peut-être" avec couleur ambre
     - Ajout du compteur "Peut-être" dans les statistiques
     - Affichage du statut "Peut-être" dans la liste des participants
     - Notification toast pour le statut 'maybe'
   
   - `EventsPanel.tsx` :
     - Fonction `handleEventResponse` accepte 'maybe'
     - Ajout du bouton "?" avec couleur ambre
     - Notification toast pour le statut 'maybe'
   
   - `PresentationPanel.tsx` :
     - Validation mise à jour pour accepter 'maybe'

3. **Composant déjà préparé**
   - `AdaptiveEventCard.tsx` avait déjà le bouton "Peut-être" mais n'était pas connecté

## 🎨 Design système

Le système suit maintenant les bonnes pratiques RSVP standards avec 3 options :
- ✅ **Participe** (vert) : Confirmation ferme de participation
- ❓ **Peut-être** (ambre/orange) : Participation incertaine
- ❌ **Ne participe pas** (rouge) : Décline l'invitation

## 🔧 Commandes pour tester

```bash
# Lancer le backend
cd backend && go run cmd/server/main.go

# Lancer le frontend (dans un autre terminal)
cd frontend && npm run dev

# Ou utiliser le script de démarrage
./start-sans-docker.sh
```

## 📊 Améliorations futures possibles

1. **Notifications de rappel** : Envoyer des rappels aux participants "peut-être" avant l'événement
2. **Conversion automatique** : Proposer de convertir "peut-être" en "participe" ou "ne participe pas" à l'approche de l'événement
3. **Statistiques avancées** : Analyser les tendances de conversion "peut-être" vers participation réelle
4. **Export des listes** : Exporter séparément les listes de participants confirmés, incertains et absents