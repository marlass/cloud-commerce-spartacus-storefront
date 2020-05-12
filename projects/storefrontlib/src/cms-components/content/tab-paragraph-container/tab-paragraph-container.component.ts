import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  CmsService,
  CMSTabParagraphContainer,
  WindowRef,
} from '@spartacus/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ComponentWrapperDirective } from '../../../cms-structure/page/component/component-wrapper.directive';
import { CmsComponentData } from '../../../cms-structure/page/model/index';

@Component({
  selector: 'cx-tab-paragraph-container',
  templateUrl: './tab-paragraph-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabParagraphContainerComponent
  implements AfterViewInit, OnInit, OnDestroy {
  activeTabNum = 0;

  @ViewChildren(ComponentWrapperDirective) children!: QueryList<
    ComponentWrapperDirective
  >;

  tabTitleParams: Observable<any>[] = [];

  subscription: Subscription;

  constructor(
    public componentData: CmsComponentData<CMSTabParagraphContainer>,
    protected cmsService: CmsService,
    protected winRef: WindowRef
  ) {}

  components$: Observable<any[]> = this.componentData.data$.pipe(
    distinctUntilChanged((x, y) => x?.components === y?.components),
    switchMap((data) =>
      combineLatest(
        (data?.components ?? '').split(' ').map((component) =>
          this.cmsService.getComponentData<any>(component).pipe(
            distinctUntilChanged(),
            map((tab) => {
              if (!tab) {
                return undefined;
              }

              if (!tab.flexType) {
                tab = {
                  ...tab,
                  flexType: tab.typeCode,
                };
              }

              return {
                ...tab,
                title: `${data.uid}.tabs.${tab.uid}`,
              };
            })
          )
        )
      )
    )
  );

  select(tabNum: number): void {
    this.activeTabNum = tabNum;
  }

  ngOnInit(): void {
    this.activeTabNum =
      this.winRef.nativeWindow.history?.state?.activeTab ?? this.activeTabNum;
  }

  ngAfterViewInit(): void {
    // If the sub cms components data exist, the components created before ngAfterViewInit are called.
    // In this case, the title parameters are directly pulled from them.
    // If the sub cms components data does not exist, it should should be loaded first.
    // In this case, listen to the changes to wait for them to be created.
    if (this.children.length > 0) {
      this.getTitleParams(this.children);
    } else {
      this.subscription = this.children.changes.subscribe(
        (tabComps: QueryList<ComponentWrapperDirective>) =>
          this.getTitleParams(tabComps)
      );
    }
  }

  private getTitleParams(children: QueryList<ComponentWrapperDirective>) {
    children.forEach((comp) => {
      if (comp.cmpRef && comp.cmpRef.instance.tabTitleParam$) {
        this.tabTitleParams.push(comp.cmpRef.instance.tabTitleParam$);
      } else {
        this.tabTitleParams.push(null);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
