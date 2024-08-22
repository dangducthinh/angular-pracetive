import { Component, inject } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfigurationActionEvent } from '../configuration-list/configuration-list.component';
import { OnInit } from '@angular/core';
import { ConfigurationModel } from '../../model/Configuration';
import { AbstractControl, FormControl, FormGroup, FormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import ConfigurationService from '../../services/configurationService';
import { ConfigurationConfirmModalComponent } from '../configuration-confirm-modal/configuration-confirm-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-configuration-modal',
  standalone: true,
  imports: [CommonModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MatInputModule, MatFormFieldModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configuration-modal.component.html',
  styleUrl: './configuration-modal.component.scss'
})
export class ConfigurationModalComponent implements OnInit {
  readonly actionEvent = inject<ConfigurationActionEvent>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfigurationModalComponent>);
  readonly dialog = inject(MatDialog)
  private readonly _snackBar = inject(MatSnackBar)
  form!: FormGroup;

  constructor (private service : ConfigurationService) { }

  ngOnInit(): void {
      const model : ConfigurationModel = this.actionEvent.type === 'Edit'
        ? {...this.service.getConfiguration(this.actionEvent.configurationId)}
        : {
          applicationName: '',
          id: 0,
          key: '',
          lastModifiedBy: '',
          lastModifiedOn: new Date(),
          value: '',
          versionNumber: ''
        }

    this.form = new FormGroup({
      key: new FormControl(model.key, [Validators.required, Validators.maxLength(1000), this.validateSameKey()]),
      value: new FormControl(model.value),
      applicationName: new FormControl(model.applicationName, [Validators.maxLength(500)]),
      versionNumber: new FormControl(model.versionNumber, [Validators.required, Validators.maxLength(20)]),
      id: new FormControl(model.id),
      lastModifiedBy: new FormControl(model.lastModifiedBy),
      lastModifiedOn: new FormControl(model.lastModifiedOn)
    })
    if (this.actionEvent.type === 'Edit') {
      this.form.get('key')?.disable()
      this.form.get('lastModifiedBy')?.disable()
      this.form.get('lastModifiedOn')?.disable()
      this.form.get('applicationName')?.disable()
      this.form.get('versionNumber')?.disable()
    }
  }

  getErrorMessage (name: string, errors: ValidationErrors | null | undefined) {
    if (!errors) return '';

    const messages = Object.keys(errors).map(key => {
      if (key === 'required') return `${name} is required`
      if (key === 'maxlength') return `${name} have max lenght is ${errors[key].requiredLength}`
      if (key === 'sameKeyError') return errors[key]

      // will have custom validation at here
      return key;
    })
    return messages;
  }

  onSubmit () {
    if (this.form.valid) {
      this.handleSave()
    }
    else {
    }
  }

  handleSave() {
    const confirmDialog = this.dialog.open(ConfigurationConfirmModalComponent, {
      data: { title: 'Are you want to save this setting ?' }
    })

    confirmDialog.afterClosed().subscribe(result => {
      if (result.isConfirm) {
        this.actionEvent.type === 'Add'
          ? this.service.addNewConfiguration(this.form.value)
          : this.service.updateConfiguration({
            ...this.form.value,
            applicationName: this.form.getRawValue().applicationName,
            key: this.form.getRawValue().key,
            versionNumber: this.form.getRawValue().versionNumber
          })
        this._snackBar.open('Save setting success!', 'OK', { duration: 3000 })

        this.dialogRef.close();
      }
    })
  }

  onCancel () {
    this.dialogRef.close();
  }

  validateSameKey(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.actionEvent.type === 'Edit') return null;

      return this.service.checkKeyExist(control.value) ? { sameKeyError: `Key name: ${control.value} already exist.` } : null;
    };
  }
}
