import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const componentWrapper = (Component) => {
    return (props) => {
        const navigation = useNavigate();
        const location = useLocation();

        return <Component navigation={navigation} location={location} {...props} />
    }
}

export default componentWrapper;