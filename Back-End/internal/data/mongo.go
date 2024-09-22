package data

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoClient struct {
	Client       *mongo.Client
	DatabaseName string
}

func getMongoURI() string {
	dbUserName := os.Getenv("MONGO_USER")
	dbPassword := os.Getenv("MONGO_PASSWORD")
	dbClusterDomain := os.Getenv("MONGO_CLUSTER_DOMAIN")
	dbName := os.Getenv("MONGO_DB")

	return fmt.Sprintf("mongodb+srv://%s:%s@%s/%s?retryWrites=true&w=majority", dbUserName, dbPassword, dbClusterDomain, dbName)
}

// Connects to the Mongo Database.
func ConnectDB() *MongoClient {
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	uri := getMongoURI()
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(context.TODO(), opts)
	if err != nil {
		panic(err)
	}

	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Err(); err != nil {
		panic(err)
	}

	return &MongoClient{
		Client:       client,
		DatabaseName: os.Getenv("MONGO_DB"),
	}
}

// Disconnects from the Mongo Database.
func (db *MongoClient) Disconnect() error {
	return db.Client.Disconnect(context.TODO())
}
