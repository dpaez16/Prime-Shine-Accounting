import React from 'react';
import useLocalization from '@/hooks/useLocalization';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { dateToStr } from '@/utils/helpers';
import { addDays } from 'date-fns';

type DeleteScheduleModalProps = {
    startDay: Date;
    onSubmit: () => void;
};

export const DeleteScheduleModal: React.FC<DeleteScheduleModalProps> = (props) => {
    const date = props.startDay;
    const { t } = useLocalization();

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant='ghost'
                    className='w-full justify-start'
                >
                    {t('Delete')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Delete Schedule?')}</AlertDialogTitle>
                    <div>
                        <p>
                            {`${dateToStr(date, 'mm/dd/yyyy')} - ${dateToStr(addDays(date, 6), 'mm/dd/yyyy')}`}
                        </p>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => props.onSubmit()}>{t('Ok')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};