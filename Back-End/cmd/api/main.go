package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"prime-shine-api/internal/data"
	"syscall"
	"time"

	"github.com/jackc/pgx"
	"github.com/pkg/errors"
)

type config struct {
	port int
	env  string
}

type application struct {
	config     config
	logger     *log.Logger
	dbClient   *data.MongoClient
	dbClientPG *pgx.Conn
}

func waitForSignals(app *application) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	s := <-quit

	app.logger.Printf("Caught signal %s", s.String())
	app.logger.Printf("Disconnecting from %s database", app.config.env)

	if err := app.dbClient.Disconnect(); err != nil {
		panic(errors.Wrap(err, "db disconnect"))
	}

	if err := app.dbClientPG.Close(); err != nil {
		panic(errors.Wrap(err, "db disconnect"))
	}

	os.Exit(0)
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 5000, "API server port")
	flag.StringVar(&cfg.env, "env", "dev", "Environment (prod|env)")
	flag.Parse()

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)
	dbClient := data.ConnectDB()
	dbClientPG, err := data.ConnectDB_PG()
	if err != nil {
		logger.Fatalf("Could not connect to database: %v", err.Error())
	}

	app := &application{
		config:     cfg,
		logger:     logger,
		dbClient:   dbClient,
		dbClientPG: dbClientPG,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go waitForSignals(app)

	logger.Printf("Connected to %s database!", cfg.env)
	logger.Printf("Starting %s server on %s", cfg.env, server.Addr)
	err = server.ListenAndServe()
	logger.Fatal(errors.Wrap(err, "server.ListenAndServe"))
}
