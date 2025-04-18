# ScubaDivingSales Firebase Database Schema

## Overview

The ScubaDivingSales application uses Firebase Firestore as its database. The schema follows a document-oriented structure with the following collections:

- `products` - Main collection for all product types
- `regulators` - Collection for regulator-specific details
- `bcds` - Collection for BCD (Buoyancy Control Device) specific details

## Collections Details

### products

Main collection that stores general information about all products.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Document ID, unique identifier for the product |
| brand | string | Manufacturer of the product |
| model | string | Model name (used as product name) |
| price | number | Price of the product |
| type | string | Product type (e.g., 'regulator', 'bcd', 'fin') |
| category | string | Product category or subcategory |
| link | string | URL link to product page |

### regulators

Collection for detailed specifications of regulator products.

| Field | Type | Description |
|-------|------|-------------|
| prod_id | string | Reference to product ID in the products collection |
| category | string | Product category (value: 'regulator') |
| temperature | string | Water temperature rating (e.g., 'Cold water') |
| high_pressure_port | number | Number of high pressure ports |
| low_pressure_port | number | Number of low pressure ports |
| adjustable_airflow | string | Whether airflow can be adjusted ('YES' or 'NO') |
| pre_dive_mode | string | Whether it has pre-dive mode ('YES' or 'NO') |
| weights_base_on_yoke | number | Weight in kg |
| material | string | Material of construction |
| dive_type | string | Type of diving it's designed for (e.g., 'Recreational') |
| airflow_at_200bar | string | Airflow rate at 200 bars |

### bcds

Collection for detailed specifications of BCD (Buoyancy Control Device) products.

| Field | Type | Description |
|-------|------|-------------|
| prod_id | string | Reference to product ID in the products collection |
| category | string | Product category (value: 'BCD') |
| type | string | BCD type (e.g., 'Jacket') |
| weight_pocket | string | Whether it has weight pockets ('Yes' or 'No') |
| quick_release | string | Whether it has quick release system ('Yes' or 'No') |
| no_pockets | number | Number of pockets |
| back_trim_pocket | string | Whether it has back trim pockets ('Yes' or 'No') |
| weight_kg | number | Weight in kg |
| has_size | string | Whether it comes in different sizes ('Yes' or 'No') |
| lift_capacity_base_on_largest_size_kg | number | Maximum lift capacity in kg |

## Relationships

- Each document in the `regulators` collection has a `prod_id` field that references a document ID in the `products` collection
- Each document in the `bcds` collection has a `prod_id` field that references a document ID in the `products` collection

## Product Factory Pattern

The application implements a Factory Method pattern for product creation, which supports the following product types:
- Regulators
- BCDs
- Fins

Each product type shares common properties (id, name, brand, price, etc.) but may have type-specific specifications stored in their respective collections.

## Data Access

Data access is managed through repository classes (e.g., `ProductRepository`) that implement specific interfaces and encapsulate the Firestore queries.

## Security Rules

Current Firestore security rules allow read and write access to all documents for development purposes. In production, these rules should be restricted to authenticated users with appropriate permissions. 