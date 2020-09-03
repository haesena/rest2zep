import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from "@angular/fire/firestore";
import {BehaviorSubject, Observable} from "rxjs";
import {TimeSlot} from "../models/time-slot";
import {AuthService} from "./auth.service";
import {User} from "../models/user";
import * as moment from "moment-timezone";
import {map, switchMap, take} from "rxjs/operators";
import {AngularFireDatabase, AngularFireList, AngularFireObject, SnapshotAction} from "@angular/fire/database";
import {PageEvent} from "@angular/material/paginator";
import {DatabaseQuery, DatabaseReference} from "@angular/fire/database/interfaces";

@Injectable({
  providedIn: 'root'
})
export class TimeSlotService {

  private currentTimeSlotObj: AngularFireObject<TimeSlot>;
  private countTimeSlotsObj: AngularFireObject<number>;
  private timeSlotsList: AngularFireList<TimeSlot>;
  public $currentTimeSlot: BehaviorSubject<TimeSlot> = new BehaviorSubject<TimeSlot>(null);
  public $countTimeSlots: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  // Pagination trackers
  private firstOfList: string = null;
  private lastOfList: string = null;

  public $timeSlotList: BehaviorSubject<TimeSlot[]> = new BehaviorSubject<TimeSlot[]>([]);
  public filterParams$: BehaviorSubject<PageEvent> = new BehaviorSubject<PageEvent>({
    length: 0,
    pageIndex: 0,
    previousPageIndex: 0,
    pageSize: 5
  });

  constructor(public db: AngularFireDatabase, private auth: AuthService) {
    this.currentTimeSlotObj = this.db.object<TimeSlot>('/users/' + this.auth.uid + '/currentTimeSlot');
    this.currentTimeSlotObj.valueChanges().subscribe(v => this.$currentTimeSlot.next(v));
    this.countTimeSlotsObj = this.db.object<number>('/users/' + this.auth.uid + '/countTimeSlots');
    this.countTimeSlotsObj.valueChanges().subscribe(v => this.$countTimeSlots.next(v));

    this.timeSlotsList = this.db.list<TimeSlot>('/timeSlots/' + this.auth.uid);

    this.filterParams$.pipe(
      switchMap(filter => {

        let queryFn: ((ref: DatabaseReference) => DatabaseQuery);
        if (filter.pageIndex === 0) {
          // Initial query, get the last 5 elements of the list
          queryFn = ref => ref.orderByKey().limitToLast(filter.pageSize + 1);
        } else if (filter.pageIndex > filter.previousPageIndex) {
          // Forward pagination, get the last 5 elements of the list before the current pagination
          queryFn = ref => ref.orderByKey().endAt(this.firstOfList).limitToLast(filter.pageSize + 1);
        } else {
          // Backward pagination, get the next 5 elements of the list after the current pagination
          queryFn = ref => ref.orderByKey().startAt(this.lastOfList).limitToFirst(filter.pageSize + 1);
        }

        return this.db.list<TimeSlot>('/timeSlots/' + this.auth.uid, queryFn).snapshotChanges()
      }))
      .subscribe((snapshots: SnapshotAction<TimeSlot>[]) => {

        // Save the first and last elements of the current list, for pagination
        this.firstOfList = snapshots[0].key;
        this.lastOfList = snapshots[snapshots.length - 1].key;

        // Reverse the list, since we want to display in descending order, and remove the last element, since this one is only needed for reference for next pagination
        this.$timeSlotList.next(snapshots.map(s => s.payload.val()).reverse().slice(0, this.filterParams$.value.pageSize));
      });
  }

  public startNewSlot() {

    console.log('this.auth.$dbUser.value', this.auth.$dbUser.value);

    this.currentTimeSlotObj.set({
      endTime: null,
      exported: false,
      startTime: moment().tz("Europe/Zurich").format('YYYY-MM-DDTHH:mm'),
      text: this.auth.$dbUser.value.stdText,
      project: this.auth.$dbUser.value.stdZepProjekt,
      vorgang: this.auth.$dbUser.value.stdZepVorgang
    });
  }

  updateCurrentText(event) {
    this.currentTimeSlotObj.update({
      text: event.target.value
    });
  }


  updateCurrentTimeslot(data: Partial<TimeSlot>) {
    this.currentTimeSlotObj.update(data);
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
