import { instance } from '../axios'

export const loginUser = async (usuario: string, clave: string) => {
  const res = await instance.post('/authU/loginUsuarioAdmin', { nombreUsuario: usuario, clave }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return res;
}

export const logoutUser = async (form:any) => {
  const res = await instance.post('authU/logoutUsuario', form, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return res;
}

export const verifyUser = async (form:any) => {
  const res = await instance.post('authU/verificarUser', form, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return res;
}
