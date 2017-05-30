import { TreeViewTestService } from './testing/tree-view-test.service';
import {
  TreeViewItemState,
  ITreeViewItem
} from './tree-view-item.interface';
import { TreeViewItem } from './tree-view-item.model';
import { TreeViewTestDict } from './testing/tree-view-test-dict';
import { ITreeViewService } from './tree-view-service.interface';
import { TreeViewItemTestSource } from './testing/tree-view-item-test-source.model';
import { ITreeViewItemSource } from './tree-view-item-source.interface';

describe('TreeView Service', () => {
  let service: ITreeViewService;
  let root: ITreeViewItem;

  beforeEach(() => {
    service = new TreeViewTestService();
    root    = service.getBranch(null);
  });

  describe('getBranch(id):', () => {
    const BRANCH_DEFAULTS =
            {
              state:      TreeViewItemState.Deselected,
              unfolded:   false,
              show:       true,
              selectable: true,
            };

    describe('when id is null', () => {
      const ROOT_DEFAULTS =
              {
                id:          null,
                label:       '',
                parent:      null,
                state:       TreeViewItemState.Deselected,
                unfolded:    true,
                children:    null,
                hasChildren: true,
                show:        true,
                selectable:  false,
              };

      it('must return root branch with special defaults', () => {
        expect(root instanceof TreeViewItem).toBeTruthy(`type of the returned brunch isn't TreeViewItem`);

        expect(root.id).toBeNull(`ID isn't null`);

        expect(root.label).toEqual(ROOT_DEFAULTS.label, `Label isn't empty`);

        expect(root.state).toEqual(ROOT_DEFAULTS.state, `State is wrong`);
        expect(root.unfolded).toEqual(ROOT_DEFAULTS.unfolded, `Unfolded option is wrong`);
        expect(root.show).toEqual(ROOT_DEFAULTS.show, `Show option is wrong`);
        expect(root.selectable).toEqual(ROOT_DEFAULTS.selectable, `Selectable option is wrong`);

        expect(root.hasChildren).toEqual(ROOT_DEFAULTS.hasChildren, `HasChildren flag is wrong`);

        // expect(root.children).toEqual(ROOT_DEFAULTS.children, `Children field must be null`);

        expect(root.parent).toEqual(ROOT_DEFAULTS.parent, `Parent set wrongly`);
      });

      it('must have correct children', () => {
        let childrenSource = TreeViewTestDict.GetRootSource();

        expect(root.children.length).toEqual(childrenSource.length, `Root must have enough children`);

        root.children.forEach((child) => {
          expect(findId(child.id, childrenSource)).toBeTruthy(`Odd child with id ${child.id}`);
          expect(child.state).toEqual(BRANCH_DEFAULTS.state, `State is wrong for child with id ${child.id}`);
          expect(child.unfolded)
            .toEqual(BRANCH_DEFAULTS.unfolded, `Unfolded option is wrong for child with id ${child.id}`);
          expect(child.show).toEqual(BRANCH_DEFAULTS.show, `Show option is wrong for child with id ${child.id}`);
          expect(child.parent).toBe(root, `Root must be parent of the child with id ${child.id}`);
        });
      });

    });

    describe('when id belongs to the root child then branch', () => {

      it(`must be one of the root's children`, () => {

        let branch: ITreeViewItem;

        root.children.forEach((child) => {
          branch = service.getBranch(child.id);

          expect(branch instanceof TreeViewItem).toBeTruthy(`type of the returned brunch isn't TreeViewItem`);
          expect(branch).toBe(child, `Root branch with id ${branch.id} isn't he exactly same object as root's child`);
        });
      });

    });

  });

  describe('unfold()', () => {
    it('must retrieve children of any branch', () => {

      let branch = service.getBranch(0);
      service.unfold(branch);
      expect(branch.children.length)
        .toEqual(12, `Branch with id ${branch.id} must have enough children`);

      branch = service.getBranch(800);
      service.unfold(branch);
      expect(branch.children.length)
        .toEqual(0, `Branch with id ${branch.id} must have enough children`);

      branch = service.getBranch(20000);
      service.unfold(branch);
      branch = service.getBranch(21100);
      service.unfold(branch);
      expect(branch.children.length)
        .toEqual(2, `Branch with id ${branch.id} must have enough children`);

      branch = service.getBranch(21121);
      service.unfold(branch);
      expect(branch.children.length)
        .toEqual(0, `Branch with id ${branch.id} must have enough children`);

      branch = service.getBranch(25100);
      service.unfold(branch);
      expect(branch.children.length)
        .toEqual(4, `Branch with id ${branch.id} must have enough children`);

    });
  });

  describe('collapse()', () => {
    it(`must not collapse the root branch`, () => {
      service.collapse(root);
      expect(root.unfolded).toBeTruthy(`Root branch has been collapsed!`);
    });

    it(`must change unfolded property to false for the whole subtree items`, () => {
      let levelOneId = 30000;
      let levelTwoId = 30100;

      let branchOne = service.getBranch(levelOneId);
      service.unfold(branchOne);

      let branchTwo = service.getBranch(levelTwoId);
      service.unfold(branchTwo);

      let childrenSource = TreeViewTestDict.GetChildrenSource(branchTwo.id);

      expect(branchTwo.children.length)
        .toEqual(childrenSource.length, `The second level branch children count is wrong`);

      expect(branchTwo.unfolded).toBeTruthy(`The second level branch isn't unfolded`);

      service.collapse(branchOne);

      expect(branchOne.unfolded).toBeFalsy(`The first level branch is still unfolded`);

      branchOne.children.forEach((child) => {
        expect(child.unfolded).toBeFalsy(`The second level branch still unfolded`);
      });
    });

  });

  describe('unfoldAll()', () => {
    it(`must unfold all the items`, () => {
      service.unfoldAll();

      expect(countSubtreeNodes(root) - 1).toEqual(TreeViewTestDict.Get().length);
    });

    function countSubtreeNodes(branch: ITreeViewItem): number {
      let result = 1;

      if (branch.children) {
        branch.children.forEach((child) => {
          result += countSubtreeNodes(child);
        })
      }

      return result;
    }
  });

  describe('collapseAll()', () => {
    it(`must collapse all the items except the root branch`, () => {
      service.unfoldAll();
      service.collapseAll();

      root.children.forEach((branch) => {
        isSubtreeNodesCollapsed(branch);
      });
    });

  });

  describe('changeState()', () => {
    let lvl1: ITreeViewItem;
    let lvl2: ITreeViewItem;
    let lvl3: ITreeViewItem;

    beforeEach(() => {
      service.unfoldAll();
      lvl1 = root.children[1];
      lvl2 = lvl1.children[0];
      lvl3 = lvl2.children[0];
    });

    it(`must change node state`, () => {
      service.changeState(lvl2, TreeViewItemState.Selected);
      expect(lvl2.state).toEqual(TreeViewItemState.Selected, `lvl2 state isn't selected`);

      service.changeState(lvl2, TreeViewItemState.Deselected);
      expect(lvl2.state).toEqual(TreeViewItemState.Deselected, `lvl2 state is selected`);
    });

    it(`must not change node state if new state is 'partially'`, () => {
      service.changeState(lvl2, TreeViewItemState.Selected);
      service.changeState(lvl2, TreeViewItemState.Partially);
      expect(lvl2.state).toEqual(TreeViewItemState.Selected, `lvl2 state must not be 'partially'`);
    });

    it(`must set children state to selected if node state set to selected`, () => {
      service.changeState(lvl1, TreeViewItemState.Selected);
      checkSubtreeDown(lvl1, TreeViewItemState.Selected);
    });

    it(`must set children state to deselected if parent state set to deselected`, () => {
      service.changeState(lvl1, TreeViewItemState.Selected);
      checkSubtreeDown(lvl1, TreeViewItemState.Selected);

      service.changeState(lvl1, TreeViewItemState.Deselected);
      checkSubtreeDown(lvl1, TreeViewItemState.Deselected);
    });

    it(`must set all parents parent state to partially if some but not all children nodes are selected`, () => {
      service.changeState(lvl3, TreeViewItemState.Selected);
      expect(lvl2.state).toEqual(TreeViewItemState.Partially, `lvl2 state must be partially`);
      expect(lvl1.state).toEqual(TreeViewItemState.Partially, `lvl1 state must be partially`);
    });

    it(`must set direct parent state to selected if all children nodes are selected`, () => {
      service.changeState(lvl1, TreeViewItemState.Deselected);

      lvl2.children.forEach((child) => {
        service.changeState(child, TreeViewItemState.Selected);
      });

      expect(lvl2.state).toEqual(TreeViewItemState.Selected, `lvl2 state must be selected`);
      expect(lvl1.state).toEqual(TreeViewItemState.Partially, `lvl1 state must be partially`);
    });

    it(`must set direct parent state to deselected if all children nodes are deselected`, () => {
      service.changeState(lvl1, TreeViewItemState.Selected);

      lvl2.children.forEach((child) => {
        service.changeState(child, TreeViewItemState.Deselected);
      });

      expect(lvl2.state).toEqual(TreeViewItemState.Deselected, `lvl2 state must be deselected`);
      expect(lvl1.state).toEqual(TreeViewItemState.Partially, `lvl1 state must be partially`);

    });

    function checkSubtreeDown(branch: ITreeViewItem, expectedState: TreeViewItemState): void {
      expect(branch.state).toEqual(expectedState, `Branch with id ${branch.id} state isn't expected`);

      if (branch.children) {
        branch.children.forEach((child) => {
          checkSubtreeDown(child, expectedState);
        })
      }
    }

  });

  describe('showSelectedOnly() and showAll()', () => {
    let lvl1: ITreeViewItem;
    let lvl2: ITreeViewItem;
    let lvl31: ITreeViewItem;
    let lvl32: ITreeViewItem;

    beforeEach(() => {
      service.unfoldAll();

      lvl1  = root.children[1];
      lvl2  = lvl1.children[0];
      lvl31 = lvl2.children[0];
      lvl32 = lvl2.children[1];

      service.changeState(lvl31, TreeViewItemState.Selected);
    });

    it(`must set 'show' property to false for every node with state deselected`, () => {
      service.showSelectedOnly();
      expect(countVisibleNodes() - 1).toEqual(3, `3 nodes must be visible only`);

      service.showAll();
      expect(countVisibleNodes() - 1).toEqual(100, `all nodes must be visible`);
    });

    it(`must set 'show' property to true for every node after showAll()`, () => {
      service.showSelectedOnly();
      service.showAll();
      expect(countVisibleNodes() - 1).toEqual(100, `all nodes must be visible`);
    });

    it('must hide nodes that were deselected while showSelectedOnly filter enabled', () => {
      service.changeState(lvl32, TreeViewItemState.Selected);
      service.showSelectedOnly();
      expect(countVisibleNodes() - 1).toEqual(4, `4 nodes must be visible only`);

      service.changeState(lvl32, TreeViewItemState.Deselected);
      expect(countVisibleNodes() - 1).toEqual(3, `3 nodes must be visible only`);
    });

  });

  describe('Selection. ', () => {
    beforeEach(() => {
      service.unfoldAll();
    });

    describe('selectAll()', () => {
      it(`must select all the nodes`, () => {
        service.selectAll();
        expect(countSelectedNodes(root))
          .toEqual(101, `The number of selected items must be 101 (including the root branch)`);
      })
    });

    describe('deselectAll()', () => {
      it('must deselect all the nodes', () => {
        service.selectAll();
        service.deselectAll();
        expect(countSelectedNodes(root)).toEqual(0, `The number of selected items must be 0`);
      });
    });

  });

  describe('reset()', () => {
    it('must collapse, clear selection and show all nodes', () => {
      service.unfoldAll();
      service.selectAll();
      service.showSelectedOnly();

      service.reset();

      expect(countSelectedNodes(root)).toEqual(0, `The number of selected nodes must be 0`);
      root.children.forEach((branch) => {
        isSubtreeNodesCollapsed(branch);
      });
      expect(countVisibleNodes()).toEqual(101, `all nodes must be visible`);
    });

  });

  describe(`get/restore selected nodes`, () => {

    let lvl1: ITreeViewItem;
    let lvl2: ITreeViewItem;
    let lvl3_1: ITreeViewItem;
    let lvl3_2: ITreeViewItem;

    let expectedIds: any[]                   = [];
    let selectedIds: any[]                   = [];
    let selectedItems: ITreeViewItemSource[] = [];

    beforeEach(() => {
      service.unfoldAll();
      lvl1   = root.children[1];
      lvl2   = lvl1.children[0];
      lvl3_1 = lvl2.children[0];
      lvl3_2 = lvl2.children[1];

      lvl2.selectable = false;

      expectedIds.push(lvl3_1.id);
      expectedIds.push(lvl3_2.id);
    });

    describe('getSelectedIds()', () => {
      it(`must return correct ids of the selected items`, () => {
        service.changeState(lvl3_1, TreeViewItemState.Selected);
        service.changeState(lvl3_2, TreeViewItemState.Selected);

        selectedIds = service.getSelectedIds();

        expect(selectedIds).toBeTruthy(`selectedIds must not be null`);
        expect(expectedIds.sort()).toEqual(selectedIds.sort());
      });

      it(`must return ids of the selected items in case of 'selectable' property set to true only`, () => {
        service.changeState(lvl2, TreeViewItemState.Selected);

        selectedIds = service.getSelectedIds();

        expect(selectedIds.length).toEqual(TreeViewTestDict.GetChildrenSource(lvl2.id).length);
      });

    });

    describe('getSelectedItems()', () => {
      it(`must return sources of the selected items`, () => {
        service.changeState(lvl2, TreeViewItemState.Selected);

        selectedItems = service.getSelectedItems();

        expect(selectedItems.length).toEqual(TreeViewTestDict.GetChildrenSource(lvl2.id).length);
        selectedItems.forEach((item) => {
          expect(item instanceof TreeViewItemTestSource)
            .toBeTruthy(`Node with id ${item.id} is a wrong class instance`);
        })
      });
    });

    describe('restore selection', () => {

      let freshService;

      beforeEach(() => {
        freshService = new TreeViewTestService();
        freshService.getBranch(null);

        lvl2.selectable = true;
        service.changeState(lvl2, TreeViewItemState.Selected);

        selectedIds   = service.getSelectedIds();
        selectedItems = service.getSelectedItems();
        service.reset();
      });

      describe('restoreSelectedIds()', () => {
        it('must restore by IDs list when all nodes are loaded from backend', () => {
          service.restoreSelectedIds(selectedIds);

          expect(service.getSelectedIds()).toEqual(selectedIds);
        });

        it('must restore by IDs list in case of a newly initialized service', () => {
          freshService.restoreSelectedIds(selectedIds);

          expect(freshService.getSelectedIds()).toEqual(selectedIds);
        });
      });

      describe('restoreSelectedItems()', () => {
        it('must restore by source items list when all nodes are loaded from backend', () => {
          service.restoreSelectedItems(selectedItems);

          expect(service.getSelectedItems().length).toEqual(selectedItems.length);
          service.getSelectedItems().forEach((item) => {
            expect(item instanceof TreeViewItemTestSource)
              .toBeTruthy(`Node with id ${item.id} is a wrong class instance`);
          })
        });

        it('must restore by source items list in case of a newly initialized service', () => {
          freshService.restoreSelectedItems(selectedItems);

          expect(freshService.getSelectedItems().length).toEqual(selectedItems.length);
          freshService.getSelectedItems().forEach((item) => {
            expect(item instanceof TreeViewItemTestSource)
              .toBeTruthy(`Node with id ${item.id} is a wrong class instance`);
          })
        });

      });

    });

  });

  function isSubtreeNodesCollapsed(branch: ITreeViewItem): void {
    expect(branch.unfolded).toBeFalsy(`Branch with id ${branch.id} is unfolded`);

    if (branch.children) {
      branch.children.forEach((child) => {
        isSubtreeNodesCollapsed(child);
      })
    }
  }

  function countVisibleNodes(branch = root): number {
    let result = branch.show ? 1 : 0;

    if (branch.children) {
      branch.children.forEach((child) => {
        result += countVisibleNodes(child);
      })
    }

    return result;
  }

  function countSelectedNodes(branch: ITreeViewItem): number {
    let result = branch.state === TreeViewItemState.Deselected ? 0 : 1;

    if (branch.children) {
      branch.children.forEach((child) => {
        result += countSelectedNodes(child);
      })
    }

    return result;
  }

  function findId(id: any, list: any[]): boolean {
    return list.some((item) => {
      return item.id === id;
    });
  }

});

