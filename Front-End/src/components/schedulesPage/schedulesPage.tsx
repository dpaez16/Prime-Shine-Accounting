import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Message } from 'semantic-ui-react';
import CreateScheduleModal from './createScheduleModal/createScheduleModal';
import EditScheduleModal from './editScheduleModal/editScheduleModal';
import DeleteScheduleModal from './deleteScheduleModal/deleteScheduleModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import LoadingSegment from '../loadingSegment/loadingSegment';
import { dateToStr } from '../../utils/helpers';
import { v4 as uuidV4 } from 'uuid';
import { Schedule } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';

export default function SchedulesPage() {
  const context = useContext(LoginSessionContext);
  const userInfo = context.userInfo!;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLocalization();
  const navigate = useNavigate();

  const createScheduleHandler = (startDay: Date) => {
    const userId = userInfo._id;
    const jwt = userInfo.token;

    PrimeShineAPIClient.createSchedule(startDay, userId, jwt)
      .then((schedule) => {
        setSchedules([...schedules, schedule]);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const editScheduleHandler = (startDay: Date, scheduleId: string) => {
    const jwt = userInfo.token;

    PrimeShineAPIClient.editSchedule(startDay, scheduleId, jwt)
      .then((patchedSchedule) => {
        const newSchedules = [...schedules];
        const idx = newSchedules.findIndex(
          (schedule) => schedule._id === scheduleId,
        );
        newSchedules.splice(idx, 1, patchedSchedule);

        setSchedules(newSchedules);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const deleteScheduleHandler = (startDay: Date) => {
    const userId = userInfo._id;
    const jwt = userInfo.token;

    PrimeShineAPIClient.deleteSchedule(startDay, userId, jwt)
      .then((didSucceed) => {
        console.log(didSucceed);

        const newSchedules = [...schedules];
        const idx = newSchedules.findIndex(
          (schedule) => schedule.startDay === startDay,
        );
        newSchedules.splice(idx, 1);

        setSchedules(newSchedules);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    PrimeShineAPIClient.fetchSchedules(userInfo._id, userInfo.token)
      .then((fetchedSchedules) => {
        setSchedules(fetchedSchedules);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setLoading(false);
        setError(err.message);
      });
  }, []);

  const sortedSchedules = schedules.sort((a, b) => a.startDay.getTime() - b.startDay.getTime());

  return (
    <div className='flex flex-col mx-auto w-1/2'>
      <h1>{t('Schedules')}:</h1>
      {loading && <LoadingSegment />}
      <div>
        <CreateScheduleModal
          onSubmit={(startDate) => {
            createScheduleHandler(startDate);
          }}
        />
      </div>
      {error && <Message negative content={error} />}
      <Table celled>
        <Table.Body>
          {sortedSchedules.map((schedule) => {
            return (
              <Table.Row key={uuidV4()}>
                <Table.Cell className='flex flex-row justify-between items-center'>
                  <a
                    href='/viewSchedule'
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/viewSchedule', {
                        state: {
                          schedule: schedule,
                        },
                      });
                    }}
                  >
                    {dateToStr(schedule.startDay)}
                  </a>
                  <div className='flex flex-row gap-2'>
                    <EditScheduleModal
                      schedule={schedule}
                      onSubmit={(startDay) => {
                        const scheduleId = schedule._id;
                        editScheduleHandler(startDay, scheduleId);
                      }}
                    />
                    <DeleteScheduleModal
                      startDay={dateToStr(schedule.startDay)}
                      onSubmit={() => {
                        const startDay = schedule.startDay;
                        deleteScheduleHandler(startDay);
                      }}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
