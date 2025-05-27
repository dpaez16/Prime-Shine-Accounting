import React, { useState } from 'react';
import {
    Modal,
    Button,
    Form,
    Label,
    Input,
    Divider,
    Dropdown,
    InputOnChangeData,
    DropdownProps,
} from 'semantic-ui-react';
import {
    validatePhoneNumber,
    validateEmail,
    validateAddress,
} from '../../../../utils/validators';
import {
    US_COUNTRY_CODE,
    US_STATES,
    US_STATE_ABBRV,
} from '../../../../utils/consts';
import useLocalization from '../../../../hooks/useLocalization';
import { WaveCustomer } from '@/types/waveCustomer';
import { CreateCustomerFormParams } from '../../createCustomerModal/createCustomerModal';

type EditCustomerModalProps = {
    customer: WaveCustomer;
    onSubmit: (params: CreateCustomerFormParams) => void;
};

export const EditCustomerModal: React.FC<EditCustomerModalProps> = (props) => {
    const getOriginalFormParams = () => {
        const customer = props.customer;
        const address = customer.address;

        return {
            name: customer.name,
            phone: customer.phone,
            mobile: customer.mobile,
            email: customer.email,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            postalCode: address.postalCode,
            provinceCode: address.province?.name ?? '',
        } as CreateCustomerFormParams;
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [formParams, setFormParams] = useState(getOriginalFormParams());
    const { t } = useLocalization();

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

    const handleChange = (
        _: React.ChangeEvent<HTMLInputElement>,
        data: InputOnChangeData,
    ) => {
        const { name, value } = data;
        setFormParams({
            ...formParams,
            [name]: value,
        });
    };

    const handleProvinceCodeInputChange = (
        _: React.SyntheticEvent<HTMLElement>,
        data: DropdownProps,
    ) => {
        const { value } = data;
        setFormParams({
            ...formParams,
            provinceCode: `${US_COUNTRY_CODE}-${value}`,
        });
    };

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => {
                setModalOpen(true);
                setFormParams({
                    ...formParams,
                    ...getOriginalFormParams(),
                });
            }}
            open={modalOpen}
            trigger={<Button>{t('Edit')}</Button>}
        >
            <Modal.Header>{t('Edit Customer')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Name')}:</Label>
                        <Input
                            type="text"
                            name="name"
                            defaultValue={props.customer.name}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Phone Number')}:</Label>
                        <Input
                            type="text"
                            name="phone"
                            defaultValue={props.customer.phone}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Mobile')}:</Label>
                        <Input
                            type="text"
                            name="mobile"
                            defaultValue={props.customer.mobile}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Email')}:</Label>
                        <Input
                            type="text"
                            name="email"
                            defaultValue={props.customer.email}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Divider hidden />
                    <h3>{t('Address')}:</h3>
                    <Form.Field>
                        <Label>{t('Address Line 1')}:</Label>
                        <Input
                            type="text"
                            name="addressLine1"
                            defaultValue={props.customer.address.addressLine1}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Address Line 2')}:</Label>
                        <Input
                            type="text"
                            name="addressLine2"
                            defaultValue={props.customer.address.addressLine2}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('City')}:</Label>
                        <Input
                            type="text"
                            name="city"
                            defaultValue={props.customer.address.city}
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('State')}:</Label>
                        <Dropdown
                            placeholder="Select State"
                            fluid
                            search
                            selection
                            defaultValue={
                                props.customer.address.province
                                    ? US_STATE_ABBRV[
                                        US_STATES.findIndex(
                                            (e) => e === props.customer.address.province.name,
                                        )
                                    ]
                                    : ''
                            }
                            options={US_STATES.map((s, idx) => {
                                return { key: s, value: US_STATE_ABBRV[idx], text: s };
                            })}
                            onChange={handleProvinceCodeInputChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Zip Code')}:</Label>
                        <Input
                            type="text"
                            name="postalCode"
                            defaultValue={props.customer.address.postalCode}
                            onChange={handleChange}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="black" onClick={() => setModalOpen(false)}>
                    {t('Cancel')}
                </Button>
                <Button
                    onClick={() => {
                        props.onSubmit(formParams);
                        setModalOpen(false);
                    }}
                    disabled={!isFormValid()}
                    positive
                >
                    {t('Save')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};