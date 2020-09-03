import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './pages/login/login.component';
import {MainComponent} from './pages/main/main.component';
import {AngularFireModule} from "@angular/fire";
import {environment} from "../environments/environment";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {SettingsComponent} from './pages/settings/settings.component';
import {MatDividerModule} from "@angular/material/divider";
import {MatListModule} from "@angular/material/list";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatInputModule} from "@angular/material/input";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatPaginatorModule} from "@angular/material/paginator";
import {TimeSlotComponent} from './partial/time-slot/time-slot.component';
import {HttpClientModule} from "@angular/common/http";
import {MatSelectModule} from "@angular/material/select";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    SettingsComponent,
    TimeSlotComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    BrowserAnimationsModule,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatSlideToggleModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
