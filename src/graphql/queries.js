import { gql } from "@apollo/client";

export const QUERY_TASK = gql`
    query GetTask($id: ID!) {
        task(id: $id) {
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            user {
                name
            }
            hasEvent
        }
    }
`;
export const UPDATE_TASK = gql`
    mutation UpdateTask($id: ID!, $name: String!, $description: String) {
        updateTask(id: $id, name: $name, description: $description) {
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            user {
                name
            }
            hasEvent
        }
    }
`;
export const CREATE_TASK = gql`
    mutation CreateTask($name: String!, $description: String) {
        createTask(name: $name, description: $description) {
            id
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            user {
                name
            }
            hasEvent
        }
    }
`;

export const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            user {
                id
                name
                email
            }
            token
        }
    }
`;

export const LOGOUT = gql`
    mutation Logout {
        logout {
            user {
                id
                name
                email
            }
        }
    }
`;

export const CURRENT_USER = gql`
    query CurrentUser {
        currentUser {
            id
            name
            email
        }
    }
`;

export const UPDATE_PROFILE = gql`
    mutation UpdateProfile($id: ID!, $email: String!, $name: String!) {
        updateProfile(id: $id, email: $email, name: $name) {
            id
            name
            email
        }
    }
`;

export const GET_TASKS = gql`
    query GetTasks($recordsPerPage: Int, $currentPage: Int) {
        tasks(first: $recordsPerPage, page: $currentPage) {
            data {
                id
                name
                description
                startDateTime
                stopDateTime
                nextRunDateTime
                user {
                    name
                }
                hasEvent
            }
            paginatorInfo {
                # hasMorePages
                # count
                # total
                # currentPage
                # perPage

                count
                currentPage
                firstItem
                hasMorePages
                lastItem
                lastPage
                perPage
                total
            }
        }
    }
`;
