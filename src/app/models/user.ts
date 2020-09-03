import {TimeSlot} from "./time-slot";

export class User {
  name: string;
  apiEnabled: boolean;
  apiToken: string;
  stdText: string;
  currentTimeSlot?: TimeSlot;
  countTimeSlots: number;
  zepEnabled: boolean;
  zepToken: string;
  zepUser: string;
  zepAutoExport: boolean;
  stdZepProjekt: string;
  stdZepVorgang: string;
  zepProjekte: ZepProjekt[]
}

export class ZepProjekt {
  name: string;
  vorgang: string[];
}
