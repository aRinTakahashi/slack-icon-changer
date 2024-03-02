import {main, test} from './main';
import {setTrigger} from './util';

declare const global: {
  [x: string]: unknown;
};

global.main = main;
global.test = test;
global.setTrigger = setTrigger;
