import React, {Component} from 'react';
import {Container, Header, Divider} from 'semantic-ui-react';
import EditCustomerModal from './editCustomerModal/editCustomerModal';
import WaveAPIClient from '../../../api/waveApiClient';
import {US_COUNTRY_CODE} from '../../../utils/consts';
import componentWrapper from '../../../utils/componentWrapper';
//import './individualCustomerPage.js';

class IndividualCustomerPage extends Component {
    constructNameElement(name) {
        if (name) {
            return (
                <React.Fragment>
                    <Header as='h3'>Name:</Header>
                    <p>{name}</p>
                </React.Fragment>
            );
        }

        return null;
    }

    constructPhoneElement(phone) {
        if (phone) {
            return (
                <React.Fragment>
                    <Header as='h3'>Phone Number:</Header>
                    <p>{phone}</p>
                </React.Fragment>
            );
        }

        return null;
    }

    constructMobileElement(mobile) {
        if (mobile) {
            return (
                <React.Fragment>
                    <Header as='h3'>Mobile:</Header>
                    <p>{mobile}</p>
                </React.Fragment>
            );
        }

        return null;
    }

    constructEmailElement(email) {
        if (email) {
            return (
                <React.Fragment>
                    <Header as='h3'>Email:</Header>
                    <p>{email}</p>
                </React.Fragment>
            );
        }

        return null;
    }

    constructAddressElement(address) {
        if (address) {
            const {
                addressLine1, 
                addressLine2,
                city,
                postalCode,
                province
            } = address;

            if (!province) {
                return null;
            }

            const provinceName = province.name;
            const addressLine3 = `${city} ${provinceName}, ${postalCode}`;

            return (
                <React.Fragment>
                    <Header as='h3'>Address:</Header>
                    <p>{addressLine1}</p>
                    {addressLine2 && <p>{addressLine2}</p>}
                    <p>{addressLine3}</p>
                </React.Fragment>
            );
        }

        return null;
    }

    constructCustomerPropElements(customer) {
        const {
            name,
            phone,
            mobile,
            email,
            address
        } = customer;

        const elements = [
            this.constructNameElement(name),
            this.constructPhoneElement(phone),
            this.constructMobileElement(mobile),
            this.constructEmailElement(email),
            this.constructAddressElement(address),
        ];

        return elements.filter((element) => element !== null);
    }

    editCustomerHandler(formParams) {
        const {
            name, phone, mobile, email,
            addressLine1, addressLine2, city, provinceCode, postalCode
        } = formParams;

        const customerId = this.props.location.state.customer.id;

        const customerPatchInput = {
            id: customerId,
            name: name,
            phone: phone,
            mobile: mobile,
            email: email,
            address: {
                addressLine1: addressLine1,
                addressLine2: addressLine2,
                city: city,
                provinceCode: provinceCode,
                countryCode: US_COUNTRY_CODE,
                postalCode: postalCode
            }
        };

        return WaveAPIClient.editCustomer(customerPatchInput);
    }

    render() {
        const customer = this.props.location.state.customer;
        const customerPropElements = this.constructCustomerPropElements(customer);

        return (
            <Container className='IndividualCustomerPage'>
                <Container className='IndividualCustomerPage_header'>
                    <Header as='h1'>{customer.name}</Header>
                    <EditCustomerModal
                        customer={customer}
                        onSubmit={(formParams) => {
                            this.editCustomerHandler(formParams)
                            .then(newCustomer => {
                                this.props.navigation("/viewCustomer", {
                                    replace: true,
                                    state: {
                                        customer: newCustomer
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        }}
                    />
                </Container>
                <Divider hidden />
                <Container className="InvididualCustomerPage_props">
                    {
                        customerPropElements.map((customerElement, idx) => {
                            return (
                                <React.Fragment>
                                    <Container>
                                        {customerElement}
                                    </Container>
                                    <Divider hidden />
                                </React.Fragment>
                            );
                        })
                    }
                </Container>
            </Container>
        );
    }
};

export default componentWrapper(IndividualCustomerPage);