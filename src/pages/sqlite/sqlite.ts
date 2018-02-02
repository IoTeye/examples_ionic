import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { AddDataPage } from './add-data/add-data';
import { EditDataPage } from './edit-data/edit-data';

@IonicPage()
@Component({
  selector: 'page-sqlite',
  templateUrl: 'sqlite.html',
})
export class SQLitePage {

  tasks: any = [];

  constructor(public navCtrl: NavController,
    private sqlite: SQLite) {}

  ionViewDidLoad() {
    this.getData();
  }

  ionViewWillEnter() {
    this.getData();
  }

  onClickHome() {
    this.navCtrl.setRoot('HomePage');
  }
  
  getData() {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('CREATE TABLE IF NOT EXISTS task(rowid INTEGER PRIMARY KEY, date TEXT, type TEXT, description TEXT, duration INT)', {})
      .then(res => console.log('Executed SQL'))
      .catch(e => console.log(e));
      db.executeSql('SELECT * FROM task ORDER BY rowid DESC', {})
      .then(res => {
        this.tasks = [];
        for(var i=0; i<res.rows.length; i++) {
          this.tasks.push({rowid:res.rows.item(i).rowid,date:res.rows.item(i).date,type:res.rows.item(i).type,description:res.rows.item(i).description,duration:res.rows.item(i).duration})
        }
      })
      .catch(e => console.log(e));
/*
      db.executeSql('SELECT SUM(amount) AS totalIncome FROM expense WHERE type="Income"', {})
      .then(res => {
        if(res.rows.length>0) {
          this.totalIncome = parseInt(res.rows.item(0).totalIncome);
          this.balance = this.totalIncome-this.totalExpense;
        }
      })
      .catch(e => console.log(e));
      db.executeSql('SELECT SUM(amount) AS totalExpense FROM expense WHERE type="Expense"', {})
      .then(res => {
        if(res.rows.length>0) {
          this.totalExpense = parseInt(res.rows.item(0).totalExpense);
          this.balance = this.totalIncome-this.totalExpense;
        }
      })
      */
    }).catch(e => console.log(e));
  }

  addData() {
    this.navCtrl.setRoot('AddDataPage');
//    this.navCtrl.push(AddDataPage);
//    this.navCtrl.setRoot('SQLitePage');
  }

  editData(rowid) {
    this.navCtrl.setRoot('EditDataPage', {
      rowid:rowid
    });
//    this.navCtrl.setRoot('SQLitePage');
  }

  deleteData(rowid) {
    this.sqlite.create({
      name: 'ionicdb.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      db.executeSql('DELETE FROM task WHERE rowid=?', [rowid])
      .then(res => {
        console.log(res);
        this.getData();
      })
      .catch(e => console.log(e));
    }).catch(e => console.log(e));
  }

}
