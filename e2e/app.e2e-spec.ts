import { AtvTutorialFrontendPage } from './app.po';

describe('atv-tutorial-frontend App', () => {
  let page: AtvTutorialFrontendPage;

  beforeEach(() => {
    page = new AtvTutorialFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
