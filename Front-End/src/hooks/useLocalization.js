import { useTranslation } from 'react-i18next';

export default function useLocalization() {
    const { t, i18n } = useTranslation();

    const setLanguage = (newLanguage) => {
        return i18n.changeLanguage(newLanguage);
    };

    return [t, setLanguage];
};