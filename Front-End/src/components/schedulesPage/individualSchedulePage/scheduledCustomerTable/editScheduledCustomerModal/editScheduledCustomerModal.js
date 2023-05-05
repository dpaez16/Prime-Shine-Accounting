import React, {Component} from 'react';
import {Modal, Button, Dropdown, Form, Label, Input} from 'semantic-ui-react';
import {fuseDateTime, constructMilitaryTimeStr} from '../../../../../utils/helpers';
import componentWrapper from '../../../../../utils/componentWrapper';

class EditScheduledCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            customerValid: false,
            timesValid: false,
            customerId: ''
        };
    }

    getFormParams() {
        const customerId = this.state.customerId;
        const startTime = document.getElementById("EditScheduledCustomerModal_serviceStartTime").value;
        const endTime = document.getElementById("EditScheduledCustomerModal_serviceEndTime").value;

        return {
            customerId: customerId,
            startTime: startTime,
            endTime: endTime
        };
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
        const defaultServiceStartTime = constructMilitaryTimeStr(this.props.scheduledCustomer.serviceStartTime).split(' ')[0];
        const defaultServiceEndTime = constructMilitaryTimeStr(this.props.scheduledCustomer.serviceEndTime).split(' ')[0];

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
                trigger={<Button>{t('Edit')}</Button>}
            >
                <Modal.Header>{t('Edit Scheduled Customer')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Customer')}:</Label>
                            <Dropdown
                                placeholder={t('Select Customer')}
                                fluid
                                search
                                selection
                                options={this.convertToDropdownOptions(this.props.allCustomers)}
                                className="EditScheduledCustomerModal_customerId"
                                onChange={this.handleCustomerInputChange.bind(this)}
                                defaultValue={this.props.scheduledCustomer.customerId}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceStartTime">{t('Service Start Time')}:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceStartTime" 
                                name="EditScheduledCustomerModal_serviceStartTime" 
                                min="00:00"
                                max="24:00"
                                required
                                onChange={() => this.handleTimeInputChange()}
                                defaultValue={defaultServiceStartTime}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceEndTime">{t('Service End Time')}:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceEndTime" 
                                name="EditScheduledCustomerModal_serviceEndTime" 
                                min="00:00"
                                max="24:00"
                                required
                                onChange={() => this.handleTimeInputChange()}
                                defaultValue={defaultServiceEndTime}
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
                            const { customerId, startTime, endTime } = this.getFormParams();
                            const scheduleDayDate = this.props.scheduleDayDate;
                            this.props.onSubmit(customerId, fuseDateTime(scheduleDayDate, startTime), fuseDateTime(scheduleDayDate, endTime));
                            
                            this.setState({modalOpen: false});
                        }}
                        positive
                        disabled={!(this.state.customerValid && this.state.timesValid)}
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(EditScheduledCustomerModal);