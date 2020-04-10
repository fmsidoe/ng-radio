import { FavoriteStationsState } from './favorite-stations-state';

export const initialFavoriteStationsState: FavoriteStationsState = {
    favoriteStations: null,
    fetchInProgress: false,
    fetchFailed: false,
    addInProgressUrls: [],
    removeInProgressIds: []
};