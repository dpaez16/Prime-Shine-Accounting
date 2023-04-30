import React, {Component} from 'react';
import {Modal, Button} from 'semantic-ui-react';

export default class DeleteCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false
        };
    }

    render() {
        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true
                })}
                open={this.state.modalOpen}
                trigger={<Button negative>Delete</Button>}
            >
                <Modal.Header>Delete Customer?</Modal.Header>
                <Modal.Content>
                    Are you sure?
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
                            Delete
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}