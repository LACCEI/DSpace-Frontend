import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Router, EventType, Scroll } from '@angular/router';
import { getCommunityPageRoute } from '../../../community-page/community-page-routing-paths';
import { getCollectionPageRoute } from '../../../collection-page/collection-page-routing-paths';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { BrowseDefinition } from '../../../core/shared/browse-definition.model';
import { RemoteData } from '../../../core/data/remote-data';
import { BrowseService } from '../../../core/browse/browse.service';

export interface ComColPageNavOption {
  id: string;
  label: string;
  routerLink: string;
  params?: any;
}

/**
 * A component to display the "Browse By" section of a Community or Collection page
 * It expects the ID of the Community or Collection as input to be passed on as a scope
 */
@Component({
  selector: 'ds-comcol-page-browse-by',
  styleUrls: ['./comcol-page-browse-by.component.scss'],
  templateUrl: './comcol-page-browse-by.component.html'
})
export class ComcolPageBrowseByComponent implements OnDestroy, OnInit {
  /**
   * The ID of the Community or Collection
   */
  @Input() id: string;
  @Input() contentType: string;

  allOptions$: Observable<ComColPageNavOption[]>;

  currentOption$: BehaviorSubject<ComColPageNavOption> = new BehaviorSubject(undefined);

  subs: Subscription[] = [];

  constructor(
    public router: Router,
    private browseService: BrowseService
  ) {
  }

  ngOnInit(): void {
    this.allOptions$ = this.browseService.getBrowseDefinitions().pipe(
      getFirstCompletedRemoteData(),
      map((browseDefListRD: RemoteData<PaginatedList<BrowseDefinition>>) => {
        const allOptions: ComColPageNavOption[] = [];
        if (browseDefListRD.hasSucceeded) {
          let comColRoute: string;
          if (this.contentType === 'collection') {
            comColRoute = getCollectionPageRoute(this.id);
            allOptions.push({
              id: 'search',
              label: 'collection.page.browse.search.head',
              routerLink: comColRoute,
            });
          } else if (this.contentType === 'community') {
            comColRoute = getCommunityPageRoute(this.id);
            allOptions.push({
              id: 'search',
              label: 'collection.page.browse.search.head',
              routerLink: comColRoute,
            });
            allOptions.push({
              id: 'comcols',
              label: 'community.all-lists.head',
              routerLink: `${comColRoute}/subcoms-cols`,
            });
          }

          allOptions.push(...browseDefListRD.payload.page.map((config: BrowseDefinition) => ({
            id: `browse_${config.id}`,
            label: `browse.comcol.by.${config.id}`,
            routerLink: `${comColRoute}/browse/${config.id}`,
          })));
        }
        return allOptions;
      }),
    );

    this.subs.push(combineLatest([
      this.allOptions$,
      this.router.events,
    ]).subscribe(([navOptions, scrollEvent]: [ComColPageNavOption[], Scroll]) => {
      if (scrollEvent.type === EventType.Scroll) {
        for (let option of navOptions) {
          if (option.routerLink === scrollEvent.routerEvent.urlAfterRedirects.split('?')[0]) {
            this.currentOption$.next(option);
          }
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  onSelectChange(event: any): void {
    this.allOptions$.pipe(
      take(1),
    ).subscribe((allOptions: ComColPageNavOption[]) => {
      for (let option of allOptions) {
        if (option.id === event.target.value) {
          this.currentOption$.next(option[0]);
          void this.router.navigate([option.routerLink], { queryParams: option.params });
          break;
        }
      }
    });
  }
}
