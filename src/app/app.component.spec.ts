import {
  TestBed,
  async,
  ComponentFixture
} from '@angular/core/testing';

import { AppComponent } from './app.component';
import { AlertModule } from 'ng2-bootstrap';

describe('AppComponent', () => {
  let app:    AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    // Создаём тестовый модуль, подключаем к нему компонент AppComponent
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      // и импортируем в него модуль Alert из ng2-bootstrap
      imports: [AlertModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
  }));

  it('should create the app', async(() => {
    expect(app).toBeTruthy();
  }));

  // Мы не меняли свойства сгенерированного класса!
  it(`should have as title 'app works!'`, async(() => {
    expect(app.title).toEqual('app works!');
  }));

  it(`should render 'AngularTreeView' in a h1 tag`,  () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('AngularTreeView');
  });
});
