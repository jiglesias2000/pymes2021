// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  ConexionWebApiAzure: "https://pav2.azurewebsites.net/api/",
  ConexionWebApiLocal: "https://localhost:44349/api/",
  ConexionWebApiPymes: "https://pymes.com.ar/api/", // mapeado en archivo host a locahost
  ConexionWebApiUtn: "http://labsys.frc.utn.edu.ar:8443/api/",

  //ConexionWebApiProxy: "https://pav2.azurewebsites.net/api/"
  ConexionWebApiProxy: "https://localhost:44349/api/"
  //ConexionWebApiProxy : "/api/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
