import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {
  constructTimeStr,
  getDayOfWeekStr,
  grabWorkingDays,
} from '@/utils/helpers';
import useLocalization from '@/hooks/useLocalization';
import { v4 as uuidv4 } from 'uuid';
import { FullScheduledCustomer } from '@/types/scheduledCustomer';
import { WaveCustomerAddress } from '@/types/waveCustomer';

type SchedulePDFDocumentProps = {
  datesOfService: string[];
  scheduleDays: Array<FullScheduledCustomer[]>;
};

export default function SchedulePDFDocument(props: SchedulePDFDocumentProps) {
  const { t } = useLocalization();

  const constructCustomerAddressStr = (address: WaveCustomerAddress) => {
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
  };

  const constructCustomerEntry = (scheduledCustomer: FullScheduledCustomer) => {
    const name = scheduledCustomer.metadata.name;
    const serviceStartTime = constructTimeStr(
      scheduledCustomer.startTime,
    );
    const serviceEndTime = constructTimeStr(scheduledCustomer.endTime);

    const address = scheduledCustomer.metadata.address;
    const addressStr = constructCustomerAddressStr(address);

    return [`\u2022 ${serviceStartTime} - ${serviceEndTime}`, name, addressStr]
      .filter((e) => e !== '')
      .join(' ');
  };

  const styleSheet = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
    },
    header: {
      margin: 5,
      padding: 10,
      height: '5%',
    },
    daysSection: {
      // (3 x 2) section
      margin: 5,
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    day: {
      padding: 5,
      width: '50%',
      height: '33%',
      border: '2 solid #000',
    },
    dayHeader: {
      fontSize: 12,
    },
    customersSection: {
      paddingTop: 5,
      flex: 1,
      flexDirection: 'column',
    },
    scheduledCustomer: {
      fontSize: 8,
      marginBottom: 3,
    },
  });

  const { datesOfService, scheduleDays } = props;
  const startDay = datesOfService[0];
  const endDay = datesOfService[datesOfService.length - 1];

  const workingDatesOfService = grabWorkingDays(datesOfService);

  // TODO: test PDF printing
  return (
    <Document>
      <Page size="A4" style={styleSheet.page}>
        <View style={styleSheet.header}>
          <Text>
            {t('Week of')} {startDay} - {endDay}
          </Text>
        </View>
        <View style={styleSheet.daysSection}>
          {workingDatesOfService.map((dateOfService, idx) => {
            return (
              <View style={styleSheet.day} key={uuidv4()}>
                <Text style={styleSheet.dayHeader}>
                  {t(getDayOfWeekStr(dateOfService))} {dateOfService}
                </Text>
                <View style={styleSheet.customersSection}>
                  {scheduleDays[idx].map((scheduledCustomer) => {
                    return (
                      <Text key={uuidv4()} style={styleSheet.scheduledCustomer}>
                        {constructCustomerEntry(scheduledCustomer)}
                      </Text>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
