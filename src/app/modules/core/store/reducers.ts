import { ActionReducerMap } from '@ngrx/store';
import { RootState } from '../models/root-state';
import { favoriteStationsReducer } from './favorite-stations/favorite-stations.reducer';
import { playerReducer } from './player/player.reducer';
import { authenticationReducer } from './authentication/authentication.reducer';

export const reducers: ActionReducerMap<RootState> = {
    favoriteStations: favoriteStationsReducer,
    player: playerReducer,
    authentication: authenticationReducer
};
