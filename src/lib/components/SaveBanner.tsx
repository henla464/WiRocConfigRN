import * as React from 'react';
import {FieldErrors} from 'react-hook-form';
import {Animated} from 'react-native';
import {Banner, Icon} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

interface ISaveBannerProps {
  visible: boolean;
  save: () => void;
  reload: () => void;
  onHideAnimationFinished: Animated.EndCallback;
  onShowAnimationFinished: Animated.EndCallback;
  isSaveDisabled?: boolean;
  errors?: FieldErrors;
}

export default function SaveBanner({
  visible,
  save,
  reload,
  onHideAnimationFinished,
  onShowAnimationFinished,
  isSaveDisabled,
  errors,
}: ISaveBannerProps) {
  const {t} = useTranslation();
  return (
    <Banner
      style={{
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 2,
      }}
      onHideAnimationFinished={onHideAnimationFinished}
      onShowAnimationFinished={onShowAnimationFinished}
      visible={visible}
      actions={[
        {
          label: t('Spara konfiguration'),
          disabled: isSaveDisabled,
          style: {flexShrink: 1},
          onPress: () => {
            save();
          },
        },
        {
          label: t('Uppdatera från enheten'),
          style: {flexShrink: 1},
          onPress: () => reload(),
        },
      ]}
      icon={({size}) => <Icon source="content-save" size={size} />}>
      {errors && Object.entries(errors).length > 0
        ? `${t('Konfigurationen innehåller fel som gör att den inte kan sparas just nu:')}\n${Object.entries(
            errors,
          )
            .map(([path, error]) =>
              typeof error?.message === 'string'
                ? `• ${error.message}`
                : `• ${t('Okänt fel i fält')} ${path}`,
            )
            .join('\n')}`
        : t(
            'Konfigurationen har ändrats i appen. Vill du spara ändringen eller uppdatera från enheten?',
          )}
    </Banner>
  );
}
