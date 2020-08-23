import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";
import {BehaviorSubject, Observable} from "rxjs";
import {TimeSlot} from "../models/time-slot";
import {AuthService} from "./auth.service";
import {User} from "../models/user";
import * as moment from "moment-timezone";
import {map, take} from "rxjs/operators";
import {AngularFireDatabase, AngularFireList, AngularFireObject} from "@angular/fire/database";

@Injectable({
  providedIn: 'root'
})
export class TimeSlotService {

  private currentTimeSlotObj: AngularFireObject<TimeSlot>;
  private timeSlotsList: AngularFireList<TimeSlot>;
  public $currentTimeSlot: BehaviorSubject<TimeSlot> = new BehaviorSubject<TimeSlot>(null);

  constructor(public db: AngularFireDatabase, private auth: AuthService) {
    this.currentTimeSlotObj = this.db.object<TimeSlot>('/users/' + this.auth.uid + '/currentTimeSlot');
    this.timeSlotsList = this.db.list<TimeSlot>('/timeSlots/' + this.auth.uid);
    this.currentTimeSlotObj.valueChanges().subscribe(v => this.$currentTimeSlot.next(v));
  }

  public startNewSlot() {
    this.currentTimeSlotObj.set({
      endTime: null,
      exported: false,
      startTime: moment().tz("Europe/Zurich").format('YYYY-MM-DDTHH:mm'),
      text: this.auth.$dbUser.value.stdText
    });
  }

  updateCurrentText(event) {
    this.currentTimeSlotObj.update({
      text: event.target.value
    });
  }

  stopTimeSlot(): Observable<TimeSlot> {
    return this.currentTimeSlotObj.valueChanges().pipe(
      take(1),
      map(t => {
        console.log('currentTimeSlot', t);
        // endTime dem currentTimeSlot hinzufügen
        t = {...t, endTime: moment().tz("Europe/Zurich").format('YYYY-MM-DDTHH:mm')};

        this.timeSlotsList.push(t);
        this.currentTimeSlotObj.remove();

        return t;
      })
    )
  }
}
