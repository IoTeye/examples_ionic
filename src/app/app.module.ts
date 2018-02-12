import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { BLE } from '@ionic-native/ble';
import { Vibration } from '@ionic-native/vibration';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';

import { Device } from '@ionic-native/device';
import { Dialogs } from '@ionic-native/dialogs';
import { BackgroundMode } from '@ionic-native/background-mode';

import { MyApp } from './app.component';
import { ShareService } from '../services/share/share';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Device,
    Dialogs,
    BLE,
    BackgroundMode,
    Vibration,
    SpeechRecognition,
    InAppBrowser,
    SQLite,
    Toast,
    ShareService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
