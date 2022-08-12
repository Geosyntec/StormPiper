MAKEFLAGS += --silent
.PHONY: clean clean-test clean-pyc clean-build restart test develop up down dev-server help build release
.DEFAULT_GOAL := help
define BROWSER_PYSCRIPT
import os, webbrowser, sys
try:
	from urllib import pathname2url
except:
	from urllib.request import pathname2url

webbrowser.open("file://" + pathname2url(os.path.abspath(sys.argv[1])))
endef
export BROWSER_PYSCRIPT

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([a-zA-Z_-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		print("%-20s %s" % (target, help))
endef
export PRINT_HELP_PYSCRIPT
BROWSER := python -c "$$BROWSER_PYSCRIPT"

help:
	@python -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)

clean: clean-build clean-pyc clean-test ## remove all build, test, coverage and Python artifacts

clean-build: ## remove build artifacts
	rm -fr build/
	rm -fr dist/
	rm -fr .eggs/
	find . -maxdepth 3 -name '*.egg-info' -exec rm -fr {} +
	find . -maxdepth 3 -name '*.egg' -exec rm -f {} +

clean-pyc: ## remove Python file artifacts
	find stormpiper -path '*/node_modules' -prune -o -name '*.pyo' -o -name '*.pyc' -exec rm -f {} +
	find stormpiper -path '*/node_modules' -prune -o -name '__pycache__' -exec rm -fr {} +

clean-test: ## remove test and coverage artifacts
	rm -fr .tox/
	rm -fr .coverage
	rm -fr htmlcov/
	rm -fr .pytest_cache
	rm -fr .mypy_cache

export COMPOSE_DOCKER_CLI_BUILD=1

stack: ## write the docker-stack.yml file
	docker compose \
		-f docker-compose.develop.yml \
		-f docker-compose.dev-volume.yml \
		-f docker-compose.dev-environment.yml \
		-f docker-compose.dev-postgis.yml \
		config > docker-stack.yml

stack-ci: ## write the docker-stack.yml file for ci
	docker compose \
		-f docker-compose.develop.yml \
		-f docker-compose.dev-postgis.yml \
		config > docker-stack.yml

build: ## build the docker-stack.yml file
	docker compose -f docker-stack.yml build

restart: ## restart the redis server and the background workers
	docker compose -f docker-stack.yml restart redis bg_worker beat_worker

test: ## run tests quickly with the default Python
	bash scripts/test.sh -xsv -m "not integration"

lint: clean
	bash scripts/lint.sh

test-ci: stack-ci ## run tests quickly with the default Python
	docker compose -f docker-stack.yml up stormpiper-test postgis -d
	docker compose -f docker-stack.yml exec stormpiper-test bash prestart-tests.sh  
	docker compose -f docker-stack.yml exec stormpiper-test pytest -xsv  -m "not integration"

coverage-ci: stack-ci ## run tests on CI with the default Python
	docker compose -f docker-stack.yml up stormpiper-test postgis -d
	docker compose -f docker-stack.yml exec stormpiper-test bash prestart-tests.sh  
	docker compose -f docker-stack.yml exec stormpiper-test coverage run -m pytest -xv -m "not integration"

coverage: clean restart ## check code coverage quickly with the default Python
	docker compose -f docker-stack.yml up -d stormpiper-test postgis
	docker compose -f docker-stack.yml exec stormpiper-test coverage run -m pytest -x
	docker compose -f docker-stack.yml exec stormpiper-test coverage report -mi

typecheck: clean ## run static type checker
	mypy stormpiper/stormpiper

develop: clean stack build ## build the development environment 

up: stack ## bring up the containers and run startup commands
	docker compose -f docker-stack.yml up 
	
up-d: stack ## bring up the containers in '-d' mode 
	docker compose -f docker-stack.yml up -d

down: ## bring down the containers
	docker compose -f docker-stack.yml down

down-v: ## bring down the containers and detach volumes
	docker compose -f docker-stack.yml down -v

dev-server: stack ## start a development server
	docker compose -f docker-stack.yml run -p 8080:80 -e LOG_LEVEL=debug stormpiper-pod bash /start-reload.sh

release: ## push production images to registry
	bash scripts/push_release.sh

cluster: ## bring up local kubenertes cluster
	bash scripts/local_cluster.sh
