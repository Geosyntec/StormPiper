import "./bmpStatWindow.css";

const fieldDict = {
  activeSWMain: ["ALTID", "DIAMETER", "INSTALLDATE"],
  activeSWFacility: ["ALTID", "SUBBASIN", "FACILITYDETAIL", "MEDIATYPE"],
  default: ["OBJECTID"],
};

function BMPStatWindow(props) {
  return (
    <div>
      <div className="panel-header">
        <div>
          <h4 id="panel-title">BMP Stat Table</h4>
        </div>
        <div >
          <h4 id="cancel-icon" onClick={props.displayController}>&#10005;</h4>
        </div>
      </div>
      {_renderStats(props?.feature)}
    </div>
  );
}

function _renderStats(props) {
  console.log("Rendering Stats:", props?.object);
  return (
    <div>
      <p>ID: {props?.object?.properties?.ALTID}</p>
      <p>Subbasin: {props?.object?.properties?.SUBBASIN}</p>
    </div>
  );
}

export default BMPStatWindow;
