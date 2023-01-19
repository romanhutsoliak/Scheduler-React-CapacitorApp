import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hutsoliak.scheduler_app',
  appName: 'Tasks TODO',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
  //   url: "http://192.168.0.102:3003",
  //   cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      // "splashFullScreen": true,
      // "splashImmersive": false
    }
  } 
};

export default config;
