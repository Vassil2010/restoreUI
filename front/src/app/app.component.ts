import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import {MenuItem} from 'primeng/api';
import {MessageService} from 'primeng/api';
import { IrisService } from './services/irisservice';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [MessageService,IrisService]
})
export class AppComponent implements OnInit {

    displayDialog: string  = 'login';
    items: MenuItem[];
    activeIndex: number = 0;
    dataBases: [];
    fileName: string = '/usr/irissys/mgr/Backup/FullDBList_20201004_001.cbk';
    msgs;

    directoryListValue: IDirectoryList[];
    selectedDirectoryList: IDirectoryList[];
    step3status: string = 'The task has not started yet';
    
    constructor(private irisService: IrisService, private messageService:MessageService) { }    
    ngOnInit() {
        this.items = [
            {label: 'Login', command: (event) => {
                this.displayDialog = 'login';
                this.activeIndex = 0;
            }},
            {label: 'Source', command: (event) => {
                this.displayDialog = 'source';
                this.activeIndex = 1;
            }},
            {label: 'List of directories to restore', command: (event) => {
                this.displayDialog = 'listdir';
                this.activeIndex = 2;
            }},
            {label: 'Start recovery', command: (event) => {
                this.displayDialog = 'startrecovery';
                this.activeIndex = 3;
            }}
        ];
    }
    step0() {
        this.displayDialog = 'login';
        this.activeIndex = 0;
    }
    step1() {
        this.displayDialog = 'source';
        this.activeIndex = 1;
    }

    step2(updateTable = false) {
        this.displayDialog = 'listdir';
        this.activeIndex = 2;
        if (updateTable) {
            this.irisService.getDataBases(this.fileName)
                .subscribe(data => {
                    
                    if (data.status == 'OK') {
                        this.directoryListValue = data.databases.map(item=> {
                            const line  = {} as IDirectoryList;
                            line.sourceDir = item.directory;
                            line.targetDir = item.directory;
                            line.createDir = true;
                            return line;
                        })
                    }
                });
            }
        
    }
    step3() {
        if (!this.selectedDirectoryList) {
            this.messageService.add({severity:'warn', summary:'Select rows', detail:'check checkboxes'});
            
            return;
        }

        this.displayDialog = 'recovery';
        this.activeIndex = 3;
        const a = {
            'restoreDirectoryList': this.selectedDirectoryList,
            'sourceDir': this.fileName 
        };
        
        this.irisService.restore(a)
        .subscribe(data => {
            
            if (data.status == 'OK') {
                console.log('finish');
                this.step3status = 'The task is running';
            }
        });
    }
}
export interface IDirectoryList {
    sourceDir:string;
    targetDir:string;
    createDir:boolean;
} 
