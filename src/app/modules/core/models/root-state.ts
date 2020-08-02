import { AuthenticationState } from '../store/authentication/models/authentication-state';
import { FavoriteStationsState } from './favorite-stations/favorite-stations-state';
import { PlayerState } from './player/player-state';

export interface RootState {
    favoriteStations: FavoriteStationsState;
    player: PlayerState;
    authentication: AuthenticationState;
}
