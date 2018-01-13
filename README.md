# :large_blue_diamond: [Ionic 3] Woods Trial Demo based on Cordova Background Geolocation &mdash;

## :large_blue_diamond: Installation

### Step 1: Start by cloning this repo

```bash
$ git clone https://github.com/IoTeye/mobile
```

----------------------------------------------------------------------------

### Step 2:  Building and Running the Ionic 3 App

```bash
$ npm install

$ npm install -g cordova ionic # you should have ionic and cordova installed

$ ionic cordova prepare android
$ ionic cordova run android --device

$ ionic cordova prepare ios
$ ionic cordova run ios --emulator
// opens a web console which receives all your locations
$ npm run open  
```

The quickest way to see the plugin in-action is to boot the **iOS** simulator and *simulate location* with *Freeway Drive*.

The demo is composed of four separate and indpendant sub-applications implemented as Ionic page-modules.

- [Events](./src/pages/hello-world/hello-world.ts)
- [Proximity](./src/pages/proximity/proximity.ts)
- [Woods Trial](./src/pages/simple-map/simple-map.ts)
- [Advanced](./src/pages/advanced) with complex settings screen and geofencing.

## :large_blue_diamond: Tracking Server

The app is configured to post locations to IoTeye's demo server, which hosts a web-application for visualizing and filtering your tracking on a map.

- After booting the app the first time, you'll be asked to enter a **unique** "Tracking Server Username" (eg: Github username) so the plugin can post locations to `tracker.ioteyeinc.com`.  

:warning: Make your username **unique** and known only to *you* &mdash; if every one uses *"test"*, you'll never find your device!)


- You can view the plugin's tracking history by visiting [http://tracker.ioteyeinc.com/username](http://tracker.ioteyeinc.com/username).

## :large_blue_diamond: Debug Mode

The plugin has a `debug` mode for field-testing.  The plugin will emit sounds during its life-cycle events:

| Event | iOS | Android |
|-------|-----|---------|
| Exit stationary-region | Dee-do Dee-do...Dee-do Dee-do | n/a |
| Location recorded | SMS-sent sound | "blip" |
| Aggressive geolocation engaged | SIRI listening sound | "doodly-doo" |
| Acquiring location | "tick, tick, tick" | dial-tone sound |
| Stationary state | "bloom" | long "beeeeeeep" |
| Geofence crossing | trumpets/fanfare | beep-beep-beep |

**NOTE:**  In order for debug sounds to operate *when the app is in background*, you must enable the `Audio and Airplay` **Background Mode**.

## :large_blue_diamond: Adding Geofences

The **Advanced** app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


