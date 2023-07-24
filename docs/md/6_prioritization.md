# Using the Prioritization Module

The watershed prioritization module allows users to identify and prioritize areas for actions to meet watershed planning goals related to water quality, habitat, and social equity.

## Selecting Project Type

The *Project Type* dialog denotes what type of project is being considered. The two choices are:

* **Retrofit** - Projects that are intended to improve water quality or hydrology. This choice gives a higher priority to subbasins that have a higher pollutant load, or do not have adequate stormwater infrastructure.

* **Preservation** - Projects that are intended to preserve an area in a subbasin with better water quality or already have adequate stormwater infrastructure.

## Setting Priority Weights

The prioritization tool allows users to weight watershed management goals based on their relative importance. Weights are positive numbers

Weights can be zero or any positive number, and reflect a decision maker or stakeholders preferences. The higher the weight, the more important the criterion. Numerically, this represents a factor of preference. For example if Goal A has a weight of 1 and Goal B has a weight of 2, Goal B will be treated as twice as important as Goal A.

No constraints have been set on the scale of weights, however, it is common practice to set a total number of weighting points (e.g. 10 points) and assign weights so that the sum of weights is equal to this predetermined total.  

Priority weights are assigned for each major watershed goal. Goals are comprised of subgoals and numeric metrics as described in [@tbl:goals]:

| Goals | Sub-goals | Criteria |
|---|---|---|
| **Goal 1: Improve Water Quality Outcomes (Clean Water Goal)** | 1.1 Prioritize areas based on pollutant concentrations | Total Nitrogen Concentration, TSS Concentration, Annual Runoff, Imperviousness |
| | 1.2 Improve infrastructure in areas with inadequate stormwater management | Percent of Area Treated, Age of Development |
| **Goal 2: Increase Resilience to Climate Change Impacts (Resilient Community Goal)** | 2.1 Target areas most vulnerable to and at risk for climate change impacts | Urban Heat Island, Capacity Issues Layer |
| **Goal 3: Preserve and Restore Critical and Sensitive Habitat (Healthy Ecosystems)** | 3.1 Preserve and Improve Natural Spaces | ES Open Space/Natural Resource Areas, Biodiversity Corridors |
| **Goal 4: Implement Equity and Social Justice (Healthy Neighborhoods; Equity)** | 4.1 Prioritize areas of overlapping equity needs as identified by other Tacoma programs | Equity Index Score, Livability Index |
| | 4.2 Improve access to safe, high-quality roadway infrastructure (green infrastructure recommendation) | Pavement Condition Index |

Table: Watershed Planning Goals used in the Prioritization Module. {#tbl:goals}

## Viewing Prioritization Results

After selecting and submitting priority weights, results will be shown on the chloropleth map and in the *Subbasin Prioritization Results* table.

Subbasins with higher priority scores reflect a higher preference for new projects based on user weighting. Clicking on a row will highlight the selected subbasin on the map.

## Downloading Prioritization Results

To understand the breakdown of attributes and weights from the prioritization module, download the results by clicking on the *Export* button. This will download a .CSV file listing subgoals, criteria, weights, direction of criteria (whether a criterion should be minimized or maximized), as well as the criterion-specific results.
