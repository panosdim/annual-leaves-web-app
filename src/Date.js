export function toMySQLDate(date) {
    return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
}

export function getYear(date) {
    return date.split('-')[0];
}

export function toDate(dateStr) {
    if (dateStr) {
        let parts = dateStr.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
        return '';
    }
}
