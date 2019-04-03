import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import * as CONSTANTS from '../constants'
import * as Positions from '../resources/InfographicPositions';

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

    async authenticateAnonymousUser(){
      await this.client.auth.loginWithCredential(new AnonymousCredential())
    }

    async getPages(){
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find({})
                    .toArray()
    }

    async getAllToolPageVersions(toolPageName){
      //this.insertInitial()
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find({[CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: toolPageName}, {sort: {[CONSTANTS.SCHEMA_FIELD_VERSION]:-1}, limit: 1000,  projection: {[CONSTANTS.SCHEMA_FIELD_ID]: 1, [CONSTANTS.SCHEMA_FIELD_VERSION]: 1} } )
                    .toArray()
    }

    async getSpecificToolPageVersion(toolPageId){
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find( {[CONSTANTS.SCHEMA_FIELD_ID]: toolPageId} )
                    .toArray()
    }

    insertToolPageVersion(data){
      this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES).insertOne({
       owner_id: this.client.auth.user.id,
       ...data
     })
    }

    async getLastToolPageVersion(toolPageName){
      return await this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES)
                    .find( {[CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: toolPageName}, {sort: {[CONSTANTS.SCHEMA_FIELD_VERSION]:-1}, limit: 1} ) //TODO change version
                    .toArray()
    }

    insertInitial(){
      this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES).deleteMany({"toolPage": "video"})
      this.db.collection(CONSTANTS.SCHEMA_TABLE_TOOL_PAGES).insertOne({
        owner_id: this.client.auth.user.id,
        [CONSTANTS.SCHEMA_FIELD_TOOL_PAGE]: "video",
        [CONSTANTS.SCHEMA_FIELD_VERSION]: "0",
        [CONSTANTS.SCHEMA_FIELD_TOOLS_DATA]: Positions.filmPositions,
        [CONSTANTS.SCHEMA_FIELD_ANCHORS]: Positions.toolConnections
      })
    }

}
