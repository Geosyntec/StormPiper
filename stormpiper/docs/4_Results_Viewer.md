# Using the BMP Facility Results View

The BMP Facility Results View can be used to view a summary of the performance of existing  BMP's. To access the viewer, select **WQ Results Viewer** from the dropdown menu at the top menu bar, or from the homepage.

You can view individual BMP results by selecting the **BMP Facility Results View** card or by selecting the icon on the left-hand menu bar.

Results are summarized by climate epoch. The tables below describe the items associated with facility results.

## Overview Tab
Name | Description |
---|---|
Facility Type|  Facility type used for water quality modeling |
Node Type| Modeled type (Simple Facility, Volume-based Facility, or Flow Based Facility) |
Captured Pct|  How much runoff is captured by the facility annually.|
Treated Pct | How much runoff is treated by the facility annually.|
Retained Pct|  How much runoff is retained or infiltrated by the facility annually.|
Retained Pct|  How much runoff is bypassed by the facility annually.|

Table: Facility Overview parameters

## Runoff Stats Tab
Name | Description |
---|---|
Runoff Volume Cuft Inflow | Annual influent volume to the facility *(ft<sup>3</sup>/yr)*|
Runoff Volume Cuft Treated | Annual volume that is treated by the facility *(ft<sup>3</sup>/yr)*|
Runoff Volume Cuft Retained | Annual volume that is retained or infiltrated by the facility *(ft<sup>3</sup>/yr)*|
Runoff Volume Cuft Captured | Annual volume that is captured by the facility *(ft<sup>3</sup>/yr)* |
Runoff Volume Cuft Bypassed | Annual influent volume that is bypassed by the facility *(ft<sup>3</sup>/yr)*|

Table: Runoff Stats Parameters

## Pollutant Mass Flow Tab
Name | Description |
---|---|
Tss Load Lbs Inflow	| Total Suspended Solids load entering the facility *(lbs/yr)*
Tss Load Lbs Removed | Total Suspended Solids removed by the facility *(lbs/yr)*
Tn Load Lbs Inflow	| Total Nitrogen load entering the facility *(lbs/yr)*
Tn Load Lbs Removed	| Total Nitrogen removed by the facility *(lbs/yr)* |
Tp Load Lbs Inflow	| Total Phosphorus load entering the facility *(lbs/yr)*
Tp Load Lbs Removed	| Total Phosphorus removed by the facility *(lbs/yr)*
Tzn Load Lbs Inflow	| Total Zinc Load entering the facility *(lbs/yr)*
Tzn Load Lbs Removed	| Total Zinc removed by the facility *(lbs/yr)*
Tcu Load Lbs Inflow	| Total Copper load entering the facility *(lbs/yr)*
Tcu Load Lbs Removed |  Total Copper removed by the facility *(lbs/yr)*

Table: Pollutant Mass Flow Parameters

## Pollutant Concentration Tab
Name | Description |
---|---|
Tss Conc Mg/L Influent	|Average annual Total Suspended Solids influent concentration *(mg/L)*
Tss Conc Mg/L Effluent	|Average annual Total Suspended Solids effluent  concentration *(mg/L)*
Tn Conc Mg/L Influent	| Average annual Total Nitrogen influent concentration *(mg/L)*
Tn Conc Mg/L Effluent	| Average annual Total Nitrogen effluent concentration *(mg/L)*
Tp Conc Mg/L Influent	| Average annual Total Phosphorus influent concentration *(mg/L)*
Tp Conc Mg/L Effluent	| Average annual Total Phosphorus effluent concentration *(mg/L)*
Tzn Conc Ug/L Influent	|Average annual Total Zinc influent concentration *(μg/L)*
Tzn Conc Ug/L Effluent	|Average annual Total Zinc effluent concentration *(μg/L)*
Tcu Conc Ug/L Influent	|Average annual Total Copper influent concentration *(μg/L)*
Tcu Conc Ug/L Effluent| Average annual Total  Copper effluent concentration *(μg/L)*

Table: Pollutant Concentration Parameters

# Using the Subbasins Results View
The water quality results viewer can be used to view the conditions of each stormwater subbasin. To access the viewer, select it from the dropdown menu at the top menu bar, or from the homepage.

You can view aggregated results by subbasin by selecting the **Subbasin Results View** card or by selecting the icon on the left-hand menu bar. To view a chloropleth map of results, select the parameter to visualize from the menu next to the map.

## Exporting Results
To export results from the Subbasin Results View, click the **Export** button on the table below the map. This will download a CSV file of all results. To export a selection of data, select the rows you want to export on the table, then click **Export**.

## Available Data Layers
Name | Description | Data Source |
---|---|---|
Land Use Breakdown |  Percent Land Use Category in Subbasin | Tacoma ArcGIS REST API:  Land Use Designations  ```(General/LandUseDesignations/MapServer/0)```|
Land Cover Breakdown |Percent Land Cover Category in Subbasin|[TNC Stormwater Heatmap](https://www.stormwaterheatmap.org/docs/Data%20Layers/land_cover)|
Runoff|Runoff depth, runoff volume, total volume reduced by stormwater facilities.|Calculated|
Treatment Facility Summary|Number of BMPs, Treated Area, Area Treated by Basic Water Quality BMPs, Area Treated by Flow Control BMPs, Effective Area|Calculated|
Average Pollutant Washoff Concentration | Average Annual Concentration before treatment | Calculated
Annual Load Reductions|Average Annual Pollutant Load reductions from BMPs| Calculated |

Table: Available Data Layers in the Subbasin Results View
