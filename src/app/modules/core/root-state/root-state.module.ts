import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../../environments/environment';
import { reducers } from './root-reducer';
import { FavoriteStationsEffects } from './sections/favorite-stations/store/favorite-stations.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      }
    }),
    EffectsModule.forRoot([FavoriteStationsEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ]
})
export class RootStateModule { }