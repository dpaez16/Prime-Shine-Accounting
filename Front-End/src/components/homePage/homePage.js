import React, {Component} from 'react';
import {Container, Header} from 'semantic-ui-react';
import componentWrapper from '../../utils/componentWrapper';
import './homePage.css';

class HomePage extends Component {
    getWelcomeElement() {
        const {t} = this.props;

        if (!this.props.userInfo) {
            return (<React.Fragment />);
        }

        const {name} = this.props.userInfo;

        return (
            <p>{t('Welcome')}, {name}</p>
        );
    }

    render() {
        const welcomeElement = this.getWelcomeElement();

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
    }
};

export default componentWrapper(HomePage);