export type Schedule = {
    _id: string;
    startDay: Date;
    user: string;
};

export type ScheduleID = Schedule['_id'];