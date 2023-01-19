import { createContext, Dispatch, SetStateAction } from 'react';

export type UserDeviceType = {
    deviceId?: string;
    platform?: string;
    manufacturer?: string;
    model?: string;
    name?: string;
    appVersion?: string;
    notificationToken?: string;
    locale?: string;
    updated_at?: string;
};
type UserDeviceContextType = {
    userDevice: UserDeviceType | null;
    setUserDevice: Dispatch<SetStateAction<UserDeviceType | null>>;
}
export const UserDeviceContext = createContext({} as UserDeviceContextType);
