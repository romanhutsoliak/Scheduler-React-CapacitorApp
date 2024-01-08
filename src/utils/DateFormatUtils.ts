export default function DateFormatUtils(
    timeFromDB: string,
    withTimeOffset = true
) {
    const date = new Date(timeFromDB);
    if (withTimeOffset) {
        const offset = new Date().getTimezoneOffset();
        date.setTime(date.getTime() - offset * 60 * 1000);
    }
    return date.toLocaleString(navigator.language, {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}
