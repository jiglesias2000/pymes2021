import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams
} from "@angular/common/http";
import { of } from "rxjs";
import { Articulo } from "../models/articulo";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class ArticulosService {
  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    //this.resourceUrl = environment.ConexionWebApiProxy +  "Articulos/"
    //this.resourceUrl = environment.ConexionWebApiAzure +  "articulos" + "/";
    this.resourceUrl = environment.ConexionWebApiLocal +  "articulos" + "/";

  }

  get(Nombre: string, Activo: boolean, Pagina: number) {
    let params = new HttpParams();
    if (Nombre != null) {
      params = params.append("Nombre", Nombre);
    }
    if (Activo != null) {  
      params = params.append("Activo", Activo.toString());
    }
    params = params.append("Pagina", Pagina.toString());

    return this.httpClient.get(this.resourceUrl, { params: params });
  }

  getById(Id: number) {
    return this.httpClient.get(this.resourceUrl + Id);
  }

  post(obj:Articulo) {
    return this.httpClient.post(this.resourceUrl, obj);
  }

  put(Id: number, obj:Articulo) {
    return this.httpClient.put(this.resourceUrl + Id, obj);
  }

  delete(Id) {
    return this.httpClient.delete(this.resourceUrl + Id);
  }
}
