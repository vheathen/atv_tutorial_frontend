import { Item } from './item.model';

const DICT = [
  {id: 0, has_children: true, title: "ОБЩЕСТВЕННЫЕ НАУКИ В ЦЕЛОМ", label: "00.00.00: ОБЩЕСТВЕННЫЕ НАУКИ В ЦЕЛОМ"},
  {id: 800, has_children: false, title: "Общественные науки и идеология", label: "00.08.00: Общественные науки и идеология"},
  {id: 26145, has_children: false, title: "Эстетическое воспитание", label: "02.61.45: Эстетическое воспитание"},
  {id: 410129, has_children: false, title: "Информационная деятельность", label: "41.01.29: Информационная деятельность"},
  {id: "0106RQ", title: "Mycology", label: "01.06.RQ: Mycology"},
  {id: "0106TA", title: "Ornithology", label: "01.06.TA: Ornithology"},
];

describe('Item model', () => {
  it('should have correct properties', () => {
    DICT.map((dictItem, indx, arr) => {
      let item = new Item(dictItem);

      // Получили экземпляр Item?
      expect(item instanceof Item).toBeTruthy(`item isn't Item instance`);

      // Второй аргумент функции-матчера будет показан в случае несоответствия
      expect(item.id).toBe(dictItem.id, `ID is wrong for item with id ${dictItem.id}`);

      let hasChildren = dictItem['has_children'];
      expect(item.hasChildren).toBe(hasChildren, `hasChildren is wrong for item with id ${dictItem.id}`);

      let selectableErrorMsg = `selectable is wrong for item with id ${dictItem.id}`;
      if (dictItem.hasOwnProperty('selectable')) {
        expect(item.selectable).toBe(dictItem['selectable'], selectableErrorMsg);
      } else {
        expect(item.selectable).toBeTruthy(selectableErrorMsg);
      }

      expect(item.getLabel()).toEqual(dictItem.label, `getlabel() result is wrong for item with id ${dictItem.id}`);
    });

  })
});
