
enum DAYS {
    SUNDAYS ,
    MONDAYS  ,
    TUESDAYS    ,
    WEDNESDAYS  ,
    THURSDAYS   ,
    FRIDAYS     ,
    SATURDAYS
}

const fromNumber = (number: number): DAYS|null => {
    if (number === 0){
        return DAYS.SUNDAYS
    } else if (number === 1){
        return DAYS.MONDAYS
    } else if (number === 2){
        return DAYS.TUESDAYS
    } else if (number === 3){
        return DAYS.WEDNESDAYS
    } else if (number === 4){
        return DAYS.THURSDAYS
    } else if (number === 5){
        return DAYS.FRIDAYS
    } else if (number === 6){
        return DAYS.SATURDAYS
    } else {
        return null;
    }
}

const fromString = (string: string): DAYS|null => {

    string = string.toLowerCase();
    if (string === "sunday") {
        return DAYS.SUNDAYS;
    } else if (string === "monday") {
        return DAYS.MONDAYS;
    } else if (string === "tuesday") {
        return DAYS.TUESDAYS;
    } else if (string === "wednesday") {
        return DAYS.WEDNESDAYS;
    } else if (string === "thursday") {
        return DAYS.THURSDAYS;
    } else if (string === "friday") {
        return DAYS.FRIDAYS;
    } else if (string === "saturday"){
        return DAYS.SATURDAYS;
    } else {
        return null;
    }
}

const YEAR = (year: number) => {

    let dates: Array<Date> = [];
    for (let month = 1; month <= 12; month++){ dates.push(...MONTH(month, year)); }

    return dates;
}

const MONTH = (month: number|null, year: number|null) => {

    if ((month === null) || (year === null)) {
        return [];
    }

    let days: number = new Date(Date.UTC(year, month-1, 0)).getDate();
    let dates: Array<Date> = [];

    for (let day = 1; day <= days; day++){

        dates.push(new Date(Date.UTC(year, month-1, day)));
    }

    return dates;
}

const DAYS_BY_MONTH = (day_type: DAYS, month: number, year: number) => {

    let in_dates: Array<Date> = MONTH(month, year);
    let out_dates: Array<Date> = [];

    in_dates.forEach((date) => {

        if (date.getDay()-1 === day_type){

            out_dates.push(date);
        }
    });

    return out_dates;
}

const DAYS_BY_YEAR = (day_type: DAYS, year: number) => {

    let in_dates: Array<Date> = YEAR(year);
    let out_dates: Array<Date> = [];

    in_dates.forEach((date, index) => {

        if (date.getDay() === day_type){

            out_dates.push(in_dates[index]);
        }
    });

    return out_dates;
}

interface dateOBJ {
    year: number,
    month: number,
    day: number
}

const EXCLUDE_DATE_RANGE = (params: Array<dateOBJ>, month: number, year: number) => {

    // params is a Array<obj>(2) with obj as { year:number, month:number, day:number }

    let [from, to] = params.map((d) => new Date(Date.UTC(d.year, d.month-1, d.day)));
    let in_dates: Array<Date> = MONTH(month, year);
    let out_dates: Array<Date> = [];

    in_dates.forEach((date, index) => {

        if ((date < from) || (date > to)){

            out_dates.push(date);
        }
    });

    return out_dates
}

const EXCLUDE_DAY_RANGE = (day_type: DAYS, month: number, year: number) => {

    let in_dates: Array<Date> = MONTH(month, year);
    let out_dates: Array<Date> = []

    in_dates.forEach((date, index) => {

        if (date.getDay() !== day_type) {

            out_dates.push(date);
        }
    });

    return out_dates;
}

const INCLUDE_DATE_RANGE = (params: Array<dateOBJ>, month: number, year: number) => {

    // params is a Array<obj>(2) with obj as { year:number, month:number, day:number }

    let [from, to] = params.map((d) => new Date(Date.UTC(d.year, d.month-1, d.day)));
    let in_dates: Array<Date> = MONTH(month, year);
    let out_dates: Array<Date> = []

    in_dates.forEach((date, index) => {

        if ((date >= from) && (date <= to)){

            out_dates.push(date);
        }
    });

    return out_dates;
}

const INCLUDE_DAY_RANGE = (day_type: DAYS | null, month: number | null, year: number | null) => {

    let in_dates: Array<Date> = MONTH(month, year);
    let out_dates: Array<Date> = []

    in_dates.forEach((date, index) => {

        if (date.getDay() === day_type) {

            out_dates.push(date);
        }
    });

    return out_dates;
}

const INCLUDE_DAY_BY_INPUT = (day_type: DAYS|null, in_dates: Array<Date>) => {

    if (day_type === null){
        return in_dates;
    }

    let out_dates: Array<Date> = []
    in_dates.forEach((date) => {

        if (date.getDay() === day_type) {

            out_dates.push(date);
        }
    });

    return out_dates;
}

const IN = (date: Date, range: Array<Date>) => {

    let set = new Set();
    range.forEach(date => set.add(date.toLocaleDateString()));

    return set.has(date.toLocaleDateString());
}

const EXCLUDE_RANGE = (superset: Array<Date>, exclude: Array<Date>) => {

    let out_dates: Array<Date> = [];
    superset.forEach(date => {

        if (!IN(date, exclude)){ out_dates.push(date); }
    });

    return out_dates;
}

const DATE_RANGE = (from: Date, to: Date) => {

    let out_dates = [];
    let current = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0));

    while (current <= to){

        out_dates.push(new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())));
        current.setDate(current.getDate() + 1);
    }

    return out_dates;
}

const UTC = (string: string) => {

    let raw_date = new Date(string);
    return new Date(Date.UTC(raw_date.getFullYear(), raw_date.getMonth(), raw_date.getDate(),
                    raw_date.getHours(), raw_date.getMinutes(), raw_date.getSeconds(), raw_date.getMilliseconds()));
}

const DATE_START = (dd: Date) => {
    return new Date(dd.getFullYear(), dd.getMonth(), dd.getDate(), 0, 0, 0, 0);
}

const DATE_RANGE_FROM_STRING = (from: string, to: string) => {

    return DATE_RANGE( new Date(from), new Date(to) );
}

const dates = {
    "close":

        [
            ["01-jan-2023", "15-mar-2023"],
            "17-mar-2023", "29-mar-2023",
            ["01-aug-2023", "01-sep-2023"],
            "23-sep-2023",
            "01-nov-2023",
            "sunday",
            "saturday"
        ],

    "exceptionalopen":

        [
            "05-jan-2023",
            "07-jan-2023",
            "17-jun-2023"
        ]
}

const resolve = (year: Array<Date>, config: any) => {

    // needs optimisation: huge space cost

    let closed: Array<Date> = [];
    let c_set = new Set();
    config["close"].forEach((data: any) => {

        if (data.constructor === Array){

            let range: Array<Date> = DATE_RANGE(UTC(data[0]), UTC(data[1]));
            closed.push(...range);
        }

        else {

            if (/\d/.test(data)){ closed.push(UTC(data)); }

            else { closed.push(...INCLUDE_DAY_BY_INPUT(fromString(data), year)); }
        }
    });

    let closed_str: Array<string> = closed.map(dd => dd.toString());
    closed_str.forEach(dstr => c_set.add(dstr));

    let open: Array<Date> = []
    config["exceptionalopen"].forEach((data: any) => {

        if (data.constructor === Array){
            let range: Array<Date> = DATE_RANGE(UTC(data[0]), UTC(data[1]));
            open.push(...range);
        }
        else if (/\d/.test(data)) {
            open.push(UTC(data));
        }
        else {
            open.push(...INCLUDE_DAY_BY_INPUT(fromString(data), year));
        }
    });

    let open_str: Array<string> = open.map((dd) => dd.toString());
    open_str.forEach((dstr) => c_set.delete(dstr));

    return c_set;
}

const config = {

    // 100 => sunday ... 106 => saturday

    "openClosing": [{
        "year": 2023,
        "values": [
            {
                "month": 6,
                "closing": [
                    100,
                    101,
                    [1, 15],
                    [17, 20],
                ],
                "exceptionalOpen": [
                    9,
                    23,
                    7,
                    11
                ]
            },
            {
                "month": 7,
                "closing": [
                    100,
                    101,
                    [1, 15],
                    [17, 20]
                ],
                "exceptionalOpen": [
                    9,
                    23,
                    7,
                    11
                ]
            }
        ]
    }]
}

export {DATE_RANGE, UTC, DAYS, fromString, INCLUDE_DAY_RANGE, config, fromNumber};
