import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Platform } from 'ionic-angular';
//import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';

  var refreshIntervalId;
  var unusualEvent;
  var unusualEventStr;

  //  DEFAULT_TRANSMITTERS = new Set(['ec149b8cc77d','fed90f07c33d','fda6a51c4598']);
  var DEFAULT_TRANSMITTERS = {
  /*
    'fed90f07c33d': {id:'beacon1'},
    'fda6a51c4598': {id:'beacon2'},
    'ec149b8cc77d': {id:'beacon3'},
    'c935df1aa8bd': {id:'beacon4'},
    'cf389feb5b65': {id:'beacon5'},
    'fa1926067aae': {id:'beacon6'},
  */
  // for android
    'E8:3F:0B:A3:F6:12': {id:'b13-client1', index:0 },
    'D2:3D:87:43:75:1F': {id:'b14-client2', index:1 },
  // for iphone
    '5CD28DF8-8459-22E2-1D91-9D2F7B839E4F': {id:'b13-client1', index:0 },
    'ED912309-81E7-5F8C-D572-6FA71324F126': {id:'b14-client2', index:1 },
  //  'b827ebf7fe86': {id:'mobile1t'}
  //  'b827eb6b0298': {id:'mobile1t'}
  };
  
  var beacon = [{id:'b13-client1', far:0,near:0,immediate:0,invisible:0},
                {id:'b14-client2', far:0,near:0,immediate:0,invisible:0},
                {id:'b1-client3', far:0,near:0,immediate:0,invisible:0},
                {id:'b2-client4', far:0,near:0,immediate:0,invisible:0},
                {id:'b3-client5', far:0,near:0,immediate:0,invisible:0},
                {id:'b4-client6', far:0,near:0,immediate:0,invisible:0},
                {id:'b5-client7', far:0,near:0,immediate:0,invisible:0},
                {id:'b6-client8', far:0,near:0,immediate:0,invisible:0},
                {id:'b7-client9', far:0,near:0,immediate:0,invisible:0},
                {id:'b8-client0', far:0,near:0,immediate:0,invisible:0}
              ];

@Injectable()
export class ShareService {
  
    // BLE
  devices: any[] = [{'id':"",'status':""},{'id':"",'status':""},
                    {'id':"",'status':""},{'id':"",'status':""}
                  ];
  statusMessage: string;
  count: number;
  scan_period: number;
  far_threshold: number;
  near_threshold: number;
  immediate_threshold: number;
  display_items: number;

    constructor(private platform:Platform, 
                private ble: BLE,
//                private backgroundMode: BackgroundMode
                private localNotifications: LocalNotifications
              ) {

      this.scan_period = 5000;
      this.far_threshold = -100;
      this.near_threshold = -85;
      this.immediate_threshold = -65;
      this.display_items = 4;
      refreshIntervalId = setInterval(this.scan2.bind(this), this.scan_period);
      unusualEvent = '';

      this.platform.ready().then(() => {
          this.platform.pause.subscribe(() => {
//            this.backgroundMode.enable();
//            clearInterval(refreshIntervalId);
//            refreshIntervalId = setInterval(this.scan2.bind(this), this.scan_period);
          });
          this.platform.resume.subscribe(() => {
//            this.backgroundMode.disable();
//            clearInterval(refreshIntervalId);
//            refreshIntervalId = setInterval(this.scan2.bind(this), this.scan_period);
          });
        })
    }
 
    set_scan_period(scan_period) {
        this.scan_period = scan_period;
        clearInterval(refreshIntervalId);
        refreshIntervalId = setInterval(this.scan2.bind(this), scan_period);
    }

    set_far_threshold(far_threshold){
        this.far_threshold = far_threshold;
    }

    set_near_threshold(near_threshold){
        this.near_threshold = near_threshold;
    }

    set_immediate_threshold(immediate_threshold){
        this.immediate_threshold = immediate_threshold;
    }

    getDevices() {
        return this.devices;
    }

    getUnusualEvent() {
        return unusualEvent;
    }

    getUnusualEventStr() {
        return unusualEventStr;
    }

// BLE events 
    scan2() {  
      this.ble.stopScan();
        var i;
        for (i=0; i<2; i++) {
          beacon[i].invisible +=1;
          if (beacon[i].invisible > 4) {    
//            this.vibration.vibrate(500);
            this.devices[i].status = 'Invisible';
            this.devices[i].id = beacon[i].id;
            unusualEvent = "Object Invisible";
          }
        }

      this.ble.startScanWithOptions([],{ reportDuplicates: true }).subscribe(
        device => this.onDeviceDiscovered(device), 
        error => this.scanError(error)
      );
      var localNotification = {
        title: 'Bluetooth Device',
        text: this.devices[0].id + ' (' + this.devices[0].status + ')'
            + this.devices[1].id + ' (' + this.devices[1].status + ')',
        sound: null,
      };
      this.localNotifications.schedule(localNotification);
    }
  
    onDeviceDiscovered(device) {
//      console.log('Discovered ' + JSON.stringify(device, null, 2));
      if (device.id in DEFAULT_TRANSMITTERS){
        var index = DEFAULT_TRANSMITTERS[device.id].index;
//         beacon[DEFAULT_TRANSMITTERS[device.id].index][0] = device.rssi;
        this.devices[index].id = DEFAULT_TRANSMITTERS[device.id].id;
        beacon[index].invisible = 0;
        if (device.rssi > this.immediate_threshold) {
          beacon[index].immediate += 1;
        }
        else if (device.rssi > this.near_threshold) {
          beacon[index].near += 1;
        } 
        else {
          beacon[index].far += 1;
        }
        if (beacon[index].immediate > 2) {
          this.devices[index].status = 'Immediate';      
          unusualEvent = "";
          beacon[index].immediate = 1;
          beacon[index].near = 0;
          beacon[index].far = 0;
        } else
        if (beacon[index].near > 2) {
          this.devices[index].status = 'Near';      
          unusualEvent = "";
          beacon[index].immediate = 0;
          beacon[index].near = 1;
          beacon[index].far = 0;
        } else
        if (beacon[index].far > 2) {    
//            this.vibration.vibrate(500);
          this.devices[index].status = 'Far';      
          unusualEvent = "Object Faraway";
          unusualEventStr = DEFAULT_TRANSMITTERS[device.id].id + " Far away";
          beacon[index].immediate = 0;
          beacon[index].near = 0;
          beacon[index].far = 1;
        }
      }
      else {
        return;
      }

    }
    
    // If location permission is denied, you'll end up here
    scanError(error) {
      this.setStatus('Error ' + error);
    }
  
    setStatus(message) {
      console.log(message);
    }

}