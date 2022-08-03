type Prop = {
    position?: 'position-absolute' | 'position-relative';
};
export default function Loading(props: Prop) {
    return (
        <div
            className={
                'd-flex align-items-center justify-content-center h-100 w-100 mt-5 mb-5 ' +
                (props.hasOwnProperty('position')
                    ? props.position
                    : 'position-relative')
            }
        >
            <div className="spinner-border" role="status"></div>
        </div>
    );
}
