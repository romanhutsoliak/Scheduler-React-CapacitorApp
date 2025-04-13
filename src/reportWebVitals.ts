import {onCLS, onINP, onLCP} from 'web-vitals';

const reportWebVitals = (onPerfEntry?:any) => {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onLCP(onPerfEntry);
};

export default reportWebVitals;
