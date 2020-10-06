import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
  })
export class IrisService {
    constructor(private http: HttpClient) {
        if (environment.production) {
            this.serverhost = location.protocol + '//' +location.host;
        } else {
            this.serverhost = 'http://localhost:32772';
        }
    }
    serverhost: string;
    serverlogin: string = '_SYSTEM';
    serverpassword: string = 'SYS';


    getDataBases(term: string): any {
        const headers = new HttpHeaders()
        term = term.trim();
        const URL = this.serverhost+'/restoreui-rest/GetBackupVolumeInfo/'+encodeURI(term.replace(new RegExp('/','g') ,':'));
        return this.http.get(URL, { headers, responseType: 'json'});
    }
    restore(data: any): any {
        const headers = new HttpHeaders()
        const URL = this.serverhost+'/restoreui-rest/do-restore';
        return this.http.post(URL, data, { headers, responseType: 'json'});
    }
}
