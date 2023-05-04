import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const componentWrapper = (Component) => {
    return (props) => {
        const navigation = useNavigate();
        const location = useLocation();
        const { t, i18n } = useTranslation();
        
        return <Component 
                    navigation={navigation} 
                    location={location}
                    t={t}
                    changeLanguage={newLanguage => i18n.changeLanguage(newLanguage)}
                    {...props}
                />
    }
}

export default componentWrapper;