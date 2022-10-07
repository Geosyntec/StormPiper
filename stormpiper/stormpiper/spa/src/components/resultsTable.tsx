import { Typography,makeStyles, Button, CircularProgress, Box } from "@material-ui/core";
import Chip from "@material-ui/core/Chip"
import React, {useState,useEffect} from "react";
import { DataGrid } from '@mui/x-data-grid';

type TableHeader = {
    field:string,
    headerName:string,
    valueGetter:(values:any)=>any,
    flex?:number
}

type FieldGroup={
    groupName:string,
    fields:string[]
}

type ResultsTableProps={
    displayController:VoidFunction,
    nodes?:"all" | string,
    displayState:boolean,
}

const useStyles = makeStyles(theme=>({
    tableContainer:{ display: "flex", height:"95%",width: "100%",flexGrow:1,flexDirection:"column" },
    tableHeader:{display: "flex",},
    headerItem:{margin:theme.spacing(0.5)},
    active:{
        "&:focus":{
            backgroundColor:theme.palette.warning.main,
        },
        "&:hover":{
            backgroundColor:theme.palette.warning.main,
        },
        backgroundColor:theme.palette.warning.main,
    },
    listRoot:{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            padding: theme.spacing(0.5),
            margin: 0,
          },
    cancelContainer:{
        position:"absolute",
        justifyContent: "end",
        right:"2%",
        top:"0%",
    },
    cancelIcon:{
        cursor:"pointer",
        position:"relative",
    }
}))

function convertToCSV(objArray:{[k:string]:string|number|undefined}[]) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(items:any, fileTitle:string, headers:any) {
    let headersFormatted:{[k:string]:string} = {}

    Object.keys(headers).map(k=>{
        headersFormatted[k] = headers[k].field
    })

    // if (headers) {
        items.unshift(headersFormatted);
    // }

    // Convert Object to JSON
    // var jsonObject = JSON.stringify(items);

    var csv = convertToCSV(items);

    var exportedFilename = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // if (navigator.msSaveBlob) { // IE 10+
    //     navigator.msSaveBlob(blob, exportedFilename);
    // } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    // }
}

export default function ResultsTable(props:ResultsTableProps){
    const classes = useStyles()
    let allResults:any
    let resSpec:any
    let headers:TableHeader[] = []


    const pinnedFields = ["node_id","epoch_id"]
    const [filterModel,setFilterModel] = useState({items:[{columnField:"node_id",operator:"contains",value:""}]})
    const fieldGroups:FieldGroup[]=[
        {
            groupName:"Overview",
            fields:[...pinnedFields,"facility_type","node_type","captured_pct","treated_pct","retained_pct","bypassed_pct"]
        },
        {
            groupName:"Runoff Stats",
            fields:[...pinnedFields,"runoff_volume_cuft_inflow","runoff_volume_cuft_treated","runoff_volume_cuft_retained","runoff_volume_cuft_captured","runoff_volume_cuft_bypassed"]
        },
        {
            groupName:"Pollutant Mass Flow",
            fields:[...pinnedFields,"TSS_load_lbs_inflow","TSS_load_lbs_removed","TN_load_lbs_inflow","TN_load_lbs_removed","TP_load_lbs_inflow","TP_load_lbs_removed","TZn_load_lbs_inflow","TZn_load_lbs_removed","TCu_load_lbs_inflow","TCu_load_lbs_removed"]
        },
        {
            groupName:"Pollutant Concentration",
            fields:[...pinnedFields,"TSS_conc_mg/l_influent","TSS_conc_mg/l_effluent","TN_conc_mg/l_influent","TN_conc_mg/l_effluent","TP_conc_mg/l_influent","TP_conc_mg/l_effluent","TZn_conc_ug/l_influent","TZn_conc_ug/l_effluent","TCu_conc_ug/l_influent","TCu_conc_ug/l_effluent"]
        },
    ]

    const [resultState,setResultState] = useState({
        results:[],
        headers:[{field:"",headerName:""}],
        loaded:false
    })
    const [currentFields,setCurrentFields] = useState([...pinnedFields,"facility_type","node_type","captured_pct","treated_pct","retained_pct","bypassed_pct"])
    const [currentGroup,setCurrentGroup]= useState("Overview")
    // const [currentFields,setCurrentFields] = useState(props.nodes==='all'? [...pinnedFields,"facility_type","node_type"]:[...pinnedFields,"runoff_volume_cuft_inflow","runoff_volume_cuft_treated","runoff_volume_cuft_retained","runoff_volume_cuft_captured","runoff_volume_cuft_bypassed"])
    // const [currentGroup,setCurrentGroup]= useState(props.nodes==='all'? "Overview":"Runoff Stats")

    useEffect(()=>{

        if (!props.displayState) return

        let resources = ["/openapi.json", "/api/rest/results"]
        Promise.all(resources.map(url=>fetch(url).then(res=>res.json())))
        .then(resArray=>{
            resSpec = resArray[0].components.schemas.ResultView
            allResults = resArray[1]
            headers = _buildTableColumns(resSpec.properties)
                // : [
                //     {
                //         field:"1980s",
                //         headerName:"1980's",
                //         flex:1
                //     },
                //     {
                //         field:"2030s",
                //         headerName:"2030's",
                //         flex:1
                //     },
                //     {
                //         field:"2050s",
                //         headerName:"2050's",
                //         flex:1
                //     },
                //     {
                //         field:"2080s",
                //         headerName:"2080's",
                //         flex:1
                //     },
                // ]
            setResultState({
                results:allResults,
                headers,
                loaded:true
            })
        })
        .catch(err=>console.warn("Couldn't get results", err))
    },[props.displayState])

    // useEffect(()=>{
    //     console.log("Current results table rows: ",resultState.results)
    // },[resultState.results])


    // _cleanNumericalValues(results:{[]})

    function _buildTableColumns(props:{[key:string]:{title:string,type:string}}):TableHeader[]{
        let colArr:TableHeader[] = []
        Object.keys(props).map(k=>{
            colArr.push({
                field:k,
                headerName:props[k].title,
                flex:pinnedFields.includes(k)? 2:1,
                valueGetter:(params)=>{
                    if(props[k].type==="number"){
                        return new Intl.NumberFormat('en-US',{maximumSignificantDigits:3}).format(params.row[k])
                    }else{
                        return params.row[k]
                    }
                }
            })
        })
        return colArr
    }

    if(resultState.loaded){
        console.log("Active Group: ",currentGroup)
        return (
          <div>
            <div className={classes.tableContainer}>
                <div className={classes.tableHeader}>
                    <Typography className={classes.headerItem} variant="h5">Water Quality Results</Typography>
                    <ul className={classes.listRoot}>
                        {fieldGroups.map(group=>{
                            return(
                                <li>
                                    <Chip
                                        className={`${classes.headerItem} ${group.groupName===currentGroup && classes.active}`}
                                        label={group.groupName}
                                        onClick={()=>{
                                            setCurrentFields(group.fields)
                                            setCurrentGroup(group.groupName)
                                        }}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                    {/* <Button onClick={()=>setFilterModel({items:[{columnField:'node_id',operator:'contains',value:props.currentNode}]})}>Select Current Facility</Button> */}
                    <Button onClick={()=>exportCSVFile(resultState.results,'testResults',resultState.headers)}>Download Results</Button>
                    <div className={classes.cancelContainer}>
                        <h4 className={classes.cancelIcon} onClick={props.displayController}>
                            &#10005;
                        </h4>
                    </div>
                </div>
                <DataGrid
                    rows={resultState.results}
                    columns={resultState.headers.filter(h=>currentFields.includes(h.field))}
                    rowsPerPageOptions={[5,25,100]}
                    disableSelectionOnClick
                    getRowId={(row) => row['node_id'] + row['epoch_id']}
                    density={"compact"}

                    // initialState={{
                    //     filter: {
                    //       filterModel,
                    //     },
                    //   }}
                />
            </div>
          </div>
        );
    }else{
        return(
            <Box sx={{display:'flex',flexDirection:'column',justifyContent:'center'}}>
                <Typography variant="h5">Loading results...</Typography>
                <CircularProgress style={{margin:'1em',alignSelf:'center'}}/>
            </Box>
        )
    }

}
