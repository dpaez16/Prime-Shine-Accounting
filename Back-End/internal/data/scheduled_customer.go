package data

import (
	"database/sql"
	"fmt"
	"prime-shine-api/internal/db"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/pkg/errors"
)

type ScheduledCustomer struct {
	ID         int                `db:"scheduledcustomerid" json:"scheduledCustomerID"`
	CustomerID string             `db:"wave_customerid" json:"waveCustomerID"`
	StartTime  pgtype.Timestamptz `db:"start_time" json:"startTime"`
	EndTime    pgtype.Timestamptz `db:"end_time" json:"endTime"`
	DayOffset  int                `db:"day_offset" json:"dayOffset"`
	ScheduleID int                `db:"scheduleid" json:"-"`
}

// Finds one scheduled customer.
// If runtime errors occur, an error is returned.
// Otherwise, a scheduled customer and nil error is returned.
func FindOneScheduledCustomer(readConn db.ReadDBExecutor, filter map[string]any) (*ScheduledCustomer, error) {
	scheduledCustomer := &ScheduledCustomer{}

	var args []any
	var whereClauses []string

	for k, v := range filter {
		argNum := len(args) + 1
		whereClause := fmt.Sprintf("%v = $%v", k, argNum)

		whereClauses = append(whereClauses, whereClause)
		args = append(args, v)
	}

	query := fmt.Sprintf(`
		SELECT   wave_customerid
		       , start_time
			   , end_time
			   , day_offset
		  FROM scheduled_customers
		 WHERE %v
	`, strings.Join(whereClauses, " AND "))

	err := readConn.Get(scheduledCustomer, query, args...)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, errors.Wrap(err, "Get")
	}

	return scheduledCustomer, nil
}

// Grabs scheduled customers that are included in a schedule.
func QueryScheduledCustomers(readConn db.ReadDBExecutor, scheduleID int) ([]*ScheduledCustomer, error) {
	entries := []*ScheduledCustomer{}
	query := `
		SELECT *
		  FROM scheduled_customers
		 WHERE scheduleid = $1
	`
	err := readConn.Select(&entries, query, scheduleID)
	if err != nil {
		return nil, errors.Wrap(err, "Select")
	}

	return entries, nil
}

// Creates a scheduled customer.
func CreateScheduledCustomer(
	tx db.WriteDBExecutor,
	newCustomerID string,
	newServiceStartTime pgtype.Timestamptz,
	newServiceEndTime pgtype.Timestamptz,
	dayOffset int,
	scheduleID int,
) (*ScheduledCustomer, error) {
	filter := map[string]any{
		"wave_customerid": newCustomerID,
		"start_time":      newServiceStartTime,
		"end_time":        newServiceEndTime,
		"day_offset":      dayOffset,
		"scheduleid":      scheduleID,
	}

	foundScheduledCustomer, err := FindOneScheduledCustomer(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if foundScheduledCustomer != nil {
		return nil, errors.New("Scheduled Customer already exists.")
	}

	result, err := tx.Exec(`
		INSERT INTO scheduled_customers
		(wave_customerid, start_time, end_time, day_offset, scheduleid)
		VALUES ($1, $2, $3, $4, $5)
	`, newCustomerID, newServiceStartTime, newServiceEndTime, dayOffset, scheduleID)

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected != 1 {
		return nil, errors.New("failed to insert scheduled_customers entry")
	}

	// Grab the newly created scheduled customer
	newScheduledCustomer, err := FindOneScheduledCustomer(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	return newScheduledCustomer, nil
}

// Edits a scheduled customer.
func EditScheduledCustomer(
	tx db.WriteDBExecutor,
	scheduledCustomerID int,
	scheduleID int,
	dayOffset int,
	newCustomerID string,
	newServiceStartTime pgtype.Timestamptz,
	newServiceEndTime pgtype.Timestamptz,
) (*ScheduledCustomer, error) {
	filter := map[string]any{
		"scheduledcustomerid": scheduledCustomerID,
		"scheduleid":          scheduleID,
		"day_offset":          dayOffset,
	}

	scheduledCustomer, err := FindOneScheduledCustomer(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if scheduledCustomer == nil {
		return nil, errors.New("Scheduled customer does not exist.")
	}

	filter = map[string]any{
		"customerId":       newCustomerID,
		"serviceStartTime": newServiceStartTime,
		"serviceEndTime":   newServiceEndTime,
		"dayOffset":        dayOffset,
		"scheduleid":       scheduleID,
	}

	foundScheduledCustomer, err := FindOneScheduledCustomer(tx, filter)
	if err != nil {
		return nil, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if foundScheduledCustomer != nil {
		return nil, errors.New("Scheduled customer exists.")
	}

	scheduledCustomer.CustomerID = newCustomerID
	scheduledCustomer.StartTime = newServiceStartTime
	scheduledCustomer.EndTime = newServiceEndTime

	result, err := tx.Exec(`
		UPDATE scheduled_customers
		SET   wave_customerid 	= $1
		    , start_time   		= $2
			, end_time 			= $3
		WHERE scheduledcustomerid = $4
	`, scheduledCustomer.CustomerID, scheduledCustomer.StartTime, scheduledCustomer.EndTime, scheduledCustomerID)

	if err != nil {
		return nil, errors.Wrap(err, "tx.Exec")
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return nil, errors.Wrap(err, "RowsAffected")
	}

	if rowsAffected == 0 {
		return nil, errors.New("scheduled customer was not mutated")
	}

	return scheduledCustomer, nil
}

// Deletes a scheduled customer.
func DeleteScheduledCustomer(tx db.WriteDBExecutor, scheduledCustomerID int) (bool, error) {
	filter := map[string]any{"scheduledcustomerid": scheduledCustomerID}
	user, err := FindOneScheduledCustomer(tx, filter)
	if err != nil {
		return false, errors.Wrap(err, "FindOneScheduledCustomer")
	}

	if user == nil {
		return false, errors.New("Scheduled customer not found.")
	}

	_, err = tx.Exec(`
		DELETE FROM users
		WHERE scheduledcustomerid = $1
	`, scheduledCustomerID)

	if err != nil {
		return false, errors.Wrap(err, "tx.Exec")
	}

	return true, nil
}
