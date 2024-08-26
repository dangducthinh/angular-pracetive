import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose, MatDialogActions, MatDialogTitle, MatDialogContent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export type ConfigurationModalConfirmData = {
  title: string,
  content: string
}

export type ConfigurationModalConfirmResult = {
  isCancel : boolean,
  isConfirm: boolean
}

@Component({
  selector: 'app-configuration-confirm-modal',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  templateUrl: './configuration-confirm-modal.component.html',
  styleUrl: './configuration-confirm-modal.component.scss'
})
export class ConfigurationConfirmModalComponent {
  data = inject<ConfigurationModalConfirmData>(MAT_DIALOG_DATA)
  readonly dialogRef = inject(MatDialogRef<ConfigurationConfirmModalComponent, ConfigurationModalConfirmResult>);

  confirm() {
    this.dialogRef.close({ isConfirm: true })
  }

  cancel() {
    this.dialogRef.close({ isCancel: true })
  }
}
