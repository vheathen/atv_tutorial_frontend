import { TreeViewTestDict } from './testing/tree-view-test-dict';
import { TreeViewItemState } from './tree-view-item.interface';
import { TreeViewItemTestSource } from './testing/tree-view-item-test-source.model';
import { TreeViewItem } from './tree-view-item.model';

describe('TreeViewItem', () => {

  let sourceItems: TreeViewItemTestSource[];

  const MODEL_DEFAULTS = {
    state:          TreeViewItemState.Deselected,
    unfolded:       false,
    show:           true,
    unfoldChildren: false,
    isRequesting:   false,
  };

  beforeAll(() => {
    sourceItems = TreeViewTestDict.Get().map((sourceItem) => {
      let item        = new TreeViewItemTestSource(sourceItem);
      item.selectable = !item.hasChildren;

      return item;
    });
  });

  it('must have correct properties', () => {
    sourceItems.forEach((sourceItem) => {
      let item = new TreeViewItem(sourceItem);

      expect(item.sourceItem).toBe(sourceItem, `SourceItem is wrong for the item with id ${sourceItem.id}`);

      expect(item.id).toEqual(sourceItem.id, `ID is wrong for the item with id ${sourceItem.id}`);
      expect(item.label).toEqual(sourceItem.getLabel(), `Label is wrong for the item with id ${sourceItem.id}`);

      expect(item.selectable)
        .toEqual(!sourceItem.hasChildren, `Selectable option is wrong for the item with id ${sourceItem.id}`);

      expect(item.hasChildren)
        .toEqual(sourceItem.hasChildren, `HasChildren flag is wrong for the item with id ${sourceItem.id}`);

      if (sourceItem.hasChildren) {
        expect(item.children).toBeNull(`Children field must be null for the item with id ${sourceItem.id}`);
      } else {
        expect(item.children).toEqual([], `Children list must be empty for the item with id ${sourceItem.id}`);
      }

      expect(item.parent).toBeNull(`Parent set wrongly for the item with id ${sourceItem.id}`);

      // test default properties
      for (let prop in MODEL_DEFAULTS) {
        expect(item[prop])
          .toEqual(MODEL_DEFAULTS[prop], `Model property '${prop}' value doesn't equal the default one`);
      }

    });
  });

  describe(`when non-default params`, () => {
    let MODEL_NON_DEFAULTS = {
      state:          TreeViewItemState.Selected,
      unfolded:       true,
      show:           false,
      children:       null,
      parent:         null,
    };

    beforeEach(() => {
      MODEL_NON_DEFAULTS.parent = new TreeViewItem(sourceItems[0]);
      MODEL_NON_DEFAULTS.children = new TreeViewItem(sourceItems[1]);
    });

    it('must set params` non-default values correctly', () => {
      MODEL_NON_DEFAULTS['unfoldChildren'] = true;

      let item   = new TreeViewItem(sourceItems[2], MODEL_NON_DEFAULTS);

      for (let prop in MODEL_NON_DEFAULTS) {
        expect(item[prop])
          .toEqual(MODEL_NON_DEFAULTS[prop], `Model property '${prop}' value doesn't equal the NON-default one`);
      }

    });

    it(`must set unfoldChildren to false if parent.unfoldChildren = true and explicit options set to false`, () => {
      MODEL_NON_DEFAULTS.parent.unfoldChildren = true;
      MODEL_NON_DEFAULTS['unfoldChildren'] = false;

      let item   = new TreeViewItem(sourceItems[2], MODEL_NON_DEFAULTS);

      for (let prop in MODEL_NON_DEFAULTS) {
        expect(item[prop])
          .toEqual(MODEL_NON_DEFAULTS[prop], `Model property '${prop}' value doesn't equal the NON-default one`);
      }

    });

  });

});
