# Browninglogic Radio

[![Build Status](https://toxicbard.visualstudio.com/Browninglogic%20Radio/_apis/build/status/Browninglogic%20Radio%20UI%20-%20YAML?branchName=master)](https://toxicbard.visualstudio.com/Browninglogic%20Radio/_build/latest?definitionId=4&branchName=master)
[![Coverage Status](https://coveralls.io/repos/github/pfbrowning/ng-radio/badge.svg?branch=master)](https://coveralls.io/github/pfbrowning/ng-radio?branch=master)

## Introduction
Browninglogic Radio is an internet radio app written as a Single-Page Application in Angular.  This is a hobby project that I work on in what little free time I have.  My motivation for this is primarily because I enjoy working with Angular and secondarily because I enjoy internet radio.

The in-progress demo version of the app can be accessed at [radio.browninglogic.com](http://radio.browninglogic.com).

## Current Features
* Display of the current "Now Playing" stream info as provided by [node-internet-radio](https://github.com/gabek/node-internet-radio) and fetched via [radio-metadata-api](https://github.com/pfbrowning/radio-metadata-api)
* Integration with the [Radio Browser API](https://de1.api.radio-browser.info/) as a backend data source to easily search for internet radio stations
* Sleep timer
* Support for opening and playing custom station URLs
* Saving of "Favorite" stations
* Automatic retry of Shoutcast streams which fail due to missing the trailing`/;` which is [required to listen from a web browser](https://stackoverflow.com/a/1759607)
* Experimental mobile browser keep-awake via [nosleep.js](https://github.com/richtr/NoSleep.js/)
* Responsive & mobile-friendly
* Logging to Azure Application Insights

## Planned Features
* Tagging of "Favorite" stations
* [HTML5 Notifications](https://developer.mozilla.org/en-US/docs/Web/API/notification)

## Supported URL Format
At its core, this application is basically a fancy frontend for the [HTML5 Audio Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio).  With this in mind, it's safe to say that any internet radio stream URL which a modern web browser can play directly should work in this app with no problem, and by extension if your browser can *not* play the stream directly then it won't work with this app either.  In other words, if you're having trouble playing a stream URL, your first troubleshooting step should be to paste the stream URL directly into your browser's address bar to see if your browser can handle it.

As a matter of practical application, there are a few points to keep in mind:
* The URL of the *.pls, *.m3u, etc files which are frequently distributed by internet radio stations _might_ might work thanks to a new experimental station preprocessing feature, but they're not guaranteed to work in all cases.  If you have problems loading such streams, try loading the playlist file in your text editor of choice and using the stream URL included inside.
* A trailing `/;` is required to load Shoutcast streams [from the browser](https://stackoverflow.com/a/1759607).  Retrying failing streams with this suffix appended is now automated as a feature, but it's still an important point to keep in mind for troubleshooting streams that won't play.
* The former two points are important to keep in mind while using the [Radio Browser API](http://www.radio-browser.info) functionality.  This is a publicly accessible, publicly maintained database, thus many of the stations that it contains are either invalid or in an unsupported format.  In my usage of it I've found that most stations work properly, but there are many which are stored as Shoutcast stations without the trailing `/;`, *.pls files, or in various other invalid formats.

## Browser Support
Support for legacy browsers is not a concern at all in developing this application.  I develop and test against Firefox and Chrome primarily, and I prefer using cutting edge native browser functionality when it's preferable to legacy alternatives.

## Configuration
To get your own instance of this application configured and running locally, you'll obviously want to start by cloning the repo.  Then take a look at `src\assets\config\app.config.json`.  There are a few things that you'll need to set up and configure in `app.config.json` in order to get the app running.  You can also configure any settings that you want `gitignore`d in `local.config.json`: any config entries in local config will automatically override matching entries in app config.

### Metadata API
You'll need to configure your own instance of the [radio-metadata-api](https://github.com/pfbrowning/radio-metadata-api).  Follow the instructions to get it set up and running on `http://localhost:3000`.  Alternatively you can host it somewhere else and specify the alternate path in `app.config.json`.

### Azure Application Insights
If you want to log stuff to Azure Application Insights, then provide your instrumentation key in `app.config.json`.  Otherwise leave it as null: this is completely optional.

### Authentication
You'll need to configure your own Oauth 2.0 + OpenID Connect identity provider.  In addition, you'll need to use an Oauth 2.0 provider which issues a JWT-based access token (this is not mandated by the Oauth 2.0 spec, but it's a common implementation).  This is required due to the "Favorites" functionality.  The quickest, easiest, and cheapest route would probably be to use an [Auth0](https://auth0.com/) free account.  A basic level of knowledge regarding authentication in Single Page Applications via OpenID Connect Implicit Flow is required.  I won't cover that here because it's outside of the scope of this readme, well-documented on the internet, and fairly easy to figure out.

Browninglogic Radio uses [angular-oauth2-oidc](https://github.com/manfredsteyer/angular-oauth2-oidc) for authentication.  The `authConfig` section within `app.config.json` stores the `AuthConfig` object which is defined and documented by `angular-oauth2-oidc`.  For a standard simple OpenID Connect configuration it should be sufficient to specify your `issuer`, `redirectUri`, `clientId`, and `scope` within `authConfig` without having to make any modifications to `src\modules\core\authentication\services\authentication.service.ts`.

### Running the App
Once you've got the aforementioned dependencies configured, running, and in a happy state, simply install your dependencies and run the app as you would any Angular CLI app.  Assuming that you've already got npm and Angular CLI installed:
```bash
npm install
ng serve --open
```

## Backlog
* Chores
  * Show a loading spinner in place of the main app content while waiting for the config to load
  * Use PKCE authentication in place of implicit flow
  * Store only what we need in NGRX authentication store
  * Move build pipeline to Github actions
  * Partition core/services directory
  * Fix warnings in tests
  * Find a better alternative to the mat spinner button package
  * Refactor selector import / export logic
* Features
  * Non-logged-in experience: Require login only for favorites
  * Socket.IO Now Playing Listener with HTTPS / CORS stream proxy
  * Favorite station tags
  * Browser-based audio recording (pending CORS proxy for audio stream)
  * HTML5 Notifications
* More Chores
  * Either type for stream validator logic
  * Prevent accidental audio streaming through CORS proxy
  * Package up reusable things and deploy to npm
  * Improve test coverage