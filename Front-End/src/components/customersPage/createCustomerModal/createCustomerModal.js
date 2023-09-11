import {useState} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Header, Dropdown} from 'semantic-ui-react';
import {validatePhoneNumber, validateEmail, validateAddress} from '../../../utils/validators';
import {US_COUNTRY_CODE, US_STATES, US_STATE_ABBRV} from '../../../utils/consts';
import useLocalization from '../../../hooks/useLocalization';

export default function CreateCustomerModal(props) {
    const [t] = useLocalization();

    const [modalOpen, setModalOpen] = useState(false);
    const [formParams, setFormParams] = useState({
        name: '',
        phone: '',
        mobile: '',
        email: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        provinceCode: ''
    });

    const isFormValid = () => {
        const {
            name, phone, mobile, email,
            addressLine1,
            city,
            postalCode,
            provinceCode
        } = formParams;

        return (
            name &&
            validatePhoneNumber(phone) &&
            (mobile === null || mobile === "" || validatePhoneNumber(mobile)) &&
            (email === null || email === "" || validateEmail(email)) &&
            validateAddress(addressLine1, city, provinceCode, postalCode)
        );
    };

    const handleChange = (event, {name, value}) => {
        setFormParams({
            ...formParams,
            [name]: value
        });
    };

    const handleProvinceCodeInputChange = (event, {value}) => {
        setFormParams({
            ...formParams,
            provinceCode: `${US_COUNTRY_CODE}-${value}`
        });
    };

    return (
        <Modal
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            trigger={<Button>{t('Create Customer')}</Button>}
        >
            <Modal.Header>{t('Create Customer')}</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <Label>{t('Name')}:</Label>
                        <Input 
                            type="text"
                            name='name'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Phone Number')}:</Label>
                        <Input 
                            type="text"
                            name='phone'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Mobile')}:</Label>
                        <Input 
                            type="text"
                            name='mobile'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Email')}:</Label>
                        <Input 
                            type="text"
                            name='email'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Divider hidden />
                    <Header as='h3'>{t('Address')}:</Header>
                    <Form.Field>
                        <Label>{t('Address Line 1')}:</Label>
                        <Input 
                            type="text"
                            name='addressLine1'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Address Line 2')}:</Label>
                        <Input 
                            type="text"
                            name='addressLine2'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('City')}:</Label>
                        <Input 
                            type="text"
                            name='city'
                            onChange={handleChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('State')}:</Label>
                        <Dropdown
                            placeholder={t('Select State')}
                            fluid
                            search
                            selection
                            options={US_STATES.map((s, idx) => { return {key: s, value: US_STATE_ABBRV[idx], text: s}; })}
                            onChange={handleProvinceCodeInputChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <Label>{t('Zip Code')}:</Label>
                        <Input 
                            type="text"
                            name='postalCode'
                            onChange={handleChange}
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button 
                    color='black' 
                    onClick={() => setModalOpen(false)}
                >
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
                        {t('Create')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};