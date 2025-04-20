# Scheduler mobile application: React with Typescript compiled by Ionic Capacitor

## Deployment
npm install

## Run locally
npm run start

### Run on a different port
For Linux/Mac it will be

```
"scripts": {
    "start": "PORT=3003 react-scripts start",
    ...
},
```

For Windows it will be
```
"scripts": {
    "start": "set PORT=3003 && react-scripts start",
    ...
},
```

## Compile app Android
npm run build:a


## Capacitor version upgrade
https://capacitorjs.com/docs/updating/7-0

## Update app version
 - Android - android/app/build.gradle (you're looking for the versionName variable)
 - iOS - ios/App/App/Info.plist *(you're looking for the CFBundleShortVersionString key)
