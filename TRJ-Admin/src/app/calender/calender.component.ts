import {Component, OnInit} from '@angular/core';
import {CalendarOptions, DatePointApi} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {DATE_RANGE, UTC, INCLUDE_DAY_RANGE, fromString, config, DAYS, fromNumber} from "./util";

enum STATE {
    OPEN,
    CLOSED
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
    calendarOptions: CalendarOptions = {
        timeZone: "UTC",
        initialView: "dayGridMonth",
        showNonCurrentDates: false,
        dateClick: this.handleDateClick.bind(this),
        events: [],
        displayEventTime: false,
        plugins: [dayGridPlugin, interactionPlugin],
        datesSet: (arg) => {
            this.currentMonth = arg.start.getUTCMonth()+1;
            this.currentYear = arg.start.getUTCFullYear();
            let dd = document.getElementsByClassName("fc-day");
            for (let i=0; i<7; i++){
                // @ts-ignore
                let element = dd.item(i).firstChild;
                // @ts-ignore
                let type = fromString(element.firstChild["ariaLabel"].toString());
                // @ts-ignore
                element.addEventListener("click",
                    () => {
                        let days: Array<Date> = INCLUDE_DAY_RANGE(type, this.currentMonth, this.currentYear);
                        days.forEach(value => {
                            if ((!this.Dates.has(value.toString())) || (this.Dates.get(value.toString()) === STATE.OPEN)){
                                this.Dates.set(value.toString(), STATE.CLOSED);
                                this.addClosure(UTC(value.toString()));
                            }
                            else {
                                this.Dates.set(value.toString(), STATE.OPEN);
                                this.removeClosure(UTC(value.toString()));
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
