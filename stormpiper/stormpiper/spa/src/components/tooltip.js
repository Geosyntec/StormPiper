// DeckGL react component
const fieldDict = {
    activeSWMain:['ALTID','DIAMETER','INSTALLDATE'],
    activeSWFacility:['ALTID','SUBBASIN','FACILITYDETAIL','MEDIATYPE'],
    default:['OBJECTID']
}



function getTooltipContents(object,layer,label) {
    const feat = object
    const fields = fieldDict[layer]?fieldDict[layer]:fieldDict.default
    console.log('feature:',feat.properties)
    console.log('layer:',layer)
    if (feat){
        return (
            `<h4> Layer: ${label}</h4>
            ${fields.map(field=>{
                return(`<h5> ${field}: ${feat?.properties[field]}</h5>`)    
            })}`
        );
    }
   
  }

  
  
  export default getTooltipContents; //`<Tooltip feat={${object} layer={${object?.layer?.id}}}></Tooltip>`
