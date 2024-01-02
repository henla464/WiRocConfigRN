import * as React from 'react';
import {Banner, Icon} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import {IErrorsForUser} from '../hooks/useBLE';

const ErrorBanner = () => {
  const BLEAPI = useBLEApiContext();

  const [errorsForUser, setErrorsForUser] = React.useState<IErrorsForUser[]>(
    [],
  );
  const [triggerVersion, setTriggerVersion] = React.useState<number>(0);

  React.useEffect(() => {
    let errs = BLEAPI.getErrorsForUser();
    setErrorsForUser(errs);
    console.log(errs);
  }, [BLEAPI, triggerVersion]);

  return (
    <Banner
      visible={BLEAPI.hasErrorsForUser}
      actions={[
        {
          label: 'Stäng alla',
          onPress: () => {
            if (BLEAPI.hasErrorsForUser) {
              BLEAPI.removeErrorsForUser();
            }
          },
        },
        {
          label: 'Stäng',
          onPress: () => {
            if (BLEAPI.hasErrorsForUser) {
              BLEAPI.removeErrorForUser(errorsForUser[0].id);
              setTriggerVersion(triggerVersion + 1);
            }
          },
        },
      ]}
      icon={({size}) => <Icon source="alert" size={size} />}
      style={{backgroundColor: 'rgb(255, 60, 60)'}}>
      {'Fel 1 av ' +
        errorsForUser.length +
        ': ' +
        (errorsForUser.length > 0 ? errorsForUser[0].message : '')}
    </Banner>
  );
};

export default ErrorBanner;
