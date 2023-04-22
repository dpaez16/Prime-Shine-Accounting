import React, {Component} from 'react';
import {Table, Button, Dimmer, Loader, Segment, Modal} from 'semantic-ui-react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
import { constructDate, dateToStr } from '../../utils/helpers';
//import './schedulesPage.css';

class SchedulesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schedules: [],
            loading: true,
            isDateValid: false
        }
    }

    handleDateChange(event) {
        const startDay = event.target.value;
        if (startDay) {
            this.setState({isDateValid: true})
        }
    }

    createSchedule() {
        const startDay = document.getElementById('createSchedule_startDay').value;
        
        PrimeShineAPIClient.createSchedule(constructDate(startDay), this.props.userInfo._id, this.props.userInfo.token)
        .then((schedule) => {
            this.setState({
                schedules: [ ...this.state.schedules, schedule ]
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    componentDidMount() {
        PrimeShineAPIClient.fetchSchedules(this.props.userInfo._id, this.props.userInfo.token)
        .then((schedules) => {
            this.setState({
                schedules: schedules,
                loading: false
            });
        })
        .catch(err => console.log);
    }

    render() {
        if (this.state.loading) {
            return (
                <Segment className='SchedulesPage_loading'>
                    <Dimmer active 
                            inverted
                    >
                        <Loader inverted 
                                content='Loading' 
                        />
                    </Dimmer>
                </Segment>
            );
        }

        return (
            <div className="SchedulesPage">
                <p>Schedules:</p>
                <Table celled className="SchedulesPage_table">
                    <Table.Body>
                    {
                        this.state.schedules.map((schedule, idx) => {
                            return (
                                <Table.Row key={`SchedulesPage_table_Schedule${idx}`}>
                                    <Table.Cell>
                                        <a
                                            href='/viewSchedule'
                                            onClick={e => {
                                                e.preventDefault();
                                                this.props.navigation('/viewSchedule', {
                                                    state: {
                                                        schedule: schedule
                                                    }
                                                });
                                            }}
                                        >
                                            {dateToStr(schedule.startDay)}
                                        </a>
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                    </Table.Body>
                </Table>
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
                    trigger={<button>Create Schedule</button>}
                >
                    <Modal.Header>Create a Schedule</Modal.Header>
                    <Modal.Content>
                        <form>
                            <label htmlFor="createSchedule_startDay">Start date:</label>&nbsp;&nbsp;
                            <input  type="date"
                                    id="createSchedule_startDay"
                                    min="2010-01-01"
                                    max="2023-12-31"
                                    defaultValue=""
                                    onChange={e => this.handleDateChange(e)}
                            />
                        </form>
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
                                this.setState({modalOpen: false});
                                this.createSchedule();
                            }}
                            disabled={!this.state.isDateValid}
                            positive
                        >
                                Create
                        </Button>
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
};

export default componentWrapper(SchedulesPage);