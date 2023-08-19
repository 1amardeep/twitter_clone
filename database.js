const uri =
  "mongodb+srv://twitter2023:twitter2023@twitterclonecluster.xh5tqcq.mongodb.net/twitterCloneDB?retryWrites=true&w=majority";
const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connect();
  }
  connect() {
    mongoose
      .connect(uri)
      .then(() => {
        console.log("DB connected successful");
      })
      .catch((err) => {
        console.log("DB error" + err);
      });
  }
}

module.exports = new Database();
