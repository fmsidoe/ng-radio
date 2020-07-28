import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { Subject, timer, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, filter, debounce, map } from 'rxjs/operators';
import { MatInput } from '@angular/material/input';
import { Store, select } from '@ngrx/store';
import { PlayerActions, PlayerSelectors } from '@core/store';
import { Station } from '@core/models/player';
import { nameTermUpdated, tagTermUpdated } from '../../store/radio-browser.actions';
import { SubSink } from 'subsink';
import { selectSearchResults, selectIsSearchInProgress } from '../../store/radio-browser.selectors';
import { RadioBrowserRootState } from '../../models/radio-browser-root-state';
import { RadioBrowserSelectors, RadioBrowserActions } from '../../store';
import { ConfigService } from '@core';

@Component({
  templateUrl: './radio-browser.component.html',
  styleUrls: ['./radio-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RadioBrowserComponent implements OnInit, OnDestroy {
  constructor(private store: Store<RadioBrowserRootState>, private configService: ConfigService) {}

  @ViewChild('nameSearchInput', { static: true }) nameSearchInput: MatInput;

  public columns = ['name', 'now-playing', 'tags', 'icon'];

  public resultsLimit$ = this.configService.appConfig$.pipe(map(config => config.radioBrowserSearchResultsLimit));
  public searchResults$ = this.store.pipe(select(selectSearchResults));
  public isSearchInProgress$ = this.store.pipe(select(selectIsSearchInProgress));
  public streamInfo$ = this.store.pipe(select(PlayerSelectors.streamInfo));
  public selectedCountry$ = this.store.pipe(select(RadioBrowserSelectors.selectedCountry));
  public countryFilter$ = this.store.pipe(select(RadioBrowserSelectors.countryFilter));
  public countries$ = this.store.pipe(select(RadioBrowserSelectors.filteredCountries));
  public tagSuggestions$ = this.store.pipe(select(RadioBrowserSelectors.tagSuggestions));
  public fetchingTagSuggestions$ = this.store.pipe(select(RadioBrowserSelectors.fetchingTagSuggestions));
  public nameSearch$ = new Subject<string>();
  public tagSearch$ = new Subject<{tag: string, debounce: boolean}>();
  public nameSearch: string;
  public tagSearch: string;
  private debounceTime = 500;
  private subs = new SubSink();

  ngOnInit() {
    this.subs.sink = this.nameSearch$
      .pipe(debounceTime(this.debounceTime), distinctUntilChanged())
      .subscribe(term => this.store.dispatch(nameTermUpdated({term})));
    this.subs.sink = this.tagSearch$.pipe(
      // Debounce conditionally
      debounce(t => t.debounce ? timer(this.debounceTime) : EMPTY),
      map(t => t.tag.toLowerCase()),
      distinctUntilChanged()
    ).subscribe(term => this.store.dispatch(tagTermUpdated({term})));

    // Load any pre-existing search criteria from state on init
    this.store.pipe(select(RadioBrowserSelectors.searchCriteria), take(1)).subscribe(criteria => {
      this.nameSearch = criteria.nameTerm;
      this.tagSearch = criteria.tagTerm;
    });

    // On init set any existing search results as listed stream info urls
    this.searchResults$.pipe(take(1), filter(results => results != null)).subscribe(results =>
      this.store.dispatch(PlayerActions.selectStreamInfoUrls({streamUrls: results.map(s => s.url)})
    ));

    // Focus on the name input
    this.nameSearchInput.focus();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.store.dispatch(PlayerActions.clearStreamInfoUrls());
  }

  onRowClicked(station: Station) {
    this.store.dispatch(PlayerActions.selectStation({station}));
  }

  onTagTermChanged(term: string) {
    this.tagSearch$.next({tag: term, debounce: true});
  }

  onTagTermSelected(term: string) {
    // Don't debounce if a value was selected via autocomplete
    this.tagSearch$.next({tag: term, debounce: false});
  }

  onNameTermChanged(term: string) {
    this.nameSearch$.next(term);
  }

  public onCountryChanged(country: string): void {
    this.store.dispatch(RadioBrowserActions.countrySelected({country}));
  }

  public onCountryFilterChanged(text: string): void {
    this.store.dispatch(RadioBrowserActions.countryFilterChanged({text}));
  }

  public onTagFocused(): void {
    this.store.dispatch(RadioBrowserActions.tagInputFocused());
  }
}
