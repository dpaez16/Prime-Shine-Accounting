import {useState} from 'react';
import {Modal, Button, Dropdown, Form, Label, Input} from 'semantic-ui-react';
import {fuseDateTime} from '../../../../utils/helpers';
import useLocalization from '../../../../hooks/useLocalization';

export default function CreateScheduledCustomerModal(props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [state, setState] = useState({
        dateOfServiceValid: false,
        customerValid: false,
        timesValid: false,
        customerId: '',
        dateOfService: ''
    });
    const [t] = useLocalization();

    const getFormParams = () => {
        const dateOfService = state.dateOfService;
        const customerId = state.customerId;
        const startTime = document.getElementById("CreateScheduledCustomerModal_serviceStartTime").value;
        const endTime = document.getElementById("CreateScheduledCustomerModal_serviceEndTime").value;

        return {
            dateOfService: dateOfService,
            customerId: customerId,
            startTime: startTime,
            endTime: endTime
        };
    };

    const handleDateOfServiceInputChange = (event, {value}) => {
        setState({
            ...state,
            dateOfService: value,
            dateOfServiceValid: value !== ''
        });
    };

    const handleCustomerInputChange = (event, {value}) => {
        setState({
            ...state,
            customerId: value,
            customerValid: value !== ''
        });
    };

    const handleTimeInputChange = () => {
        const { startTime, endTime } = getFormParams();

        setState({
            ...state,
            timesValid: startTime && endTime
        });
    };

    const convertToDropdownOptions = (items) => {
        return items.map(item => {
            return {
                key: item.id,
                value: item.id,
                text: item.name
            };
        });
    };

    const allCustomers = convertToDropdownOptions(props.allCustomers);
    const datesOfService = props.datesOfService.map((dateOfService) => {
        return {
            key: dateOfService,
            value: dateOfService,
            text: dateOfService
        };
    });

    return (
        <Modal
            onClose={() => {
                setModalOpen(false);
                setState({
                    ...state,
                    customerValid: false,
                    timesValid: false
                });
            }}
            onOpen={() => {
                setModalOpen(true);
                setState({
                    ...state,
                    customerValid: false,
                    timesValid: false
                });
            }}
            open={modalOpen}
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
                            onChange={handleDateOfServiceInputChange}
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
                            onChange={handleCustomerInputChange}
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
                            onChange={() => handleTimeInputChange()}
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
                            onChange={() => handleTimeInputChange()}
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
                        const { dateOfService, customerId, startTime, endTime } = getFormParams();
                        props.onSubmit(dateOfService, customerId, fuseDateTime(dateOfService, startTime), fuseDateTime(dateOfService, endTime));
                        setModalOpen(false);
                    }}
                    positive
                    disabled={!(state.dateOfServiceValid && state.customerValid && state.timesValid)}
                >
                        {t('Ok')}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};