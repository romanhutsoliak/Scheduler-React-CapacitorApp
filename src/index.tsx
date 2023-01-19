import ReactDOM from 'react-dom/client';
import App from './App';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider,
    createHttpLink,
    from,
    ErrorPolicy,
    FetchPolicy,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { Capacitor } from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
} from '@capacitor/push-notifications';
// import reportWebVitals from "./reportWebVitals";

const defaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache' as FetchPolicy,
        errorPolicy: 'all' as ErrorPolicy,
    },
    query: {
        fetchPolicy: 'no-cache' as FetchPolicy,
        errorPolicy: 'all' as ErrorPolicy,
    },
};
const httpLink = createHttpLink({
    uri: process.env.REACT_APP_SERVER_GRAPHQL_URL,
});
const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem(
        process.env.REACT_APP_LOCAL_STORAGE_PREFIX + 'token'
    );
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            if (message === 'Unauthenticated.') {
                window.location.replace('/login');
            }
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        });
    }

    if (networkError) {
        console.log(`[Network error]: ${networkError}`);

        // Show Toast component
        window.setTimeout(function () {
            const toastCont = document.querySelector<HTMLElement>('.toast');
            if (toastCont) {
                toastCont.classList.add('toastError', 'show');
                const toastBody =
                    toastCont.querySelector<HTMLElement>('.toast-body');
                if (toastBody) {
                    toastBody.textContent =
                        'Network error. Check your internet connection and try again';
                }
                window.setTimeout(function () {
                    toastCont.classList.remove('toastError', 'show');
                }, 10000);
            }
        }, 100);
    }
});
const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
});

// Push notifications
// --------------------------------------------------
const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
if (isPushNotificationsAvailable) {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then(result => {
    if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
    } else {
        // Show some error
    }
    });
    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
        (error: any) => {
            alert('Error on registration: ' + JSON.stringify(error));
        }
    );
    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
        (notification: PushNotificationSchema) => {
            // it just redirects, maybe need some modal with additional information
            // alert();
            let redirectTo = notification.data.redirectTo ?? null;
            if (redirectTo)
                window.location.href = redirectTo;
        }
    );
    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
        (notification: ActionPerformed) => {
            let redirectTo = notification.notification.data.redirectTo ?? null;
            if (redirectTo)
                window.location.href = redirectTo;
        }
    );
}   
declare global {
    interface Window {
        appStartTimestamp: number | undefined;
    }
}
window.appStartTimestamp = Date.now();

// <React.StrictMode>
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
