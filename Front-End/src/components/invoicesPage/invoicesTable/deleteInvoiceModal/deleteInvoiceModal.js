import React, {Component} from 'react';
import {Modal, Button} from 'semantic-ui-react';

export default class DeleteInvoiceModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false
        };
    }

    render() {
        const invoice = this.props.invoice;
        
        return (
            <Modal
                onClose={() => this.setState({modalOpen: false})}
                onOpen={() => this.setState({modalOpen: true})}
                open={this.state.modalOpen}
                trigger={this.props.trigger}
            >
                <Modal.Header>Delete Invoice?</Modal.Header>
                <Modal.Content>
                    <div>
                        <p>Invoice Number: {invoice.invoiceNumber}</p>
                        <p>Date of Service: {invoice.invoiceDate}</p>
                        <p>Customer: {invoice.customer.name}</p>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button 
                        color='black' 
                        onClick={() => this.setState({modalOpen: false})}
                    >
                        Cancel
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
}