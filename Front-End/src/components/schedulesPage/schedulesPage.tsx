import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Message } from 'semantic-ui-react';
import CreateScheduleModal from './createScheduleModal/createScheduleModal';
import EditScheduleModal from './editScheduleModal/editScheduleModal';
import DeleteScheduleModal from './deleteScheduleModal/deleteScheduleModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import useLocalization from '../../hooks/useLocalization';
import LoadingSegment from '../loadingSegment/loadingSegment';
import { dateToStr } from '../../utils/helpers';
import { ScheduleID } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';

export default function SchedulesPage() {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { data, loading, error, refetch } = useDataFetcher({ fetcher: () => PrimeShineAPIClient.fetchSchedules(userInfo._id, userInfo.token) });
    const { t } = useLocalization();
    const navigate = useNavigate();

    const createScheduleHandler = (startDay: Date) => {
        const userId = userInfo._id;
        const jwt = userInfo.token;

        PrimeShineAPIClient.createSchedule(startDay, userId, jwt)
            .then(() => refetch())
            .catch((err) => alert('Failed to create schedule: ' + err.message)); // TODO: use translation hook
    };

    const editScheduleHandler = (startDay: Date, scheduleId: ScheduleID) => {
        const jwt = userInfo.token;

        PrimeShineAPIClient.editSchedule(startDay, scheduleId, jwt)
            .then(() => refetch())
            .catch((err) => alert('Failed to edit schedule: ' + err.message)); // TODO: use translation hook
  };

    const deleteScheduleHandler = (scheduleID: ScheduleID) => {
        const jwt = userInfo.token;

        PrimeShineAPIClient.deleteSchedule(scheduleID, jwt)
            .then(() => refetch())
            .catch((err) => alert('Failed to delete schedule: ' + err.message)); // TODO: use translation hook
    };

    const schedules = data ?? [];
    const sortedSchedules = schedules.sort((a, b) => a.startDay.getTime() - b.startDay.getTime());

    return (
        <div className='flex flex-col mx-auto w-1/2'>
            <h1>{t('Schedules')}:</h1>
            {loading && <LoadingSegment />}
            <div>
                <CreateScheduleModal onSubmit={createScheduleHandler} />
            </div>
            {error && <Message negative content={error.message} />}
            <Table celled>
                <Table.Body>
                {sortedSchedules.map((schedule, idx) => {
                    return (
                        <Table.Row key={idx}>
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
                                        onSubmit={(startDay) => editScheduleHandler(startDay, schedule._id)}
                                    />
                                    <DeleteScheduleModal
                                        startDay={dateToStr(schedule.startDay)}
                                        onSubmit={() => deleteScheduleHandler(schedule._id)}
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
