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

// Gets schedules for a user.
func (db *MongoClient) QuerySchedules(userID primitive.ObjectID) ([]Schedule, error) {
	collection := db.getScheduleDaysCollection()

	filter := bson.M{"user": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return nil, errors.Wrap(err, "schedules.Find")
	}

	var schedules []Schedule
	err = cursor.All(context.TODO(), &schedules)
	if err != nil {
		return nil, errors.Wrap(err, "cursor.All")
	}

	return schedules, nil
}

// Creates a schedule for a user.
func (db *MongoClient) CreateSchedule(startDay primitive.DateTime, userID primitive.ObjectID) (*Schedule, error) {
	filter := bson.M{"startDay": startDay, "user": userID}
	schedule, err := db.FindOneSchedule(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule != nil {
		return nil, errors.New("Schedule exists already.")
	}

	newSchedule := Schedule{
		StartDay: startDay,
		User:     userID,
	}

	collection := db.getSchedulesCollection()
	result, err := collection.InsertOne(context.TODO(), newSchedule)
	if err != nil {
		return nil, errors.Wrap(err, "schedules.InsertOne")
	}

	newSchedule.ID = result.InsertedID.(primitive.ObjectID)
	return &newSchedule, nil
}

// Edits a schedule.
func (db *MongoClient) EditSchedule(newStartDay primitive.DateTime, scheduleID primitive.ObjectID) (*Schedule, error) {
	filter := bson.M{"_id": scheduleID}
	schedule, err := db.FindOneSchedule(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule == nil {
		return nil, errors.New("Cannot find schedule.")
	}

	filter = bson.M{"startDay": newStartDay, "user": schedule.User}
	foundSchedule, err := db.FindOneSchedule(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if foundSchedule != nil {
		return nil, errors.New("Schedule exists already.")
	}

	schedule.StartDay = newStartDay

	updateFilter := bson.D{{"_id", scheduleID}}
	update := bson.D{
		{"$set", bson.D{
			{"startDay", newStartDay},
		}},
	}

	collection := db.getSchedulesCollection()
	_, err = collection.UpdateOne(context.TODO(), updateFilter, update)

	if err != nil {
		return nil, errors.Wrap(err, "schedules.UpdateOne")
	}

	return schedule, nil
}

// Deletes a schedule for a user.
func (db *MongoClient) DeleteSchedule(startDay primitive.DateTime, userID primitive.ObjectID) (bool, error) {
	filter := bson.M{"startDay": startDay, "user": userID}
	schedule, err := db.FindOneSchedule(filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule == nil {
		return false, errors.New("Cannot find schedule.")
	}

	scheduleDays, err := db.QueryScheduleDays(schedule.ID)
	if err != nil {
		return false, errors.Wrap(err, "QueryScheduleDays")
	}

	for _, scheduleDay := range scheduleDays {
		success, err := db.DeleteScheduleDay(schedule.ID, scheduleDay.DayOffset)
		if err != nil {
			return false, errors.Wrap(err, "DeleteScheduleDay")
		}

		if !success {
			return false, errors.Wrapf(err, "Failed to remove schedule day %s", scheduleDay.ID)
		}
	}

	collection := db.getSchedulesCollection()

	deleteFilter := bson.D{{"_id", schedule.ID}}
	result := collection.FindOneAndDelete(context.TODO(), deleteFilter)
	err = result.Err()

	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return false, nil
		default:
			return false, errors.Wrap(err, "schedules.FindOneAndDelete")
		}
	}

	return true, nil
}
