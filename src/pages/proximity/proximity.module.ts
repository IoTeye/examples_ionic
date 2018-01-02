import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProximityPage } from './proximity';

@NgModule({
  declarations: [
    ProximityPage,
  ],
  imports: [
    IonicPageModule.forChild(ProximityPage),
  ],
})
export class ProximityPageModule {}
