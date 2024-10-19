import { useTranslation } from 'react-i18next';
import { SupportedLanguageLocales } from '@/utils/consts';

export default function useLocalization() {
  const { t, i18n } = useTranslation();

  const setLanguage = (newLanguage: SupportedLanguageLocales) => {
    return i18n.changeLanguage(newLanguage);
  };

  return { t, setLanguage };
}
