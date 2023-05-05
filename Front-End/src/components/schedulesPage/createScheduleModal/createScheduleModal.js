import React, {Component} from 'react';
import {Modal, Button, Form, Label, Input} from 'semantic-ui-react';
import { constructDate } from '../../../utils/helpers';
import componentWrapper from '../../../utils/componentWrapper';

class CreateScheduleModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false,
            isDateValid: false
        };
    }

    getFormParams() {
        const startDay = document.getElementById('createSchedule_startDay').value;

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
                trigger={<Button>{t('Create Schedule')}</Button>}
            >
                <Modal.Header>{t('Create Schedule')}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Label>{t('Start date')}:</Label>
                            <Input  type="date"
                                id="createSchedule_startDay"
                                min="2010-01-01"
                                max="2023-12-31"
                                defaultValue=""
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
                            {t('Create')}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(CreateScheduleModal);