COMPOSE := docker compose

.PHONY: build up test stop clean

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

test:
	$(COMPOSE) up --build -d
	@echo "Waiting for backend to be healthy..."
	@i=0; while [ $$i -lt 30 ]; do \
		$(COMPOSE) exec -T backend python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" 2>/dev/null && break; \
		sleep 2; i=$$((i+1)); \
	done
	@echo "Running E2E tests..."
	$(COMPOSE) run --rm playwright

stop:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v --remove-orphans
