import React from 'react';
import Footer from '../../layoutParts/Footer';
import Header from '../../layoutParts/Header';
import Toasts from '../../layoutParts/Toasts';
import './DarkGreenTheme.css';

type Props = {
    children: React.ReactNode;
};
export default function DarkGreenTheme(props: Props) {
    return (
        <div className="darkGreenTheme">
            <div className="main_background_gradient1"></div>
            <div className="main_background_gradient2"></div>
            <div className="darkGreenThemeContent">
                <Header />
                <div className="container">{props.children}</div>
                <Toasts />
            </div>
        </div>
    );
}
