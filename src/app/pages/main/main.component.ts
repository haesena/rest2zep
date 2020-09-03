import {Component, OnInit, ViewChild} from '@angular/core';
import {TimeSlotService} from "../../global/time-slot.service";
import {TimeSlot} from "../../models/time-slot";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {AuthService} from "../../global/auth.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public user: User = new User();

  @ViewChild('paginator') paginator: MatPaginator;
  currentTimeSlot: TimeSlot = new TimeSlot();

  pageSize = 5;

  public vorgang: string[];

  constructor(public time: TimeSlotService, public auth: AuthService, private _snackBar: MatSnackBar) {
    this.time.$currentTimeSlot.subscribe(t => this.currentTimeSlot = t);
    this.time.$countTimeSlots.subscribe(v => {
      // If the length changed, show the list from begin, because else the pagination keys will be mixed up
      this.time.filterParams$.next({pageSize: this.pageSize, length: v, pageIndex: 0});
      if(this.paginator) {
        this.paginator.firstPage();
      }
    });
    this.auth.$dbUser.subscribe(u => {
      this.user = u ?? this.user;
      if(this.user.zepProjekte) {
        this.vorgang = u.zepProjekte.filter(p => p.name === u.stdZepProjekt)[0].vorgang;
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
