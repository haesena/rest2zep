import {Component, OnInit} from '@angular/core';
import {AuthService} from "./global/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public loggedIn: boolean;

  constructor(public auth: AuthService) {
  }

  ngOnInit(): void {
  }
}
