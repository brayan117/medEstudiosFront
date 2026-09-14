import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DicomViewer } from './dicom-viewer';

describe('DicomViewer', () => {
  let component: DicomViewer;
  let fixture: ComponentFixture<DicomViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DicomViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(DicomViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
