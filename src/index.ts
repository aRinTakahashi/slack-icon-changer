import {main} from './main';
import {setTrigger} from './util';

declare const global: {
  [x: string]: unknown;
};

global.main = main;
global.setTrigger = setTrigger;
