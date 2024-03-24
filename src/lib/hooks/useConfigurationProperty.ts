import {useEffect} from 'react';
import {useController} from 'react-hook-form';

import {
  GettablePropName,
  SettablePropName,
  SettableValues,
} from '@api/transformers';

import {useWiRocPropertyQuery} from './useWiRocPropertyQuery';

/**
 * Wrapper around useWiRocPropertyQuery _and_ react-hook-form's useController.
 * Meant to be used inside ConfigurationScreen, to reduce boilerplate code for
 * syncing original device values to the form (so it can check dirty state etc).
 *
 * This hook returns a tuple.
 *
 * The first member is the react-hook-form controller, which can be used to get
 * the current form value, i.e. what the user has choosen.
 *
 * The second member is the result of useWiRocPropertyQuery, which can be used
 * to get the original value from the device, and also the query status for the
 * property value. (isLoading, isError etc).
 */
export const useConfigurationProperty = <
  PropName extends GettablePropName & SettablePropName,
>(
  deviceId: string,
  propName: PropName,
  onDefaultValuesChange: (values: Partial<SettableValues>) => void,
) => {
  const query = useWiRocPropertyQuery<PropName>(deviceId, propName);

  const {data: originalValue} = query;

  useEffect(() => {
    onDefaultValuesChange({
      [propName]: originalValue,
    });
  }, [propName, onDefaultValuesChange, originalValue]);

  return [
    useController<SettableValues, PropName>({name: propName}),
    query,
  ] as const;
};
