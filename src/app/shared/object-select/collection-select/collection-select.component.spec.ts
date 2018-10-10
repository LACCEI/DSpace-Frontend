import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { RemoteData } from '../../../core/data/remote-data';
import { PaginatedList } from '../../../core/data/paginated-list';
import { PageInfo } from '../../../core/shared/page-info.model';
import { PaginationComponentOptions } from '../../pagination/pagination-component-options.model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared.module';
import { ObjectSelectServiceStub } from '../../testing/object-select-service-stub';
import { ObjectSelectService } from '../object-select.service';
import { HostWindowService } from '../../host-window.service';
import { HostWindowServiceStub } from '../../testing/host-window-service-stub';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CollectionSelectComponent } from './collection-select.component';
import { Collection } from '../../../core/shared/collection.model';

describe('ItemSelectComponent', () => {
  let comp: CollectionSelectComponent;
  let fixture: ComponentFixture<CollectionSelectComponent>;
  let objectSelectService: ObjectSelectService;

  const mockCollectionList = [
    Object.assign(new Collection(), {
      id: 'id1',
      name: 'name1'
    }),
    Object.assign(new Collection(), {
      id: 'id2',
      name: 'name2'
    })
  ];
  const mockCollections = Observable.of(new RemoteData(false, false, true, null, new PaginatedList(new PageInfo(), mockCollectionList)));
  const mockPaginationOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'search-page-configuration',
    pageSize: 10,
    currentPage: 1
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), SharedModule, RouterTestingModule.withRoutes([])],
      declarations: [],
      providers: [
        { provide: ObjectSelectService, useValue: new ObjectSelectServiceStub() },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionSelectComponent);
    comp = fixture.componentInstance;
    comp.dsoRD$ = mockCollections;
    comp.paginationOptions = mockPaginationOptions;
    fixture.detectChanges();
    objectSelectService = (comp as any).objectSelectService;
  });

  it(`should show a list of ${mockCollectionList.length} collections`, () => {
    const tbody: HTMLElement = fixture.debugElement.query(By.css('table#collection-select tbody')).nativeElement;
    expect(tbody.children.length).toBe(mockCollectionList.length);
  });

  describe('checkboxes', () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      checkbox = fixture.debugElement.query(By.css('input.collection-checkbox')).nativeElement;
    });

    it('should initially be unchecked',() => {
      expect(checkbox.checked).toBeFalsy();
    });

    it('should be checked when clicked', () => {
      checkbox.click();
      fixture.detectChanges();
      expect(checkbox.checked).toBeTruthy();
    });

    it('should switch the value through object-select-service', () => {
      spyOn((comp as any).objectSelectService, 'switch').and.callThrough();
      checkbox.click();
      expect((comp as any).objectSelectService.switch).toHaveBeenCalled();
    });
  });

  describe('when confirm is clicked', () => {
    let confirmButton: HTMLButtonElement;

    beforeEach(() => {
      confirmButton = fixture.debugElement.query(By.css('button.collection-confirm')).nativeElement;
      spyOn(comp.confirm, 'emit').and.callThrough();
    });

    it('should emit the selected collections',() => {
      confirmButton.click();
      expect(comp.confirm.emit).toHaveBeenCalled();
    });
  });
});
