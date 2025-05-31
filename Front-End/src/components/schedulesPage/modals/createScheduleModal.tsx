import React, { useContext, useState } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { DatePicker } from '@/components/ui/date-picker';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import PrimeShineAPIClient from '@/api/primeShineApiClient';

type CreateScheduleModalProps = {
    onSuccess: () => void;
}

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const [ open, setOpen ] = useState(false);
    const [ startDay, setStartDay ] = useState<Date | undefined>(undefined);
    const { t } = useLocalization();

    const createScheduleHandler = (startDay: Date) => {
        const userId = userInfo.userID;
        const jwt = userInfo.token;

        PrimeShineAPIClient.createSchedule(startDay, userId, jwt)
            .then(() => {
                props.onSuccess();
                setOpen(false);
            })
            .catch((err) => alert('Failed to create schedule: ' + err.message)); // TODO: use translation hook
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            setStartDay(undefined);
        }}>
            <DialogTrigger asChild>
                <Button variant='outline' className='hover:cursor-pointer'>
                    {t('Create Schedule')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('Create Schedule')}
                    </DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Start date')}>
                        <DatePicker value={startDay} onChange={setStartDay} onlyMondays />
                    </GridFormItem>
                </GridForm>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={() => createScheduleHandler(startDay!)}
                        disabled={!startDay}
                    >
                        {t('Create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};