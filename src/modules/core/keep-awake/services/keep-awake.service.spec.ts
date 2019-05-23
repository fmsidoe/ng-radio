import { TestBed } from '@angular/core/testing';
import { KeepAwakeService } from './keep-awake.service';
import { NotificationsSpyFactories } from '@modules/core/notifications/testing/notifications-spy-factories.spec';
import { NoSleepToken } from '../injection-tokens/no-sleep-token';
import { AudioElementToken } from '@modules/core/core-radio-logic/core-radio-logic.module';
import { AudioElementStub } from '@modules/core/core-radio-logic/testing/AudioElementStub.spec';
import { KeepAwakeSpyFactories } from '../testing/keep-awake-spy-factories.spec';
import { KeepAwakeModule } from '@modules/core/keep-awake/keep-awake.module';
import { MessageService } from 'primeng/api';
import * as NoSleep from 'nosleep.js';

describe('KeepAwakeService', () => {
  let enabledSpy: jasmine.Spy;
  let keepAwakeService: KeepAwakeService;
  let noSleepSpy: jasmine.SpyObj<NoSleep>;
  let audioElement: AudioElementStub;

  beforeEach(() => {
    audioElement = new AudioElementStub();
    noSleepSpy = KeepAwakeSpyFactories.CreateKeepAwakeServiceSpy();

    TestBed.configureTestingModule({
      imports: [
        KeepAwakeModule
      ],
      providers: [
        { provide: AudioElementToken, useValue: audioElement },
        { provide: NoSleepToken, useValue: noSleepSpy },
        { provide: MessageService, useValue: NotificationsSpyFactories.CreateMessageServiceSpy() }
      ]
    });

    keepAwakeService = TestBed.get(KeepAwakeService);
    enabledSpy = jasmine.createSpy('enabled');
    keepAwakeService.enabled$.subscribe(enabled => enabledSpy(enabled));
  });

  it('should be created', () => {
    expect(keepAwakeService).toBeTruthy();
  });

  it('should properly enable and disable', () => {
    /* Before doing anything enabled$ should be false and
    enable should not have been called on the nosleep object yet. */
    expect(enabledSpy).toHaveBeenCalledTimes(1);
    expect(enabledSpy.calls.mostRecent().args).toEqual([false]);
    expect(noSleepSpy.enable).not.toHaveBeenCalled();

    // Enable nosleep
    keepAwakeService.enable();
    /* After enabling nosleep enabled$ should emit true and
    enable should have been called on the nosleep object once. */
    expect(enabledSpy).toHaveBeenCalledTimes(2);
    expect(enabledSpy.calls.mostRecent().args).toEqual([true]);
    expect(noSleepSpy.enable).toHaveBeenCalledTimes(1);

    /* Disable should not have been called yet at all
    at this point. */
    expect(noSleepSpy.disable).not.toHaveBeenCalled();

    // Disable nosleep again
    keepAwakeService.disable();
    /* After turning nosleep back off, enabled$ should emit the
    status again and disabled should be called. */
    expect(enabledSpy).toHaveBeenCalledTimes(3);
    expect(enabledSpy.calls.mostRecent().args).toEqual([false]);
    expect(noSleepSpy.disable).toHaveBeenCalledTimes(1);
  });

  it('should toggle on and off', () => {
    /* Before doing anything enabled$ should be false and
    enable should not have been called on the nosleep object yet. */
    expect(enabledSpy).toHaveBeenCalledTimes(1);
    expect(enabledSpy.calls.mostRecent().args[0]).toBe(false);
    expect(noSleepSpy.enable).not.toHaveBeenCalled();

    // Enable nosleep
    keepAwakeService.toggle();
    /* After toggling, enabled$ should emit true and
    enable should have been called on the nosleep object once. */
    expect(enabledSpy).toHaveBeenCalledTimes(2);
    expect(enabledSpy.calls.mostRecent().args[0]).toBe(true);
    expect(noSleepSpy.enable).toHaveBeenCalledTimes(1);

    /* Disable should not have been called yet at all
    at this point. */
    expect(noSleepSpy.disable).not.toHaveBeenCalled();

    // Toggle again
    keepAwakeService.toggle();
    /* After toggling, enabled$ should emit a status of false
    and disabled should be called. */
    expect(enabledSpy).toHaveBeenCalledTimes(3);
    expect(enabledSpy.calls.mostRecent().args[0]).toBe(false);
    expect(noSleepSpy.disable).toHaveBeenCalledTimes(1);
  });

  it('should disable nosleep on audio pause', () => {
    /* On init neither enable nor disable should have been
    called at all. */
    expect(noSleepSpy.disable).not.toHaveBeenCalled();
    expect(noSleepSpy.enable).not.toHaveBeenCalled();

    // Enable nosleep and ensure that it was enabled properly
    keepAwakeService.enable();
    expect(noSleepSpy.enable).toHaveBeenCalledTimes(1);

    // Emit audioPaused
    audioElement.pause();
    // Nosleep should be disabled now
    expect(noSleepSpy.disable).toHaveBeenCalledTimes(1);
  });
});