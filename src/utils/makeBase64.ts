const encoding =  (data:string) => {
    let buff = new Buffer(data);
    let base64data = buff.toString('base64');

    console.log('"' + data + '" converted to Base64 is "' + base64data + '"');
    return base64data
}
export default encoding;