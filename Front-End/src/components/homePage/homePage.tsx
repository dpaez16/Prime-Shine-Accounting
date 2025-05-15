import React, { useContext } from 'react';
import { Container, Header } from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import './homePage.css';

export default function HomePage() {
    const { userInfo } = useContext(LoginSessionContext);
    const { t } = useLocalization();

    const getWelcomeElement = () => {
        if (!userInfo) {
            return null;
        }

        const { name } = userInfo;

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
