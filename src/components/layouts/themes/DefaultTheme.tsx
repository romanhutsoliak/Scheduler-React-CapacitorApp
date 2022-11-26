import React from 'react';
import Footer from '../../layoutParts/Footer';
import Header from '../../layoutParts/Header';
import Toasts from '../../layoutParts/Toasts';
import './DefaultTheme.css';

type Props = {
    children: React.ReactNode;
};
export default function DefaultTheme(props: Props) {
    return (
        <>
            <Header />
            <div className="container">{props.children}</div>
            <Toasts />
            <Footer />
        </>
    );
}
