"# TaxiApp" 
To run the app install cordova following the instructions here: https://cordova.apache.org/docs/en/latest/guide/cli/
Replace the www folder with the www folder here
Add plugins for geolocation and googlemaps
cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="YOUR_ANDROID_API_KEY_IS_HERE" --variable API_KEY_FOR_IOS="YOUR_IOS_API_KEY_IS_HERE"
cordova plugin add cordova-plugin-geolocation
Fot camera plugin: cordova plugin add cordova-plugin-camera
Screenshot plugin: cordova plugin add https://github.com/gitawego/cordova-screenshot.git
