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

func GetTimestamptzFromTimeStruct(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{
		Time:  t,
		Valid: true,
	}
}
