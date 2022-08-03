import Footer from "../layoutParts/Footer";
import React from "react";
import Header from "../layoutParts/Header";

export default function EmptyLayout(props) {
    return (
        <>
            <div className="container">
                <Header />
                {props.children}
            </div>
            <Footer />
        </>
    );
}
