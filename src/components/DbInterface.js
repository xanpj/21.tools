import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import * as CONSTANTS from '../constants'

export default class DbInterface {
    constructor() {
     // Initialize the App Client
     this.client = Stitch.initializeDefaultAppClient(process.env.REACT_APP_MONGO_DB_APP_ID);

     // Get a MongoDB Service Client
     // This is used for logging in and communicating with Stitch
     const mongodb = this.client.getServiceClient(
       RemoteMongoClient.factory,
       "mongodb-atlas"
     );

     // Get a reference to the todo database
     this.db = mongodb.db(CONSTANTS.DB_NAME);
    }

    async getPages(){
      const credentials = await this.client.auth.loginWithCredential(new AnonymousCredential())
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find({})
                    .toArray()
    }

    insertToolPageVersion(data){
      this.client.auth
       .loginWithCredential(new AnonymousCredential())
       .then(response => {
        this.db
       .collection("toolPages")
       .insertOne({
         owner_id: this.client.auth.user.id,
         ...data
        })
       })
       .catch(err => console.log("err"+err))
    }

    async getLastToolPageVersion(toolPageName){
      const credentials = await this.client.auth.loginWithCredential(new AnonymousCredential())
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find( {[CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: toolPageName}, {sort: {[CONSTANTS.SCHEMA_FIELD_VERSION]:-1}, limit: 1} )
                    .toArray()
    }

}
