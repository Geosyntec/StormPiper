// DeckGL react component
const fieldDict = {
  activeSWFacility: [
    {
      id: "altid",
      label: "Facility ID",
    },
    { id: "facilitytype", label: "Facility Type" },
    { id: "subbasin", label: "Basin ID" },
  ],
  tmnt_delineations: [
    {
      id: "altid",
      label: "ID",
    },
    { id: "relid", label: "Downstream Facility" },
  ],
  scenarioDelineations: [
    { id: "scenarioName", label: "Scenario" },
    { id: "name", label: "Delineation Name" },
  ],
  scenarioFacilities: [
    { id: "scenarioName", label: "Scenario" },
    { id: "node_id", label: "Facility Name" },
  ],
  subbasins: [{ id: "subbasin", label: "Subbasin" }],
  default: [{ id: "altid", label: "ID" }],
};

function getTooltipContents(object, layer, label) {
  const feat = object;
  const fields = fieldDict[layer] ? fieldDict[layer] : fieldDict.default;
  if (feat) {
    let content = `<h4> Layer: ${label}</h4>
        ${fields.reduce((acc, field, i) => {
          return acc + `<p>${field.label}: ${feat?.properties[field.id]}</p>`;
        }, "")}`;
    return content;
  }
}

export default getTooltipContents; //`<Tooltip feat={${object} layer={${object?.layer?.id}}}></Tooltip>`
