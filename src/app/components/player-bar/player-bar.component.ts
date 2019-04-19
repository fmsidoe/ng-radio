import { Component } from '@angular/core';
import { PlayerService } from 'src/app/services/player.service';
import { SleepTimerService } from 'src/app/services/sleep-timer.service';
import { KeepAwakeService } from 'src/app/services/keep-awake.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'blr-player-bar',
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss']
})
export class PlayerBarComponent {
  constructor(public playerService: PlayerService,
    public sleepTimerService: SleepTimerService,
    public keepAwakeService: KeepAwakeService) {}

  public onImgError(img: HTMLImageElement) {
    Utils.SetAltImage(img, '/assets/images/radio.svg');
  }

  public onTimerSelected(length: number) {
    if (length != null) {
      this.sleepTimerService.setTimer(length);
    } else {
      this.sleepTimerService.cancelTimer();
    }
  }
}
