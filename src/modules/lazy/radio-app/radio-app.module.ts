import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioAppComponent } from './components/radio-app/radio-app.component';
import { RadioAppRoutingModule } from './radio-app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResponsiveSidenavModule } from '@responsive-sidenav';
import { PlayerBarComponent } from './components/player-bar/player-bar.component';
import { PlayerBarStationInfoComponent } from './components/player-bar-station-info/player-bar-station-info.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { SharedComponentsModule } from '@shared-components';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    RadioAppComponent,
    PlayerBarComponent,
    PlayerBarStationInfoComponent,
    SidenavComponent
  ],
  imports: [
    CommonModule,
    RadioAppRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    ResponsiveSidenavModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    SharedComponentsModule
  ]
})
export class RadioAppModule { }

export { PlayerBarComponent, PlayerBarStationInfoComponent, SidenavComponent };
