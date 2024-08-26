import { Component, inject, ViewChild } from '@angular/core';
import { ConfigurationListComponent, ConfigurationActionEvent } from './components/configuration/configuration-list/configuration-list.component';
import { ConfigurationModalComponent } from './components/configuration/configuration-modal/configuration-modal.component';
import { ConfigurationConfirmModalComponent } from './components/configuration/configuration-confirm-modal/configuration-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import ConfigurationService from './services/configurationService';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConfigurationListComponent, ConfigurationModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'groove-angular-practice';
  @ViewChild(ConfigurationListComponent) listConfiguration!: ConfigurationListComponent
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar)

  constructor(private service: ConfigurationService) {
  }

  onAction(event: ConfigurationActionEvent) {
    if (event.type === 'Add' || event.type === 'Edit') {
      this.openInfoModal(event);
    }
    else {
      this.openDeleteConfirmModal(event)
    }
  }

  openDeleteConfirmModal(event: ConfigurationActionEvent) {
    const dialogRef = this.dialog.open(ConfigurationConfirmModalComponent, {
      data: { title: 'Are you sure want to delete this setting ?', content: `This can't undo` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isConfirm) {
        this.service.deleteConfiguration(event.configurationId)
        this._snackBar.open('Delete setting success !', 'OK', { duration: 3000 })
      }
    })
  }

  openInfoModal(event: ConfigurationActionEvent) {
    this.dialog.open(ConfigurationModalComponent, {
      data: event
    });
  }
}