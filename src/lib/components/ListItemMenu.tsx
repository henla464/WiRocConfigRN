import React, {useState} from 'react';
import {List, Menu} from 'react-native-paper';

interface ListItemMenuProps
  extends Omit<
    React.ComponentProps<typeof Menu>,
    'visible' | 'onDismiss' | 'anchor'
  > {
  disabled?: boolean;
  icon?: React.ComponentProps<typeof List.Icon>['icon'];
  right?: React.ComponentProps<typeof List.Item>['right'];
  title?: React.ComponentProps<typeof List.Item>['title'];
  description?: React.ComponentProps<typeof List.Item>['description'];
}

const ListItemMenuContext = React.createContext<() => void>(() => {});

export function ListItemMenu({
  disabled,
  icon,
  title,
  description,
  children,
  right,
}: ListItemMenuProps) {
  const [isVisible, setVisible] = useState(false);
  return (
    <Menu
      visible={isVisible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      anchor={
        <List.Item
          style={{
            width: '100%',
            opacity: disabled ? 0.5 : undefined,
          }}
          left={props =>
            icon ? <List.Icon {...props} icon={icon} /> : undefined
          }
          right={right}
          disabled={disabled}
          title={title}
          description={description}
          onPress={() => setVisible(true)}
        />
      }>
      <ListItemMenuContext.Provider value={() => setVisible(false)}>
        {children}
      </ListItemMenuContext.Provider>
    </Menu>
  );
}

export function ListItemMenuItem({
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  const dismiss = React.useContext(ListItemMenuContext);
  return (
    <Menu.Item
      {...props}
      onPress={(...args) => {
        props.onPress?.(...args);
        dismiss?.();
      }}
    />
  );
}
