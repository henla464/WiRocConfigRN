import * as React from 'react';
import {Image} from 'react-native';
import {Banner, Icon} from 'react-native-paper';

interface ISaveBannerProps {
  visible: boolean;
  save: () => void;
  reload: () => void;
}

const SaveBanner = ({visible, save, reload}: ISaveBannerProps) => {
  return (
    <Banner
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
};

export default SaveBanner;
