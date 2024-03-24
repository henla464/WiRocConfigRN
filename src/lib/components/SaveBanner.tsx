import * as React from 'react';
import {Animated} from 'react-native';
import {Banner, Icon} from 'react-native-paper';

interface ISaveBannerProps {
  visible: boolean;
  save: () => void;
  reload: () => void;
  onHideAnimationFinished: Animated.EndCallback;
  onShowAnimationFinished: Animated.EndCallback;
}

export default function SaveBanner({
  visible,
  save,
  reload,
  onHideAnimationFinished,
  onShowAnimationFinished,
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
      Konfigurationen har ändrats i appen. Vill du spara ändringen eller
      uppdatera från enheten?
    </Banner>
  );
}
