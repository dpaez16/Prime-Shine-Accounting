import { LoginSessionContext } from '@/context/LoginSessionContext';
import { ScheduleID } from '@/types/schedule';
import { FullScheduledCustomer, ScheduledCustomer } from '@/types/scheduledCustomer';
import React, { useContext } from 'react';
import { useEditScheduledCustomerForm } from './useEditScheduledCustomerForm';
import useLocalization from '@/hooks/useLocalization';
import { constructMilitaryTimeStr, fuseDateTime } from '@/utils/helpers';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectWaveCustomer } from '@/components/ui/selectors/select-wave-customer';

type EditScheduledCustomerModalProps = {
    dateOfService: string;
    scheduleID: ScheduleID;
    scheduledCustomer: FullScheduledCustomer;
    onClose: () => void;
    onSubmit: () => void;
};

export const EditScheduledCustomerModal: React.FC<EditScheduledCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { formParams, setFormParam, formValid } = useEditScheduledCustomerForm(props.scheduledCustomer);

    const { t } = useLocalization();

    const handleTimeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof ScheduledCustomer;
        const value = event.target.value;

        if (!value) {
            setFormParam(name, '');
            return;
        }

        const date = fuseDateTime(props.dateOfService, value);
        setFormParam(name, date.toUTCString());
    };

    const handleSubmit = () => {
        const startTime = new Date(formParams.startTime);
        const endTime = new Date(formParams.endTime);

        PrimeShineAPIClient.editScheduledCustomer(
            formParams.scheduledCustomerID,
            formParams.waveCustomerID,
            startTime,
            endTime,
            formParams.dayOffset,
            props.scheduleID,
            userInfo.token,
        )
            .then(() => props.onSubmit())
            .catch((err) => alert('Failed to create scheduled customer' + err.message)); // TODO: use translation hook
    };

    return (
        <Dialog open={true} onOpenChange={isOpen => !isOpen && props.onClose()}>
            <DialogTrigger asChild></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('Edit Scheduled Customer')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Customer')}>
                        <SelectWaveCustomer
                            placeholder={t('Select Customer')}
                            onChange={(newValue) => setFormParam('waveCustomerID', newValue!)}
                            customerID={formParams.waveCustomerID.toString()}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Service Start Time')}>
                        <Input
                            type="time"
                            name="startTime"
                            min="00:00"
                            max="24:00"
                            required
                            defaultValue={constructMilitaryTimeStr(props.scheduledCustomer.startTime)}
                            onChange={handleTimeInputChange}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Service End Time')}>
                        <Input
                            type="time"
                            name="endTime"
                            min="00:00"
                            max="24:00"
                            required
                            defaultValue={constructMilitaryTimeStr(props.scheduledCustomer.endTime)}
                            onChange={handleTimeInputChange}
                        />
                    </GridFormItem>
                </GridForm>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={() => handleSubmit()}
                        disabled={!formValid}
                    >
                        {t('Ok')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};