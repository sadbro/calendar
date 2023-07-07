import {Component, OnInit} from '@angular/core';
import {CalendarOptions, DatePointApi} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {DATE_RANGE, UTC, INCLUDE_DAY_RANGE, fromString, config, DAYS, fromNumber} from "./util";

enum STATE {
    OPEN,
    CLOSED
}

interface configMonth {
    "month": number,
    "closing": Array<number|Array<number>>
    "exceptionalOpen": Array<number|Array<number>>
}

interface config {
    "year": number,
    "values": Array<configMonth>
}

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss']
})
export class CalenderComponent implements OnInit {
    Dates = new Map<string, STATE>();
    rangeDates = new Array<Date>();
    isRangeSelection: boolean = false;
    beEvents: Array<any> = [];
    currentMonth: number|null = null;
    currentYear: number|null = null;
    weird_count: number = 0;
    calendarOptions: CalendarOptions = {
        timeZone: "UTC",
        initialView: "dayGridMonth",
        showNonCurrentDates: false,
        dateClick: this.handleDateClick.bind(this),
        events: [],
        displayEventTime: false,
        plugins: [dayGridPlugin, interactionPlugin],
        datesSet: (arg) => {
            this.weird_count += 1;
            this.currentMonth = arg.start.getUTCMonth()+1;
            this.currentYear = arg.start.getUTCFullYear();
            let dd = document.getElementsByClassName("fc-day");
            for (let i=0; i<7; i++){
                // @ts-ignore
                let element = dd.item(i).firstChild;
                // @ts-ignore
                let type = fromString(element.firstChild["ariaLabel"].toString());
                // @ts-ignore
                (this.weird_count === 1) && element.addEventListener("click",
                    () => {
                        let days: Array<Date> = INCLUDE_DAY_RANGE(type, this.currentMonth, this.currentYear);
                        element && console.log(element);
                        days.forEach((value) => {
                            if ((!this.Dates.has(value.toString())) || (this.Dates.get(value.toString()) === STATE.OPEN)){
                                this.Dates.set(value.toString(), STATE.CLOSED);
                                this.addClosure(UTC(value.toString()));
                            } else if (this.Dates.get(value.toString()) === STATE.CLOSED) {
                                this.Dates.set(value.toString(), STATE.OPEN);
                                this.removeClosure(UTC(value.toString()));
                            } else {
                                this.Dates.set(value.toString(), STATE.CLOSED);
                                this.addClosure(UTC(value.toString()));
                            }
                        });
                        this.calendarOptions.events = [...this.beEvents];
                    }
                )
            }
        }
    }
    constructor() {}
    ngOnInit(): void {}

    addClosure(_start: Date){
        this.beEvents.forEach(value => {
            if (value.id === _start.toString()){
                return;
            }
        });
        this.beEvents.push({title: "Closed", start: _start, color: "#ff0000", id: _start.toString()});
    }
    removeClosure(_start: Date){
        let newEvents: Array<any> = [];
        this.beEvents.forEach(value => {
            if (value.id !== _start.toString()){
                newEvents.push(value);
            }
        })
        this.beEvents = newEvents;
    }
    range(): void {
        this.isRangeSelection = !this.isRangeSelection
    }
    log(): void {
        this.Dates.forEach((value, key) => {
            console.log(key + " : " + value.toString());
        });
    }
    stateDivByDayType(day_type: DAYS|null, month: number, year: number, state: STATE): void {
        let dd = document.getElementsByClassName("fc-day");
        for (let i=0; i<7; i++){
            // @ts-ignore
            let element = dd.item(i).firstChild;
            // @ts-ignore
            let type = fromString(element.firstChild["ariaLabel"].toString());
            if (type === day_type){
                let days: Array<Date> = INCLUDE_DAY_RANGE(type, month+1, year);
                days.forEach(value => {
                    this.Dates.set(value.toString(), state);
                });
            }
        }
    }

    setConfig(): void {
        config.openClosing.forEach(data => {
            let currentYear = data.year;
            data.values.forEach(section => {
                let currentMonth = section.month - 1;
                section.closing.forEach((type: any) => {
                    if (type.constructor === Array){
                        let [from_date, to_date] = type;
                        let from = new Date(Date.UTC(currentYear, currentMonth, from_date));
                        let to = new Date(Date.UTC(currentYear, currentMonth, to_date));
                        DATE_RANGE(from, to).forEach(date => {
                            this.Dates.set(date.toString(), STATE.CLOSED);
                        });
                    } else if (typeof type === "number"){
                        if (type >= 100){
                            this.stateDivByDayType(fromNumber(type-100), currentMonth, currentYear, STATE.CLOSED);
                        }
                        else {
                            let date = new Date(Date.UTC(currentYear, currentMonth, type))
                            this.Dates.set(date.toString(), STATE.CLOSED);
                        }
                    }
                });
                section.exceptionalOpen.forEach((type: any) => {
                    if (type.constructor === Array){
                        let [from_date, to_date] = type;
                        let from = new Date(Date.UTC(currentYear, currentMonth, from_date));
                        let to = new Date(Date.UTC(currentYear, currentMonth, to_date));
                        DATE_RANGE(from, to).forEach(date => {
                            this.Dates.set(date.toString(), STATE.OPEN);
                        });
                    } else if (typeof type === "number"){
                        if (type >= 100){
                            this.stateDivByDayType(fromNumber(type-100), currentMonth, currentYear, STATE.OPEN);
                        }
                        else {
                            let date = new Date(Date.UTC(currentYear, currentMonth, type))
                            this.Dates.set(date.toString(), STATE.OPEN);
                        }
                    }
                });
            });
        });
        this.Dates.forEach((value, key) => {
            if (value === STATE.CLOSED){
                this.addClosure(UTC(key));
            }
        });
        this.calendarOptions.events = [...this.beEvents];
    }
    generateConfig(): void{
        const config: Array<config> = new Array<config>();
        const years: Set<number> = new Set<number>();
        const months: Set<number> = new Set<number>();

        this.Dates.forEach((value, key) => {years.add(UTC(key).getFullYear());});
        years.forEach((year) => config.push({year:year, values: []}))

        config.forEach((cfg) => {
            let currentYear: number = cfg.year;
            this.Dates.forEach((value, key) => {
                let cDate: Date = UTC(key);
                if (cDate.getFullYear() === currentYear){
                    months.add(cDate.getMonth()+1)
                }
            })
            months.forEach((month) => cfg.values.push({month: month, closing: [], exceptionalOpen: []}))
            cfg.values.forEach(value => {
                this.Dates.forEach((st, key) => {

                    let dd = UTC(key);
                    let mm = dd.getMonth()+1;
                    if ((mm === value.month)){
                        if (st === STATE.CLOSED){
                            value.closing.push(dd.getDate())
                        } else {
                            value.exceptionalOpen.push(dd.getDate())
                        }
                    }
                })
            })
            months.clear();
        })
        console.log(config);
    }

    handleDateClick(info: DatePointApi): void {
        if (!this.isRangeSelection) {
            if (this.Dates.get(info.date.toString()) === STATE.CLOSED) {
                this.beEvents = [];
                this.Dates = this.Dates.set(info.date.toString(), STATE.OPEN);
                this.Dates.forEach((value, key) => {
                    if (value === STATE.CLOSED) {
                        this.addClosure(UTC(key));
                    }
                });
                this.calendarOptions.events = [...this.beEvents];
            } else {
                this.Dates = this.Dates.set(info.date.toString(), STATE.CLOSED);
                this.addClosure(UTC(info.date.toString()));
                this.calendarOptions.events = [...this.beEvents];
            }
        }
        else {
            if (this.rangeDates.length === 1){
                let [_start] = this.rangeDates;
                let _end = UTC(info.date.toString())
                let dateRange = DATE_RANGE(_start, _end);
                dateRange.forEach(date => {
                    if ((!this.Dates.has(date.toString())) || (this.Dates.get(date.toString()) === STATE.OPEN)) {
                        this.Dates.set(date.toString(), STATE.CLOSED);
                        this.addClosure(UTC(date.toString()));
                    }
                    else {
                        this.Dates.set(date.toString(), STATE.OPEN);
                        this.removeClosure(UTC(date.toString()));
                    }
                });
                this.calendarOptions.events = [...this.beEvents];
                this.rangeDates = [];
            }
            else {
                this.rangeDates.push(UTC(info.date.toString()));
            }
        }
    }
}
