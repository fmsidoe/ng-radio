import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  fetchStationsStart,
  fetchStationsSucceeded,
  fetchStationsFailed,
  addToFavoritesStart,
  addToFavoritesSucceeded,
  removeFromFavoritesStart,
  addToFavoritesFailed,
  removeFromFavoritesSucceeded,
  removeFromFavoritesFailed,
  addCurrentStationToFavoritesRequested,
  removeCurrentStationFromFavoritesRequested
} from './favorite-stations.actions';
import { switchMap, catchError, map, withLatestFrom, filter, mergeMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { FavoriteStationsService } from '../../services/favorite-stations.service';
import { Store, select } from '@ngrx/store';
import { selectFavoriteStationsLoadingStatus, selectIsCurrentStationInFavorites, selectCurrentFavoriteStationId } from './favorite-stations.selectors';
import { NotificationService, Severities } from '@notifications';
import { RootState } from '../../models/root-state';
import { selectCurrentStation } from '../player/player.selectors';
import { selectStation } from '../player/player-actions';

@Injectable()
export class FavoriteStationsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private favoriteStationsService: FavoriteStationsService,
    private notificationService: NotificationService
  ) {}

  fetchStations$ = createEffect(() => this.actions$.pipe(
    ofType(fetchStationsStart),
    switchMap(() =>
      this.favoriteStationsService.fetchAll().pipe(
        map(stations => fetchStationsSucceeded({stations})),
        catchError(error => of(fetchStationsFailed({error})))
      )
    )
  ));

  addCurrentStationToFavoritesRequested$ = createEffect(() => this.actions$.pipe(
    ofType(addCurrentStationToFavoritesRequested),
    withLatestFrom(this.store.pipe(select(selectIsCurrentStationInFavorites))),
    filter(([action, isFavorite]) => !isFavorite),
    withLatestFrom(this.store.pipe(select(selectCurrentStation))),
    map(([action, station]) => addToFavoritesStart({station}))
  ));

  addFavorite$ = createEffect(() => this.actions$.pipe(
    ofType(addToFavoritesStart),
    mergeMap(action =>
      this.favoriteStationsService.addFavorite(action.station).pipe(
        map(station => addToFavoritesSucceeded({station})),
        catchError(error => of(addToFavoritesFailed({station: action.station, error})))
      )
    )
  ));

  removeCurrentStationFromFavoritesRequested$ = createEffect(() => this.actions$.pipe(
    ofType(removeCurrentStationFromFavoritesRequested),
    withLatestFrom(this.store.pipe(select(selectIsCurrentStationInFavorites))),
    filter(([action, isFavorite]) => isFavorite),
    withLatestFrom(this.store.pipe(select(selectCurrentFavoriteStationId))),
    map(([action, stationId]) => removeFromFavoritesStart({stationId}))
  ));

  removeFavorite$ = createEffect(() => this.actions$.pipe(
    ofType(removeFromFavoritesStart),
    mergeMap(action =>
      this.favoriteStationsService.removeFavorite(action.stationId).pipe(
        map(() => removeFromFavoritesSucceeded({stationId: action.stationId})),
        catchError(error => of(removeFromFavoritesFailed({stationId: action.stationId, error})))
      )
    )
  ));

  fetchOnInitialStationSelect$ = createEffect(() => this.actions$.pipe(
    ofType(selectStation),
    withLatestFrom(this.store.pipe(select(selectFavoriteStationsLoadingStatus))),
    filter(([action, selected]) => !selected.loaded && !selected.inProgress),
    map(() => fetchStationsStart())
  ));

  notifyAddSucceeded$ = createEffect(() => this.actions$.pipe(
    ofType(addToFavoritesSucceeded),
    tap(action => this.notificationService.notify(Severities.Success, 'Added To Favorites', `${action.station.title} has been added to favorites.`))
  ), { dispatch: false });

  notifyAddFailed$ = createEffect(() => this.actions$.pipe(
    ofType(addToFavoritesFailed),
    tap(action => this.notificationService.notify(Severities.Error, 'Failed to Add To Favorites', `${action.station.title} was not added to favorites.`))
  ), { dispatch: false });

  notifyRemoveFailed$ = createEffect(() => this.actions$.pipe(
    ofType(removeFromFavoritesFailed),
    tap(() =>
      this.notificationService.notify(Severities.Error, 'Failed to Remove From Favorites', `Station was not removed from favorites.`)
    )
  ), { dispatch: false });
}
