# Frontend application for a dental clinic
To serve the application I used a simple Go file server for the backend.
For the frontend I used HTML, CSS, Typescript and Webpack as bundler.

## Cloning the repo
```bash
git clone https://github.com/jucaza1/dental-care-frontend && cd dental-care-frontend
```

## Frontend application
To build the Typescript project **installing Node is required**.
```bash
npm install
npm run prod
```

## Backend server
To build and run **installing Go is required**.
Commands:
Build and run go backend on port 4000
```bash
make run
```
or
```bash
go build -o build/frontend-server ./cmd && ./build/frontend-server
```

## Access the application
[http://localhost:4000/](http://localhost:4000/)

## Diary of notes
[https://github.com/jucaza1/dental-care-frontend/blob/master/diary.md](https://github.com/jucaza1/dental-care-frontend/blob/master/diary.md)
