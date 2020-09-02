import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {auth} from "firebase/app";
import {BehaviorSubject} from "rxjs";
import {take} from "rxjs/operators";
import {User} from "../models/user";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {AngularFireDatabase, AngularFireObject} from "@angular/fire/database";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userObj: AngularFireObject<User>;
  public $authUser: BehaviorSubject<firebase.User> = new BehaviorSubject<firebase.User>(null);
  public $dbUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public uid;

  constructor(public auth: AngularFireAuth, public router: Router, public db: AngularFireDatabase, public readonly afs: AngularFirestore) {
    auth.authState.subscribe(s => this.$authUser.next(s));
    auth.authState.subscribe(u => {
      if (u) {
        this.uid = u.uid;
        this.userObj = this.db.object('users/' + this.uid);
        this.initUser(u.displayName);
        this.userObj.valueChanges().subscribe(u => this.$dbUser.next(u));
        if(localStorage.getItem('rest2zep_redirected_to_login') === 'redirected') {
          localStorage.removeItem('rest2zep_redirected_to_login');
          this.router.navigate(['/main']);
        }
      } else {
        this.uid = null;
        this.$dbUser = null;
        this.userObj = null;
      }
    })
  }

  private initUser(displayName: string) {
    console.log('chacking if user exists in afs');
    this.userObj.valueChanges().pipe(take(1))
      .subscribe(v => {
        console.log('user in afs:', v);
        if(!v) {
          console.log('user does not exist, creating');
          this.userObj.set({
            name: displayName,
            apiToken: this.afs.createId(),
            apiEnabled: false,
            stdText: "Eintrag aus TimeTrackerApp",
            countTimeSlots: 0,
            zepAutoExport: false,
            zepEnabled: false,
            zepToken: "",
            zepUser: ""
          });

          // this.afs.doc('timeSlots/' + this.uid).set({numberOfDocs: 0});
        }
      });
  }

  public logIn() {
    localStorage.setItem('rest2zep_redirected_to_login', 'redirected');
    this.auth.signInWithRedirect(new auth.GoogleAuthProvider())
      .then(() => console.log('signed in!'))
      .catch((err) => console.error(err));
  }

  public logOut() {
    this.auth.signOut()
      .then(() => this.router.navigate(['/login']));
  }

  generateNewToken() {
    this.userObj.update({
      apiToken: this.afs.createId()
    });
  }

  updateUser(data: Partial<User>) {
    this.userObj.update(data);
  }
}
