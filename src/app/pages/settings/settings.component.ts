import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../global/auth.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public user: User = new User();

  public zepProjects: any[];

  constructor(public auth: AuthService) {
    this.auth.$dbUser.subscribe(u => {
      this.user = u ?? this.user;
    });
  }

  ngOnInit(): void {
  }

}
