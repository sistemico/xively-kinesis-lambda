//
// Units conversion helpers
//

const KM_TO_MI = 0.00062137119223733;
const KPH_TO_MPH = KM_TO_MI * 1000;

export function convertKmToMi(km: number): number {
  return km * KM_TO_MI;
}

export function convertKphToMph(kph: number): number {
  return kph * KPH_TO_MPH;
}
