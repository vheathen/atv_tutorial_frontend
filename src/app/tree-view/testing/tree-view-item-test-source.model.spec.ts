import { TreeViewItemTestSource } from './tree-view-item-test-source.model';

const DICT = [
  {id: 0, has_children: true, title: "ОБЩЕСТВЕННЫЕ НАУКИ В ЦЕЛОМ"},
  {id: 800, has_children: false, title: "Общественные науки и идеология"},
  {id: 26145, has_children: false, title: "Эстетическое воспитание"},
  {id: 410129, has_children: false, title: "Информационная деятельность"},
  {id: "0106RQ", title: "Mycology"},
  {id: "0106TA", title: "Ornithology"},
];

describe('TreeViewItemTestSource model', () => {

  it('should have correct properties', () => {
    DICT.forEach((dictItem) => {
      let item = new TreeViewItemTestSource(dictItem);

      // Второй аргумент функции-матчера будет показан в случае несоответствия
      expect(item.id).toEqual(dictItem.id, `ID is wrong for item with id ${dictItem.id}`);

      let hasChildren = dictItem['has_children'];
      expect(item.hasChildren).toBe(hasChildren, `hasChildren is wrong for item with id ${dictItem.id}`);

      let selectableErrorMsg = `selectable is wrong for item with id ${dictItem.id}`;
      if (dictItem.hasOwnProperty('selectable')) {
        expect(item.selectable).toBe(dictItem['selectable'], selectableErrorMsg);
      } else {
        expect(item.selectable).toBeTruthy(selectableErrorMsg);
      }

      expect(item.getLabel()).toEqual(dictItem.title, `getlabel() result is wrong for item with id ${dictItem.id}`);
    });

  })
});
