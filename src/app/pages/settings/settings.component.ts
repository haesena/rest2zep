import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../global/auth.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public user: User = {name: null, stdText: null, token: false};

  constructor(public auth: AuthService) {
    this.auth.$dbUser.subscribe(u => this.user = u);
  }

  ngOnInit(): void {
  }

}
