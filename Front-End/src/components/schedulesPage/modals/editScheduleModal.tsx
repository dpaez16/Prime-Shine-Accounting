import React, { useState } from 'react';
import useLocalization from '@/hooks/useLocalization';
import { Schedule } from '@/types/schedule';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { DatePicker } from '@/components/ui/date-picker';

type EditScheduleModalProps = {
    schedule: Schedule;
    onSubmit: (startDate: Date) => void;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = (props) => {
    const [ startDay, setStartDay ] = useState<Date | undefined>(props.schedule.startDay);
    const { t } = useLocalization();

    return (
        <Dialog onOpenChange={() => setStartDay(props.schedule.startDay)}>
            <DialogTrigger asChild>
                <Button
                    variant='ghost'
                    className='w-full justify-start'
                >
                    {t('Edit')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('Edit Schedule')}
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
                        onClick={() => {
                            props.onSubmit(startDay!);
                        }}
                        disabled={!startDay}
                    >
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};