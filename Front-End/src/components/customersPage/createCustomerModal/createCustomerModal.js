import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input, Divider, Header, Dropdown} from 'semantic-ui-react';
import {validatePhoneNumber, validateEmail, validateAddress} from '../../../utils/validators';
import {US_COUNTRY_CODE, US_STATES, US_STATE_ABBRV} from '../../../utils/consts';

export default class CreateCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,

            name: '',
            phone: '',
            mobile: '',
            email: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            provinceCode: ''
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
        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true
                })}
                open={this.state.modalOpen}
                trigger={<Button>Create Customer</Button>}
            >
                <Modal.Header>Create a Customer</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>Name:</Label>
                            <Input 
                                type="text"
                                name='name'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Phone Number:</Label>
                            <Input 
                                type="text"
                                name='phone'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Mobile:</Label>
                            <Input 
                                type="text"
                                name='mobile'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Email:</Label>
                            <Input 
                                type="text"
                                name='email'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Divider hidden />
                        <Header as='h3'>Address:</Header>
                        <Form.Field>
                            <Label>Address Line 1:</Label>
                            <Input 
                                type="text"
                                name='addressLine1'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Address Line 2:</Label>
                            <Input 
                                type="text"
                                name='addressLine2'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>City:</Label>
                            <Input 
                                type="text"
                                name='city'
                                onChange={this.handleChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>State:</Label>
                            <Dropdown
                                placeholder='Select State'
                                fluid
                                search
                                selection
                                options={US_STATES.map((s, idx) => { return {key: s, value: US_STATE_ABBRV[idx], text: s}; })}
                                onChange={this.handleProvinceCodeInputChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>Zip Code:</Label>
                            <Input 
                                type="text"
                                name='postalCode'
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
                        Cancel
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
                            Create
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}