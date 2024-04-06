import {gql} from '@apollo/client';

export const QUERY_TASK = gql`
    query GetTask($id: ID!) {
        task(id: $id) {
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            isActive
            hasEvent
            periodType
            periodTypeTime
            periodTypeWeekDays
            periodTypeMonthDays
            periodTypeMonths
            category {
                name
                slug
                label
            }
        }
    }
`;

export const TASK_CATEGORIES_ALL = gql`
    query GetCategoryAll($name: String) {
        taskCategoriesAll(name: $name) {
            name
            slug
        }
    }
`;

export const TASK_CATEGORIES_WITH_TASKS = gql`
    query GetTaskCategoryWithTasks {
        taskCategoriesWithTasks(orderBy: [{ column: "name", order: ASC }]) {
            name
            slug
        }
    }
`;
export const UPDATE_TASK = gql`
    mutation UpdateTask(
        $id: ID!
        $name: String!
        $description: String
        $categoryName: String
        $periodType: String
        $periodTypeTime: String
        $periodTypeWeekDays: [String]
        $periodTypeMonthDays: [String]
        $periodTypeMonths: [String]
        $isActive: Boolean
    ) {
        updateTask(
            id: $id
            name: $name
            description: $description
            categoryName: $categoryName
            periodType: $periodType
            periodTypeTime: $periodTypeTime
            periodTypeWeekDays: $periodTypeWeekDays
            periodTypeMonthDays: $periodTypeMonthDays
            periodTypeMonths: $periodTypeMonths
            isActive: $isActive
        ) {
            id
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            isActive
        }
    }
`;

export const CREATE_TASK = gql`
    mutation CreateTask(
        $name: String!
        $description: String
        $categoryName: String
        $periodType: String
        $periodTypeTime: String
        $periodTypeWeekDays: [String]
        $periodTypeMonthDays: [String]
        $periodTypeMonths: [String]
        $isActive: Boolean
    ) {
        createTask(
            name: $name
            description: $description
            categoryName: $categoryName
            periodType: $periodType
            periodTypeTime: $periodTypeTime
            periodTypeWeekDays: $periodTypeWeekDays
            periodTypeMonthDays: $periodTypeMonthDays
            periodTypeMonths: $periodTypeMonths
            isActive: $isActive
        ) {
            id
            name
            description
            startDateTime
            stopDateTime
            nextRunDateTime
            isActive
        }
    }
`;

export const DELETE_TASK = gql`
    mutation DeleteTask($id: ID!) {
        deleteTask(id: $id) {
            result
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
            isActive
        }
        taskHistory(taskId: $id, orderBy: [{ column: "id", order: DESC }]) {
            notes
            created_at
        }
    }
`;

export const GET_TASKS = gql`
    query GetTasks($recordsPerPage: Int, $currentPage: Int, $search: String, $filter: TaskFiltersList) {
        tasks(
            search: $search,
            filter: $filter,
            first: $recordsPerPage
            page: $currentPage
            orderBy: [
                { column: "isActive", order: DESC }
                { column: "nextRunDateTime", order: ASC }
            ]
        ) {
            data {
                id
                name
                description
                startDateTime
                stopDateTime
                nextRunDateTime
                hasEvent
                isActive
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

export const CREATE_USER_DEVICE = gql`
    mutation CreateUserDevice(
        $deviceId: String
        $platform: String
        $manufacturer: String
        $model: String
        $appVersion: String
        $notificationToken: String
    ) {
        createUserDevice(
            deviceId: $deviceId
            platform: $platform
            manufacturer: $manufacturer
            model: $model
            appVersion: $appVersion
            notificationToken: $notificationToken
        ) {
            deviceId
            platform
            manufacturer
            model
            appVersion
            notificationToken
            updated_at
        }
    }
`;

export const CREATE_USER_FROM_DEVICE = gql`
    mutation CreateUserFromDevice($deviceId: String!, $manufacturer: String!, $model: String!, $timezoneOffset: Int) {
        createUserFromDevice(
            deviceId: $deviceId
            manufacturer: $manufacturer
            model: $model
            timezoneOffset: $timezoneOffset
        ) {
            user {
                name
            }
            token
        }
    }
`;

export const LOGIN = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            user {
                name
                timezoneOffset
            }
            token
        }
    }
`;
export const USER_REGISTRATION = gql`
    mutation UserRegistration(
        $name: String!
        $email: String!
        $password: String!
        $password_confirmation: String!
    ) {
        userRegistration(
            name: $name
            email: $email
            password: $password
            password_confirmation: $password_confirmation
        ) {
            user {
                name
                timezoneOffset
            }
            token
        }
    }
`;

export const LOGOUT = gql`
    mutation logout($deviceId: String) {
        logout(deviceId: $deviceId) {
            result
        }
    }
`;

export const CURRENT_USER = gql`
    query CurrentUser {
        currentUser {
            name
            timezoneOffset
        }
    }
`;

export const UPDATE_PROFILE = gql`
    mutation UpdateProfile(
        $name: String
    ) {
        updateProfile(
            name: $name
        ) {
            name
            timezoneOffset
        }
    }
`;
export const UPDATE_USER_TIMEZONE = gql`
    mutation UpdateUserTimezone($timezoneOffset: Int!) {
        updateUserTimezone(timezoneOffset: $timezoneOffset) {
            name
            timezoneOffset
        }
    }
`;

export const CREATE_MISSED_LANGUAGE = gql`
    mutation CreateMissedLanguage(
        $language: String
        $text: String
        $url: String
    ) {
        createMissedLanguage(language: $language, text: $text, url: $url) {
            result
        }
    }
`;
