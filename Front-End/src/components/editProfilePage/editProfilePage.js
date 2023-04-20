import React, {Component} from 'react';
import PrimeShineAPIClient from '../../api/primeShineApiClient';
import componentWrapper from '../../utils/componentWrapper';
//import './editProfilePage.css';

class EditProfilePage extends Component {
    handleUserEditProfile() {
        const name = document.getElementById('EditProfilePage_name').value;
        const email = document.getElementById('EditProfilePage_email').value;
        const password = document.getElementById('EditProfilePage_password').value;
        const { userId, token } = this.props.location.state;

        PrimeShineAPIClient.editUser(name, email, password, userId, token)
        .then((user) => {
            alert("User changes are saved!");
            this.props.updateUserInfo(user);
            this.props.navigation('/');
        })
        .catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
            <div className="EditProfilePage">
                <form>
                    <label htmlFor="EditProfilePage_name">Name:</label>&nbsp;&nbsp;
                    <input type="text" id="EditProfilePage_name" />
                    <br />
                    <label htmlFor="EditProfilePage_email">Email:</label>&nbsp;&nbsp;
                    <input type="text" id="EditProfilePage_email" />
                    <br />
                    <label htmlFor="EditProfilePage_password">Password:</label>&nbsp;&nbsp;
                    <input type="password" id="EditProfilePage_password" />
                    <br />
                    <button onClick={e => {
                        e.preventDefault();
                        this.handleUserEditProfile();
                    }}>
                        Save Changes
                    </button>
                </form>
            </div>
        );
    }
};

export default componentWrapper(EditProfilePage);