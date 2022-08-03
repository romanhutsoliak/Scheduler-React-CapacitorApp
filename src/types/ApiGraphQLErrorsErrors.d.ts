export type ApiGraphQLValidationError = {
    extensions?: {
        category: string;
        validation: {
            [k: string]: [string];
        };
    };
    locations?: {};
    path?: {};
    trace?: {};
    message: string;
};
export type ApiLValidationError = {
    graphQLErrors?: {
        extensions?: {
            category: string;
            validation: {
                [k: string]: [string];
            };
        };
        locations?: {};
        path?: {};
        trace?: {};
        message: string;
    };
    message: string;
};
