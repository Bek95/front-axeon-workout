# Variables
IMAGE_NAME = front-axeon-workout
IMAGE_NAME_DEV = $(IMAGE_NAME)-dev
PORT = 5173
CONTAINER_NAME = front-axeon-workout
CONTAINER_NAME_DEV = $(CONTAINER_NAME)-dev

.PHONY: help build run stop clean logs shell rebuild dev-build dev dev-stop dev-logs

help:
	@echo "Commandes de DEV (Temps réel) :"
	@echo "  make dev-build - Construit l'image de développement"
	@echo "  make dev       - Lance l'app en mode dev avec rechargement à chaud"
	@echo "  make dev-stop  - Arrête le conteneur de dev"
	@echo "  make dev-logs  - Affiche les logs de dev"
	@echo "--------------------------------------------------"
	@echo "Commandes de PROD (Fichiers figés via Nginx) :"
	@echo "  make build     - Construit l'image de prod"
	@echo "  make run       - Lance le container de prod (port $(PORT):80)"
	@echo "  make stop      - Arrête et supprime le container de prod"

# =========================================================================
# CONFIGURATION DEVELOPMENT (HMR / LIVE RELOAD)
# =========================================================================

dev-build:
	docker build -f Dockerfile.dev -t $(IMAGE_NAME_DEV) .

dev: dev-stop
	@echo "Démarrage du mode Dev... (Changements pris en compte en direct)"
	docker run -it --rm \
		--name $(CONTAINER_NAME_DEV) \
		-p $(PORT):$(PORT) \
		-v $(shell pwd):/app:delegated \
		-v /app/node_modules \
		$(IMAGE_NAME_DEV)

dev-stop:
	-docker stop $(CONTAINER_NAME_DEV)
	-docker rm $(CONTAINER_NAME_DEV)

dev-logs:
	docker logs -f $(CONTAINER_NAME_DEV)

# =========================================================================
# CONFIGURATION PRODUCTION
# =========================================================================

build:
	docker build -t $(IMAGE_NAME) .

run: stop
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):80 $(IMAGE_NAME)
	@echo "App de PROD disponible sur http://localhost:$(PORT)"

stop:
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) sh

clean: stop dev-stop
	-docker rmi $(IMAGE_NAME)
	-docker rmi $(IMAGE_NAME_DEV)

rebuild: stop build run