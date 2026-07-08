import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sliderbar } from './sliderbar';

describe('Sliderbar', () => {
  let component: Sliderbar;
  let fixture: ComponentFixture<Sliderbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sliderbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Sliderbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
