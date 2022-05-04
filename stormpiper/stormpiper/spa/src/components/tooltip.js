// DeckGL react component
const fieldDict = {
    activeSWMain:['ALTID','DIAMETER','INSTALLDATE'],
    proposedSWFacility:['ALTID','SUBBASIN','FACILITYDETAIL','MEDIATYPE'],
    default:['OBJECTID']
}



function getTooltipContents(object,layer) {
    const feat = object
    const fields = fieldDict[layer]?fieldDict[layer]:fieldDict.default
    console.log('feature:',feat.properties)
    console.log('layer:',layer)
    if (feat){
        return (
            `<h4> Layer: ${layer}</h4>
            ${fields.map(field=>{
                return(`<h4> ${field}: ${feat?.properties[field]}</h4>`)    
            })}`
        );
    }
   
  }

  
  
  export default getTooltipContents; //`<Tooltip feat={${object} layer={${object?.layer?.id}}}></Tooltip>`