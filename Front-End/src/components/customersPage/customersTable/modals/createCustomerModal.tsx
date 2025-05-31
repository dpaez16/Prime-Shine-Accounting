import React, { useContext, useState } from 'react';
import {
    validatePhoneNumber,
    validateEmail,
    validateAddress,
} from '@/utils/validators';
import {
    US_COUNTRY_CODE,
    US_STATES,
    US_STATE_ABBRV,
} from '@/utils/consts';
import useLocalization from '@/hooks/useLocalization';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { Input } from '@/components/ui/input';
import { DropdownPicker } from '@/components/ui/dropdown-picker';
import { WaveCustomerCreateInput } from '@/types/waveCustomer';
import { WaveAPIClient } from '@/api/waveApiClient';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { parseWaveProvinceCode } from '@/utils/helpers';

export type CreateCustomerFormParams = {
    name: string;
    phone: string;
    mobile: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postalCode: string;
    provinceCode: string;
};

type CreateCustomerModalProps = {
    onSuccess: () => void;
};

export function CreateCustomerModal(props: CreateCustomerModalProps) {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;
    const userInfo = context.userInfo!;

    const [open, setOpen] = useState(false);
    const { t } = useLocalization();

    const [formParams, setFormParams] = useState<CreateCustomerFormParams>({
        name: '',
        phone: '',
        mobile: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        provinceCode: '',
    });

    const resetFormParams = () => {
        setFormParams({
            name: '',
            phone: '',
            mobile: '',
            email: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            provinceCode: '',
        });
    };

    const isFormValid = () => {
        const {
            name,
            phone,
            mobile,
            email,
            addressLine1,
            city,
            postalCode,
            provinceCode,
        } = formParams;

        return (
            name &&
            validatePhoneNumber(phone) &&
            (mobile === null || mobile === '' || validatePhoneNumber(mobile)) &&
            (email === null || email === '' || validateEmail(email)) &&
            validateAddress(addressLine1, city, provinceCode, postalCode)
        );
    };

    const createCustomerHandler = () => {
        const businessId = businessInfo.businessId;

        const {
            name,
            phone,
            mobile,
            email,
            addressLine1,
            addressLine2,
            city,
            provinceCode,
            postalCode,
        } = formParams;

        const customerCreateInput: WaveCustomerCreateInput = {
            businessId: businessId,
            name: name,
            phone: phone,
            mobile: mobile,
            email: email,
            address: {
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                provinceCode: provinceCode,
                countryCode: US_COUNTRY_CODE,
                postalCode: postalCode,
            },
        };

        return WaveAPIClient.createCustomer(customerCreateInput, userInfo.token)
            .then(() => {
                props.onSuccess();
                setOpen(false);
            })
            .catch((err) => alert('Failed to create customer: ' + err.message)); // TODO: use translation hook
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormParams({
            ...formParams,
            [name]: value,
        });
    };

    const handleProvinceCodeInputChange = (value: string) => {
        setFormParams({
            ...formParams,
            provinceCode: `${US_COUNTRY_CODE}-${value}`,
        });
    };

    const { provinceAbbvr } = parseWaveProvinceCode(formParams.provinceCode);

    return (
        <Dialog open={open} onOpenChange={isOpen => {
            setOpen(isOpen);
            resetFormParams();
        }}>
            <DialogTrigger asChild>
                <Button variant='outline'>{t('Create Customer')}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Create Customer')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Name')} required>
                        <Input type='text' name='name' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('Phone Number')} required>
                        <Input type='text' name='phone' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('Mobile')}>
                        <Input type='text' name='mobile' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('Email')}>
                        <Input type='text' name='email' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('Address Line 1')} required>
                        <Input type='text' name='addressLine1' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('Address Line 2')}>
                        <Input type='text' name='addressLine2' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('City')} required>
                        <Input type='text' name='city' onChange={handleChange} />
                    </GridFormItem>
                    <GridFormItem label={t('State')} required>
                        <DropdownPicker
                            placeholder={t('Select State')}
                            options={US_STATES.map((s, idx) => {
                                return { label: s, value: US_STATE_ABBRV[idx] };
                            })}
                            onChange={(newValue) => handleProvinceCodeInputChange(newValue!)}
                            value={provinceAbbvr}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Zip Code')} required>
                        <Input type='text' name='postalCode' onChange={handleChange} />
                    </GridFormItem>
                </GridForm>
                <DialogFooter>
                    <div className='my-auto'>* = Required</div>
                    <Button
                        onClick={() => createCustomerHandler()}
                        disabled={!isFormValid()}
                    >
                        {t('Create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
