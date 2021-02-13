import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalDialogService } from "../../services/modal-dialog.service";

//import { jsPDF } from "jspdf"; //ref angular reporte pdf  : https://www.positronx.io/angular-pdf-tutorial-export-pdf-in-angular-with-jspdf/
import { HttpClient } from "@angular/common/http";
import {
  analyzeAndValidateNgModules,
  Identifiers,
  ThisReceiver,
} from "@angular/compiler";
//import { UtilesService } from "src/app/services/utiles.service";
import { noop, Observable, Observer, of, Subscription } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { UtilesService } from "../../services/utiles.service";

@Component({
  selector: "app-clientes",
  templateUrl: "./clientes.component.html",
  styleUrls: ["./clientes.component.css"],
})
export class ClientesComponent implements OnInit, OnDestroy {
  Titulo = "Clientes";
  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)",
  };
  AccionABMC = "L"; // inicialmente inicia en el listado de Clientes (buscar con parametros)
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados...",
  };

  Lista = null;
  RegistrosTotal: number;

  Pagina = 1; // inicia pagina 1

  // opciones del combo activo
  OpcionesActivo = [
    { Id: null, Nombre: "" },
    { Id: true, Nombre: "SI" },
    { Id: false, Nombre: "NO" },
  ];

  FormFiltro: FormGroup;
  FormReg: FormGroup;
  submitted = false;

  //@ViewChild('htmlData') htmlData: ElementRef;
  TiposDocumentos: any;
  Sexos: any;
  EstadosCiviles: any;
  Paises: any;
  Provincias: any;
  Departamentos: any;
  ClientesService: any;
  Departamento: any; // departamento relacionado con IdDepartamento
  Subscripciones: Subscription[] = [];

  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private modalDialogService: ModalDialogService,
    private utiles: UtilesService
  ) {}

  ngOnInit() {
    this.FormFiltro = this.formBuilder.group({
      Nombre: [""],
      Activo: [null],
    });
    this.FormReg = this.formBuilder.group({
      IdCliente: [0],
      Nombre: [
        null,
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(55),
        ],
      ],
      IdTipoDocumento: ["", [Validators.required]],
      NumeroDocumento: [
        null,
        [Validators.required, Validators.pattern("[0-9]{6,10}")],
      ],
      CreditoMaximo: [
        null,
        [
          Validators.required,
          Validators.pattern("([0-9]{1,8})(\\.|)([0-9]{1,2}|)"),
        ],
      ],
      Cuit: [null, [Validators.required, Validators.pattern("[0-9]{11}")]],
      Mail: [null, [Validators.required, Validators.email]],
      IdEstadoCivil: ["", [Validators.required]],
      FechaNacimiento: [
        null,
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          ),
        ],
      ],
      FechaEgreso: [
        null,
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          ),
        ],
      ],
      FechaIngreso: [
        null,
        [
          Validators.required,
          Validators.pattern(
            "(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}"
          ),
        ],
      ],
      Activo: [true],
      IdSexo: [null, [Validators.required]],
      Observaciones: [null],
      TieneTrabajo: [null],
      TieneCasa: [null],
      TieneAuto: [null],
      IdPais: [null, [Validators.required]],
      IdProvincia: [null, [Validators.required]],
      IdDepartamento: [null, [Validators.required]],
      DepartamentoAux: [null, [Validators.required]],
      Localidad: [
        null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(255),
        ],
      ],
      Calle: [
        null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(50),
        ],
      ],
      NumeroCalle: [
        null,
        [Validators.required, Validators.pattern("[0-9]{1,5}")],
      ],
      //search: [null],
    });

    this.Setup();

    this.FormReg.controls["IdPais"].valueChanges.subscribe((value) => {
      if (!value) {
        // undefined, null or empty
        this.Provincias = [];
        return; //si es nulo no buscar
      }

      try {
        let params = { IdPais: value };
        this.Subscripciones.push(
          this.http
          .get(environment.ConexionWebApiProxy +  "clientes/GetProvincias", { 
          //.get(environment.ConexionWebApiProxy +  "clientes/GetProvincias", {
              params: params,
            })
            .subscribe((db: any) => {
              this.Provincias = db;
            })
        );
      } catch (error) {}
    });

    this.FormReg.get("IdProvincia").valueChanges.subscribe((value) => {
      // ojo: this.FormReg.value  aun no se actualizo en este momento!!!
      // si cambia la provincia, borro el departamento.
      //if ((!this.FormReg.value.DepartamentoAux.IdDepartamento == value)) {
      this.FormReg.patchValue({
        DepartamentoAux: { Nombre: "", IdDepartamento: null },
      });
      this.FormReg.patchValue({ IdDepartamento: null });
      //this.FormReg.get("IdDepartamento").setValue(null, { emitEvent: false });
      //console.log(this.FormReg.get("IdDepartamento").value);
      // }
    });
  }
  ngOnDestroy() {
    this.Subscripciones.forEach((element) => {
      element.unsubscribe();
    });
  }

  Setup() {
    this.Subscripciones.push(
      this.http
        .get(environment.ConexionWebApiProxy +  "clientes/setup")
        .subscribe((db: any) => {
          this.TiposDocumentos = db.TiposDocumentos;
          this.Sexos = db.Sexos;
          this.EstadosCiviles = db.EstadosCiviles;
          this.Paises = db.Paises;
          //this.Provincias = db.Provincias;
        })
    );
  }

  // ----------------------------  typeahead Departamentos
  typeAheadformatterDpto(x) {
    return x.Nombre; // viene del servicio
  }
  typeAheadSearchDpto = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        term.length < 3
          ? of([])
          : //this.articulosService.get(term, null, 1)
            this.http
              .get(environment.ConexionWebApiProxy +  "clientes/getdepartamentos", {
                params: {
                  Nombre: term,
                  IdProvincia: this.FormReg.value.IdProvincia,
                },
                headers: { NoBloquearPantalla: "1" },
              })
              .pipe(
                catchError(() => {
                  return of([]);
                })
              )
      ),
      map((x: any) => (x.Lista ? x.Lista : x)) // por ahora porque estoy reciclando la consulta que devueve lista+registrototal
    );
  typeAheadselectItemDpto(event, input) {
    // al seleccionar se guarda
    //    this.Departamento = event.item;
    //this.FormReg.value.IdDepartamento = event.item?.IdDepartamento;
    this.FormReg.patchValue({ IdDepartamento: event.item?.IdDepartamento });
  }
  typeAheadBlurDpto(input) {
    //si modifico el texto con el buscado, no se acepta y se borra.
    if (input.value != this.FormReg.value.DepartamentoAux?.Nombre) {
      input.value = "";
      this.FormReg.value.IdDepartamento = null;
    }
  }

  //-----------------------------------
  Agregar() {
    this.AccionABMC = "A";
    this.FormReg.reset({ Activo: true, IdCliente: 0 });
    this.submitted = false;
  }

  // Buscar segun los filtros, establecidos en FormReg
  Buscar() {
    let params = { ...this.FormFiltro.value, Pagina: this.Pagina };
    // let params: any = {};
    // params.Nombre = this.FormFiltro.value.Nombre;
    // params.Activo = this.FormFiltro.value.Activo;
    // params.Pagina = this.Pagina;

    this.http
      .get(environment.ConexionWebApiProxy +  "clientes/", { params: params })
      .subscribe((res: any) => {
        this.Lista = res.Items;
        this.RegistrosTotal = res.RegistrosTotal;
      });
  }

  // Obtengo un registro especifico según el Id
  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll
    this.http
      .get(environment.ConexionWebApiProxy +  "clientes/" + Dto.IdCliente)
      .subscribe((res: any) => {
        let aux = res;
        //formatear fecha de  ISO 8061 a string dd/MM/yyyy
        aux.FechaIngreso = this.utiles.Fecha_ISO_ddMMyyyy(res.FechaIngreso);
        aux.FechaEgreso = this.utiles.Fecha_ISO_ddMMyyyy(res.FechaEgreso);
        aux.FechaNacimiento = this.utiles.Fecha_ISO_ddMMyyyy(
          res.FechaNacimiento
        );

        //this.FormReg.patchValue(aux, { emitEvent: false });  // para que no desdecadene lo ngchanges del provincia por ej que borraria departamento
        this.FormReg.patchValue(aux); //que se desencadene el ngchanges para cargar las provincias segun el pais
        this.AccionABMC = AccionABMC;
      });
  }

  Consultar(Dto) {
    this.BuscarPorId(Dto, "C");
  }

  // comienza la modificacion, luego la confirma con el metodo Grabar
  Modificar(Dto) {
    if (!Dto.Activo) {
      this.modalDialogService.Alert(
        "No puede modificarse un registro Inactivo."
      );
      return;
    }
    this.submitted = false;
    this.FormReg.markAsUntouched();
    this.BuscarPorId(Dto, "M");
  }

  // grabar tanto altas como modificaciones
  Grabar() {
    this.submitted = true;
    // verificar que los validadores esten OK
    if (this.FormReg.invalid) {
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    itemCopy.FechaIngreso = this.utiles.Fecha_ddMMyyyy_ISO(
      itemCopy.FechaIngreso
    );
    itemCopy.FechaEgreso = this.utiles.Fecha_ddMMyyyy_ISO(itemCopy.FechaEgreso);
    itemCopy.FechaNacimiento = this.utiles.Fecha_ddMMyyyy_ISO(
      itemCopy.FechaNacimiento
    );

    // agregar post
    if (itemCopy.IdCliente == 0) {
      this.http
        .post(environment.ConexionWebApiProxy +  "clientes/", itemCopy)
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert("Registro agregado correctamente.");
          this.Buscar();
        });
    } else {
      // modificar put
      this.http
        .put(
          environment.ConexionWebApiProxy +  "clientes/" + itemCopy.IdCliente,
          itemCopy
        )
        .subscribe((res: any) => {
          this.Volver();
          this.modalDialogService.Alert("Registro modificado correctamente.");
          this.Buscar();
        });
    }
  }

  // representa la baja logica
  ActivarDesactivar(Dto) {
    this.modalDialogService.Confirm(
      "Esta seguro de " +
        (Dto.Activo ? "desactivar" : "activar") +
        " este registro?",
      undefined,
      undefined,
      undefined,
      () =>
        this.http
          .delete(environment.ConexionWebApiProxy +  "clientes/" + Dto.IdCliente)
          .subscribe((res: any) => this.Buscar()),
      null
    );
  }

  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
  }

  ImprimirListado() {
    this.modalDialogService.Alert("Sin desarrollar...");

    // ref angular pdf : https://stackoverflow.com/a/63684298
    // let DATA = this.htmlData.nativeElement;
    // let doc = new jsPDF('p', 'pt', 'a4');
    // doc.html(DATA, {
    //   callback: (doc) => {
    //     doc.output("dataurlnewwindow");
    //   }
    // });
  }
}
