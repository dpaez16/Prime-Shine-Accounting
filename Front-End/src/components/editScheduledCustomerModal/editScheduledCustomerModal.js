import React, {Component} from 'react';
import {Modal, Button, Dropdown, Form, Label, Input} from 'semantic-ui-react';
import {fuseDateTime} from '../../utils/helpers';

export default class EditScheduledCustomerModal extends Component {
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
                trigger={<Button>Edit</Button>}
            >
                <Modal.Header>Edit Scheduled Customer</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>Customer:</Label>
                            <Dropdown
                                placeholder='Select Customer'
                                fluid
                                search
                                selection
                                options={this.convertToDropdownOptions(this.props.allCustomers)}
                                className="EditScheduledCustomerModal_customerId"
                                onChange={this.handleCustomerInputChange.bind(this)}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceStartTime">Service Start Time:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceStartTime" 
                                name="EditScheduledCustomerModal_serviceStartTime" 
                                min="00:00"
                                max="24:00"
                                required
                                onChange={() => this.handleTimeInputChange()}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceEndTime">Service End Time:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceEndTime" 
                                name="EditScheduledCustomerModal_serviceEndTime" 
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
                        Cancel
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
}