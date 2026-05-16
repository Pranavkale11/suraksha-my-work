export interface KeystrokeData {
  dwellTimes: number[];
  flightTimes: number[];
  timestamps: number[];
  totalKeys: number;
}

export interface MouseData {
  velocities: number[];
  clickPatterns: number[];
  idleTimes: number[];
  trajectory: { x: number; y: number; timestamp: number }[];
}

export interface BehavioralData {
  keystroke: KeystrokeData;
  mouse: MouseData;
}
