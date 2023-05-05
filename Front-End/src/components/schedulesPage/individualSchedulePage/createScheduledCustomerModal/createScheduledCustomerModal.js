import React, {Component} from 'react';
import {Modal, Button, Dropdown, Form, Label, Input} from 'semantic-ui-react';
import {fuseDateTime} from '../../../../utils/helpers';
import componentWrapper from '../../../../utils/componentWrapper';

class CreateScheduledCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            dateOfServiceValid: false,
            customerValid: false,
            timesValid: false,
            customerId: '',
            dateOfService: ''
        };
    }

    getFormParams() {
        const dateOfService = this.state.dateOfService;
        const customerId = this.state.customerId;
        const startTime = document.getElementById("CreateScheduledCustomerModal_serviceStartTime").value;
        const endTime = document.getElementById("CreateScheduledCustomerModal_serviceEndTime").value;

        return {
            dateOfService: dateOfService,
            customerId: customerId,
            startTime: startTime,
            endTime: endTime
        };
    }

    handleDateOfServiceInputChange(event, {value}) {
        this.setState({
            dateOfService: value,
            dateOfServiceValid: value !== ''
        });
    }

    handleCustomerInputChange(event, {value}) {
        this.setState({
            customerId: value,
            customerValid: value !== ''
        });
    }

    handleTimeInputChange() {
        const { startTime, endTime } = this.getFormParams();

        this.setState({
            timesValid: startTime && endTime
        });
    }

    convertToDropdownOptions(items) {
        return items.map(item => {
            return {
                key: item.id,
                value: item.id,
                text: item.name
            };
        });
    }

    render() {
        const {t} = this.props;

        const allCustomers = this.props.allCustomers.map((customerOption) => {
            return {
                key: customerOption.id,
                value: customerOption.id,
                text: customerOption.name
            };
        });

        const datesOfService = this.props.datesOfService.map((dateOfService) => {
            return {
                key: dateOfService,
                value: dateOfService,
                text: dateOfService
            };
        });

        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false,
                    customerValid: false,
                    timesValid: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    customerValid: false,
                    timesValid: false
                })}
                open={this.state.modalOpen}
                trigger={<Button>{t('Add Customer')}</Button>}
            >
                <Modal.Header>{t('Add Customer')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Date of Service')}:</Label>
                            <Dropdown
                                placeholder={t('Select Date')}
                                fluid
                                selection
                                options={datesOfService}
                                className="CreateScheduledCustomerModal_dateOfService"
                                onChange={this.handleDateOfServiceInputChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label>{t('Customer')}:</Label>
                            <Dropdown
                                placeholder={t('Select Customer')}
                                fluid
                                search
                                selection
                                options={allCustomers}
                                className="CreateScheduledCustomerModal_customerId"
                                onChange={this.handleCustomerInputChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="CreateScheduledCustomerModal_serviceStartTime">{t('Service Start Time')}:</Label>
                            <Input 
                                type="time" 
                                id="CreateScheduledCustomerModal_serviceStartTime" 
                                name="CreateScheduledCustomerModal_serviceStartTime" 
                                min="00:00"
                                max="24:00"
                                required
                                onChange={() => this.handleTimeInputChange()}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="CreateScheduledCustomerModal_serviceEndTime">{t('Service End Time')}:</Label>
                            <Input 
                                type="time" 
                                id="CreateScheduledCustomerModal_serviceEndTime" 
                                name="CreateScheduledCustomerModal_serviceEndTime" 
                                min="00:00"
                                max="24:00"
                                required
                                onChange={() => this.handleTimeInputChange()}
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
                            const { dateOfService, customerId, startTime, endTime } = this.getFormParams();
                            this.props.onSubmit(dateOfService, customerId, fuseDateTime(dateOfService, startTime), fuseDateTime(dateOfService, endTime));
                            
                            this.setState({modalOpen: false});
                        }}
                        positive
                        disabled={!(this.state.dateOfServiceValid && this.state.customerValid && this.state.timesValid)}
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(CreateScheduledCustomerModal);