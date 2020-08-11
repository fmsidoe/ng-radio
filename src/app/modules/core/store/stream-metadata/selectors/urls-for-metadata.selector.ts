import { createSelector } from '@ngrx/store';
import { PlayerStatus } from '../../../models/player/player-status';
import { uniq, sortBy } from 'lodash-es';
import * as PlayerSelectors from '../../player/player.selectors';
import * as RouterSelectors from '../../router/selectors';
import * as FavoritesSelectors from '../../favorite-stations/favorite-stations.selectors';
import * as RadioBrowserResultsSelectors from '../../radio-browser-results/selectors';

export const urlsSelectedForMetadata = createSelector(
    PlayerSelectors.selectCurrentStation,
    PlayerSelectors.selectPlayerStatus,
    PlayerSelectors.streamsMappedToADifferentUrl,
    RouterSelectors.currentUrl,
    FavoritesSelectors.selectFavoriteStations,
    RadioBrowserResultsSelectors.radioBrowserResults,
    (currentStation, currentStatus, mapped, currentRoute, favorites, radioBrowserResults) => {
        let urls = [];
        if (currentStation != null && currentStatus == PlayerStatus.Playing) {
            urls.push(currentStation.url);
        }
        switch(currentRoute) {
            case '/favorites':
                if (favorites) {
                    urls.push(...favorites.map(s => s.url));
                }
                break;
            case '/radio-browser':
                if (radioBrowserResults) {
                    urls.push(...radioBrowserResults.map(s => s.url));
                }
                break;
        }
        /* If there are any URLs which were mapped to something different during validation,
        then look up data for the validated version rather than the original. */
        urls = urls.map(url => mapped.find(m => m.original === url)?.validated || url);

        /* Ensure that the list is always unique and sorted so that the deep equality
        comparison in our effects really does know if the list actually changed, as opposed
        to just being reordered or having a duplicate entry added. */
        return sortBy(uniq(urls));
    }
)