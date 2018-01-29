import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SQLitePage } from './sqlite';
//import { AddDataPage } from '../add-data/add-data';
//import { EditDataPage } from './edit-data/edit-data';
@NgModule({
  declarations: [
    SQLitePage
  ],
  imports: [
    IonicPageModule.forChild(SQLitePage),
  ],
  entryComponents: [
    SQLitePage
  ],
})
export class SQLitePageModule {}
