import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationConfirmModalComponent } from './configuration-confirm-modal.component';

describe('ConfigurationConfirmModalComponent', () => {
  let component: ConfigurationConfirmModalComponent;
  let fixture: ComponentFixture<ConfigurationConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationConfirmModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
