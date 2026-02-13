COMPOSE := docker compose

.PHONY: build up test stop clean

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

test:
	$(COMPOSE) run --rm frontend npm run test:e2e

stop:
	$(COMPOSE) down

clean:
	$(COMPOSE) down -v --remove-orphans
