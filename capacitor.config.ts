import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.hutsoliak.scheduler_app',
    appName: 'Monthly tasks',
    webDir: 'build',
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
        }
    }
};

export default config;
