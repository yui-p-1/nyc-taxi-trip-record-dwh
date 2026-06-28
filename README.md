# NYC Trip Record Data Project

## Overview
This project is a Dataform-based data warehouse on BigQuery for NYC Taxi data.

## Architecture
- Warehouse: BigQuery
- Orchestration: Dataform + Cloud Scheduler
- BI: Tableau Public

## Data Model
- staging: raw cleaning and standardization
- marts: BI-ready analytical tables

## Directory Structure
definitions/
staging/
marts/
includes/
assertions/

## Execution Environment
Production: main
Development: feature/*

## Naming Conventions
stg_: Staging
mart_: Data Mart

## Data Source
https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page

## Dashboard
https://public.tableau.com/app/profile/yui.hosono6688/viz/NYCTaxiDashboard_17756464185300/NYCTaxiDashboard
