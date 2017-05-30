import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  Component,
  DebugElement
} from '@angular/core';
import TreeViewComponent from './tree-node.component';
import { TreeViewTestService } from './testing/tree-view-test.service';
import { TreeViewTestDict } from './testing/tree-view-test-dict';
import { ITreeViewService } from './tree-view-service.interface';
import {
  ITreeViewItem,
  TreeViewItemState
} from './tree-view-item.interface';
import { click } from '../../testing/index';

describe('TreeViewComponent', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let service: ITreeViewService;
  let nodeEl: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
                                     declarations: [TestHostComponent, TreeViewComponent], // declare the test component
                                     providers:    [TreeViewTestService],
                                   })
           .compileComponents();

  }));

  // synchronous beforeEach
  beforeEach(() => {
    fixture  = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance; // TestHostComponent test instance

    service = TestBed.get(TreeViewTestService);

    fixture.detectChanges();

    // get node element with id === 0
    nodeEl = fixture.debugElement.query(By.css('.tree-node-id-0'));
  });

  it('should contain correct branch label', () => {
    const expectedLabel = TreeViewTestDict.GetNode(0).title;

    let testEl = nodeEl.query(By.css('.node-label'));
    expect(testEl.nativeElement.textContent).toContain(expectedLabel);
  });

  describe('node controls \ icons changes', () => {
    let branch: ITreeViewItem;

    it('must have fa-plus class if branch is collapsed', fakeAsync(() => {
      tick();

      branch          = service.getBranch(0);
      branch.unfolded = false;

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-plus'));
      expect(iconEl).toBeTruthy();
    }));

    it('must have fa-minus class if branch is unfolded', fakeAsync(() => {
      tick();

      branch          = service.getBranch(0);
      branch.unfolded = true;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-minus'));
      expect(iconEl).toBeTruthy();
    }));

    it('must have fa-refresh class if branch is requesting children', fakeAsync(() => {
      tick();

      branch              = service.getBranch(0);
      branch.isRequesting = true;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-refresh'));
      expect(iconEl).toBeTruthy();
    }));

    it('must not have fa-refresh class if branch is NOT requesting children', fakeAsync(() => {
      tick();

      branch              = service.getBranch(0);
      branch.isRequesting = false;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-refresh'));
      expect(iconEl).toBeFalsy();
    }));

    it('must have fa-square-o class if branch is deselected', fakeAsync(() => {
      tick();

      branch       = service.getBranch(0);
      branch.state = TreeViewItemState.Deselected;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square-o'));
      expect(iconEl).toBeTruthy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square'));
      expect(iconEl).toBeFalsy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-check-square'));
      expect(iconEl).toBeFalsy();
    }));

    it('must have fa-square class if branch is partially selected', fakeAsync(() => {
      tick();

      branch       = service.getBranch(0);
      branch.state = TreeViewItemState.Partially;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square-o'));
      expect(iconEl).toBeFalsy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square'));
      expect(iconEl).toBeTruthy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-check-square'));
      expect(iconEl).toBeFalsy();
    }));

    it('must have fa-check-square class if branch is selected', fakeAsync(() => {
      tick();

      branch       = service.getBranch(0);
      branch.state = TreeViewItemState.Selected;

      fixture.detectChanges();

      let iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square-o'));
      expect(iconEl).toBeFalsy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-square'));
      expect(iconEl).toBeFalsy();

      iconEl = fixture.debugElement.query(By.css('.tree-node-id-0 .fa-check-square'));
      expect(iconEl).toBeTruthy();
    }));
  });

  describe('node unfold / collapse clicking control (plus\minus)', () => {

    let childrenEl: DebugElement;
    let iFaPlusEl: DebugElement;
    let iFaMinusEl: DebugElement;

    beforeEach(async(() => {
      checkControl();
    }));

    it('must have i.fa-plus tag if node has children', () => {
      expect(iFaPlusEl).toBeTruthy(`Doesn't have i.fa-plus tag`);
      expect(iFaMinusEl).toBeFalsy(`Incorrectly has i.fa-minus tag`);
      expect(childrenEl).toBeFalsy(`Incorrectly has .node-children div`);
    });

    it('must have i.fa-minus tag if node has children and i.fa-plus has been clicked', fakeAsync(() => {
      click(iFaPlusEl);
      tick();

      checkControl();

      expect(iFaPlusEl).toBeFalsy(`Has i.fa-plus tag`);
      expect(iFaMinusEl).toBeTruthy(`Doesn't have i.fa-minus tag`);
      expect(childrenEl).toBeTruthy(`Doesn't have .node-children div`);

      const expectedLabel = TreeViewTestDict.GetNode(800).title;
      expect(childrenEl.nativeElement.textContent)
        .toContain(expectedLabel, `Doesn't have node id 800 label in the children node`);
    }));

    it('must change i tag class back to .fa-plus and hide children after click on i.fa-minus', fakeAsync(() => {
      click(iFaPlusEl);
      tick();
      checkControl();
      click(iFaMinusEl);
      checkControl();

      expect(iFaPlusEl).toBeTruthy(`Doesn't have i.fa-plus tag`);
      expect(iFaMinusEl).toBeFalsy(`Incorrectly has i.fa-minus tag`);
      expect(childrenEl).toBeFalsy(`Incorrectly has .node-children div`);
    }));

    function checkControl(): void {
      fixture.detectChanges();

      iFaPlusEl  = nodeEl.query(By.css('i.fa-plus'));
      iFaMinusEl = nodeEl.query(By.css('i.fa-minus'));
      childrenEl = nodeEl.query(By.css('.node-children'));
    }
  });

  describe('node change state by clicking selection', () => {
    let deselectedEl: DebugElement;
    let selectedEl: DebugElement;
    let partiallyEl: DebugElement;

    beforeEach(() => {
      checkSelection();
    });

    it('must not be selected by default', () => {
      expect(deselectedEl).toBeTruthy(`Node isn't deselected`);
      expect(partiallyEl).toBeFalsy(`Node partially selected`);
      expect(selectedEl).toBeFalsy(`Node selected`);
    });

    it(`must change state to selected after clicking on deselected element`, () => {
      click(deselectedEl);
      checkSelection();

      expect(deselectedEl).toBeFalsy(`Node deselected`);
      expect(partiallyEl).toBeFalsy(`Node partially selected`);
      expect(selectedEl).toBeTruthy(`Node isn't selected`);
    });

    it(`must change state to deselected after clicking on already selected element`, () => {

      click(deselectedEl);
      checkSelection();
      click(selectedEl);
      checkSelection();

      expect(deselectedEl).toBeTruthy(`Node isn't deselected`);
      expect(partiallyEl).toBeFalsy(`Node partially selected`);
      expect(selectedEl).toBeFalsy(`Node selected`);
    });

    it(`must change state to deselected after clicking on partially selected element`, fakeAsync(() => {

      let controlEl = nodeEl.query(By.css('i.fa-plus'));
      click(controlEl);

      fixture.detectChanges();

      let childSelectionEl = nodeEl.query(By.css('.tree-node-id-800 i.fa-square-o'));
      click(childSelectionEl);

      tick();
      checkSelection();

      click(partiallyEl);

      tick();

      checkSelection();

      expect(deselectedEl).toBeFalsy(`Node deselected`);
      expect(partiallyEl).toBeFalsy(`Node partially selected`);
      expect(selectedEl).toBeTruthy(`Node isn't selected`);
    }));

    function checkSelection(): void {
      fixture.detectChanges();
      deselectedEl = nodeEl.query(By.css('i.fa-square-o'));
      partiallyEl  = nodeEl.query(By.css('i.fa-square'));
      selectedEl   = nodeEl.query(By.css('i.fa-check-square'));
    }
  });
});

@Component({
             template: `<atv-tree-node [srv]="srv"></atv-tree-node>`
           })
class TestHostComponent {
  constructor(private srv: TreeViewTestService) {
  }
}

