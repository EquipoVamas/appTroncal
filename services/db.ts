import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    { name: "ExampleDB", location: "default"},
    () => { console.log("DB iniciada..!") },
    error => { console.log(error) }
)

export const initDB = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, estado INTEGER, latitud TEXT, longitud TEXT, codPoste TEXT, propietario TEXT, ladoVia TEXT, direccion TEXT, tipoVia TEXT, nroApoyo TEXT, nivelTension TEXT, material TEXT, altura TEXT, nombreVia TEXT, lote TEXT, estadoP TEXT, item TEXT NULL, editado INTEGER, file BLOB NULL, materiales BLOB NULL)',
        [],
        (tx, results) => { 
          resolve(results?.rowsAffected);
          console.log('Table created successfully');
         },
        error => { reject(error); }
      );
    });
  });
};

export const saveItem = (
  nombre: string, 
  latitud: string, 
  longitud: string, 
  codPoste: string, 
  propietario: string, 
  ladoVia: string, 
  direccion?:string, 
  tipoVia?:string, 
  nroApoyo?:string, 
  nivelTension?:string, 
  material?:string, 
  altura?:string, 
  nombreVia?:string, 
  lote?:string,
  estadoP?:string, 
  file?: any, 
  status?: number,
  item?: string,
  materiales?: any
) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO items (
            nombre, 
            latitud, 
            longitud, 
            estado, 
            codPoste, 
            propietario, 
            ladoVia, 
            direccion, 
            tipoVia,
            nroApoyo, 
            nivelTension, 
            material, 
            altura, 
            nombreVia,
            lote,
            estadoP,
            file, 
            item,
            editado,
            materiales
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [nombre, latitud, longitud, status == 0 ? 0 : 1, codPoste, propietario, ladoVia, direccion, tipoVia, nroApoyo, nivelTension, material, altura, nombreVia, lote, estadoP, file, item ? item : null, 0, materiales],
          (tx, results) => {
            resolve(results);
          },
          error => {
            reject(error);
          }
        );
      });
    });
};

export const updateItem = (id: string, nombre: string, latitud: string, longitud: string, codPoste: string, propietario: string, ladoVia: string, direccion?: string, tipoVia?: string, nroApoyo?: string, nivelTension?: string, material?: string, altura?: string, nombreVia?: string,  lote?:string, estadoP?:string, file?: any, status?: number, item?: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE items SET 
            nombre = ?, 
            latitud = ?, 
            longitud = ?, 
            estado = ?, 
            codPoste = ?, 
            propietario = ?, 
            ladoVia = ?, 
            direccion = ?, 
            tipoVia = ?,
            nroApoyo = ?, 
            nivelTension = ?, 
            material = ?, 
            altura = ?, 
            nombreVia = ?,
            lote = ?,
            estadoP = ?,
            file = ?,
            item = ?,
            editado = ?
        WHERE id = ?`,
        [nombre, latitud, longitud, status == 0 ? 0 : 1, codPoste, propietario, ladoVia, direccion, tipoVia, nroApoyo, nivelTension, material, altura, nombreVia, lote, estadoP, file, item ? item : null, 1, id],
        (tx, results) => {
          resolve(results);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const deleteTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      'DROP TABLE IF EXISTS tipoEstado',
      [],
      () => { console.log('Table deleted successfully'); },
      error => { console.log(error); }
    )
  })
}

export const getItems = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM items',
          [],
          (tx, results) => {
            let items = [];
            for (let i = 0; i < results.rows.length; i++) {
              items.push(results.rows.item(i));
            }
            resolve(items);
          },
          error => {
            reject(error);
          }
        );
      });
    });
};

export const getOneItem = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items WHERE id = ?',
        [id],
        (tx, results) => {
          resolve(results.rows.item(0)); 
        },
        error => {
          reject(error);
        }
      );
    });
  });
}

export const getOneItemIdServer = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items WHERE item = ?',
        [id],
        (tx, results) => {
          resolve(results.rows.item(0)); 
        },
        error => {
          reject(error);
        }
      );
    });
  });
}

export const setFiles = (id:string, files: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET file = ? WHERE id = ?',
        [files, id],
        (tx, results) => {
          resolve(results);
        },
        error => {
          reject(error);
        }
      );
    });
  });
}

export const setStatus = (id:string, item?: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET estado = 0, editado = 0, file = NULL, item = ? WHERE id = ?',
        [item ? item : null, id],
        (tx, results) => {
          resolve(results);
        },
        error => {
          reject(error);
        }
      );
    });
  });
}

export const setMaterial = (id:string, material: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET materiales = ? WHERE id = ?',
        [material ? material : null, id],
        (tx, results) => {
          resolve(results);
        },
        error => {
          reject(error);
        }
      );
    });
  });
}


  