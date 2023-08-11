# Editing Facility Data
<div id="editing_facility_data"></div>

## Editing Water Quality Parameters

You can edit the parameters used to model facilities in the **Facility Details**
view. There are several ways to navigate to this view:

* From the Map Explorer map, click on a facility to open the Facility Overview panel. Then, click on **View Facility Details** to be taken to the
detail page.

* From the **Water Quality Results Viewer,** click on a BMP name in the table.

## Updating from Simple to Detailed Facility

By default, most facilities are modeled as simple facilities, meaning only two parameters are
used: [Captured Percentage](#captured_pct), and [Retained Percentage](retained_pct). The Simple Facility type should be used when detailed data about a facility are not available (e.g. the facility's infiltration area).

If more detailed data are available, turn off the Simple Facility switch, and parameters specific to the facility type will be editable.

## Editing Facility Type

If a [Facility Type](#facility_type) needs to be updated, select the  Facility Type dropdown menu, and choose the appropriate facility type. Click **Save** to save your edits.

::::: Warning :::::::::::::::::::::::::::::::::::::::::
**Warning** Saving your edits does not recalculate results. To recalculate, click the **Refresh Results** button on the Facility Details Page.
:::::::::::::::::::::::::::::::::::::::::::::::::::::::

## Editing Life Cost Analysis Parameters

By default, facilities will not have cost parameters unless users provide cost analysis parameters. Facilities without cost data will show the following message under the Lifecycle Cost Analysis Heading:

> *Lifecycle costs are unavailable for this facility.*
> *This usually means that the "Cost Analysis Parameters" are incomplete.*

To edit lifecycle cost parameters, select the dropdown menu titled **Cost Analysis Parameters.** There, you can enter the cost analysis parameters directly for a facility. See the [Cost Analysis Parameters section](#cost_analysis_params) for descriptions of parameters.

### Cost Estimator Tool  

To assist with selection of cost analysis parameters, a cost estimator tool is available; it uses cost curves and methodology developed by King County to provide high-level cost estimates for various facilities. To use this tool, select a BMP to view the BMP facility details page. Next, click on the cost analysis parameters drop down and then click on the **King County Cost Estimator Tool.** This will open a dialog box to select and apply data from King County cost curves.

First, select the appropriate facility type under the **BMP Type** dropdown menu. This will preselect an appropriate BMP Cost Curve used by King County (**KC BMP Variation** in the tool). You can refine or change the selected cost curve under the **KC BMP Variation** menu. Cost curves that match the selected **BMP Type** will be shown in **bold**.

In order to calculate the cost parameters, you must enter a sizing parameter in the next dialog box. Depending on the cost curve selected, the dialog box will display either *area (sqft)* or *each (count).* Here, *area* refers to the footprint area of a facility (e.g. the total area of pervious pavement), or the number of facilities to be installed (e.g. number of UIC wells).

After entering the number denoting the area or number of facilities, the Capital Cost and O&M Costs will be calculated. Click *Apply to BMP Form* to apply the calculated costs to the facility. To calculate the final lifecycle cost, you will need to enter data for the following:

 **Install Year** - The year of installation, denoting what year to apply the capital costs.

 **Replacement Cost** - The cost to replace a facility. This cost is intended to reflect costs related to major replacement of facility components, such as replacement of soil after multiple years of use.

 **Lifespan Yrs** - How long the facility would be operated before replacement would be necessary.

### Global Cost Settings

In order to calculate lifecycle costs the same way for every facility, the tool uses four global cost parameters (*discount rate*, *inflation rate*, *planning horizon*, and *cost basis year*). These parameters apply to all facilities analyzed, instead of a particular facility.

To edit these global parameters, select *Settings* under your user profile in the top left portion of the screen. Individual cost parameters can be edited by clicking the edit tool to the left of each parameter name.
