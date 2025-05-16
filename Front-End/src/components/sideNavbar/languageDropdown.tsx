import React from 'react';
import { Dropdown } from 'semantic-ui-react';
import useLocalization from '../../hooks/useLocalization';
import { SupportedLanguageLocales } from '@/utils/consts';

export default function LanguageDropdown() {
    const { t, setLanguage } = useLocalization();

    return (
        <Dropdown simple text={t('Language')!}>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => setLanguage(SupportedLanguageLocales.English)}
            >
              {t('English')}
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setLanguage(SupportedLanguageLocales.Spanish)}
            >
              {t('Spanish')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
    );
}
