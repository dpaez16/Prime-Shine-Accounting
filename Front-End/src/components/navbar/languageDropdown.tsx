import React from 'react';
import useLocalization from '@/hooks/useLocalization';
import { SupportedLanguageLocales } from '@/utils/consts';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';

export const LanguageDropdown: React.FC = () => {
    const { t, setLanguage } = useLocalization();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>{t('Language')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className='flex flex-col'>
                            <NavigationMenuLink
                                className='text-nowrap hover:cursor-pointer'
                                onClick={() => setLanguage(SupportedLanguageLocales.English)}
                            >
                                {t('English')}
                            </NavigationMenuLink>
                            <NavigationMenuLink
                                className='text-nowrap hover:cursor-pointer'
                                onClick={() => setLanguage(SupportedLanguageLocales.Spanish)}
                            >
                                {t('Spanish')}
                            </NavigationMenuLink>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};