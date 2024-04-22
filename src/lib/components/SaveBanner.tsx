import * as React from 'react';
import {FieldErrors} from 'react-hook-form';
import {Animated} from 'react-native';
import {Banner, Icon} from 'react-native-paper';

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
          label: 'Spara konfigurationen',
          disabled: isSaveDisabled,
          onPress: () => {
            save();
          },
        },
        {
          label: 'Uppdatera från enheten',
          onPress: () => reload(),
        },
      ]}
      icon={({size}) => <Icon source="content-save" size={size} />}>
      {errors && Object.entries(errors).length > 0
        ? `Konfigurationen innehåller fel som gör att den inte kan sparas just nu:\n${Object.entries(
            errors,
          )
            .map(([path, error]) =>
              typeof error?.message === 'string'
                ? `• ${error.message}`
                : `• Okänt fel i fält ${path}`,
            )
            .join('\n')}`
        : 'Konfigurationen har ändrats i appen. Vill du spara ändringen eller uppdatera från enheten?'}
    </Banner>
  );
}
