import React from 'react';
import { useTranslation } from 'react-i18next';

const translationWrapper = (Component) => {
    return (props) => {
        const { t, i18n } = useTranslation();
        
        return <Component 
                    t={t}
                    changeLanguage={newLanguage => i18n.changeLanguage(newLanguage)}
                    {...props}
                />
    }
}

export default translationWrapper;