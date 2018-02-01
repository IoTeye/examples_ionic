import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BLEscanPage } from './ble-scan';

@NgModule({
  declarations: [
    BLEscanPage,
  ],
  imports: [
    IonicPageModule.forChild(BLEscanPage),
  ],
})
export class BLEscanPageModule {}
