import {Injectable} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {auth} from "firebase/app";
import {Observable, ReplaySubject} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/database";
import {map, take} from "rxjs/operators";
import {User} from "../models/user";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {AngularFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public $authUser: ReplaySubject<firebase.User> = new ReplaySubject<firebase.User>();
  public $dbUser: ReplaySubject<User> = new ReplaySubject<User>();
  public uid;

  constructor(public auth: AngularFireAuth, public router: Router, public db: AngularFireDatabase, public readonly afs: AngularFirestore) {
    auth.authState.subscribe(s => this.$authUser.next(s));
    auth.authState.subscribe(u => {
      if (u) {
        this.uid = u.uid;
        this.initUser(u.displayName);
        this.db.object('users/' + this.uid).valueChanges().subscribe(u => this.$dbUser.next(u));
        // this.router.navgitigate(['/main']);
      } else {
        this.uid = null;
        this.$dbUser = null;
      }
    })
  }

  private initUser(displayName: string) {
    this.db.object('users/' + this.uid).valueChanges().pipe(take(1))
      .subscribe(v => {
        if(v === null) {
          this.db.object('users/' + this.uid).set({
            name: displayName,
            token: false,
            stdText: "Eintrag aus ZepApp"
          });
        }
      });
  }

  public logIn() {
    this.auth.signInWithRedirect(new auth.GoogleAuthProvider())
      .then(() => console.log('signed in!'))
      .catch((err) => console.error(err));
  }

  public logOut() {
    this.auth.signOut()
      .then(() => this.router.navigate(['/login']));
  }

  public updateApiToken(event: MatSlideToggleChange) {
    this.db.object('users/' + this.uid).update({
      token: event.checked ? this.afs.createId() : false
    });
  }

  updateStdText(event) {
    this.db.object('users/' + this.uid).update({
      stdText: event.target.value
    });
  }
}
