import React from 'react';
import Footer from '../layoutParts/Footer';
import Header from '../layoutParts/Header';
import Toasts from '../layoutParts/Toasts';

type Props = {
    children: React.ReactNode;
};
export default function MainLayout(props: Props) {
    return (
        <>
            <Header />
            <div className="container">{props.children}</div>
            <Footer />
            <Toasts />
        </>
    );
}
