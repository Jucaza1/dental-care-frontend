.PHONY: build
build:
	@go build -o build/frontend-server ./cmd

.PHONY: build-windows
build-windows:
	GOOS=windows GOARCH=amd64 go build -o build/frontend-server.exe ./cmd

.PHONY: run
run: build
	@./build/frontend-server

docker:
	@docker build -t dental-care-frontend .
	@docker compose up -d

docker-clear:
	@docker rm dentcare-app
	@docker rmi dental-care-frontend
