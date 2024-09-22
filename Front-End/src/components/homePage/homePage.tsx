import React from 'react';
import {Container, Header} from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import './homePage.css';

export default function HomePage(props) {
    const [t] = useLocalization();

    const getWelcomeElement = () => {
        if (!props.userInfo) {
            return (<React.Fragment />);
        }

        const {name} = props.userInfo;

        return (
            <p>{t('Welcome')}, {name}</p>
        );
    };

    const welcomeElement = getWelcomeElement();

    return (
        <Container 
            className="HomePage" 
            textAlign='center'
            fluid 
        >
            <Header as='h1'>Prime Shine Accounting</Header>
            {welcomeElement}
        </Container>
    );
};