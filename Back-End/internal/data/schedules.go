package data

import (
	"context"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Schedule struct {
	ID       primitive.ObjectID `bson:"_id" json:"_id"`
	StartDay primitive.DateTime `bson:"startDay" json:"startDay"`
	User     primitive.ObjectID `bson:"user" json:"user"`
}

func (db *MongoClient) getSchedulesCollection() *mongo.Collection {
	return db.Client.Database(db.DatabaseName).Collection("schedules")
}

// Finds one schedule.
// If runtime errors occur, an error is returned.
// Otherwise, a schedule and nil error is returned.
func (db *MongoClient) FindOneSchedule(filter bson.M) (*Schedule, error) {
	var schedule Schedule
	collection := db.getSchedulesCollection()

	err := collection.FindOne(context.TODO(), filter).Decode(&schedule)
	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return nil, nil
		default:
			return nil, errors.Wrap(err, "schedules.FindOne")
		}
	}

	return &schedule, nil
}
