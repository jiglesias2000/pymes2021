import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { VentasDetalle } from "../../models/VentasDetalle";
import { FormBuilder, FormGroup } from "@angular/forms";


import { Observable, of } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap
} from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ClientesInfoComponent } from '../clientes-info/clientes-info.component';
import { ModalDialogService } from "src/app/services/modal-dialog.service";
import { UtilesService } from "src/app/services/utiles.service";
import { environment } from "src/environments/environment";


@Component({
  selector: 'app-ventas-consultas',
  templateUrl: './ventas-consultas.component.html',
  styleUrls: ['./ventas-consultas.component.css']
})
export class VentasConsultasComponent implements OnInit {


  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private ngbModal: NgbModal,
    private md: ModalDialogService,
    public utiles: UtilesService
  ) { }

  Titulo = "Ventas Consultas";
  FormBusqueda: FormGroup;
  Items = null;  //para evitar mostrar el no se encontraron registros
  ItemSeleccionado = null;
  ItemsDetalles = [];
  Cliente = null;
  
  minDate_fh = null;  //fechaminima fh


  ngOnInit() {
    var FechaHasta = new Date().toISOString();
    var FechaDesde = this.utiles.Fecha_SumarDias(FechaHasta, -10);

    this.FormBusqueda = this.formBuilder.group({
      IdCliente: [null],
      FechaDesde: [FechaDesde],
      FechaHasta: [FechaHasta]
    });
    this.FormBusqueda.controls['FechaDesde'].valueChanges.subscribe(value => {
      try {
        if (this.utiles.Fecha_Comparar(value, this.FormBusqueda.value.FechaHasta) == 1) {
          //this.FormBusqueda.value.FechaHasta = value;
          this.FormBusqueda.get('FechaHasta').setValue(value);
        }
        this.minDate_fh = this.utiles.Fecha_ISO_Struct(value);

      } catch (error) {
      }
    })


  }

  //Ref Angular Focus
  @ViewChild("refCliente") inputCliente: ElementRef;
  ngAfterViewInit() {
    this.inputCliente.nativeElement.focus();
  }

  //------------
  //typeahead Cliente
  typeAheadSearch_cli = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchText =>

        searchText.length < 3 ? of([]) // menos de tres caracteres no busca
        :
          this.http.get(environment.ConexionWebApiProxy +  "clientes/typeahead", 
                     { params: { Nombre: searchText }, headers: { 'NoBloquearPantalla': '1' } })
      )
    );
  typeAheadformatter_cli(x) {
    return x.Nombre; // viene del servicio
  }
  typeAheadselectItem_cli(event, input) {
    // al seleccionar se guarda el cliente
    this.Cliente = event.item;
    this.FormBusqueda.value.IdCliente = event.item?.IdCliente;
  }
  typeAheadBlur_cli(input) {
    //si modifico el texto con el buscado, no se acepta y se borra.
    if (input.value != this.Cliente?.Nombre) {
      input.value = "";
      this.Cliente = null;
      this.FormBusqueda.value.IdCliente = null;
    }
  }

  Consultar() {
    // envio el formulario de busqueda completo
    let params = this.FormBusqueda.value;
    params.IdCliente = this.Cliente?.IdCliente;   //error porque se pierde luego de cambiar la fecha
    this.http.get(environment.ConexionWebApiProxy +  "ventas", { params: { ...params } })
      .subscribe(x => {
        this.Items = x as any;
        this.ItemsDetalles = [];
      });
  }

  VerDetalle(Item) {
    this.ItemSeleccionado = Item;
    this.http.get(environment.ConexionWebApiProxy +  "ventasdetalles/" + Item.IdVenta)
      .subscribe(x => {
        this.ItemsDetalles = x as any;
        setTimeout(() => {
          document.getElementById("divVentasDetalles").scrollIntoView();
        }, 100);
      });
  }

  VerInfoCliente() {
    if (this.Cliente) {
      const modalRef = this.ngbModal.open(ClientesInfoComponent,
        { centered: true, backdrop: 'static', size: 'lg', windowClass: 'modal-xl' });
      modalRef.componentInstance.Cliente = this.Cliente;
    }
    else {
      this.md.Alert("No hay cliente seleccionado!!!");
    }
  }

}
