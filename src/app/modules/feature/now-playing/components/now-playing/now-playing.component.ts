import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RootState } from '@core';
import { KeepAwakeService } from '@core';
import { selectMinutesUntilSleep } from '@core/store/sleep-timer';
import { PlayerStatus, StreamInfoStatus } from '@core/models/player';
import { FavoriteStationsSelectors, FavoriteStationsActions } from '@core/store/favorite-stations';
import * as PlayerSelectors from '@core/store/player/selectors';

@Component({
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingComponent {
  constructor(
    public keepAwakeService: KeepAwakeService,
    private store: Store<RootState>
  ) {}

  public playerStatus$ = this.store.pipe(select(PlayerSelectors.selectPlayerStatus));
  public currentStation$ = this.store.pipe(select(FavoriteStationsSelectors.selectCurrentStationOrMatchingFavorite));
  public currentStreamInfo$ = this.store.pipe(select(PlayerSelectors.currentStreamInfo));
  public minutesUntilSleep$ = this.store.pipe(select(selectMinutesUntilSleep));
  public validatingCurrent$ = this.store.pipe(select(PlayerSelectors.selectIsValidationInProgressForCurrentStation));
  public streamInfoStatus = StreamInfoStatus;
  public playerStatus = PlayerStatus;
  private invalidImageUrls = new Array<string>();

  public getImageSrc(stationIconUrl: string): string {
    return stationIconUrl != null && !this.invalidImageUrls.includes(stationIconUrl) ? stationIconUrl : '/assets/images/radio.svg';
  }

  public onImgError(stationIconUrl: string): void {
    if (stationIconUrl != null && !this.invalidImageUrls.includes(stationIconUrl)) {
      this.invalidImageUrls.push(stationIconUrl);
    }
  }

  public onEditFavoriteClicked(): void {
    this.store.dispatch(FavoriteStationsActions.openStationEditCurrent());
  }
}
