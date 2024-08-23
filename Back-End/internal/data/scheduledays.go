package data

import (
	"context"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ScheduleDay struct {
	ID        primitive.ObjectID `bson:"_id" json:"_id"`
	DayOffset int                `bson:"dayOffset" json:"dayOffset"`
	Schedule  primitive.ObjectID `bson:"schedule" json:"schedule"`
}

func (db *MongoClient) getScheduleDaysCollection() *mongo.Collection {
	return db.Client.Database(db.DatabaseName).Collection("scheduledays")
}

// Finds one schedule day.
// If runtime errors occur, an error is returned.
// Otherwise, a schedule day and nil error is returned.
func (db *MongoClient) FindOneScheduleDay(filter bson.M) (*ScheduleDay, error) {
	var scheduleDay ScheduleDay
	collection := db.getScheduleDaysCollection()

	err := collection.FindOne(context.TODO(), filter).Decode(&scheduleDay)
	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return nil, nil
		default:
			return nil, errors.Wrap(err, "scheduledays.FindOne")
		}
	}

	return &scheduleDay, nil
}
