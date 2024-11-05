import SQLite from 'react-native-sqlite-storage';
import Schemas from './Schemas.json';

// Initialize the database
const db = SQLite.openDatabase(
  { name: "ExampleDB", location: "default" },
  () => { console.log("DB iniciada..!"); },
  error => { console.log(error); }
);

export const initDB = (): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject(new Error('Database is not initialized.'));
    }

    let rowsAffected: number[] = []; // Array to hold rowsAffected for each table

    db.transaction(tx => {
      let tablePromises: Promise<void>[] = [];

      Schemas.forEach(table => {
        const columnsDefinition = table.columns.map(
          column => `${column.name} ${column.type} ${column.options || ''}`
        ).join(', ');
        // resetTables(table.name)
        const createTableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (${columnsDefinition})`;

        const tablePromise = new Promise<void>((resolveTable, rejectTable) => {
          tx.executeSql(
            createTableQuery,
            [],
            (tx, results) => {
              console.log('-------------------------------------------');
              console.log(`Table "${table.name}" created successfully`);
              rowsAffected.push(results.rowsAffected); // Store the rowsAffected
              resolveTable();
            },
            error => {
              console.error(`Error creating table "${table.name}":`, error);
              rejectTable(error);
            }
          );
        });

        tablePromises.push(tablePromise);
      });

      Promise.all(tablePromises)
        .then(() => resolve(rowsAffected)) // Resolve with the rowsAffected array
        .catch(error => reject(error));
    }, error => {
      reject(error);
    });
  });
};

export const fetchAllTables = async (): Promise<string[]> => {
  try {
    if (!db) {
      throw new Error('Database is not initialized.');
    }

    return await new Promise<string[]>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, 
          [],
          (tx, results) => {
            const tableNames: string[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              tableNames.push(results.rows.item(i).name);
            }
            resolve(tableNames);
          },
          (tx, error) => {
            console.error('Error fetching table names:', error);
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.log("Error fetching tables", error);
    throw error;
  }
};


// TIPO DE ESTADO
export const savePosteLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    // Get the columns and values from the object
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO poste (${columns}) VALUES (${placeholders})`,
        values,
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

export const getPosteLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM poste',
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


// TIPO DE ESTADO
export const saveTypeStatusLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    // Get the columns and values from the object
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO tipoEstado (${columns}) VALUES (${placeholders})`,
        values,
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

export const getTypeStatusLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tipoEstado',
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


// TIPO DE VIA
export const saveTypeTrackLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    // Get the columns and values from the object
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO tipoVia (${columns}) VALUES (${placeholders})`,
        values,
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

export const getTypeTrackLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tipoVia',
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


// UNIDAD DE MEDIDA
export const saveUnitMeasurementLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO unidadMedida (${columns}) VALUES (${placeholders})`,
        values,
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

export const getUnitMeasurementLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM unidadMedida',
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

// TRONCAL
export const saveTroncalLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO troncal (${columns}) VALUES (${placeholders})`,
        values,
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

export const getTroncalLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM troncal ORDER BY nombre ASC', // Ordering by name in ascending order
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


export const getOneTroncal = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM troncal WHERE item = ?',
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


// NODO
export const saveNodoLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO nodo (${columns}) VALUES (${placeholders})`,
        values,
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

export const getNodoLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM nodo',
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

export const getFilterNodoLocal = (idTroncal: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM nodo WHERE idTroncal = ? ORDER BY CAST(substr(nombre, instr(nombre, '-') + 1) AS INTEGER) ASC`,
        [idTroncal],
        (tx, results) => {
          let rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          resolve(rows);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const getOneNodo = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM nodo WHERE item = ?',
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

// Empresa
export const saveEmpresaLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO empresa (${columns}) VALUES (${placeholders})`,
        values,
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

export const getEmpresaLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM empresa',
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

// Folders
export const saveFoldersLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO folder (${columns}) VALUES (${placeholders})`,
        values,
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

export const getFoldersLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM folder',
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

export const getFoldersSearchPrefixLocal = (prefix = '', numSlash = 1) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = 'SELECT * FROM folder';
      let params = [];

      if (prefix) {
        query += ' WHERE prefix LIKE ?';
        params.push(`${prefix}%`);
      } else {
        // Selecciona solo los registros cuyo prefix contiene exactamente un '/'
        query += " WHERE (LENGTH(prefix) - LENGTH(REPLACE(prefix, '/', ''))) = " + numSlash.toString();
      }

      tx.executeSql(
        query,
        params,
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


// fileManager
export const saveFileManagerLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO fileManager (${columns}) VALUES (${placeholders})`,
        values,
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

export const getFileManagerLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM fileManager',
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

// Detalle
export const saveDetalleLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {

    const allColumns = [
      'bool', 'codInterno', 'codigo', 'idProducto', 'nombre', 'tipo', 'estado', 
      'cantidadInicial', 'cantidadReferencia', 'cantidadFinal', 'precio', 
      'idTipoVia', 'ladoVia', 'nombreVia', 'lote', 'direccion', 'latitud', 
      'longitud', 'apoyo', 'idPropietario', 'propietario', 'idUsuario', 
      'nivelTension', 'idUnidadMedidaAlto', 'alto', 'idUnidadMedidaAncho', 
      'ancho', 'item', 'especificaciones', 'materiales', 'referencias', 
      'archivos', 'idTipoEstado', 'idMufa', 'idSubMufa', 'enviado', 'editado'
    ];

    const columns = allColumns.join(', ');
    const placeholders = allColumns.map(column => itemData.hasOwnProperty(column) ? '?' : 'NULL').join(', ');
    
    const values = allColumns
      .filter(column => itemData.hasOwnProperty(column))
      .map(column => itemData[column]);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO detalle (${columns}) VALUES (${placeholders})`,
        values,
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

// Mufa
export const saveMufaLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO mufa (${columns}) VALUES (${placeholders})`,
        values,
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

export const getMufaLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM mufa',
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

export const getFilterMufaLocal = (idNodo: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM mufa WHERE idNodo = ? ORDER BY CAST(substr(nombre, instr(nombre, '-') + 1) AS INTEGER) ASC`,
        [idNodo],
        (tx, results) => {
          let rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          resolve(rows);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const getOneMufa = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM mufa WHERE item = ?',
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

// Sub Mufa
export const saveSubMufaLocal = (itemData: { [key: string]: any }) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData).join(', ');
    const placeholders = Object.keys(itemData).map(() => '?').join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO subMufa (${columns}) VALUES (${placeholders})`,
        values,
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

export const getSubMufaAllLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM subMufa',
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

export const getOneSubMufa = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM subMufa WHERE item = ?
        ORDER BY CAST(substr(nombre, instr(nombre, '-') + 1) AS INTEGER) ASC`,
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

export const getSubMufaLocal = (idMufa : string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM subMufa WHERE idMufa = ?',
        [idMufa], // Pasamos idMufa como parámetro
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

// Detalle
export const getAllDetalleLocal = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM detalle',
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

export const getFilterDetalleLocal = (idSubMufa: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM detalle 
         WHERE idSubMufa = ? 
         ORDER BY CAST(substr(nombre, instr(nombre, '-') + 1) AS INTEGER) ASC`,
        [idSubMufa],
        (tx, results) => {
          let rows = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          resolve(rows);
        },
        error => {
          reject(error);
        }
      );
    });
  });
};

export const updateDetalleLocal = (itemData: { [key: string]: any }, id: number) => {
  return new Promise((resolve, reject) => {
    const columns = Object.keys(itemData)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(itemData);

    db.transaction(tx => {
      tx.executeSql(
        `UPDATE detalle SET ${columns} WHERE id = ?`,
        [...values, id], // valores para las columnas y el id para el WHERE
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

export const updateDetalleArchivos = (archivos: any, id: number, editado = 1) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE detalle SET editado = ?, archivos = ? WHERE id = ?`, 
        [editado, archivos, id],
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


export const updateTypeStateDetalle = (idTipoEstado: any, id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {

      tx.executeSql(
        `UPDATE detalle SET idTipoEstado = ? WHERE id = ?`,
        [idTipoEstado, id], // valores para actualizar el campo "archivos" y el "id" para el WHERE
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

export const getOneDetalleItem = (id:string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM detalle WHERE id = ?',
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

// Alls
export const resetTables = (name: string) => {
  return new Promise<boolean>((resolve, reject) => {
    if (typeof name !== 'string' || name.trim() === '') {
      reject(false); // Nombre de tabla inválido
      return;
    }

    db.transaction(tx => {
      // Verifica si la tabla tiene registros
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${name};`,
        [],
        (_, result) => {
          const count = result.rows.item(0).count;

          if (count > 0) {
            // Si hay registros, procede a borrar y resetear
            tx.executeSql(
              `DELETE FROM ${name};`, // Borra los registros
              [],
              () => {
                tx.executeSql(
                  `DELETE FROM sqlite_sequence WHERE name='${name}';`, // Resetea el ID
                  [],
                  () => {
                    resolve(true); // Éxito, registros borrados y ID reiniciado
                  },
                  error => {
                    reject(false); // Error al resetear el ID
                  }
                );
              },
              error => {
                reject(false); // Error al borrar los registros
              }
            );
          } else {
            // Si no hay registros, no hace nada
            resolve(true); // No se requiere acción, pero devuelve true
          }
        },
        error => {
          reject(false); // Error al verificar los registros
        }
      );
    });
  });
};

export const dropTables = (name : string) => {
  db.transaction(tx => {
    tx.executeSql(
      `DROP TABLE IF EXISTS ${name}`,
      [],
      () => { console.log('Table deleted successfully'); },
      error => { console.log(error); }
    )
  })
}



