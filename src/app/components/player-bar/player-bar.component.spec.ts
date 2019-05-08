import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerBarComponent } from './player-bar.component';
import { MatTooltipModule, MatIconModule, MatButtonModule, MatToolbarModule,
  MatMenuModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { SpyFactories } from 'src/app/testing/spy-factories.spec';
import { PlayerService, CoreRadioLogicModule } from '@modules/core-radio-logic/core-radio-logic.module';
import { CoreRadioLogicSpyFactories } from '@modules/core-radio-logic/testing/core-radio-logic-spy-factories.spec';
import { SleepTimerMenuComponent } from '../sleep-timer-menu/sleep-timer-menu.component';
import { NotificationService } from 'src/app/services/notification.service';
import { KeepAwakeService } from 'src/app/services/keep-awake.service';
import { PlayerBarStationInfoComponent } from '../player-bar-station-info/player-bar-station-info.component';
import { CustomStationWindowComponent } from '../custom-station-window/custom-station-window.component';
import { ModalManagerModule } from '@browninglogic/ng-modal';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PlayerBarComponent', () => {
  let component: PlayerBarComponent;
  let fixture: ComponentFixture<PlayerBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PlayerBarComponent,
        SleepTimerMenuComponent,
        PlayerBarStationInfoComponent,
        CustomStationWindowComponent
      ],
      imports: [
        RouterTestingModule,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        ModalManagerModule,
        FormsModule,
        NoopAnimationsModule,
        CoreRadioLogicModule
      ],
      providers: [
        { provide: PlayerService, useValue: CoreRadioLogicSpyFactories.CreatePlayerServiceSpy() },
        { provide: NotificationService, useValue: SpyFactories.CreateNotificationServiceSpy() },
        { provide: KeepAwakeService, useValue: SpyFactories.CreateKeepAwakeServiceSpy() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
