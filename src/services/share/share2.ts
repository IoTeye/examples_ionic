import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { ChangeDetectorRef } from '@angular/core';

@Injectable()
export class ShareService2 {
  // Speech Recognition
  matches: String[];
  isRecording = false;

  constructor(
    private platform:Platform,
    private cd: ChangeDetectorRef, 
    private speechRecognition: SpeechRecognition) {

    this.platform.ready().then(() => {
        this.platform.pause.subscribe(() => {
  //        clearInterval(refreshIntervalId);
  //        refreshIntervalId = setInterval(this.scan2.bind(this), this.scan_period);
        });
        this.platform.resume.subscribe(() => {
  //        clearInterval(refreshIntervalId);
  //        refreshIntervalId = setInterval(this.scan2.bind(this), this.scan_period);
        });
      })
  }

  onDeviceReady() {
    this.getPermission();
  }
    // Speech Recognition
    isIos() {
      return this.platform.is('ios');
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

}