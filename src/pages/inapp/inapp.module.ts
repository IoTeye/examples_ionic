import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InAppPage } from './inapp';

@NgModule({
  declarations: [
    InAppPage,
  ],
  imports: [
    IonicPageModule.forChild(InAppPage),
  ],
})
export class InAppPageModule {}
