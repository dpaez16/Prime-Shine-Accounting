package data

import (
	"context"
	"prime-shine-api/internal"

	"github.com/pkg/errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name     string             `bson:"name" json:"name"`
	Email    string             `bson:"email" json:"email"`
	Password []byte             `bson:"password" json:"-"`
}

func (db *MongoClient) getUsersCollection() *mongo.Collection {
	return db.Client.Database(db.DatabaseName).Collection("users")
}

// Finds one user.
// If a runtime error occurs, a nil user and error is returned.
// Otherwise, a user and nil error is returned.
func (db *MongoClient) FindOneUser(filter bson.M) (*User, error) {
	collection := db.getUsersCollection()
	var user User

	err := collection.FindOne(context.TODO(), filter).Decode(&user)
	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return nil, nil
		default:
			return nil, errors.Wrap(err, "users.FindOne")
		}
	}

	return &user, nil
}

// Searches for a user in the context of logging in.
// If a runtime error occurs, a nil user and error is returned.
// Otherwise, a user and nil error is returned.
func (db *MongoClient) QueryUserAndPassword(email string, password string) (*User, error) {
	filter := bson.M{"email": email}
	user, err := db.FindOneUser(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return nil, nil
	}

	passwordValid, err := internal.ComparePasswords([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.Wrap(err, "ComparePasswords")
	}

	if passwordValid {
		return user, nil
	} else {
		return nil, nil
	}
}

// Creates a new user.
func (db *MongoClient) CreateUser(name string, email string, password string) (*User, error) {
	filter := bson.M{"email": email}
	foundUser, err := db.FindOneUser(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if foundUser != nil {
		return nil, errors.New("User already exists.")
	}

	hashedPassword, err := internal.HashPassword(password)
	if err != nil {
		return nil, errors.Wrap(err, "HashPassword")
	}

	newUser := User{
		Name:     name,
		Email:    email,
		Password: hashedPassword,
	}

	collection := db.getUsersCollection()
	result, err := collection.InsertOne(context.TODO(), newUser)
	if err != nil {
		return nil, errors.Wrap(err, "users.InsertOne")
	}

	newUser.ID = result.InsertedID.(primitive.ObjectID)
	return &newUser, nil
}

// Edits a user.
func (db *MongoClient) EditUser(userID primitive.ObjectID, newEmail string, newName string, newPassword string) (*User, error) {
	hashedPassword, err := internal.HashPassword(newPassword)
	if err != nil {
		return nil, errors.Wrap(err, "HashPassword")
	}

	filter := bson.M{"_id": userID}
	user, err := db.FindOneUser(filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return nil, errors.New("Unable to find user.")
	}

	if user.Email != newEmail {
		filter = bson.M{"email": newEmail}
		foundUser, err := db.FindOneUser(filter)
		if err != nil {
			return nil, errors.Wrap(err, "FindOneUser")
		}

		if foundUser != nil {
			return nil, errors.New("User with that email exists.")
		}
	}

	user.ID = userID
	user.Name = newName
	user.Email = newEmail
	user.Password = hashedPassword

	updateFilter := bson.D{{"_id", userID}}
	update := bson.D{
		{"$set", bson.D{
			{"name", user.Name},
			{"email", user.Email},
			{"password", user.Password},
		}},
	}
	collection := db.getUsersCollection()
	_, err = collection.UpdateOne(context.TODO(), updateFilter, update)

	if err != nil {
		return nil, errors.Wrap(err, "users.UpdateOne")
	}

	return user, nil
}

// Deletes a user.
func (db *MongoClient) DeleteUser(userID primitive.ObjectID) (bool, error) {
	filter := bson.M{"_id": userID}
	user, err := db.FindOneUser(filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneUser")
	}

	if user == nil {
		return false, errors.New("User not found.")
	}

	schedules, err := db.QuerySchedules(userID)
	if err != nil {
		return false, errors.Wrap(err, "QuerySchedules")
	}

	for _, schedule := range schedules {
		success, err := db.DeleteSchedule(schedule.StartDay, userID)
		if err != nil {
			return false, errors.Wrap(err, "DeleteSchedule")
		}

		if !success {
			return false, errors.Wrapf(err, "Failed to delete schedule %s", schedule.ID)
		}
	}

	collection := db.getUsersCollection()

	deleteFilter := bson.D{{"_id", userID}}
	result := collection.FindOneAndDelete(context.TODO(), deleteFilter)
	err = result.Err()

	if err != nil {
		switch {
		case errors.Is(err, mongo.ErrNoDocuments):
			return false, nil
		default:
			return false, errors.Wrap(err, "users.FindOneAndDelete")
		}
	}

	return true, nil
}
