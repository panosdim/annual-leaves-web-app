export function toMySQLDate(date) {
    if (date != null) {
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }
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

export function isBankHoliday(day, month, year) {
    let easter = getOrthodoxEaster(year);
    let cleanMonday = new Date(easter);
    cleanMonday.setDate(cleanMonday.getDate() - 48);
    let goodFriday = new Date(easter);
    goodFriday.setDate(goodFriday.getDate() - 2);
    let easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);
    let whitMonday = new Date(easter);
    whitMonday.setDate(whitMonday.getDate() + 50);
    if (day === 1 && month === 0) return true;
    if (day === 6 && month === 0) return true;
    if (day === 25 && month ===2) return true;
    if (day === 1 && month === 4) return true;
    if (day === 15 && month === 7) return true;
    if (day === 28 && month === 9) return true;
    if (day === 25 && month === 11) return true;
    if (day === 26 && month === 11) return true;
    if (day === easter.getDate() && month === easter.getMonth()) return true;
    if (day === cleanMonday.getDate() && month === cleanMonday.getMonth()) return true;
    if (day === goodFriday.getDate() && month === goodFriday.getMonth()) return true;
    if (day === easterMonday.getDate() && month === easterMonday.getMonth()) return true;
    return day === whitMonday.getDate() && month === whitMonday.getMonth();
}

function getOrthodoxEaster(year) {
    let oed = new Date();

    let r1 = year % 4;
    let r2 = year % 7;
    let r3 = year % 19;
    let r4 = (19 * r3 + 15) % 30;
    let r5 = (2 * r1 + 4 * r2 + 6 * r4 + 6) % 7;
    let days = r5 + r4 + 13;

    if (days > 39) {
        days = days - 39;
        oed.setFullYear(year, 4, days);
        oed.setHours(0,0,0);
    } else if (days > 9) {
        days = days - 9;
        oed.setFullYear(year, 3, days);
        oed.setHours(0,0,0);
    } else {
        days = days + 22;
        oed.setFullYear(year, 2, days);
        oed.setHours(0,0,0);
    }
    return oed;
}
