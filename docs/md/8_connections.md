# Data Integrations

Facility data, subbasin data, and results can be easily integrated into other tools and applications through the **Data Integration Module.** Navigate to the module by clicking on **Profile** under the user menu in the top left corner of the application. The **Data Integration** panel is displayed below your profile information.

Data integration is performed through a REST API, which uses HTTP methods to read data from the tool.

## Obtaining a read-only token

Each user is assigned a unique read-only token. This token allows the API server to identify and authorize your requests. Your read-only token will be displayed beneath your user profile.

## Token Rotation

It is good practice to change your token at regular intervals, or in the event of your token being compromised.  To rotate your token, click the **Rotate Token** button next to your token.

## Making API calls

All API calls are GET requests and are made in the following format:

```
https://www.tacomawatersheds.com/api/rest/{resource}/
{resource_id}/token/{token}
```

In the above URL structure, `{resource}` is the data type you are requesting, `{resource_id}` is the specific ID of the resource (optional and depends on the endpoint), and `{token}` is your unique read-only token.

### API Endpoints

This API is organized around several endpoints representing different types of resources: `tmnt_facility`, `tmnt_delineation`, `subbasin`, and `results`. All responses are provided in JSON format unless otherwise specified.

**Common Parameters:**

- `f`: (optional, default=json, [json, geojson]) Format of response data
- `limit`: (optional, default=1e6) Number of records to return
- `offset`: (optional, default=0) Start from index
- `epoch`: (optional, default=1980s, [all, 1980s, 2030s, 2050s, 2080s]) Climate epoch filter

**Get attributes for all treatment facilities:**

```
/api/rest/tmnt_facility/token/{token}?f={f}&
limit={limit}&offset={offset}```

**Get attributes for a specific treatment facility:**

`/api/rest/tmnt_facility/{altid}/token/{token}
`
Replace `{altid}` with the specific facility id.

**Get attributes for all delineations:**

```/api/rest/tmnt_delineation/token/{token}?
f={f}&limit={limit}&offset={offset}```

**Get attributes for a specific delineation:**

```/api/rest/tmnt_delineation/ {altid}/token/
{token}?f={f}```

Replace `{altid}` with the specific delineation id.

 **Get attributes for all subbasins:**

```/api/rest/subbasin/token/{token}?f={f}&limit=
{limit}&offset={offset}```

**Get attributes for a specific subbasin:**

```/api/rest/subbasin/{subbasin_id}/token/{token}```

Replace `{subbasin_id}` with the specific subbasin id.

**Get water quality results for a specific subbasin:**

```/api/rest/subbasin/wq/{subbasin_id}/token/
{token}?epoch={epoch}```

Replace `{subbasin_id}` with the specific subbasin id.

**Get water quality results for all subbasins:**

```/api/rest/subbasin/wq/token/{token}?f={f}& 
limit={limit}&offset={offset}&epoch={epoch}```

**Get results:**

```/api/rest/results/token/{token}?ntype={ntype}& 
limit={limit}&offset={offset}&epoch={epoch}```

The `ntype` parameter is optional and filters the data by node type (land_surface, tmnt_facility).

## How to connect Excel with Tacoma Watersheds Results

Power Query is a powerful tool within Microsoft Excel that allows you to import data from various external data sources, including RESTful APIs. This tutorial will guide you on how to connect Excel Power Query with the Tacoma Watersheds `results` API.

Before starting, make sure you have your unique read-only token from the Tacoma Watersheds API.

### Step 1: Open Power Query

1. Open Excel, and go to the `Data` tab in the Ribbon.
2. Click on `Get Data` in the left corner of the Ribbon.
3. In the dropdown menu, select `From Other Sources`, then `From Web`.

### Step 2: Connect to the API

1. A pop-up window will appear prompting you to enter a URL.
2. In this field, enter the following API endpoint URL:

```
https://www.tacomawatersheds.com/api/rest/results/token/
{token}?ntype={ntype}&limit={limit}&offset={offset}&
epoch={epoch}
```

Replace `{token}` with your unique read-only token and fill in the `{ntype}`, `{limit}`, `{offset}`, and `{epoch}` as per your requirements. For example, if you want to get all results for `land_surface` node type and for the `1980s` climate epoch, your URL would be:

```
https://www.tacomawatersheds.com/api/rest/results/token/
your_token?ntype=land_surface&limit=1000000&offset=0&
epoch=1980s
```

3. Click **OK**

### Step 3: Parse the Response

1. A new window named `Power Query Editor` will open, and Excel will show you a preview of the data.
2. If the data appears as a single column of records, click on `List` to convert it to a table. Then click on the button with two arrows on the right side of the header of the column to expand the data into a tabular format.
3. If the data is in nested JSON format, you may need to click on the double-arrow button again to fully expand the data.

### Step 4: Load the Data

1. Once you are satisfied with the preview of the data, click on `Close & Load` in the `Home` tab.
2. Excel will create a new worksheet and load the data into a table.
