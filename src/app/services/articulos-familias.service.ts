import { Injectable } from "@angular/core";
import {  HttpClient} from "@angular/common/http";
import { of, Observable } from "rxjs";
import { ArticuloFamilia } from "../models/articulo-familia";
import { environment } from "../../environments/environment";


@Injectable({
  providedIn: "root"
})
export class ArticulosFamiliasService {
  resourceUrl: string;
  constructor(private httpClient: HttpClient) {
    
    //this.resourceUrl = environment.ConexionWebApiAzure +  "articulosfamilias" + "/";
    //this.resourceUrl = environment.ConexionWebApiLocal +  "articulosfamilias" + "/";
    this.resourceUrl = environment.ConexionWebApiProxy +  "articulosfamilias" + "/";   // para probar proxy.config.json   
  }

  get() {
    return this.httpClient.get(this.resourceUrl);
  }
}
