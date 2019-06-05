import { Injectable, Inject } from '@angular/core';
import { Station } from '../models/station';
import { NowPlaying } from '../models/now-playing';
import { StreamInfoService } from './stream-info.service';
import { interval, Subscription, BehaviorSubject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ConfigService } from '@modules/core/config/config.module';
import { NotificationService, Severities } from '@modules/core/notifications/notifications.module';
import { SleepTimerService } from './sleep-timer.service';
import { AudioElementToken } from '../injection-tokens/audio-element-token';
import { AudioElement } from '../models/audio-element';
import { LoggingService } from '@modules/core/logging/logging.module';
import { StreamInfoStatus } from '../models/stream-info-status';
import { isEqual } from 'lodash';
import isBlank from 'is-blank';

/** Service which handles the underlying core logic of playing radio
 * stations and maintains the nowPlaying state */
@Injectable()
export class PlayerService {
  constructor(private streamInfoService: StreamInfoService,
    private notificationService: NotificationService,
    private sleepTimerService: SleepTimerService,
    private loggingService: LoggingService,
    private configService: ConfigService,
    private titleService: Title,
    @Inject(AudioElementToken) private audio: AudioElement) {
      /* Subscribe to the events that we care about from the AudioElement
      and pass them on to the appropriate handler. */
      this.audio.error.subscribe(error => this.onAudioError(error));
      this.audio.playing.subscribe(() => this.onAudioPlaying());
      this.audio.paused.subscribe(() => this.onAudioPaused());
      // Pause the playing audio when the sleep timer does its thing
      this.sleepTimerService.sleep.subscribe(() => this.pause());
      // Whenever the now playing info changes
      this.nowPlaying$.subscribe(nowPlaying => this.onNowPlayingChanged(nowPlaying));
    }

  /** The current audio source URL */
  private _source: string;
  /** Subscription used to refresh the now-playing stream info on a scheduled interval */
  private refreshSub: Subscription;
  /** Subscription which manages any currently running now-playing stream info fetch operation */
  private metaFetchSub: Subscription;
  /** The current state of nowPlaying represented as a private BehaviorSubject */
  private nowPlaying = new BehaviorSubject<NowPlaying>(new NowPlaying(null, null, StreamInfoStatus.NotInitialized));
  /** The current paused state represented as a private BehaviorSubject */
  private paused = new BehaviorSubject<boolean>(true);
  /** nowPlaying publicly exposed as an obserable */
  public nowPlaying$ = this.nowPlaying.asObservable();
  /** paused state publicly exposed as an observable */
  public paused$ = this.paused.asObservable();

  /** Audio source URL */
  public get source(): string {
    return this._source;
  }

  /** The current value of nowPlaying.  Use this only for reference
   * and assignment: don't modify this.  I'll set this to use
   * immutable.js soon. */
  private get nowPlayingValue(): NowPlaying {
    return this.nowPlaying.value;
  }

  /** Notifies the user when the audio fails to play */
  private onAudioError(error): void {
    this.notificationService.notify(Severities.Error, 'Failed to play audio', `Failed to play ${this.source}`);
  }

  /** Notifies listeners when the audio starts to play. */
  private onAudioPlaying(): void {
    this.paused.next(false);
  }

  /** Updates the reactive 'paused' state and unsubscribes
   * from any metadata fetch & refresh subscriptions. */
  private onAudioPaused(): void {
    /* Clear the src in order to prevent the browser from continuing to
    download audio in the background. */
    this.audio.src = '';
    /* Notify listeners that the audio is now paused. */
    this.paused.next(true);
    /* Unsubscribe from the refresh interval and from any concurrent metadata
    fetch when the media is paused.  We want to do this in the onAudioPaused
    handler so that we catch the "user presses the browser-provided pause button"
    use-case as well, in addition to our own pause button. */
    if (this.refreshSub) { this.refreshSub.unsubscribe(); }
    if (this.metaFetchSub) { this.metaFetchSub.unsubscribe(); }
  }

  /** Notifies the user of nowPlaying changes */
  private onNowPlayingChanged(nowPlaying: NowPlaying) {
    // If we have stream info
    if (nowPlaying.streamInfo != null) {
      // Notify the user of the currently playing stream info
      const notificationBody = !isBlank(nowPlaying.streamInfo.title) ?
        `${nowPlaying.streamInfo.title} - ${nowPlaying.station.title}` : nowPlaying.station.title;
      this.notificationService.notify(Severities.Info, 'Now Playing', notificationBody);
    }
  }

  /** Reports whether there is a currently selected station */
  public get stationSelected(): boolean {
    return !isBlank(this.source);
  }

  /** Plays the specified Station */
  public playStation(station: Station) {
    // Pause the current audio in case it's already playing something
    this.pause();
    // Update the current station
    this.updateStation(station);
    // Set the source url accordingly in the service
    this._source = station.url;
    // Play the audio and fetch the metadata
    this.play();
  }

  /** Updates the Now Playing metadata with the specified station info */
  private updateStation(station: Station) {
    // If the provided station is any different from the current station
    if (!isEqual(this.nowPlayingValue.station, station)) {
      // Update the NowPlaying metadata with a new object (rather than mutating the existing one)
      this.nowPlaying.next(new NowPlaying(station, null, StreamInfoStatus.NotInitialized));
    }
  }

  /** Initiates a new subscription to getMetadata and updates the stored 'now playing'
   * info accordingly upon succesful metadata retrieval. */
  private loadMetadata(setLoading: boolean = false) {
    // If setLoading is specified and NowPlaying doesn't already indicate loading
    if (setLoading && this.nowPlayingValue.streamInfoStatus !== StreamInfoStatus.Loading) {
      // Emit a new NowPlaying object which indicates that we're currently loading
      this.nowPlaying.next(new NowPlaying(this.nowPlayingValue.station, null, StreamInfoStatus.Loading));
      // Temporarily set a generic app title until we get some stream info back
      this.titleService.setTitle('Browninglogic Radio');
    }
    // If we're not still waiting on a previous metadata fetch to complete
    if (this.metaFetchSub == null || this.metaFetchSub.closed) {
      // Fetch updated stream info from the API
      this.metaFetchSub = this.streamInfoService.getMetadata(this.source)
        .subscribe(
          streamInfo => {
            // If the retrieved stream info differs from that in the current now playing model
            if (!isEqual(this.nowPlayingValue.streamInfo, streamInfo)) {
              // Emit a new NowPlaying object with the updated stream info
              this.nowPlaying.next(new NowPlaying(this.nowPlayingValue.station, streamInfo, StreamInfoStatus.Valid));

              /* Set the HTML document title to the title (or station,
                if no title was provided). */
              if (!isBlank(this.nowPlayingValue.streamInfo.title)) {
                this.titleService.setTitle(this.nowPlayingValue.streamInfo.title);
              } else {
                this.titleService.setTitle(this.nowPlayingValue.station.title);
              }
            }
          },
          error => {
            /* In the case of a metadata fetch error, log it as an event.  This is expected
            to happen commonly and it's more likely to be the stream's fault than ours, so we
            don't consider it to be an application bug.  It is worth noting for diagnostics, however. */
            this.loggingService.logEvent('Failed to fetch metadata', { 'url': this.source, 'message': error.error });
            // Emit a new NowPlaying object denoting the error
            this.nowPlaying.next(new NowPlaying(this.nowPlayingValue.station, null, StreamInfoStatus.Error));
            // Set a generic app title
            this.titleService.setTitle('Browninglogic Radio');
          }
        );
    }
  }

  /** Play the selected audio and handle the relevant side-effects */
  public play() {
    /* Since we clear the audio src after pause, we need to assing or re-assign
    it before playing. */
    this.audio.src = this.source;
    // Play the audio
    this.audio.play();
    /* On the initial load of the station, load the metadata
    and set the StreamInfoStatus to denote that we're in
    a 'loading' state. */
    this.loadMetadata(true);
    /* Unsubscribe if there's still an active refresh interval
    subscription from the previously-played station. */
    if (this.refreshSub) { this.refreshSub.unsubscribe(); }
    // Refresh the "Now Playing" metadata once every few seconds.
    this.refreshSub = interval(this.configService.appConfig.metadataRefreshInterval).subscribe(() => this.loadMetadata());
  }

  /** Pause the selected audio */
  public pause() {
    this.audio.pause();
  }
}
