
const getValueGRP = ( resultXml, field ) => {
    const recorrerGrupo = resultXml.$value.RESULT.GRP;

    let encontrado = false;
    let value = ""
    for (let i = 0; i < recorrerGrupo.length; i++) {
        const recorrerCampo = recorrerGrupo[i].FLD;
        for (let j = 0; j < recorrerCampo.length; j++) {
            const element = recorrerCampo[j];
            if (element.attributes.NAME === field){
                encontrado = true;
                value =  element.$value;
                break
            };
        }
        if (encontrado) break;
    };
    return value;
}

const chunkSubstr = (str, size) => {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)
  
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size)
    }
  
    return chunks
}

module.exports = {
    getValueGRP,
    chunkSubstr
}