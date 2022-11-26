import React from 'react';
import DarkGreenTheme from './themes/DarkGreenTheme';
import DefaultTheme from './themes/DefaultTheme';

type Props = {
    children: React.ReactNode;
};
export default function MainLayout(props: Props) {
    return <DefaultTheme>{props.children}</DefaultTheme>;
}
