import { 
  Component,
  ViewChild,
  ElementRef,
  NgZone 
} from '@angular/core';

import {
  IonicPage, 
  NavController,
  NavParams,
  ToastController,
  AlertController,
  LoadingController,
  Platform
} from 'ionic-angular';
import { ChangeDetectorRef } from '@angular/core';
// Cordova plugins Device & Dialogs
import { Device } from '@ionic-native/device';
import { Dialogs } from '@ionic-native/dialogs';
import { BLE } from '@ionic-native/ble';
import { Vibration } from '@ionic-native/vibration';
import { SpeechRecognition } from '@ionic-native/speech-recognition';


// Handy color & sound constants.
import COLORS from '../../lib/colors';
import SOUND_MAP from '../../lib/sound-map';

// Google maps <script> is loaded in main index.html
declare var google;

// Transistor Software Tracking Server Host
const TRACKER_HOST = 'http://18.218.71.70:9000/locations/';
//const TRACKER_HOST = 'http://192.168.1.139:9000/locations/';

var refreshIntervalId;

@IonicPage()
@Component({
  selector: 'page-simple-map',
  templateUrl: 'simple-map.html',
})
export class SimpleMapPage {
  @ViewChild('map') mapElement: ElementRef;

  // BackgroundGeolocation API
  bgGeo: any;

  // Background Geolocation State
  state: any;
  enabled: boolean;  
  isMoving: boolean;
  distanceFilter: number;
  stopTimeout: number;
  autoSync: boolean;
  stopOnTerminate: boolean;
  startOnBoot: boolean;
  debug: boolean;
  provider: any;

  // UI State
  menuActive: boolean;
  motionActivity: string;
  odometer: string;
  menu2Active: boolean;

  // Google Map references
  map: any;
  locationMarkers: any;
  currentLocationMarker: any;
  lastLocation: any;
  stationaryRadiusCircle: any;
  polyline: any;  

  // BLE
  devices: any[] = [];
  statusMessage: string;
  count: number;
  scan_period: number;

  // Speech Recognition
  matches: String[];
  isRecording = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private zone:NgZone, 
    private platform:Platform, 
    private device:Device,
    private dialogs:Dialogs,
    private ble: BLE,
    private vibration:Vibration,
    private speechRecognition: SpeechRecognition,
    private plt: Platform,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.platform.ready().then(this.onDeviceReady.bind(this));

    this.state = {};
    // BackgroundGeolocation initial config.
    this.isMoving = true;
    this.enabled = true;
    this.autoSync = true;
    this.distanceFilter = 10;
    this.stopTimeout = 1;
    this.stopOnTerminate = false;
    this.startOnBoot = true;
    this.debug = true;
    this.count = 0;

    // UI members.
    this.motionActivity = 'Activity';
    this.menuActive = false;
    this.menu2Active = false;

    this.scan_period = 5000;
    refreshIntervalId = setInterval(this.scan.bind(this), this.scan_period);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.configureMap();
    this.onToggleEnabled();
  }

  onDeviceReady() {
    // We prompt you for a unique identifier in order to post locations tracker.transistorsoft.com
    this.configureBackgroundGeolocation();
    this.getPermission();
//    setInterval(this.startListening.bind(this), 10000);
  }

  private configureBackgroundGeolocation() {

    // Compose #url from username
    let localStorage = (<any>window).localStorage;
    let username = localStorage.getItem('username');
    let url = TRACKER_HOST + username;

    this.bgGeo = (<any>window).BackgroundGeolocation;

    ////
    // Step 1:  listen to events
    //    
    this.bgGeo.on('location', this.onLocation.bind(this));
    this.bgGeo.on('motionchange', this.onMotionChange.bind(this));
    this.bgGeo.on('activitychange', this.onActivityChange.bind(this));
    this.bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));
    this.bgGeo.on('providerchange', this.onProviderChange.bind(this));
    this.bgGeo.on('heartbeat', this.onHeartbeat.bind(this));
    this.bgGeo.on('powersavechange', this.onPowerSaveChange.bind(this));

    ////
    // Step 2:  #configure the plugin
    //       

    // We can fetch the current state from the plugin and use this to update the UI State
    // 
    this.bgGeo.getState((state) => {
      this.state = state;

      if (!this.isFirstBoot()) {
        // Set current plugin state upon our view.
        this.enabled         = state.enabled;
        this.isMoving        = state.isMoving;
        this.autoSync        = state.autoSync;
        this.distanceFilter  = state.distanceFilter;
        this.stopTimeout     = state.stopTimeout;
        this.stopOnTerminate = state.stopOnTerminate;
        this.startOnBoot     = state.startOnBoot;
        this.debug           = state.debug;
      }

      // Feel free to override or add any config options below
      this.bgGeo.configure({
        // Geolocation config
        desiredAccuracy: 0,  // <-- highest possible accuracy
        distanceFilter: this.distanceFilter,
        // ActivityRecognition config
        stopTimeout: this.stopTimeout,
        // Application config
        foregroundService: true,
        stopOnTerminate: this.stopOnTerminate,
        heartbeatInterval: 60,
        // HTTP / Persistence config
        url: url,
        params: {
          device: {
            platform: this.device.platform,
            version: this.device.version,
            uuid: this.device.uuid,
            cordova: this.device.cordova,
            model: this.device.model,
            manufacturer: this.device.manufacturer,
            framework: 'Cordova'
          }
        },
        extras: {
          "usualevent": "Jesus Love me"
        },
        autoSync: this.autoSync,
        autoSyncThreshold: 0,
        // Logging / Debug config
        debug: this.debug,
        logLevel: this.bgGeo.LOG_LEVEL_VERBOSE
      }, (state) => {
        console.log('- Configure success: ', state);        
      });      
    });
  }

// BLE events 
  scan() {
      this.devices = [];  // clear list
    this.setStatus('*************** Supervising Client Activity');
/*
    this.ble.startScanWithOptions([],{ reportDuplicates: true }).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );
*/
    this.ble.scan([],3).subscribe(
      device => this.onDeviceDiscovered(device), 
      error => this.scanError(error)
    );
//    setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
//    setTimeout(this.ble.stopScan, 3000);
  }

  onDeviceDiscovered(device) {

    console.log('Discovered ' + JSON.stringify(device, null, 2));
    this.ngZone.run(() => {
      this.count = this.count + 1;
      if (device.rssi < -100)
        this.vibration.vibrate(500);
      if (this.devices.length > 5)
        this.devices.shift();
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

  // Speech Recognition
  isIos() {
    return this.plt.is('ios');
  }

  stopListening() {
    this.speechRecognition.stopListening().then(() => {
      this.isRecording = false;
    });
  }
 
  getPermission() {
    this.speechRecognition.hasPermission()
      .then((hasPermission: boolean) => {
        if (!hasPermission) {
          this.speechRecognition.requestPermission();
        }
      });
  }

  startListening() {
    let options = {
      language: 'en-US',
      matches: 1,
      showPopup: false,
      prompt: '',
      showPartial: true
    }
    this.speechRecognition.startListening(options).subscribe(matches => {
      this.matches = matches;
      this.cd.detectChanges();
    });
    this.isRecording = true;
  }

  /**
  * @event location
  */
  onLocation(location) {
    console.log('[event] location ', location);
    this.zone.run(() => {
      this.odometer = (location.odometer/1000).toFixed(1) + 'km';
    });
    
    this.updateCurrentLocationMarker(location);
  }
  /**
  * @event motionchange
  */
  onMotionChange(isMoving, location) {
    console.log('[event] motionchange, isMoving: ', isMoving, location);

    this.zone.run(() => {
      this.isMoving = isMoving;
    });
    
    // Show / hide the big, red stationary radius circle    
    if (!isMoving) {
      let coords = location.coords;
      let radius = 200;
      let center = new google.maps.LatLng(coords.latitude, coords.longitude);

      this.stationaryRadiusCircle.setRadius(radius);
      this.stationaryRadiusCircle.setCenter(center);
      this.stationaryRadiusCircle.setMap(this.map);
      this.map.setCenter(center);
    } else if (this.stationaryRadiusCircle) {
      this.stationaryRadiusCircle.setMap(null);
    }
  }
  /**
  * @event activitychange
  */
  onActivityChange(event) {
    console.log('[event] activitychange: ', event);
    this.zone.run(() => {
      this.motionActivity = `${event.activity}:${event.confidence}%`;  
    });    
  }
  /**
  * @event http
  */
  onHttpSuccess(response) {
    console.log('[event] http: ', response);
  }
  onHttpFailure(response) {
    console.warn('[event] http failure: ', response);
  }

  /**
  * @event heartbeat
  */
  onHeartbeat(event) {
    let location = event.location;
    // NOTE:  this is merely the last *known* location.  It is not the *current* location.  If you want the current location,
    // fetch it yourself with #getCurrentPosition here.
    console.log('- heartbeat: ', location);
  }
  /**
  * @event powersavechange
  */
  onPowerSaveChange(isPowerSaveEnabled) {
    this.dialogs.alert('[event] powersavechnage, Power-save mode enabled? ' + isPowerSaveEnabled);
    console.log('[event] powersavechange, isPowerSaveEnabled: ', isPowerSaveEnabled);
  }
  /**
  * @event providerchange
  */
  onProviderChange(provider) {
    this.provider = provider;
    console.log('[event] providerchange: ', provider);
  }

  onClickMainMenu(item) {
    this.menuActive = !this.menuActive;
    this.playSound((this.menuActive) ? 'OPEN' : 'CLOSE');
  }

  onClickMainMenu2(item) {
    this.menu2Active = !this.menu2Active;
    this.playSound((this.menu2Active) ? 'OPEN' : 'CLOSE');
  }

  onClickSync() {
    this.hasRecords().then((count) => {
      this.confirm(`Sync ${count} records to server?`).then(this.doSync.bind(this));
    });
  }

  private doSync() {
    this.bgGeo.sync((records) => {
      this.toast(`Synced ${records.length} records to server.`);
      console.log('- #sync success: ', records.length);
    }, (error) => {
      console.warn('- #sync failure: ', error);
    });
  }

  onClickDestroy() {
    this.hasRecords().then((count) => {
      this.confirm(`Destroy ${count} records?`).then(this.doDestroyLocations.bind(this));
    }).catch(() => {
      this.toast('Database is empty');
    });
  }

  private doDestroyLocations() {
    this.bgGeo.destroyLocations(() => {
      this.toast('Destroyed all records');
      console.log('- #destroyLocations success');
    }, (error) => {
      console.warn('- #destroyLocations error: ', error);
    });
  }

  private hasRecords() {
    return new Promise((resolve, reject) => {
      this.bgGeo.getCount((count) => {
        if (count > 0) {
          resolve(count);
        } else {
          this.toast('Database is empty');
        }
      });
    });
  }

  onClickEmailLog() {
    this.getEmail().then((email) => {
      this.confirm(`Email logs to ${email}?`).then(() => {
        this.doEmailLog(email);
      }).catch(() => {
        // Clear email from localStorage and redo this action.
        let localStorage = (<any>window).localStorage;
        localStorage.removeItem('email');
        this.onClickEmailLog();
      });
    });
  }

  private doEmailLog(email) {
    // Show spinner
    let loader = this.loadingCtrl.create({content: "Creating log file..."});
    loader.present();

    this.bgGeo.emailLog(email, () => {      
      loader.dismiss();
    }, (error) => {
      loader.dismiss();
      console.warn('#emailLog error: ', error);
    });
  }

  onClickDestroyLog() {
    this.confirm("Destroy logs?").then(this.doDestroyLog.bind(this));
  }

  private doDestroyLog() {
    let loader = this.loadingCtrl.create({content: "Destroying logs..."});
    loader.present();

    this.bgGeo.destroyLog(() => {
      loader.dismiss();
      this.toast('Destroyed logs');
    }, (error) => {
      loader.dismiss();
      this.toast('Destroy logs failed: ' + error);
    });
  }

  onSetConfig(name) {
    if (name == 'scan_period') {
      // Set BLE
      clearInterval(refreshIntervalId);
      this.scan_period = parseInt(this[name], 10);
      refreshIntervalId = setInterval(this.scan.bind(this), this.scan_period);
      return;
    }
    if (this.state[name] === this[name]) {
      // No change.  do nothing.
      return;
    }
    // Careful to convert string -> number from <ion-input> fields.
    switch(name) {
      case 'distanceFilter':
      case 'stopTimeout':
        this[name] = parseInt(this[name], 10);
        break;
    }
    // Update state
    this.state[name] = this[name];
    let config = {};
    config[name] = this[name];

    // #setConfig

    this.bgGeo.setConfig(config, (state) => {
      this.toast(`#setConfig ${name}: ${this[name]}`);
    });
  }

  /**
  * [Home] button clicked.  Goo back to home page
  */
  onClickHome() {
    this.navCtrl.setRoot('HomePage');
  }

  /**
  * #start / #stop tracking
  */
  onToggleEnabled() {
    console.log('- enabled: ', this.enabled);

    if (this.enabled) {
      this.bgGeo.start((state) => {
        console.log('- Start success: ', state);        
      });
    } else {
      this.isMoving = false;
      this.stationaryRadiusCircle.setMap(null);
      this.bgGeo.stop((state) => {
        console.log('- Stop success: ', state);        
      });
    }
  }
  /**
  * Toggle moving / stationary state
  */
  onClickChangePace() {
    if (!this.enabled) {
      this.toast('You cannot changePace while plugin is stopped');
      return;
    }
    this.isMoving = !this.isMoving;

    this.bgGeo.changePace(this.isMoving, () => {
      console.log('- changePace success');
    });
  }
  /**
  * Get the current position
  */
  onClickGetCurrentPosition() {
    this.bgGeo.getCurrentPosition((location) => {
      console.log('- getCurrentPosition success: ', location);
    });
  }    

  /**
  * Configure the google map
  */
  private configureMap() {
    /**
    * Configure Google Maps
    */
    this.locationMarkers = [];
    
    let latLng = new google.maps.LatLng(-34.9290, 138.6010);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    
    // Blue current location marker
    this.currentLocationMarker = new google.maps.Marker({
      zIndex: 10,
      map: this.map,
      title: 'Current Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.blue,
        fillOpacity: 1,
        strokeColor: COLORS.white,
        strokeOpacity: 1,
        strokeWeight: 6
      }
    });
    
    // Red Stationary Geofence
    this.stationaryRadiusCircle = new google.maps.Circle({
      zIndex: 0,
      fillColor: COLORS.red,
      strokeColor: COLORS.red,
      strokeWeight: 1,
      fillOpacity: 0.3,
      strokeOpacity: 0.7,
      map: this.map
    });
    // Route polyline
    this.polyline = new google.maps.Polyline({
      map: this.map,
      zIndex: 1,
      geodesic: true,
      strokeColor: COLORS.polyline_color,
      strokeOpacity: 0.7,
      strokeWeight: 7,
      icons: [{
        repeat: '30px',
        icon: {
          path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
          scale: 1,
          fillOpacity: 0,
          strokeColor: COLORS.white,
          strokeWeight: 1,
          strokeOpacity: 1
        }
      }]
    });    
  }

  /**
  * Update the lat/lng of blue current location marker
  */
  private updateCurrentLocationMarker(location) {
    var latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    this.currentLocationMarker.setPosition(latlng);   

    setTimeout(() => {
      this.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
    });

    if (location.sample === true) {
      return;
    }
    if (this.lastLocation) {
      this.locationMarkers.push(this.buildLocationMarker(location));
    }
    // Add breadcrumb to current Polyline path.
    this.polyline.getPath().push(latlng);
    this.lastLocation = location;
  }

  /**
  * Build a new Google Map location marker with direction icon
  */
  private buildLocationMarker(location, options?) {
    options = options || {};
    
    return new google.maps.Marker({
      zIndex: 1,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        rotation: location.coords.heading,
        scale: 2,
        anchor: new google.maps.Point(0, 2.6),
        fillColor: COLORS.polyline_color,
        fillOpacity: 1,
        strokeColor: COLORS.black,
        strokeWeight: 1,
        strokeOpacity: 1
      },
      map: this.map,
      position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude)
    });
  }  

  /**
  * Fetch email address from localStorage.  We use this for #emailLog method
  * @return Promise
  */
  private getEmail() {
    let localStorage = (<any>window).localStorage;
    let email = localStorage.getItem('email');

    return new Promise((resolve, reject) => {
      if (email) { return resolve(email); }
      this.dialogs.prompt('Email address', 'Email Logs').then((response) => {
        if (response.buttonIndex === 1 && response.input1.length > 0) {
          let email = response.input1;
          localStorage.setItem('email', email);
          resolve(email);
        }
      });
    });
  }

  /**
  * Return true of this is the first time this app has booted.  We store the device.uuid into localStorage
  * as a flag that the app has booted before.
  * @return {Boolean}
  */
  private isFirstBoot() {
    let localStorage = (<any>window).localStorage;
    let isFirstBoot = true;
    if (localStorage.getItem('device.uuid')) {
      isFirstBoot = false;
    } else {
      localStorage.setItem('device.uuid', this.device.uuid);
    }
    return isFirstBoot;
  }

  /**
  * Send a Toast message
  */
  private toast(message, duration?) {
    this.toastCtrl.create({
      message: message,
      cssClass: 'toast',
      duration: duration || 3000
    }).present();
  }

  /**
  * Confirm stuff
  */
  private confirm(message) {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Confirm',
        message: message,
        buttons: [{
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Confirm',
          handler: resolve
        }]
      });
      alert.present();    
    });    
  }

  /**
  * Play a UI sound via BackgroundGeolocation#playSound
  */
  private playSound(name) {
    let soundId = SOUND_MAP[this.device.platform.toUpperCase()][name.toUpperCase()];
    if (!soundId) {
      console.warn('playSound: Unknown sound: ', name);
    }
    this.bgGeo.playSound(soundId);
  }
}
