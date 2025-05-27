package data

import (
	"database/sql"
	"fmt"
	"prime-shine-api/internal/db"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
)

type Schedule struct {
	ID       int         `db:"scheduleid" json:"_id"`
	UserID   int         `db:"userid" json:"-"`
	StartDay pgtype.Date `db:"start_day" json:"startDay"`
}

// Finds one schedule.
// If runtime errors occur, an error is returned.
// Otherwise, a schedule and nil error is returned.
func FindOneSchedule(readConn db.ReadDBExecutor, filter map[string]any) (*Schedule, error) {
	schedule := &Schedule{}

	var args []any
	var whereClauses []string

	for k, v := range filter {
		argNum := len(args) + 1
		whereClause := fmt.Sprintf("%v = $%v", k, argNum)

		whereClauses = append(whereClauses, whereClause)
		args = append(args, v)
	}

	query := fmt.Sprintf(`
		SELECT   scheduleid
			   , start_day
		  FROM schedules
		 WHERE %v
	`, strings.Join(whereClauses, " AND "))

	err := readConn.Get(schedule, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "Get")
	}

	return schedule, nil
}

// Gets schedules for a user.
func QuerySchedules(readConn db.ReadDBExecutor, userID int) ([]*Schedule, error) {
	entries := []*Schedule{}
	query := `
		SELECT *
		  FROM schedules
		 WHERE userid = $1
	`

	err := readConn.Select(&entries, query, userID)
	if err != nil {
		return nil, errors.Wrap(err, "Select")
	}

	return entries, nil
}

// Creates a schedule for a user.
func CreateSchedule(tx db.WriteDBExecutor, startDay pgtype.Date, userID int) (*Schedule, error) {
	filter := map[string]any{"start_day": startDay, "userid": userID}
	schedule, err := FindOneSchedule(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule != nil {
		return nil, errors.New("Schedule exists already.")
	}

	result, err := tx.Exec(`
		INSERT INTO schedules
		(userid, start_day)
		VALUES ($1, $2)
	`, userID, startDay)

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected != 1 {
		return nil, errors.New("failed to insert users entry")
	}

	// Grab the newly created schedule
	newSchedule, err := FindOneSchedule(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	return newSchedule, nil
}

// Edits a schedule.
func EditSchedule(tx db.WriteDBExecutor, newStartDay pgtype.Date, scheduleID int) (*Schedule, error) {
	filter := map[string]any{"scheduleid": scheduleID}
	schedule, err := FindOneSchedule(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule == nil {
		return nil, errors.New("Cannot find schedule.")
	}

	filter = map[string]any{"start_day": newStartDay, "userid": schedule.UserID}
	foundSchedule, err := FindOneSchedule(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneSchedule")
	}

	if foundSchedule != nil {
		return nil, errors.New("Schedule exists already.")
	}

	schedule.StartDay = newStartDay

	result, err := tx.Exec(`
		UPDATE schedules
		SET    start_day = $1
		WHERE scheduleid = $2
	`, schedule.StartDay, schedule.ID)

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected == 0 {
		return nil, errors.New("schedule was not mutated")
	}

	return schedule, nil
}

// Deletes a schedule for a user.
func DeleteSchedule(tx db.WriteDBExecutor, scheduleID int) (bool, error) {
	filter := map[string]any{"scheduleid": scheduleID}
	schedule, err := FindOneSchedule(tx, filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneSchedule")
	}

	if schedule == nil {
		return false, errors.New("Cannot find schedule.")
	}

	_, err = tx.Exec(`
		DELETE FROM schedules
		WHERE scheduleid = $1
	`, scheduleID)

	if err != nil {
		return false, errors.Wrap(err, "tx.Exec")
	}

	return true, nil
}
