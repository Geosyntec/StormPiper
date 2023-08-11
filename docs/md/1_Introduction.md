<!-- 
::::: Warning :::::::::::::::::::::::::::::::::::::::::
**Warning** This is a warning. 
:::::::::::::::::::::::::::::::::::::::::::::::::::::::



-->



# Introduction

This manual describes how to use the Tacoma Watershed Insights web application. This application lets users track stormwater infrastructure, assess performance, and make informed decisions regarding stormwater and water quality in Tacoma.

## Purpose

The purpose of this manual is to provide a guide for users who want to learn how to navigate and use the Tacoma Watershed Insights web application. The manual covers the following topics:

- How to access and log in to the application
- How to view and explore the map and data layers
- How to use the tools and features of the application
- How to export and share data and reports

This manual is focused on the usability of the web application. It does not provide technical details about the methodology behind calculations or modeling assumptions. For information regarding these aspects, please refer to the Technical Methodology Report [^1].

[^1]: *Technical Methods and Approach Document - City of Tacoma Watershed Planning Project.*
Geosyntec Consultants, June 2023.

The manual assumes that users have a basic familiarity with web browsers and GIS concepts. The manual also provides links to external resources for further information and learning.

## Key Concepts

Before using the Tacoma Watershed Insights web application, it is helpful to understand some key concepts that are used in the tool. These concepts are also referred to throughout this manual.

### Climate Epochs

Stormwater facility results are calculated based on continuous rainfall-runoff simulation using a regional precipitation data set.[^2]

[^2]: Salathé, E.P., Hamlet, A.F., Mass, C.F., Lee, S-Y., Stumbaugh, M., Steed, R. 2014. Estimates of Twenty-first Century flood risk in the Pacific Northwest based on regional scale climate model simulations. J. Hydrometeorology 15(5): 1881-1899, <https://doi.org/10.1175/JHM-D-13-0137.1>

Four scenarios or *climate epochs* have been developed as shown in [@tbl:epochs].

| Scenario | Begin | End |
| :------- | :-------------- | :---------------- |
| 1980s (Historic) | January 1, 1970 | December 31, 1999 |
| 2030s | January 1, 2000 | December 31, 2039 |
| 2050s | January 1, 2040 | December 31, 2069 |
| 2080s | January 1, 2070 | December 31, 2099 |

Table: Climate Epochs {#tbl:epochs}

### Facility Types
Water quality and hydrology calculations are specific to each facility type. *Facility Type* refers to stormwater facility names used by the City of Tacoma. 


| Facility Type | Description |
|---|---|
| Filterra/Vegetated box | Manufactured devices with high-rate filtration media that support plants. |
| Media Filter | Manufactured devices with high-rate filtration media consisting of a variety of inert and sorptive media types and configurations (e.g., cartridge filters, upflow filters, membrane filters, vertical bed filters). |
| Oil-water Separator | Manufactured devices including oil/water separators and baffle chambers designed for removing floatables and coarse solids. |
| Pervious Pavement | Full-depth pervious concrete, porous asphalt, paving stones or bricks, reinforced turf rings, and other permeable surface designed to replace traditional pavement. | |
| Pond/wet vault | Surface wet pond with a permanent pool of water, may include underground wet vaults. | |
| Bioretention | Shallow, vegetated basins with a variety of planting/filtration media and often including underdrains. |
| Sand Filter | Filter bed with granular media, typically sand. |
| Swale | Shallow, vegetated channel, also called bioswale or vegetated swale. |
| Swirl Separator | Manufactured devices providing gravitational settling using swirl concentrators, screens, and baffles. Also referred to as hydrodynamic separators (HDS). |
| Dry Extended Detention Basin/Tank | Dry extended detention including grass-lined and concrete lined basins that are designed to empty after a storm. |
| Trench | Filter bed with granular media, typically sand. Full infiltration |
| Vault | Concrete-lined basins that drain after a storm. |

Table: Facility Types contained in the Tacoma Watershed Insights application {#tbl:facilities}

### Simple vs. Detailed Facilities

In the context of the Tacoma Watershed Insights application, facilities can be modeled as one of two types: Simple and Detailed.

The Tacoma Watershed Insights application models stormwater infrastructure as either Simple or Detailed facilities based on the availability of data and the complexity of the facility's design and operation.

#### Simple Facilities

By default, facilities are initially modeled as Simple Facilities unless detailed information has been entered. The Simple Facility model is used when detailed data about a facility is not available, such as the specific design parameters of the facility or the infiltration area. Simple facilities are assumed to treat or retain 91% of runoff from the effective drainage area.

#### Detailed Facilities

If more detailed data about a facility are available, the application can model the facility as a Detailed Facility. When the Simple Facility switch is turned off, parameters specific to the facility type become editable. 
Detailed Facilities provide a more accurate and comprehensive model of a facility's performance.

### Pollutants

The Tacoma Watershed Insights application models 8 different stormwater pollutants. These are shown below. 

| Parameter                                 | Group        | EIM Parameter CAS |
|-------------------------------------------|--------------|-------------------|
| Bis(2-ethylhexyl) phthalate | Phthalate    | 117-81-7          |
| Copper                     | Metal        | 7440-50-8         |
| Phenanthrene               | LPAH         | 85-01-8           |
| Pyrene                     | HPAH         | 129-00-0          |
| Total Nitrogen             | Nutrient     | None               |
| Total Phosphorus           | Nutrient     | 7723-14-0         |
| Total Suspended Solids     | Conventional | None     |
| Zinc                       | Metal        | 7440-66-6         |

Table: Stormwater Pollutants  {#tbl:pollutants}

### Subbasins

A Subbasin is a geographical area that drains into a particular receiving water or collection system node. In addition to reporting facility performance, the tool reports metrics on a subbasin level. 

The subbasins used in this tool have been developed by the City of Tacoma. They are summarized in [@Tbl:subbasins]. Subbasins are referenced by a unique subbasin code using the subbasin code prefix shown in [@Tbl:subbasins]. For example, the first subbasin that is part of the Flett Creek Basin would be `FL_01`.

| Basin            | Number of Subbasins | Subbasin Code prefix  |
|----------------|-------------------|--------------------|
| Flett Creek      | 10                  | `FL_`                |
| Foss Waterway    | 15                  | `FS_`                |
| Joes Creek       | 3                   | `JC_`                |
| Leach Creek      | 6                   | `LC_`                |
| Lower Puyallup   | 6                   | `LP_`                |
| North Tacoma     | 11                  | `NT_`                |
| Northeast Tacoma | 6                   | `NE_`                |
| Tideflats         | 6                   | `TF_`                |
| Western Slopes   | 4                   | `WS_`                |

Table: City of Tacoma Subbasins {#tbl:subbasins}