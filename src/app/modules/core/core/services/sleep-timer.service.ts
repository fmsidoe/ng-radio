import { Injectable, Output, EventEmitter } from '@angular/core';
import { Subscription, timer, BehaviorSubject } from 'rxjs';
import { NotificationService, Severities } from '@notifications';
import * as moment from 'moment';

/** Service which maintains the sleep timer functionality & state */
@Injectable()
export class SleepTimerService {
  constructor(private notificationService: NotificationService) {}

  /** Subscription which maintains the sleep timer countdown */
  private sleepTimerSubscription: Subscription;
  /** Subscription which maintains the minute interval for the purpose
   * of keeping subscribers notified of how many minutes remain until
   * going to sleep. */
  private minuteInterval: Subscription;
  /** Moment representing the time at which we're going to sleep. */
  private sleepTime: moment.Moment;
  private minutesUntilSleep = new BehaviorSubject<number>(null);
  /* How many minutes remain until we go to sleep. */
  public minutesUntilSleep$ = this.minutesUntilSleep.asObservable();
  /** The actual sleep event */
  @Output() sleep = new EventEmitter<void>();

  private calculateMinutesUntilSleep(): number {
    if (this.sleepTime != null) {
      return this.sleepTime.diff(moment(), 'minutes');
    }
    return null;
  }

  /**
   * Clears any previous timers and initiates a new sleep timer which
   * will go off in the specified number of minutes
   * @param minutes Number of minutes until going to sleep
   */
  public setTimer(minutes: number): void {
    // Clear the subscription & date from any previous timers
    this.clearTimer();
    // Set the sleepTime to the specified number of minutes from the current date
    this.sleepTime = moment().add(minutes, 'minutes');
    // Call goToSleep in the specified number of minutes
    this.sleepTimerSubscription = timer(minutes * 60000).subscribe(() => this.goToSleep());
    /* Wait 1 ms so that we're not still at the very start of the interval (we want the first value
    emitted to be minutes - 1 rather than minutes), then update minutesUntilSleep once each minute. */
    this.minuteInterval = timer(1, 60000).subscribe(() => this.minutesUntilSleep.next(this.calculateMinutesUntilSleep()));
    // Notify the user that the sleep timer has been set.
    this.notificationService.notify(Severities.Success, 'Sleep Timer Set', `Sleep timer set for ${this.sleepTime.format('h:mm:ss a')}.`);
  }

  /** Cancels any current sleep timers and notifies the user accordingly */
  public cancelTimer(): void {
    // Clear the subscription & date, then notify the user that the timer has been cancelled.
    this.clearTimer();
    this.notificationService.notify(Severities.Success, 'Sleep Timer Cancelled', `Sleep timer cancelled.`);
  }

  /** Silently clears any current sleep timers */
  private clearTimer(): void {
    // Unsubscribe and clear everything without performing any notifications or emitting any events
    if (this.sleepTimerSubscription) { this.sleepTimerSubscription.unsubscribe(); }
    if (this.minuteInterval) { this.minuteInterval.unsubscribe(); }
    this.sleepTime = null;
    this.minutesUntilSleep.next(null);
  }

  private goToSleep(): void {
    // Clear out the timer
    this.clearTimer();
    // Emit the actual sleep event
    this.sleep.emit();
    // Notify the user that we're going to sleep
    this.notificationService.notify(Severities.Info, 'Going to sleep', 'Good night!');
  }
}