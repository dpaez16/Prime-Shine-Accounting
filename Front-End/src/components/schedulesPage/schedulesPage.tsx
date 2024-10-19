import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Container, Header, Message } from 'semantic-ui-react';
import CreateScheduleModal from './createScheduleModal/createScheduleModal';
import EditScheduleModal from './editScheduleModal/editScheduleModal';
import DeleteScheduleModal from './deleteScheduleModal/deleteScheduleModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import LoadingSegment from '../loadingSegment/loadingSegment';
import { dateToStr } from '../../utils/helpers';
import { v4 as uuidV4 } from 'uuid';
import './schedulesPage.css';
import { UserInfo } from '@/types/userInfo';
import { Schedule } from '@/types/schedule';

type SchedulesPageProps = {
  userInfo: UserInfo;
};

export default function SchedulesPage(props: SchedulesPageProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLocalization();
  const navigate = useNavigate();

  const createScheduleHandler = (startDay: Date) => {
    const userId = props.userInfo._id;
    const jwt = props.userInfo.token;

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
    const jwt = props.userInfo.token;

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
    const userId = props.userInfo._id;
    const jwt = props.userInfo.token;

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
    PrimeShineAPIClient.fetchSchedules(props.userInfo._id, props.userInfo.token)
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

  const sortedSchedules = schedules.sort((a, b) =>
    Number(a.startDay) > Number(b.startDay) ? 1 : -1,
  );

  return (
    <Container fluid className='SchedulesPage'>
      <Header as='h1'>{t('Schedules')}:</Header>
      {loading && <LoadingSegment className='SchedulesPage_loading' />}
      <CreateScheduleModal
        onSubmit={(startDate) => {
          createScheduleHandler(startDate);
        }}
      />
      {error && <Message negative content={error} />}
      <Table celled className='SchedulesPage_table'>
        <Table.Body>
          {sortedSchedules.map((schedule) => {
            return (
              <Table.Row key={uuidV4()}>
                <Table.Cell className='SchedulesPage_table_row_cell'>
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
                  <div>
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
    </Container>
  );
}
