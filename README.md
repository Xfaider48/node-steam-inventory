# node-steam-inventory
A module for interacting with steam API for getting users inventory

## Two endpoints
Steam has two endpoints:
- https://steamcommunity.com/profiles/STEAM_ID/inventory/json/APP_ID/CONTEXT_Id/
- https://steamcommunity.com/inventory/STEAM_ID/APP_ID/CONTEXT_Id/

You can see their differences in [stackoverflow](https://stackoverflow.com/questions/17393099/getting-someones-steam-inventory).
In this module you can use both of them.

## Installation

`npm install @xfaider/node-steam-inventory`

## Usage

```javascript
var steamInventoryModule = require('@xfaider/node-steam-inventory');
var steamInventory = new steamInventoryModule.SteamUserInventory(options);
```

### Constructor params
Params:
- `options[defaultGotOptions]`: default options for [got](https://github.com/sindresorhus/got) module for all call methods. *Default: `{}`.*

### Basic usage
```javascript
steamInventory.loadAndFormat({
    steamId: userSteamId
}).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```

## API
### Instance methods

#### loadFromOldEndPoint
Load steam inventory from old endpoint
```javascript
steamInventory.loadFromOldEndPoint(params).then(response => {
    console.log(response);
    // `got` response`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for request |
| `params[steamId]` | String\|Number | Empty string | User steam id |
| `params[appId]` | Number | `730` (CSGO App id) | Steam application id |
| `params[contextId]` | Number | `2` | Steam context id |
| `params[gotOptions]` | Object | `{}` | Options for [got](https://github.com/sindresorhus/got) module |


#### loadFromOldEndPointAndFormat
Load steam inventory from old endpoint and format data
```javascript
steamInventory.loadFromOldEndPointAndFormat(params).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadFromOldEndPoint](#loadfromoldendpoint) |


#### loadFromNewEndPoint
Load steam inventory from new endpoint
```javascript
steamInventory.loadFromNewEndPoint(params).then(response => {
    console.log(response);
    // `got` response`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for request |
| `params[steamId]` | String\|Number | Empty string | User steam id |
| `params[appId]` | Number | `730` (CSGO App id) | Steam application id |
| `params[contextId]` | Number | `2` | Steam context id |
| `params[language]` | String | `english` | Language for some fields in response |
| `params[count]` | Number | `5000` (For steam maximum is 5000) | Limit of items in response |
| `params[cursor]` | String\|Number | `null` | Asset id of steam item working as cursor for pagination |
| `params[gotOptions]` | Object | `{}` | Options for [got](https://github.com/sindresorhus/got) module |


#### loadAllDataFromNewEndPoint
Load steam inventory from new endpoint with all pages fetching.
Because of highly ratelimited steam endpoint , you need to use different IPs, or different proxies for each request (use `getGotOptionsPromise` for it)
```javascript
steamInventory.loadAllDataFromNewEndPoint(params, getGotOptionsPromise).then(responses => {
    console.log(responses);
    // array of `got` responses
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for request |
| `params[steamId]` | String\|Number | Empty string | User steam id |
| `params[appId]` | Number | `730` (CSGO App id) | Steam application id |
| `params[contextId]` | Number | `2` | Steam context id |
| `params[language]` | String | `english` | Language for some fields in response |
| `params[perPage]` | Number | `5000` (For steam maximum is 5000) | Limit of items per response |
| `params[gotOptions]` | Object | `{}` | Options for [got](https://github.com/sindresorhus/got) module |
| `getGotOptionsPromise` | Function | `return Promise.resolve(params.gotOptions)` | Function returning Promise, resolving gotOptions for each request |


#### loadFromNewEndPointAndFormat
Load steam inventory from new endpoint and format data
```javascript
steamInventory.loadFromNewEndPointAndFormat(params).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadFromNewEndPoint](#loadfromnewendpoint) |


#### loadFromNewEndPointNextPage
Load next page steam inventory from new endpoint
```javascript
steamInventory.loadFromNewEndPointNextPage(params, previousResponse).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadFromNewEndPoint](#loadfromnewendpoint) |
| `previousResponse` | Object | `undefined` | Steam response from new endpoint |


#### loadAllDataFromNewEndPointAndFormat
Load steam inventory from new endpoint with all pages fetching and format it
```javascript
steamInventory.loadAllDataFromNewEndPointAndFormat(params, getGotOptionsPromise).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadAllDataFromNewEndPoint](#loadalldatafromnewendpoint) |
| `getGotOptionsPromise` | Function | `null` | See this parameter in [loadAllDataFromNewEndPoint](#loadalldatafromnewendpoint)|


#### load
Load steam inventory from new or old endpoints
```javascript
steamInventory.load(params, useNewEndPoint, getGotOptionsPromise).then(responses => {
    console.log(responses);
    // array of `got` responses
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadAllDataFromNewEndPoint](#loadalldatafromnewendpoint) or [loadFromOldEndPoint](#loadfromoldendpoint)|
| `useNewEndPoint` | Boolean | `true` | Flag for using new endpoint (or old) |
| `getGotOptionsPromise` | Function | `null` | See this parameter in [loadAllDataFromNewEndPoint](#loadalldatafromnewendpoint)|

#### loadAndFormat
**Main method**. Load steam inventory from new or old endpoints and format it
```javascript
steamInventory.loadAndFormat(params, useNewEndPoint, getGotOptionsPromise).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `params` | Object | `undefined` | Parameters for method [loadAllDataFromNewEndPointAndFormat](#loadalldatafromnewendpointandformat) or [loadFromOldEndPointAndFormat](#loadfromoldendpointandformat)|
| `useNewEndPoint` | Boolean | `true` | Flag for using new endpoint (or old) |
| `getGotOptionsPromise` | Function | `null` | See this parameter in [loadAllDataFromNewEndPointAndFormat](#loadalldatafromnewendpointandformat)|

### Static methods

#### requestJSON
JSON request
```javascript
requestJSON(url, gotOptions).then(respone => {
    console.log(response);
    // `got` response
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | String | `undefined` | URL for request |
| `gotOptions` | Object | `undefined` | Options for [got](https://github.com/sindresorhus/got) module |

#### getItemClassInstanceString
Get item special string `class_id` + `_` + `instance_id`
```javascript
let steamItem = {classid: 98, instanceid: 115};
getItemClassInstanceString(steamItem).then(str => {
    console.log(str);
    // 98_115
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `steamItem` | Object | `undefined` | Steam item object from response |
| `steamItem[classid]` | String\|Number | `undefined` | Steam item `class_id` |
| `steamItem[instanceid]` | String\|Number | `undefined` | Steam item `instance_id` |

#### getItemImageUrl
Get item image (normal or large)
```javascript
let steamItem = {icon_url_large: '__href__'};
let large = true;
getItemImageUrl(steamItem, large).then(str => {
    console.log(str);
    // https://steamcommunity-a.akamaihd.net/economy/image/__href__
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `steamItem` | Object | `undefined` | Steam item object from response |
| `steamItem[icon_url_large]` | String | `undefined` | Steam item `icon_url_large` |
| `steamItem[icon_url]` | String | `undefined` | Steam item `icon_url` |
| `large` | Boolean | `true` | Get large image flag |

#### getInspectItemLink
Get item inspect link
```javascript
let steamItem = {
    actions: [
        {item: 'Inspect in Game...', link: 'test_link'}
    ]
};
getInspectItemLink(steamItem).then(str => {
    console.log(str);
    // test_link
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `steamItem` | Object | `undefined` | Steam item object from response |
| `steamItem[actions]` | Array | `undefined` | Steam item `actions` |


#### formatItem
Format item
```javascript
formatItem(itemData).then(formatted => {
    console.log(formatted);
    // {
    //     id: '14364197067',
    //     assetId: '14364197067',
    //     amount: '1',
    //     classId: '2777986317',
    //     instanceId: '188530139',
    //     raw: { base: [Object], description: [Object] },
    //     appId: 730,
    //     name: 'Five-SeveN | Monkey Business',
    //     marketHashName: 'Five-SeveN | Monkey Business (Well-Worn)',
    //     tradable: 1,
    //     marketable: 1,
    //     marketTradableRestriction: 7,
    //     link: 'steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S%owner_steamid%A%assetid%D11673583149302548085',
    //     imageLarge: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROh-zF_Jn4t1i1uRQ5fTvzdoGWdwdvMFzU_FbolerujJHptcjAwXo37yUrtyuOyRbliU4aPOdxxavJhXiz6dw',
    //     imageSmall: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROh-zF_Jn4xlbkqURvZmiidYKRdAFoNVzR81bryLvmjZ7o6ZjAmyYw7CNw7SmLzRepwUYbn3RWfTI',
    //     image: 'https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goWYkuHxPYTTl2VQ5sROh-zF_Jn4t1i1uRQ5fTvzdoGWdwdvMFzU_FbolerujJHptcjAwXo37yUrtyuOyRbliU4aPOdxxavJhXiz6dw',
    //     category: null,
    //     type: undefined,
    //     exterior: undefined,
    //     quality: undefined
    // }
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `steamItem` | Object | `undefined` | Steam item object from response |
| `steamItem[base]` | Object | `undefined` | `Base` steam item data |
| `steamItem[description]` | Object | `undefined` | `Description` steam item data |


#### formatData
Format response data (result is array of objects formatted by [formatItem](#formatitem))
```javascript
formatData(items, descriptions).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `items` | Object | `undefined` | Object with `base` item data |
| `descriptions` | Object | `undefined` | Object with `description` item data |


#### formatDataFromOldEndPoint
Format response data from old endpoint(see result [formatData](#formatdata))
```javascript
formatDataFromOldEndPoint(data).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | Object | `undefined` | Data in response from old steam endpoint |

#### formatDataFromNewEndPoint
Format response data from new endpoint(see result [formatData](#formatdata))
```javascript
formatDataFromNewEndPoint(data).then(formattedArray => {
    console.log(formattedArray);
    // Array of objects formatted by `formatItem`
});
```
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | Object | `undefined` | Data in response from new steam endpoint |

