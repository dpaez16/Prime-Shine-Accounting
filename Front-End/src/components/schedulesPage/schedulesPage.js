import React, {Component} from 'react';
import {Table, Dimmer, Loader, Segment} from 'semantic-ui-react';
import CreateScheduleModal from './createScheduleModal/createScheduleModal';
import EditScheduleModal from './editScheduleModal/editScheduleModal';
import DeleteScheduleModal from './deleteScheduleModal/deleteScheduleModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
import { dateToStr } from '../../utils/helpers';
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

    createScheduleHandler(startDay) {
        const userId = this.props.userInfo._id;
        const jwt = this.props.userInfo.token;

        PrimeShineAPIClient.createSchedule(startDay, userId, jwt)
        .then((schedule) => {
            this.setState({
                schedules: [ ...this.state.schedules, schedule ]
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    editScheduleHandler(startDay, scheduleId) {
        const jwt = this.props.userInfo.token;

        PrimeShineAPIClient.editSchedule(startDay, scheduleId, jwt)
        .then((patchedSchedule) => {
            const newSchedules = [...this.state.schedules];
            const idx = newSchedules.findIndex((schedule) => schedule._id === scheduleId);
            newSchedules.splice(idx, 1, patchedSchedule);

            this.setState({
                schedules: newSchedules
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }

    deleteScheduleHandler(startDay) {
        const userId = this.props.userInfo._id;
        const jwt = this.props.userInfo.token;

        PrimeShineAPIClient.deleteSchedule(startDay, userId, jwt)
        .then((didSucceed) => {
            console.log(didSucceed);

            const newSchedules = [...this.state.schedules];
            const idx = newSchedules.findIndex((schedule) => schedule.startDay === startDay);
            newSchedules.splice(idx, 1);

            this.setState({
                schedules: newSchedules
            });
        })
        .catch(err => {
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

        const schedules = this.state.schedules.sort((a, b) => Number(a.startDay) > Number(b.startDay) ? 1 : -1);

        return (
            <div className="SchedulesPage">
                <p>Schedules:</p>
                <CreateScheduleModal
                    onSubmit={(startDate) => {
                        this.createScheduleHandler(startDate);
                    }}
                />
                <Table celled className="SchedulesPage_table">
                    <Table.Body>
                    {
                        schedules.map((schedule, idx) => {
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
                                        <EditScheduleModal
                                            onSubmit={(startDay) => {
                                                const scheduleId = schedule._id;
                                                this.editScheduleHandler(startDay, scheduleId);
                                            }}
                                        />
                                        <DeleteScheduleModal
                                            startDay={dateToStr(schedule.startDay)}
                                            onSubmit={() => {
                                                const startDay = schedule.startDay;
                                                this.deleteScheduleHandler(startDay);
                                            }}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            );
                        })
                    }
                    </Table.Body>
                </Table>
            </div>
        );
    }
};

export default componentWrapper(SchedulesPage);