# WiRocConfigRN

React Native app for configuring WiRoc devices.

## Expo

We are using Expo to manage the project. Read about available commands here:

https://docs.expo.dev/develop/tools/

## Running locally

To start Metro (the JavaScript bundler) and build native Android code, run:

```bash
npm run android
```

The first time this command is run, it will compile the native Android code
into the `android` directory. If you later change configuration in e.g.
`app.json` and need to recompile, run:

```bash
npx expo prebuild --clean
```

It is recommended to use Expo config plugins to customize the generated native
code, and keep the generated files in .gitignore. (As compared to manually
editing the generated code.) Currently we are using such a plugin from
react-native-ble-plx, to manage the user permissions for Bluetooth.

## Adding Dependencies

Prefer installing dependencies using expo instead of npm or yarn, as expo will
try to ensure that compatible versions are installed.

```bash
npx expo install package-name
```

Check for any issues with the expo setup (including dependencies):

```bash
npx expo-doctor
```
