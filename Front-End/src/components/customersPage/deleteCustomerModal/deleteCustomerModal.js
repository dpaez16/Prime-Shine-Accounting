import React, {Component} from 'react';
import {Modal, Button} from 'semantic-ui-react';
import componentWrapper from '../../../utils/componentWrapper';

class DeleteCustomerModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalOpen: false
        };
    }

    render() {
        const {t} = this.props;
        return (
            <Modal
                onClose={() => this.setState({
                    modalOpen: false
                })}
                onOpen={() => this.setState({
                    modalOpen: true
                })}
                open={this.state.modalOpen}
                trigger={<Button negative>{t('Delete')}</Button>}
            >
                <Modal.Header>{t('Delete Customer?')}</Modal.Header>
                <Modal.Content>
                    {t('Are you sure?')}
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
                            {t('Delete')}
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
};

export default componentWrapper(DeleteCustomerModal);