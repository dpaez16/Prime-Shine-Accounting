import React, { useContext } from 'react';
import { CreateScheduleModal } from './modals/createScheduleModal';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import useLocalization from '@/hooks/useLocalization';
import { ScheduleID } from '@/types/schedule';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useDataFetcher } from '@/hooks/useDataFetcher';
import { ErrorMessage } from '@/components/ui/error-message';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useSchedulesTableColumns } from './useSchedulesTableColumns';
import { PageTitle } from '@/components/ui/page-title';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';

export const SchedulesPage: React.FC = () => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { data, loading, error, refetch } = useDataFetcher({ fetcher: () => PrimeShineAPIClient.fetchSchedules(userInfo.userID, userInfo.token) });
    const { t } = useLocalization();

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

    const columns = useSchedulesTableColumns({
        onEdit: editScheduleHandler,
        onDelete: deleteScheduleHandler,
    });

    return (
        <div className='flex flex-col mx-auto w-1/2 gap-4'>
            <PageTitle>{t('Schedules')}</PageTitle>
            <div>
                <CreateScheduleModal onSuccess={refetch} />
            </div>
            <ErrorMessage message={error?.message} />
            <DataTable
                data={sortedSchedules}
                columns={columns}
                loading={loading}
                pagination={DataTablePagination}
            />
        </div>
    );
};