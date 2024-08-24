package data

import (
	"context"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ScheduledCustomer struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	CustomerID       string             `bson:"customerId" json:"customerId"`
	ServiceStartTime primitive.DateTime `bson:"serviceStartTime" json:"serviceStartTime"`
	ServiceEndTime   primitive.DateTime `bson:"serviceEndTime" json:"serviceEndTime"`
	ScheduleDay      primitive.ObjectID `bson:"scheduleDay" json:"scheduleDay"`
}

func (db *MongoClient) getScheduledCustomersCollection() *mongo.Collection {
	return db.Client.Database(db.DatabaseName).Collection("scheduledcustomers")
}

// Finds one scheduled customer.
// If runtime errors occur, an error is returned.
// Otherwise, a scheduled customer and nil error is returned.
func (db *MongoClient) FindOneScheduledCustomer(filter bson.M) (*ScheduledCustomer, error) {
	var scheduledCustomer ScheduledCustomer
	collection := db.getScheduledCustomersCollection()

	err := collection.FindOne(context.TODO(), filter).Decode(&scheduledCustomer)
	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return nil, nil
		default:
			return nil, errors.Wrap(err, "scheduledcustomers.FindOne")
		}
	}

	return &scheduledCustomer, nil
}

// Searches for scheduled customers within a scheduled day.
func (db *MongoClient) QueryScheduledCustomers(scheduleDayID primitive.ObjectID) ([]ScheduledCustomer, error) {
	collection := db.getScheduledCustomersCollection()

	filter := bson.M{"scheduleDay": scheduleDayID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		return nil, errors.Wrap(err, "scheduledcustomers.Find")
	}

	var scheduledCustomers []ScheduledCustomer
	err = cursor.All(context.TODO(), &scheduledCustomers)
	if err != nil {
		return nil, errors.Wrap(err, "cursor.All")
	}

	return scheduledCustomers, nil
}

// Creates a scheduled customer.
func (db *MongoClient) CreateScheduledCustomer(
	newCustomerID string,
	newServiceStartTime primitive.DateTime,
	newServiceEndTime primitive.DateTime,
	scheduleDayID primitive.ObjectID,
) (*ScheduledCustomer, error) {
	filter := bson.M{"_id": scheduleDayID}
	scheduleDay, err := db.FindOneScheduleDay(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduleDay")
	}

	if scheduleDay == nil {
		return nil, errors.New("Schedule Day does not exist.")
	}

	filter = bson.M{
		"customerID":       newCustomerID,
		"serviceStartTime": newServiceStartTime,
		"serviceEndTime":   newServiceEndTime,
		"scheduleDay":      scheduleDayID,
	}

	foundScheduledCustomer, err := db.FindOneScheduledCustomer(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if foundScheduledCustomer != nil {
		return nil, errors.New("Scheduled Customer already exists.")
	}

	newScheduledCustomer := ScheduledCustomer{
		CustomerID:       newCustomerID,
		ServiceStartTime: newServiceStartTime,
		ServiceEndTime:   newServiceEndTime,
		ScheduleDay:      scheduleDayID,
	}

	collection := db.getScheduledCustomersCollection()
	result, err := collection.InsertOne(context.TODO(), newScheduledCustomer)
	if err != nil {
		return nil, errors.Wrap(err, "scheduledcustomers.InsertOne")
	}

	newScheduledCustomer.ID = result.InsertedID.(primitive.ObjectID)
	return &newScheduledCustomer, nil
}

// Edits a scheduled customer.
func (db *MongoClient) EditScheduledCustomer(
	scheduledCustomerID primitive.ObjectID,
	scheduleDay primitive.ObjectID,
	newCustomerID string,
	newServiceStartTime primitive.DateTime,
	newServiceEndTime primitive.DateTime,
) (*ScheduledCustomer, error) {
	collection := db.getScheduledCustomersCollection()
	filter := bson.M{"_id": scheduledCustomerID}

	scheduledCustomer, err := db.FindOneScheduledCustomer(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if scheduledCustomer == nil {
		return nil, errors.New("Scheduled customer does not exist.")
	}

	scheduledCustomer.CustomerID = newCustomerID
	scheduledCustomer.ServiceStartTime = newServiceStartTime
	scheduledCustomer.ServiceEndTime = newServiceEndTime

	filter = bson.M{
		"_id":              scheduledCustomer.ID,
		"customerId":       scheduledCustomer.CustomerID,
		"serviceStartTime": scheduledCustomer.ServiceStartTime,
		"serviceEndTime":   scheduledCustomer.ServiceEndTime,
		"scheduleDay":      scheduledCustomer.ScheduleDay,
	}

	foundScheduledCustomer, err := db.FindOneScheduledCustomer(filter)
	if err != nil {
		return nil, errors.Wrap(err, "scheduledcustomers.FindOne")
	}

	if foundScheduledCustomer != nil {
		return nil, errors.New("Scheduled customer exists.")
	}

	updateFilter := bson.D{{"_id", scheduledCustomer.ID}}
	update := bson.D{
		{"$set", bson.D{
			{"customerId", scheduledCustomer.CustomerID},
			{"serviceStartTime", scheduledCustomer.ServiceStartTime},
			{"serviceEndTime", scheduledCustomer.ServiceEndTime},
		}},
	}
	_, err = collection.UpdateOne(context.TODO(), updateFilter, update)

	if err != nil {
		return nil, errors.Wrap(err, "scheduledcustomers.UpdateOne")
	}

	return scheduledCustomer, nil
}

// Deletes a scheduled customer.
func (db *MongoClient) DeleteScheduledCustomer(scheduledCustomerID primitive.ObjectID) (bool, error) {
	collection := db.getScheduledCustomersCollection()

	filter := bson.D{{"_id", scheduledCustomerID}}
	result := collection.FindOneAndDelete(context.TODO(), filter)
	err := result.Err()

	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return false, nil
		default:
			return false, errors.Wrap(err, "scheduledcustomers.FindOneAndDelete")
		}
	}

	return true, nil
}
