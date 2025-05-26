create table users (
      userid    int4            generated always as identity
    , name      varchar(256)    not null
    , email     varchar(256)    not null
    , password  varchar(100)    not null

    , constraint userid_pk      primary key (userid)
    , constraint unique_email   unique (email)
);

create table schedules (
      scheduleid    int4    generated always as identity
    , userid        int4    not null
    , start_day     date    not null

    , constraint scheduleid_pk primary key (scheduleid)
    , foreign key (userid) references users (userid) on delete cascade
);

create table scheduled_customers (
      wave_customerid   varchar(84)               not null -- size of IDs that Wave generates
    , start_time        timestamp with time zone  not null
    , end_time          timestamp with time zone  not null
    , day_offset        int2                      not null
    , scheduleid        int4                      not null

    , foreign key (scheduleid) references schedules (scheduleid) on delete cascade
);
