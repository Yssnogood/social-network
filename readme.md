## Initialisation

Pour créer la base de données et lancer les migrations automatiquement :

```bash
go run backend/cmd/server/main.go
```
# commande de migration

| Commande                                      | Description                                        |
| --------------------------------------------- | -------------------------------------------------- |
| `go run backend/cmd/tools/migrate.go up`      | ✅ Crée toutes les tables (applique les migrations)|
| `go run backend/cmd/tools/migrate.go alldown` | 🗑️ Supprime toutes les tables (rollback total)     |
| `go run backend/cmd/tools/migrate.go reset`   | 🔄 Supprime **et** recrée toutes les tables        |
