import React from 'react';
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
    uri: 'http://api.scheduler.local/graphql',
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
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) => {
            if (message === 'Unauthenticated.') {
                window.location.replace('/login');
            }
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        });

    if (networkError) console.log(`[Network error]: ${networkError}`);
});
const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
