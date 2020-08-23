import {Component, OnInit} from '@angular/core';
import {TimeSlotService} from "../../global/time-slot.service";
import {TimeSlot} from "../../models/time-slot";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  currentTimeSlot: TimeSlot = new TimeSlot();
  constructor(public time: TimeSlotService, private _snackBar: MatSnackBar) {
    this.time.$currentTimeSlot.subscribe(t => this.currentTimeSlot = t);
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
}
