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
    this.poolConnection.query(query, (err, result, keys) => {
      callback(err, result);
    });
  }
}

let sqlConnectionInstance = new SQLHelper();
export default sqlConnectionInstance;
