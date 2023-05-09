import React, {Component} from 'react';
import {Modal, Button, Dropdown, Form, Label, Input} from 'semantic-ui-react';
import {fuseDateTime, constructMilitaryTimeStr} from '../../../../../utils/helpers';
import componentWrapper from '../../../../../utils/componentWrapper';

class EditScheduledCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            customerId: this.props.customerId ?? null,
            serviceStartTime: this.props.serviceStartTime ?? null,
            serviceEndTime: this.props.serviceEndTime ?? null
        };
    }

    getFormParams() {
        return {
            customerId: this.state.customerId,
            serviceStartTime: this.state.serviceStartTime,
            serviceEndTime: this.state.serviceEndTime
        };
    }

    isFormValid() {
        const {customerId, serviceStartTime, serviceEndTime} = this.getFormParams();

        return (
            customerId && customerId !== null && customerId.length > 0 && 
            serviceStartTime !== null &&
            serviceEndTime !== null
        );
    }

    handleFormChange(event, {name, value}) {
        this.setState({
            [name]: value
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
                                name="customerId"
                                onChange={this.handleFormChange.bind(this)}
                                defaultValue={this.props.scheduledCustomer.customerId}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceStartTime">{t('Service Start Time')}:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceStartTime" 
                                min="00:00"
                                max="24:00"
                                required
                                name="serviceStartTime"
                                onChange={this.handleFormChange.bind(this)}
                                defaultValue={defaultServiceStartTime}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Label htmlFor="EditScheduledCustomerModal_serviceEndTime">{t('Service End Time')}:</Label>
                            <Input 
                                type="time" 
                                id="EditScheduledCustomerModal_serviceEndTime" 
                                min="00:00"
                                max="24:00"
                                required
                                name="serviceEndTime"
                                onChange={this.handleFormChange.bind(this)}
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
                        disabled={!this.isFormValid()}
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(EditScheduledCustomerModal);