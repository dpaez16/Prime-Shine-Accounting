insert into users (name, email, password) values
(
    'Bob',
    'bob@fakeuser.com',
    '$2a$12$HAWJ4GL84J8kxxcmcyYPPeBn7Q8dvHX63nFA2BdBVESI8anSOFOwS'
);

insert into schedules (userid, start_day)
select users.userid,
       '08/11/2025'
  from users
 where users.name = 'Bob';
