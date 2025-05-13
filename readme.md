créer la db + migration : go run backend/cmd/server/main.go

commande de migration :

go run backend/cmd/tools/migrate.go up = créer toutes les tables
go run backend/cmd/tools/migrate.go alldown = supprime toutes les tables
go run backend/cmd/tools/migrate.go reset = supprime toutes les tables + recréer toutes les tables