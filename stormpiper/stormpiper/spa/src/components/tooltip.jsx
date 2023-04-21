// DeckGL react component
const fieldDict = {
  activeSWMain: ["altid", "diameter"],
  activeSWFacility: ["altid", "subbasin", "facilitytype"],
  tmnt_delineations: ["altid", "relid"],
  userDelineations: ["name"],
  userPoints: ["node_id"],
  subbasins: ["subbasin"],
  default: ["altid"],
};

function getTooltipContents(object, layer, label) {
  const feat = object;
  const fields = fieldDict[layer] ? fieldDict[layer] : fieldDict.default;
  if (feat) {
    let content = `<h4> Layer: ${label}</h4>
        ${fields.reduce((acc, field, i) => {
          return acc + `<p>${field}: ${feat?.properties[field]}</p>`;
        }, "")}`;
    return content;
  }
}

export default getTooltipContents; //`<Tooltip feat={${object} layer={${object?.layer?.id}}}></Tooltip>`
