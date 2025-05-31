import React, { useContext } from 'react';
import { fuseDateTime } from '@/utils/helpers';
import useLocalization from '@/hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { useCreateScheduledCustomerForm } from './useCreateScheduledCustomerForm';
import PrimeShineAPIClient from '@/api/primeShineApiClient';
import { ScheduleID } from '@/types/schedule';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { DropdownPicker } from '@/components/ui/dropdown-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScheduledCustomerCreateInput } from '@/types/scheduledCustomer';
import { SelectWaveCustomer } from '@/components/ui/selectors/select-wave-customer';

type CreateScheduledCustomerModalProps = {
    datesOfService: string[];
    scheduleID: ScheduleID;
    onClose: () => void;
    onSubmit: () => void;
};

export const CreateScheduledCustomerModal: React.FC<CreateScheduledCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { formParams, setFormParam, formValid } = useCreateScheduledCustomerForm();

    const { t } = useLocalization();

    const dateOptions = props.datesOfService.map((date, idx) => {
        return {
            label: date,
            value: idx.toString(),
        };
    });

    const handleTimeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name as keyof ScheduledCustomerCreateInput;
        const value = event.target.value;

        const dateOfService = props.datesOfService[formParams.dayOffset];
        const date = fuseDateTime(dateOfService, value);
        setFormParam(name, date.toUTCString());
    };

    const handleSubmit = () => {
        const startTime = new Date(formParams.startTime);
        const endTime = new Date(formParams.endTime);

        PrimeShineAPIClient.createScheduledCustomer(
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
                    <DialogTitle>{t('Add Customer')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Date of Service')}>
                        <DropdownPicker
                            placeholder={t('Select Date')}
                            options={dateOptions}
                            value={formParams.dayOffset.toString()}
                            onChange={(newValue) => setFormParam('dayOffset', parseInt(newValue!))}
                        />
                    </GridFormItem>
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