import React, {Component} from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { constructTimeStr, getDayOfWeekStr, grabWorkingDays } from '../../../../utils/helpers';

export default class SchedulePDFDocument extends Component {
    constructCustomerAddressStr(address) {
        if (!address) {
            return '';
        }

        let addressStr = address.addressLine1;
        if (address.addressLine2) {
            addressStr += ` ${address.addressLine2}`;
        }

        if (!addressStr) {
            return '';
        }

        return `(${addressStr})`;
    }

    constructCustomerEntry(scheduledCustomer, style) {
        const name = scheduledCustomer.metadata.name;
        const serviceStartTime = constructTimeStr(scheduledCustomer.serviceStartTime);
        const serviceEndTime = constructTimeStr(scheduledCustomer.serviceEndTime);

        const address = scheduledCustomer.metadata.address;
        const addressStr = this.constructCustomerAddressStr(address);

        return [`\u2022 ${serviceStartTime} - ${serviceEndTime}`, name, addressStr].filter(e => e !== '').join(" ");
    }

    render() {
        const styleSheet = StyleSheet.create({
            page: {
                flexDirection: 'col',
                backgroundColor: '#FFFFFF'
            },
            header: {
                margin: 5,
                padding: 10,
                height: '5%'
            },
            daysSection: { // (3 x 2) section
                margin: 5,
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap'
            },
            day: {
                padding: 5,
                width: '50%',
                height: '33%',
                border: '2 solid #000'
            },
            dayHeader: {
                fontSize: 12
            },
            customersSection: {
                paddingTop: 5,
                flex: 1,
                flexDirection: 'col'
            },
            scheduledCustomer: {
                fontSize: 8,
                marginBottom: 3
            }
        });

        const {datesOfService, scheduleDays} = this.props;
        const startDay = datesOfService[0];
        const endDay = datesOfService[datesOfService.length - 1];

        const workingDatesOfService = grabWorkingDays(datesOfService);

        // TODO: test PDF printing 
        return (
            <Document>
                <Page
                    size='A4'
                    style={styleSheet.page}
                >
                    <View style={styleSheet.header}>
                        <Text>Week of {startDay} - {endDay}</Text>
                    </View>
                    <View style={styleSheet.daysSection}>
                    {
                        workingDatesOfService.map((dateOfService, idx) => {
                            return (
                                <View style={styleSheet.day} key={idx}>
                                    <Text style={styleSheet.dayHeader}>
                                        {getDayOfWeekStr(dateOfService)} {dateOfService}
                                    </Text>
                                    <View style={styleSheet.customersSection}>
                                        {
                                            scheduleDays[idx].map((scheduledCustomer, customerIdx) => {
                                                return (
                                                    <Text key={customerIdx} style={styleSheet.scheduledCustomer}>
                                                        {this.constructCustomerEntry(scheduledCustomer)}
                                                    </Text>
                                                );
                                            })
                                        }
                                    </View>
                                </View>
                            );
                        })
                    }
                    </View>
                </Page>
            </Document>
        );
    }
};