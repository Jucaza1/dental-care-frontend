package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

const (
    PORT = ":4000"
)

func main() {
	app := http.NewServeMux()
	app.HandleFunc("GET /", centralErrorHandler(homeHandler))
    fmt.Printf("Listening on http://localhost%s\n",PORT)
    log.Fatal(http.ListenAndServe(PORT,app))
}
func homeHandler(w http.ResponseWriter, r *http.Request) error {
    log.Println("request path -> ",r.URL.Path)
	http.FileServerFS(os.DirFS("public")).ServeHTTP(w, r)
	return nil
}

type handlerFuncWithError func(http.ResponseWriter, *http.Request) error

func centralErrorHandler(f handlerFuncWithError) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := f(w, r)
		if err != nil {
			log.Println(err)
		}
	}
}
