import { Component, OnInit, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ConfigurationModel } from '../../../model/Configuration';
import ConfigurationService, { SortInfo } from '../../../services/configurationService';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, Validators, FormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';

export type ConfigurationActionEvent = {
  type: 'Edit' | 'Add' | 'Delete',
  configurationId: number
}

@Component({
  selector: 'app-configuration-list',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatTableModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatSortModule],
  templateUrl: './configuration-list.component.html',
  styleUrl: './configuration-list.component.scss'
})
export class ConfigurationListComponent implements OnInit {
  dataSource: ConfigurationModel[] = []
  displayedColumns: string[] = ['key', 'value', 'applicationName', 'versionNumber', 'lastModifiedOn', 'action'];
  onAction = output<ConfigurationActionEvent>();
  pageSize = 5;
  pageIndex = 0;
  totalItem = 0;
  form!: FormGroup

  constructor(private service: ConfigurationService) {
  }

  validateAtLeatOneKeyword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const searchKeyName = control.get('searchKeyName')?.value
      const searchApplicationName = control.get('searchApplicationName')?.value
      const isValid = searchKeyName || searchApplicationName;
      return isValid ? null : { customError: 'At least one keyword are set for filter' };
    };
  }

  onFilter() {
    if (!this.form.valid) return;

    this.getData(this.form.value.searchKeyName, this.form.value.searchApplicationName)
  }

  onPageChange(event?: PageEvent) {
    const searchKeyName = this.form.valid ? this.form.value.searchKeyName : '';
    const searchAppName = this.form.valid ? this.form.value.searchApplicationName : '';
    this.pageIndex = event? event.pageIndex : 0;
    this.getData(searchKeyName, searchAppName)
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      searchKeyName: new FormControl('', [Validators.minLength(2)]),
      searchApplicationName: new FormControl('', [Validators.minLength(2)])
    }, { validators: this.validateAtLeatOneKeyword() })
    this.service.items$.subscribe(items => {
      this.getData();
    })
  }

  getData (searchKeyName = '', searchAppName = '', sort?: SortInfo) {
    const pagingResult = this.service.getPagingConfiguration(this.pageSize, this.pageIndex, searchKeyName, searchAppName, sort);
    this.dataSource = pagingResult.data;
    this.totalItem = pagingResult.totalItem;
  }

  onEdit(configuationId: number) {
    this.onAction.emit({ type: 'Edit', configurationId: configuationId })
  }

  onDelete(configuationId: number) {
    this.onAction.emit({ type: 'Delete', configurationId: configuationId })
  }

  openAddSettingDialog() {
    this.onAction.emit({ configurationId: 0, type: 'Add' })
  }

  isFormTouchAndDirty(): boolean {
    return this.form.dirty && this.form.touched
  }

  getFormErrorMessage(): string {
    const errorMessage: string[] = [];
    if (this.form.hasError('customError')) {
      errorMessage.push('At least one keyword are set for filter')
    }
    if (this.form.get('searchKeyName')?.hasError('minlength')) {
      const { minlength } = this.form.get('searchKeyName')?.errors || {}
      errorMessage.push(`Search key have min lenght is ${minlength.requiredLength} current length is ${minlength.actualLength}`)
    }

    if (this.form.get('searchApplicationName')?.hasError('minlength')) {
      const { minlength } = this.form.get('searchApplicationName')?.errors || {}
      errorMessage.push(`Search application name have min lenght is ${minlength.requiredLength} current length is ${minlength.actualLength}`)
    }

    return errorMessage.join(', ')
  }

  announceSortChange (sortState: any) {
    const searchKeyName = this.form.valid ? this.form.value.searchKeyName : '';
    const searchAppName = this.form.valid ? this.form.value.searchApplicationName : '';
    this.getData(
      searchKeyName,
      searchAppName,
      { sortDirection: sortState.direction, sortField: sortState.active })
  }
}
