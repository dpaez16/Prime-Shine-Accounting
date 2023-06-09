import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input} from 'semantic-ui-react';
import { constructDate } from '../../../utils/helpers';
import componentWrapper from '../../../utils/componentWrapper';

class EditScheduleModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            isDateValid: false
        };
    }

    getFormParams() {
        const startDay = document.getElementById('editSchedule_startDay').value;

        return {
            startDay: constructDate(startDay)
        };
    }

    handleDateChange(event) {
        const startDay = event.target.value;
        if (startDay) {
            this.setState({isDateValid: true})
        }
    }

    render() {
        const {t} = this.props;
        const defaultStartDay = this.props.schedule.startDay.toISOString().split('T')[0];

        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false,
                    isDateValid: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true,
                    isDateValid: false
                })}
                open={this.state.modalOpen}
                trigger={<Button>{t('Edit')}</Button>}
            >
                <Modal.Header>{t('Edit Schedule')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Start date')}:</Label>
                            <Input  type="date"
                                id="editSchedule_startDay"
                                min="2010-01-01"
                                max="2023-12-31"
                                defaultValue={defaultStartDay}
                                onChange={e => this.handleDateChange(e)}
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
                            const { startDay } = this.getFormParams();
                            this.props.onSubmit(startDay);
                            
                            this.setState({modalOpen: false});
                        }}
                        disabled={!this.state.isDateValid}
                        positive
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(EditScheduleModal);