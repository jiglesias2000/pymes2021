import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams
} from "@angular/common/http";
import { of } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class HttpGenericoService {
  pathResourceUrl: string;
  constructor(private httpClient: HttpClient) {
        //this.pathResourceUrl = environment.ConexionWebApiProxy +  ""
        this.pathResourceUrl  = environment.ConexionWebApiAzure;
  }

  get(Recurso: string, params) {
    return this.httpClient.get(this.pathResourceUrl + Recurso  , { params: params });
  }

  getById(Recurso : string, Id: any) {
    return this.httpClient.get(this.pathResourceUrl + Recurso + "/" + Id);
  }

  // post(obj: Articulo) {
  //   return this.httpClient.post(this.resourceUrl, obj);
  // }

  // put(Id: number, obj: Articulo) {
  //   return this.httpClient.put(this.resourceUrl + Id, obj);
  // }

  // delete(Id) {
  //   return this.httpClient.delete(this.resourceUrl + Id);
  // }
}
