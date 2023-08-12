export default function TimeToEventUtils(
    timeFromDB: string,
    t: (text: string) => string
): string {
    let seconds = Math.floor((Date.parse(timeFromDB) - Date.now()) / 1000);

    let eventTineHasPassed = false;
    if (seconds < 0) {
        eventTineHasPassed = true;
    }

    let inTime = '';
    let timeAgo = '';
    if (!eventTineHasPassed) {
        inTime = t('in_time') + ' ';
    } else {
        timeAgo = ' ' + t('time_ago');
    }

    seconds = Math.abs(seconds);

    let interval = seconds / 31536000;
    if (interval > 1) {
        return (
            inTime +
            Math.floor(interval) +
            ' ' +
            t(
                declOfNum(
                    Math.floor(interval),
                    [t('years1'), t('years2'), t('years3')],
                    'years'
                )
            ) +
            timeAgo
        );
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return (
            inTime +
            Math.floor(interval) +
            ' ' +
            t(
                declOfNum(
                    Math.floor(interval),
                    [t('months1'), t('months2'), t('months3')],
                    'months'
                )
            ) +
            timeAgo
        );
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return (
            inTime +
            Math.floor(interval) +
            ' ' +
            t(
                declOfNum(
                    Math.floor(interval),
                    [t('days1'), t('days2'), t('days3')],
                    'days'
                )
            ) +
            timeAgo
        );
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return (
            inTime +
            Math.floor(interval) +
            ' ' +
            t(
                declOfNum(
                    Math.floor(interval),
                    [t('hours1'), t('hours2'), t('hours3')],
                    'hours'
                )
            ) +
            timeAgo
        );
    }
    interval = seconds / 60;
    if (interval > 1) {
        return (
            inTime +
            Math.floor(interval) +
            ' ' +
            t(
                declOfNum(
                    Math.floor(interval),
                    [t('minutes1'), t('minutes2'), t('minutes3')],
                    'minutes'
                )
            ) +
            timeAgo
        );
    }
    return (
        inTime +
        Math.floor(seconds) +
        ' ' +
        t(
            declOfNum(
                Math.floor(interval),
                [t('seconds1'), t('seconds2'), t('seconds3')],
                'seconds'
            )
        ) +
        timeAgo
    );
}

function declOfNum(
    number: number,
    verbArray: string[],
    rootOfVerb: string
): string {
    const cases = [2, 0, 1, 1, 1, 2];
    const verb =
        verbArray[
            number % 100 > 4 && number % 100 < 20
                ? 2
                : cases[number % 10 < 5 ? number % 10 : 5]
            ];

    if (verb) {
        if (verb.indexOf(rootOfVerb) === 0) {
            return rootOfVerb;
        }
        return verb;
    }
    return '';
}
