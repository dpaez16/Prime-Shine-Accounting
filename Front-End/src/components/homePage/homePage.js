import React, {Component} from 'react';
import {Container} from 'semantic-ui-react';
import componentWrapper from '../../utils/componentWrapper';
//import './homePage.css';

class HomePage extends Component {
    render() {
        const {t} = this.props;

        if (!this.props.userInfo) {
            return (
                <Container className="HomePage">
                </Container>
            );
        }

        return (
            <Container className="HomePage">
                <p>Prime Shine Accounting:</p>
                <ul>
                    <li>ID: {this.props.userInfo._id}</li>
                    <li>Name: {this.props.userInfo.name}</li>
                    <li>Email: {this.props.userInfo.email}</li>
                    <li>JWT: {this.props.userInfo.token}</li>
                </ul>
                <p>Wave Apps:</p>
                <ul>
                    <li>Business ID: {this.props.businessInfo.businessId}</li>
                    <li>Business Name: {this.props.businessInfo.businessName}</li>
                    <li>Product ID: {this.props.businessInfo.productId}</li>
                    <li>Product Name: {this.props.businessInfo.productName}</li>
                </ul>
            </Container>
        );
    }
};

export default componentWrapper(HomePage);