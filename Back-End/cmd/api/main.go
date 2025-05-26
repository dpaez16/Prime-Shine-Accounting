package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"prime-shine-api/internal/db"
	"syscall"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

type config struct {
	port int
	dev  bool
}

type application struct {
	config config
	logger *log.Logger
	db     *sqlx.DB
}

func waitForSignals(app *application) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	s := <-quit

	app.logger.Printf("Caught signal %s", s.String())
	app.logger.Println("Disconnecting from database")

	if err := app.db.Close(); err != nil {
		panic(errors.Wrap(err, "db disconnect"))
	}

	os.Exit(0)
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 5000, "API server port")
	flag.BoolVar(&cfg.dev, "dev", true, "Development mode")
	flag.Parse()

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)
	db, err := db.SetupDB(logger)
	if err != nil {
		logger.Fatalf("Could not connect to database: %v", err.Error())
	}

	logger.Println("Connected to database")

	app := &application{
		config: cfg,
		logger: logger,
		db:     db,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go waitForSignals(app)

	mode := "development"
	if !app.config.dev {
		mode = "production"
	}

	logger.Printf("Starting %s server on %s", mode, server.Addr)
	err = server.ListenAndServe()
	logger.Fatal(errors.Wrap(err, "server.ListenAndServe"))
}
