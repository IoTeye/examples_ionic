import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';

@IonicPage()
@Component({
  selector: 'page-proximity',
  templateUrl: 'proximity.html'
})
export class ProximityPage {
 /**
  * @property {Object} state
  */
  state: any;  
  devices: any[] = [];
  statusMessage: string;

  constructor(public navCtrl: NavController, 
              private toastCtrl: ToastController,
              private ble: BLE,
              private ngZone: NgZone) { 
    // Initial state
    this.state = {
      enabled: true,
      count:0
    }
  }

  // Return to Home screen (app switcher)
  onClickHome() {
    this.navCtrl.setRoot('HomePage');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.onToggleEnabled();
  }

  scan() {
    this.setStatus('Scanning for Bluetooth LE Devices');
    this.devices = [];  // clear list

    this.ble.startScanWithOptions([],{ reportDuplicates: true }).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );

//    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
  }

  onDeviceDiscovered(device) {
    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
//      this.state.count = this.state.count + 1;
      this.devices.push(device);
    });
  }

  // If location permission is denied, you'll end up here
  scanError(error) {
    this.setStatus('Error ' + error);
    let toast = this.toastCtrl.create({
      message: 'Error scanning for Bluetooth low energy devices',
      position: 'middle',
      duration: 5000
    });
    toast.present();
  }

  setStatus(message) {
    console.log(message);
    this.ngZone.run(() => {
      this.statusMessage = message;
    });
  }

  onToggleEnabled() {
    if (this.state.enabled == true) {
      this.scan();
    } else {
      this.ble.stopScan();
      this.setStatus('Scan complete');
    }
  }

}
