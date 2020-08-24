import {TimeSlot} from "./time-slot";

export class User {
  name: string;
  apiEnabled: boolean;
  apiToken: string;
  stdText: string;
  currentTimeSlot?: TimeSlot;
  countTimeSlots: number;
}
