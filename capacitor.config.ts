import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.hutsoliak.scheduler_app',
    appName: 'Monthly tasks',
    webDir: 'build',
    plugins: {
        SplashScreen: {
            launchAutoHide: false,
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        }
    }
};

export default config;
