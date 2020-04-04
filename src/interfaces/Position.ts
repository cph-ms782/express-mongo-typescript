export default interface Position {
    lastUpdated:Date,
    userName:string,
    name:string,
    location: {
        type: string,//No(easy) way in ts, to restrict this to the only legal value "point"
        coordinates : Array<number>
    }
 }
 