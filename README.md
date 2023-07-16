# RESTFUL API E-LEARNING PLATFORM - DOCS
This document provides information about the RESTful API endpoints implemented in the Node.js code you provided. The API allows you to perform CRUD operations (Create, Read, Update, Delete,...) on categories, courses, sections, lessons, discuss, users, orders, auth.
## Base URL


## Authentication
Authentication is required for certain endpoints. You need to include a valid authentication token in the request headers for those endpoints. The token should be sent in the Authorization header as follows:

`Authorization: Bearer <token>`

# Endpoints
## Get Categories

`GET /admin/categories`
### Request
+ Method: GET
+ Endpoint: /categories
+ Authentication: Required

### Response
+ Status Code: 200 (OK)
+ Content: JSON array containing category objects.

Example Response:
```json
[
  {
    "id": "1",
    "name": "Category 1"
  },
  {
    "id": "2",
    "name": "Category 2"
  }
]

```

## Get category
`GET /cataegories/:id`

### Request
+ Method: GET
+ Endpoint: /categories/:id
+ Authentication: Required

### Response
+ Status Code: 200 (OK)
+ Content: JSON array containing category objects.

Example Response:

```json

  {
    "id": "1",
    "name": "Category 1"
  },


