import React from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';

type LoadingSegmentProps = {
    className?: string;
};

export default function LoadingSegment(props: LoadingSegmentProps) {
    return (
        <Segment className={props.className ?? ''}>
            <Dimmer active inverted>
                <Loader inverted content='Loading' />
            </Dimmer>
        </Segment>
    );
};
