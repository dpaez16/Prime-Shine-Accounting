import React, {Component} from 'react';
import {Modal, Button} from 'semantic-ui-react';
import componentWrapper from '../../../../utils/componentWrapper';

class DeleteInvoiceModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false
        };
    }

    render() {
        const {t, invoice} = this.props;
        
        return (
            <Modal
                onClose={() => this.setState({modalOpen: false})}
                onOpen={() => this.setState({modalOpen: true})}
                open={this.state.modalOpen}
                trigger={this.props.trigger}
            >
                <Modal.Header>{t('Delete Invoice?')}</Modal.Header>
                <Modal.Content>
                    <div>
                        <p>{t('Invoice Number')}: {invoice.invoiceNumber}</p>
                        <p>{t('Date of Service')}: {invoice.invoiceDate}</p>
                        <p>{t('Customer')}: {invoice.customer.name}</p>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button 
                        color='black' 
                        onClick={() => this.setState({modalOpen: false})}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            this.props.onSubmit();
                            this.setState({modalOpen: false});
                        }}
                        negative
                    >
                            Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(DeleteInvoiceModal);