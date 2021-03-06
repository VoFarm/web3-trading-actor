export const ITERATIONCOUNTER = 'ic';
export const CONSOLECOUNTER = 'cc';
export const PRICECOUNTER = 'pc';
export const PRIORITY = 'priority';

export const ITERATIONDESCRIPTOR = 'i';
export const CONSOLEDESCRIPTOR = 'c';
export const PRICEDESCRIPTOR = 'p';

export const PRIMARYNAME = 'pn';
export const SECONDARYNAME = 'sn';

export const CONTRACTNAME = 'cn';

export interface Price {
  primary: number;
  secondary: number;
  date: Date;
}
