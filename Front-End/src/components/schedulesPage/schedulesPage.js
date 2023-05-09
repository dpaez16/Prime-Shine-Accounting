import React, {Component} from 'react';
import {Table, Container, Header, Message} from 'semantic-ui-react';
import CreateScheduleModal from './createScheduleModal/createScheduleModal';
import EditScheduleModal from './editScheduleModal/editScheduleModal';
import DeleteScheduleModal from './deleteScheduleModal/deleteScheduleModal';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
import LoadingSegment from '../../utils/loadingSegment';
import { dateToStr } from '../../utils/helpers';
import { v4 as uuidV4 } from 'uuid';
//import './schedulesPage.css';

class SchedulesPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schedules: [],
            loading: true,
            isDateValid: false,
            error: null
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
                schedules: [ ...this.state.schedules, schedule ],
                error: null
            });
        })
        .catch((err) => {
            this.setState({
                error: err.message
            });
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
                schedules: newSchedules,
                error: null
            });
        })
        .catch((err) => {
            this.setState({
                error: err.message
            });
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
                schedules: newSchedules,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    componentDidMount() {
        PrimeShineAPIClient.fetchSchedules(this.props.userInfo._id, this.props.userInfo.token)
        .then((schedules) => {
            this.setState({
                schedules: schedules,
                loading: false,
                error: null
            });
        })
        .catch(err => {
            this.setState({
                error: err.message
            });
        });
    }

    render() {
        const {t} = this.props;
        const schedules = this.state.schedules.sort((a, b) => Number(a.startDay) > Number(b.startDay) ? 1 : -1);

        return (
            <Container className="SchedulesPage">
                <Header as='h1'>{t('Schedules')}:</Header>
                {this.state.loading && <LoadingSegment className="SchedulesPage_loading" />}
                <CreateScheduleModal
                    onSubmit={(startDate) => {
                        this.createScheduleHandler(startDate);
                    }}
                />
                {this.state.error &&
                    <Message
                        negative
                        content={this.state.error}
                    />
                }
                <Table celled className="SchedulesPage_table">
                    <Table.Body>
                    {
                        schedules.map((schedule, idx) => {
                            return (
                                <Table.Row key={uuidV4()}>
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
                                            schedule={schedule}
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
            </Container>
        );
    }
};

export default componentWrapper(SchedulesPage);