import { createPool } from "mysql";

class SQLHelper {
  poolConnection: any;
  constructor() {
    this.poolConnection = createPool({
      host: "52.66.203.209",
      user: "trackadmin",
      password: "T1r@c!k123",
      database: "track",
      connectionLimit: 10
    });
  }

  executeQuery(query, callback) {
    this.poolConnection.getConnection(function(err, connection) {
      if (err) {
        connection.release();
        throw err;
      }
      connection.query(query, function(err, rows) {
        connection.release();
        if (!err) {
          callback(null, { rows: rows });
        }
      });
      connection.on("error", function(err) {
        throw err;
        return;
      });
    });
  }
}

let sqlConnectionInstance = new SQLHelper();
export default sqlConnectionInstance;
