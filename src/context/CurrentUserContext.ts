import { createContext, Dispatch, SetStateAction } from 'react';

export interface CurrentUserI {
    id?: number;
    name: string;
    email: string;
    timezoneOffset: number;
}
interface CurrentUserContextI {
    currentUser: CurrentUserI | null;
    setCurrentUser: Dispatch<SetStateAction<CurrentUserI | null>>;
}
export const CurrentUserContext = createContext({} as CurrentUserContextI);
