export default function DateFormateUtils(timeFromDB: String): String {
    return timeFromDB.replace(
        /^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)$/g,
        '$3.$2.$1 $4:$5'
    );
}
