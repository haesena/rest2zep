import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {AngularFireAuthGuard, redirectUnauthorizedTo} from "@angular/fire/auth-guard";
import {MainComponent} from "./pages/main/main.component";
import {SettingsComponent} from "./pages/settings/settings.component";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/login']);

const routes: Routes = [
  // public routes, without authentication
  {path: 'login', component: LoginComponent},

  // routes with authentication, checked in AuthGuardService
  {
    path: '', canActivate: [AngularFireAuthGuard], data: {authGuardPipe: redirectUnauthorizedToLogin}, children: [
      {path: 'main', component: MainComponent},
      {path: 'settings', component: SettingsComponent},
      {path: '', redirectTo: '/main', pathMatch: 'full'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
