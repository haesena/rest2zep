import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../global/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public waitingAfterRedirect: boolean = false;

  constructor(public auth: AuthService) {
    this.waitingAfterRedirect = localStorage.getItem('rest2zep_redirected_to_login') === 'redirected';
  }

  ngOnInit(): void {
  }
}
