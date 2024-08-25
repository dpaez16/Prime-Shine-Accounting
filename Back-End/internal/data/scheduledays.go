package data

import (
	"context"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ScheduleDay struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
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

// Gets the schedule days for a schedule.
func (db *MongoClient) QueryScheduleDays(scheduleID primitive.ObjectID) ([]ScheduleDay, error) {
	collection := db.getScheduleDaysCollection()

	filter := bson.M{"schedule": scheduleID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return nil, errors.Wrap(err, "scheduledays.Find")
	}

	var scheduleDays []ScheduleDay
	err = cursor.All(context.TODO(), &scheduleDays)
	if err != nil {
		return nil, errors.Wrap(err, "cursor.All")
	}

	return scheduleDays, nil
}

// Creates a schedule day for a schedule.
func (db *MongoClient) CreateScheduleDay(scheduleID primitive.ObjectID, dayOffset int) (*ScheduleDay, error) {
	filter := bson.M{"_id": scheduleID}
	schedule, err := db.FindOneSchedule(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule == nil {
		return nil, errors.New("Schedule does not exist.")
	}

	scheduleDays, err := db.QueryScheduleDays(scheduleID)
	if err != nil {
		return nil, errors.Wrap(err, "QueryScheduleDays")
	}

	for _, scheduleDay := range scheduleDays {
		if scheduleDay.DayOffset == dayOffset {
			return nil, errors.New("Day already exists.")
		}
	}

	newScheduleDay := ScheduleDay{
		DayOffset: dayOffset,
		Schedule:  scheduleID,
	}

	collection := db.getScheduleDaysCollection()
	result, err := collection.InsertOne(context.TODO(), newScheduleDay)
	if err != nil {
		return nil, errors.Wrap(err, "scheduledays.InsertOne")
	}

	newScheduleDay.ID = result.InsertedID.(primitive.ObjectID)
	return &newScheduleDay, nil
}

// Deletes a schedule day.
func (db *MongoClient) DeleteScheduleDay(scheduleID primitive.ObjectID, dayOffset int) (bool, error) {
	filter := bson.M{"schedule": scheduleID, "dayOffset": dayOffset}
	scheduleDay, err := db.FindOneScheduleDay(filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneScheduleDay")
	}

	if scheduleDay == nil {
		return false, errors.New("Schedule Day does not exist.")
	}

	scheduledCustomers, err := db.QueryScheduledCustomers(scheduleDay.ID)
	if err != nil {
		return false, errors.Wrap(err, "QueryScheduledCustomers")
	}

	for _, scheduledCustomer := range scheduledCustomers {
		success, err := db.DeleteScheduledCustomer(scheduledCustomer.ID)
		if err != nil {
			return false, errors.Wrap(err, "DeleteScheduledCustomer")
		}

		if !success {
			return false, errors.Wrapf(err, "Failed to remove scheduled customer %s", scheduledCustomer.ID)
		}
	}

	collection := db.getScheduleDaysCollection()

	deleteFilter := bson.D{{"schedule", scheduleID}, {"dayOffset", dayOffset}}
	result := collection.FindOneAndDelete(context.TODO(), deleteFilter)
	err = result.Err()

	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return false, nil
		default:
			return false, errors.Wrap(err, "scheduledays.FindOneAndDelete")
		}
	}

	return true, nil
}
