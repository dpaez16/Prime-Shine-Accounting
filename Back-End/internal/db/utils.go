package db

import (
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func GetDateFromTimeStruct(t time.Time) pgtype.Date {
	return pgtype.Date{
		Time:  t,
		Valid: true,
	}
}
