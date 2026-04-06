# Variables
IMAGE_NAME = front-axeon-workout
PORT = 5173
CONTAINER_NAME = front-axeon-workout

# .PHONY indique que ce ne sont pas des fichiers physiques
.PHONY: help build run stop clean logs shell rebuild

help:
	@echo "Commandes disponibles :"
	@echo "  make build   - Construit l'image Docker"
	@echo "  make run     - Lance le container (mappage port $(PORT))"
	@echo "  make stop    - Arrête et supprime le container"
	@echo "  make logs    - Affiche les logs en temps réel"
	@echo "  make shell   - Ouvre un shell dans le container"
	@echo "  make clean   - Supprime l'image"
	@echo "  make rebuild - Stop, Build et Run"

build:
	docker build -t $(IMAGE_NAME) .

run:
	@# On vérifie si un conteneur du même nom tourne déjà pour éviter les conflits
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):80 $(IMAGE_NAME)
	@echo "App disponible sur http://localhost:$(PORT)"

stop:
	@# Le "-" avant docker permet de ne pas stopper le Makefile si le container n'existe pas
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) sh

clean: stop
	-docker rmi $(IMAGE_NAME)

rebuild: stop build run