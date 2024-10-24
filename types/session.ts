interface Facturacion {
  Estado: any; 
  igv: any;
  bienesSelva: any;
  serviciosSelva: any;
}

export interface Session {
  id: string,
  idS?: string,
  usuario: string,
  facturacion?: Facturacion,
  email: string;
  token: string;
  idEmpresa?: string;
  roles?: [];
  strategy: string;
  idStrategy?: string;
  rol?:string;
  rolSup?:string;
  razonSocial?:string;
  logo?: any;
  type: string;
  idUsuario?: string;
  statusOnline?: string;
}