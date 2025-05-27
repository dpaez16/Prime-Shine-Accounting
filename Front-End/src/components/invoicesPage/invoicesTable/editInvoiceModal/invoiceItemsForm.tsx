import React, { useContext } from 'react';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoiceService } from '@/types/waveInvoice';
import { Button, Icon, Input, Table } from 'semantic-ui-react';
import { v4 as uuidV4 } from 'uuid';

export type InvoiceService = WaveInvoiceService & { uuid: string };

type EditInvoiceModalTableProps = {
    invoiceServices: InvoiceService[];
    onChange: (invoiceServices: InvoiceService[]) => void;
};

export const InvoiceItemsForm: React.FC<EditInvoiceModalTableProps> = (props) => {
    const context = useContext(LoginSessionContext);
    const businessInfo = context.businessInfo!;

    const createNewInvoiceService = (): InvoiceService => {
        const { productId } = businessInfo;

        return {
            productId: productId,
            description: '',
            quantity: 1,
            unitPrice: 0,
            uuid: uuidV4(),
        };
    };

    const handleInvoiceServiceChange = (idx: number, newInvoiceService: InvoiceService) => {
        const newInvoiceServices = [...props.invoiceServices];
        newInvoiceServices.splice(idx, 1, newInvoiceService);

        props.onChange(newInvoiceServices);
    };

    const deleteInvoiceServiceHandler = (idx: number) => {
        const newInvoiceServices = props.invoiceServices.filter(
            (_, elementIdx) => idx !== elementIdx,
        );

        props.onChange(newInvoiceServices);
    };

    const addInvoiceServiceHandler = (newInvoiceService: InvoiceService) => {
        const newInvoiceServices = [...props.invoiceServices, newInvoiceService];
        props.onChange(newInvoiceServices);
    };

    const { t } = useLocalization();
    const { invoiceServices } = props;
    const productName = businessInfo.productName;

    return (
        <Table celled>
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell>{t('Items')}</Table.HeaderCell>
                <Table.HeaderCell>{t('Description')}</Table.HeaderCell>
                <Table.HeaderCell>{t('Price')}</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {invoiceServices.map((invoiceService, index) => {
                    return (
                        <Table.Row key={invoiceService.uuid}>
                            <Table.Cell>{productName}</Table.Cell>
                            <Table.Cell>
                                <Input
                                    type='text'
                                    defaultValue={invoiceService.description}
                                    onChange={(e) => {
                                        const description = e.target.value;
                                        const newInvoiceService = {
                                            ...invoiceService,
                                            description: description,
                                        };

                                        handleInvoiceServiceChange(index, newInvoiceService);
                                    }}
                                />
                            </Table.Cell>
                            <Table.Cell className='flex flex-row gap-4 items-center'>
                                <Input
                                    type='text'
                                    defaultValue={invoiceService.unitPrice}
                                    onChange={(e) => {
                                        const totalValue = e.target.value;
                                        const newInvoiceService = {
                                            ...invoiceService,
                                            unitPrice: totalValue,
                                        };

                                        handleInvoiceServiceChange(index, newInvoiceService);
                                    }}
                                />
                                <Icon
                                    name='trash'
                                    link
                                    onClick={() => deleteInvoiceServiceHandler(index)}
                                />
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.Cell>
                        <Button
                            onClick={() => {
                                const newInvoiceService = createNewInvoiceService();
                                addInvoiceServiceHandler(newInvoiceService);
                            }}
                        >
                            {t('Add Item')}
                        </Button>
                    </Table.Cell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
};