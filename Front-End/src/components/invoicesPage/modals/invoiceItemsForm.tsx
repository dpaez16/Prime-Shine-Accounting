import React, { useContext } from 'react';
import { LoginSessionContext } from '@/context/LoginSessionContext';
import useLocalization from '@/hooks/useLocalization';
import { WaveInvoiceService } from '@/types/waveInvoice';
import { v4 as uuidV4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Cross1Icon } from '@radix-ui/react-icons';

export type InvoiceService = WaveInvoiceService & { uuid: string };

type EditInvoiceModalTableProps = {
    invoiceServices: InvoiceService[];
    onChange: (invoiceServices: InvoiceService[]) => void;
    className?: string;
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

    return (
        <div className={cn('flex flex-col gap-2', props.className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('Items')}</TableHead>
                        <TableHead>{t('Description')}</TableHead>
                        <TableHead>{t('Price')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoiceServices.map((invoiceService, index) => {
                        return (
                            <TableRow key={invoiceService.uuid}>
                                <TableCell>{businessInfo.productName}</TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell className='flex flex-row gap-4 items-center'>
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
                                    <Cross1Icon
                                        className='hover:cursor-pointer'
                                        onClick={() => deleteInvoiceServiceHandler(index)}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className='flex flex-row justify-end'>
                <Button onClick={() => addInvoiceServiceHandler(createNewInvoiceService())}>
                    {t('Add Item')}
                </Button>
            </div>
        </div>
    );
};