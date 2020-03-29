import { FavoriteStationsState } from '../sections/favorite-stations/models/favorite-stations-state';
import { PlayerState } from '../sections/player/models/player-state';
import { SleepTimerState } from '../sections/sleep-timer/models/sleep-timer-state';

export interface RootState {
    favoriteStations: FavoriteStationsState;
    player: PlayerState;
    sleepTimer: SleepTimerState
}
