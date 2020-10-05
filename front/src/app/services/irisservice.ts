import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
  })
export class IrisService {
    constructor(private http: HttpClient) {}
    getDataBases(term: string): any {
        const headers = new HttpHeaders()
        term = term.trim();
        const URL = 'http://localhost:32772/restoreui/GetBackupVolumeInfo/'+encodeURI(term.replace(new RegExp('/','g') ,':'));
        return this.http.get(URL, { headers, responseType: 'json'});
    }
    restore(data: any): any {
        const headers = new HttpHeaders()
        const URL = 'http://localhost:32772/restoreui/do-restore';
        return this.http.post(URL, data, { headers, responseType: 'json'});
    }
}
