import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Header, Dropdown} from 'semantic-ui-react';
import {validatePhoneNumber, validateEmail, validateAddress} from '../../../../utils/validators';
import {US_COUNTRY_CODE, US_STATES, US_STATE_ABBRV} from '../../../../utils/consts';
import componentWrapper from '../../../../utils/componentWrapper';

class EditCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            ...this.getOriginalFormParams()
        };
    }

    getOriginalFormParams() {
        const customer = this.props.customer;
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
            provinceCode: address.province ? address.province.name : ''
        };
    }

    getFormParams() {
        return {
            name: this.state.name,
            phone: this.state.phone,
            mobile: this.state.mobile,
            email: this.state.email,
            addressLine1: this.state.addressLine1,
            addressLine2: this.state.addressLine2,
            city: this.state.city,
            postalCode: this.state.postalCode,
            provinceCode: this.state.provinceCode
        };
    }

    isFormValid() {
        const {
            name, phone, mobile, email,
            addressLine1,
            city,
            postalCode,
            provinceCode
        } = this.getFormParams();

        return (
            name &&
            validatePhoneNumber(phone) &&
            (mobile === null || mobile === "" || validatePhoneNumber(mobile)) &&
            (email === null || email === "" || validateEmail(email)) &&
            validateAddress(addressLine1, city, provinceCode, postalCode)
        );
    }

    handleChange(event, {name, value}) {
        this.setState({
            [name]: value
        });
    }

    handleProvinceCodeInputChange(event, {value}) {
        this.setState({
            provinceCode: `${US_COUNTRY_CODE}-${value}`
        });
    }

    render() {
        const {t} = this.props;
        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    ...this.getOriginalFormParams()
                })}
                open={this.state.modalOpen}
                trigger={<Button>{t('Edit')}</Button>}
            >
                <Modal.Header>{t('Edit Customer')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Name')}:</Label>
                            <Input 
                                type="text"
                                name='name'
                                defaultValue={this.props.customer.name}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Phone Number')}:</Label>
                            <Input 
                                type="text"
                                name='phone'
                                defaultValue={this.props.customer.phone}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Mobile')}:</Label>
                            <Input 
                                type="text"
                                name='mobile'
                                defaultValue={this.props.customer.mobile}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Email')}:</Label>
                            <Input 
                                type="text"
                                name='email'
                                defaultValue={this.props.customer.email}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Divider hidden />
                        <Header as='h3'>{t('Address')}:</Header>
                        <Form.Field>
                            <Label>{t('Address Line 1')}:</Label>
                            <Input 
                                type="text"
                                name='addressLine1'
                                defaultValue={this.props.customer.address.addressLine1}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Address Line 2')}:</Label>
                            <Input 
                                type="text"
                                name='addressLine2'
                                defaultValue={this.props.customer.address.addressLine2}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('City')}:</Label>
                            <Input 
                                type="text"
                                name='city'
                                defaultValue={this.props.customer.address.city}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('State')}:</Label>
                            <Dropdown
                                placeholder='Select State'
                                fluid
                                search
                                selection
                                defaultValue={
                                    this.props.customer.address.province ? 
                                    US_STATE_ABBRV[US_STATES.findIndex(e => e === this.props.customer.address.province.name)] : ''
                                }
                                options={US_STATES.map((s, idx) => { return {key: s, value: US_STATE_ABBRV[idx], text: s}; })}
                                onChange={this.handleProvinceCodeInputChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Zip Code')}:</Label>
                            <Input 
                                type="text"
                                name='postalCode'
                                defaultValue={this.props.customer.address.postalCode}
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button 
                        color='black' 
                        onClick={() => this.setState({modalOpen: false})}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button 
                        onClick={() => {
                            const formParams = this.getFormParams();
                            this.props.onSubmit(formParams);
                            
                            this.setState({modalOpen: false});
                        }}
                        disabled={!this.isFormValid()}
                        positive
                    >
                            {t('Save')}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(EditCustomerModal);