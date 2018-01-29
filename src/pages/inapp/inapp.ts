import { Component } from '@angular/core';

import {  IonicPage, NavController} from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';

@IonicPage()
@Component({
  selector: 'page-inapp',
  templateUrl: 'inapp.html'
})
export class InAppPage {

  constructor( 
    public navCtrl: NavController,
    private inappbrowser: InAppBrowser
  )
     {
//      this.openUrl();
  }
  openUrl() {
          let browser = this.inappbrowser.create('https://ionicframework.com/',"_blank");
          browser.show();
  }

    // Return to Home screen (app switcher)
    onClickHome() {
      this.navCtrl.setRoot('HomePage');
    }

    ionViewDidLoad() {
      console.log('ionViewDidLoad InAppPage');
    }
}
