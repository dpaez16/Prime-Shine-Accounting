import React, {Component} from 'react';
import {Dimmer, Loader, Segment} from 'semantic-ui-react';
import './loadingSegment.css';

export default class LoadingSegment extends Component {
    render() {
        return (
            <Segment className={this.props.className}>
                <Dimmer active 
                        inverted
                >
                    <Loader inverted content='Loading' />
                </Dimmer>
            </Segment>
        );
    }
};