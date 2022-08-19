import { gql } from '@apollo/client';

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
            periodType
            periodTypeTime
            periodTypeWeekDays
            periodTypeMonthDays
            periodTypeMonths
        }
    }
`;
export const UPDATE_TASK = gql`
    mutation UpdateTask(
        $id: ID!
        $name: String!
        $description: String
        $periodType: String
        $periodTypeTime: String
        $periodTypeWeekDays: [String]
        $periodTypeMonthDays: [String]
        $periodTypeMonths: [String]
    ) {
        updateTask(
            id: $id
            name: $name
            description: $description
            periodType: $periodType
            periodTypeTime: $periodTypeTime
            periodTypeWeekDays: $periodTypeWeekDays
            periodTypeMonthDays: $periodTypeMonthDays
            periodTypeMonths: $periodTypeMonths
        ) {
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

export const CREATE_TASK = gql`
    mutation CreateTask(
        $name: String!
        $description: String
        $periodType: String
        $periodTypeTime: String
        $periodTypeWeekDays: [String]
        $periodTypeMonthDays: [String]
        $periodTypeMonths: [String]
    ) {
        createTask(
            name: $name
            description: $description
            periodType: $periodType
            periodTypeTime: $periodTypeTime
            periodTypeWeekDays: $periodTypeWeekDays
            periodTypeMonthDays: $periodTypeMonthDays
            periodTypeMonths: $periodTypeMonths
        ) {
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

export const COMPLETE_TASK = gql`
    mutation CompleteTask($id: ID!, $notes: String) {
        completeTask(id: $id, notes: $notes) {
            id
        }
    }
`;

export const QUERY_TASK_WITH_HISTORY = gql`
    query GetTaskWithHistory($id: ID!) {
        task(id: $id) {
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            hasEvent
            periodType
            periodTypeTime
            periodTypeWeekDays
            periodTypeMonthDays
            periodTypeMonths
        }
        taskHistory(taskId: $id, orderBy: [{ column: "id", order: DESC }]) {
            notes
            created_at
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
        tasks(
            first: $recordsPerPage
            page: $currentPage
            orderBy: [{ column: "nextRunDateTime", order: ASC }]
        ) {
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
