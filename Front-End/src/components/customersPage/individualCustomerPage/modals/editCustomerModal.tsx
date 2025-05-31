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
import { WaveCustomer, WaveCustomerID, WaveCustomerPatchInput } from '@/types/waveCustomer';
import { CreateCustomerFormParams } from '../../customersTable/modals/createCustomerModal';
import { WaveAPIClient } from '@/api/waveApiClient';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GridForm, GridFormItem } from '@/components/ui/grid-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownPicker } from '@/components/ui/dropdown-picker';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import { parseWaveProvinceCode } from '@/utils/helpers';

type EditCustomerModalProps = {
    customer: WaveCustomer;
    onSuccess: () => void;
};

export const EditCustomerModal: React.FC<EditCustomerModalProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const userInfo = context.userInfo!;

    const { t } = useLocalization();
    const [open, setOpen] = useState(false);
    const [formParams, setFormParams] = useState<CreateCustomerFormParams>({
        name: props.customer.name,
        phone: props.customer.phone,
        mobile: props.customer.mobile,
        email: props.customer.email,
        addressLine1: props.customer.address.addressLine1,
        addressLine2: props.customer.address.addressLine2,
        city: props.customer.address.city,
        postalCode: props.customer.address.postalCode,
        provinceCode: props.customer.address.province?.code ?? '',
    });

    const resetFormParams = () => {
        const customer = props.customer;
        const address = customer.address;

        setFormParams({
            name: customer.name,
            phone: customer.phone,
            mobile: customer.mobile,
            email: customer.email,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            postalCode: address.postalCode,
            provinceCode: address.province?.code ?? '',
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

    const editCustomerHandler = (customerID: WaveCustomerID, formParams: CreateCustomerFormParams) => {
        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerPatchInput: WaveCustomerPatchInput = {
            id: customerID,
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
                postalCode: postalCode
            }
        };

        return WaveAPIClient.editCustomer(customerPatchInput, userInfo.token)
            .then(() => {
                setOpen(false);
                props.onSuccess();
            })
            .catch((err) => alert('Failed to edit customer: ' + err.message)); // TODO: use translation hook
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
                <Button variant='outline'>{t('Edit')}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Edit Customer')}</DialogTitle>
                </DialogHeader>
                <GridForm>
                    <GridFormItem label={t('Name')} required>
                        <Input type='text' name='name' onChange={handleChange} defaultValue={formParams.name} />
                    </GridFormItem>
                    <GridFormItem label={t('Phone Number')} required>
                        <Input type='text' name='phone' onChange={handleChange} defaultValue={formParams.phone} />
                    </GridFormItem>
                    <GridFormItem label={t('Mobile')}>
                        <Input type='text' name='mobile' onChange={handleChange} defaultValue={formParams.mobile} />
                    </GridFormItem>
                    <GridFormItem label={t('Email')}>
                        <Input type='text' name='email' onChange={handleChange} defaultValue={formParams.email} />
                    </GridFormItem>
                    <GridFormItem label={t('Address Line 1')} required>
                        <Input type='text' name='addressLine1' onChange={handleChange} defaultValue={formParams.addressLine1} />
                    </GridFormItem>
                    <GridFormItem label={t('Address Line 2')}>
                        <Input type='text' name='addressLine2' onChange={handleChange} defaultValue={formParams.addressLine2} />
                    </GridFormItem>
                    <GridFormItem label={t('City')} required>
                        <Input type='text' name='city' onChange={handleChange} defaultValue={formParams.city} />
                    </GridFormItem>
                    <GridFormItem label={t('State')} required>
                        <DropdownPicker
                            placeholder={t('Select State')}
                            options={US_STATES.map((s, idx) => {
                                return { label: s, value: US_STATE_ABBRV[idx] };
                            })}
                            onChange={(newValue) => handleProvinceCodeInputChange(newValue!)}
                            value={US_STATE_ABBRV.find(e => e === provinceAbbvr)}
                        />
                    </GridFormItem>
                    <GridFormItem label={t('Zip Code')} required>
                        <Input type='text' name='postalCode' onChange={handleChange} defaultValue={formParams.postalCode} />
                    </GridFormItem>
                </GridForm>
                <DialogFooter>
                    <div className='my-auto'>* = Required</div>
                    <Button
                        onClick={() => editCustomerHandler(props.customer.id, formParams)}
                        disabled={!isFormValid()}
                    >
                        {t('Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};