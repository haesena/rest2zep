import {Component, OnInit, ViewChild} from '@angular/core';
import {TimeSlotService} from "../../global/time-slot.service";
import {TimeSlot} from "../../models/time-slot";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {AuthService} from "../../global/auth.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;
  currentTimeSlot: TimeSlot = new TimeSlot();

  pageSize = 5;

  constructor(public time: TimeSlotService, public auth: AuthService, private _snackBar: MatSnackBar) {
    this.time.$currentTimeSlot.subscribe(t => this.currentTimeSlot = t);
    this.time.$countTimeSlots.subscribe(v => {
      // If the length changed, show the list from begin, because else the pagination keys will be mixed up
      this.time.filterParams$.next({pageSize: this.pageSize, length: v, pageIndex: 0});
      if(this.paginator) {
        this.paginator.firstPage();
      }
    });
  }

  ngOnInit(): void {
  }

  stop() {
    this.time.stopTimeSlot()
      .subscribe((t: TimeSlot) => {
        console.log(t);
        const message = "Saved timeslot from " + t.startTime.substr(11, 5) + " to " + t.endTime.substr(11, 5) + "!";
        this._snackBar.open(message, 'OK', {
          duration: 5000,
        });
      });
  }

  paginate($event: PageEvent) {
    if($event.pageSize !== this.pageSize) {
      this.paginator.firstPage();
      this.time.filterParams$.next({...$event, pageSize: $event.pageSize, pageIndex: 0});
    } else {
      this.time.filterParams$.next($event);
    }

    this.pageSize = $event.pageSize;
  }
}
