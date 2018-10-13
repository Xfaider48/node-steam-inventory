import got from 'got';
import extend from 'extend';
import clone from 'clone';


/**
 * Bad response error
 */
class SteamUserInventoryError extends Error {
    constructor(message, response) {
        super(message);
        this.name = this.constructord.name;
        this.response = response;
    }
}

/**
 *
 */
class SteamUserInventory {
    /**
     * @param {Object} [options]
     *
     * @property {Object} [options.defaultGotOptions={}] Default parameters for 'got' module
     */
    constructor(options = {}) {
        this.options = {};

        extend(true, this.options, {
            defaultGotOptions: {}
        }, options);
    }

    /**
     *
     * @returns {string[]}
     */
    static get AVAILABLE_TAGS() {
        return [
            'Category',
            'Type',
            'Exterior',
            'Quality'
        ];
    }

    /**
     * JSON request
     *
     * @param {String} url
     * @param {Object} [gotOptions] Options for 'got' module
     *
     * @returns {Promise}
     */
    static async requestJSON(url, gotOptions = {}) {
        gotOptions = clone(gotOptions || {});
        gotOptions.json = true;

        return got(url, gotOptions);
    }

    /**
     * Get item special string `class_id` + `_` + `instance_id`
     *
     * @param {Object} steamItem
     *
     * @returns {string|null}
     */
    static getItemClassInstanceString(steamItem) {
        let classId = steamItem.classid;
        let instanceId = steamItem.instanceid;

        return classId && instanceId ? `${classId}_${instanceId}` : null;
    }

    /**
     * Get item image (normal or large)
     *
     * @param {Object} steamItem
     * @param {Boolean} large
     *
     * @returns {string|null}
     */
    static getItemImageUrl(steamItem, large = true) {
        let link = 'https://steamcommunity-a.akamaihd.net/economy/image/';
        let ref = large ? steamItem.icon_url_large : steamItem.icon_url;

        return ref ? link + ref : null;
    }

    /**
     * Get item inspect link
     *
     * @param {Object} steamItem
     *
     * @returns {string|null}
     */
    static getInspectItemLink(steamItem) {
        let result = null;
        let actions = steamItem.actions;
        if (Array.isArray(actions) && actions.length > 0) {
            for (let index in actions) {
                let action = actions[index];
                if (action.name == 'Inspect in Game...' && action.link) {
                    return action.link;
                }
            }
        }

        return result;
    }

    /**
     * Validate parameters
     *
     * @param {Number|String} steamId
     * @param {Number}      appId
     * @param {Number} contextId
     *
     * @throws {TypeError}
     *
     * @private
     */
    static _validateRequiredParams(steamId, appId, contextId) {
        if (!steamId) {
            throw new TypeError('"steamId" is required');
        }
        if (isNaN(Number(steamId))) {
            throw new TypeError('"steamId" must be a number');
        }
        if (isNaN(Number(appId))) {
            throw new TypeError('"appId" must be a number');
        }
        if (isNaN(Number(contextId))) {
            throw new TypeError('"contextId" must be a number');
        }
    }

    /**
     * Format item
     *
     * @param {Object} itemData
     *
     * @returns {Object}
     */
    static formatItem(itemData) {
        let item = itemData.base;
        let description = itemData.description;

        // id equal to assetId
        let id = item.id || item.assetid;

        let resultRow = {
            id: id,
            assetId: id,
            amount: item.amount,
            classId: item.classid,
            instanceId: item.instanceid,
            raw: {
                base: item
            }
        };

        // Item has description?
        if (description) {
            resultRow.raw.description = description;

            resultRow.appId = description.appid;
            resultRow.name = description.name;
            resultRow.marketHashName = description.market_hash_name;
            resultRow.tradable = description.tradable;
            resultRow.marketable = description.marketable;
            resultRow.marketTradableRestriction = description.market_tradable_restriction;
            resultRow.link = SteamUserInventory.getInspectItemLink(description);
            resultRow.imageLarge = SteamUserInventory.getItemImageUrl(description);
            resultRow.imageSmall = SteamUserInventory.getItemImageUrl(description, false);
            resultRow.image = resultRow.imageLarge || resultRow.imageSmall;

            SteamUserInventory.AVAILABLE_TAGS.forEach(categoryName => {
                resultRow[categoryName.toLowerCase()] = null;
            });

            if (Array.isArray(description.tags)) {
                description.tags.forEach(tag => {
                    if (SteamUserInventory.AVAILABLE_TAGS.includes(tag.category)) {
                        resultRow[tag.category.toLowerCase()] = tag.name;
                    }
                });
            }
        }
        else {
            resultRow.descriptionNotExist = true;
        }

        return resultRow;
    }

    /**
     * Format items with descriptions
     *
     * @param {Object} items
     * @param {Object} descriptions
     *
     * @returns {Array}
     */
    static formatData(items, descriptions) {
        let result = [];

        for (let index in items) {
            let item = {
                base: items[index],
                description: null
            };

            let ciString = SteamUserInventory.getItemClassInstanceString(item.base);
            if (descriptions.hasOwnProperty(ciString)) {
                item.description = descriptions[ciString];
            }

            result.push(SteamUserInventory.formatItem(item));
        }

        return result;
    }

    /**
     * Format old endpoint response
     *
     * @param {Object} data
     *
     * @returns {Array}
     */
    static formatDataFromOldEndPoint(data) {
        let items = data.rgInventory;
        let descriptions = data.rgDescriptions;

        return SteamUserInventory.formatData(items, descriptions);
    }

    /**
     * Format new endpoint response
     *
     * @param {Object} data
     *
     * @returns {Array}
     */
    static formatDataFromNewEndPoint(data) {
        let items = data.assets;
        let descriptions = {};

        // Creating "class_id + instance_id" -> "description" map like in old endpoint
        for (let index in data.descriptions) {
            let description = data.descriptions[index];
            let ciString = SteamUserInventory.getItemClassInstanceString(description);
            descriptions[ciString] = description;
        }

        return SteamUserInventory.formatData(items, descriptions);
    }

    /**
     * Request with extended `gotOptions` by `defaultGotOptions`
     *
     * @param {String} url
     * @param {Object} [gotOptions] Options for 'got' module
     *
     * @returns {Promise}
     * @private
     */
    async _request(url, gotOptions = {}) {
        gotOptions = extend(true, {}, this.options.defaultGotOptions, gotOptions);
        return SteamUserInventory.requestJSON(url, gotOptions);
    }

    /**
     * Request to steam with validating response body
     *
     * @param url
     * @param gotOptions
     * @returns {Promise}
     *
     * @throws {SteamUserInventoryError}
     * @private
     */
    async _requestValidateBody(url, gotOptions = {}) {
        let response = await this._request(url, gotOptions);

        if (!response.body || response.body !== Object(response.body)) {
            throw new SteamUserInventoryError('Empty response', response);
        }

        if (!response.body.success) {
            throw new SteamUserInventoryError('Unsuccessful response', response);
        }

        return response;
    }

    /**
     * Load steam inventory from old endpoint
     *
     * @param {String} steamId
     * @param {Number} appId
     * @param {Number} contextId
     * @param {Object} gotOptions
     *
     * @throws {TypeError|SteamUserInventoryError}
     * @returns {Promise}
     */
    async loadFromOldEndPoint({
        steamId = '',
        appId = 730,
        contextId = 2,
        gotOptions = {}
    }) {
        SteamUserInventory._validateRequiredParams(steamId, appId, contextId);
        let url = `https://steamcommunity.com/profiles/${steamId}/inventory/json/${appId}/${contextId}/`;
        return this._requestValidateBody(url, gotOptions);
    }

    /**
     * Load steam inventory from old endpoint and format data
     *
     * @param {Object} params Parameters for method `loadFromOldEndPoint`
     *
     * @throws {TypeError|SteamUserInventoryError}
     * @returns {Promise}
     */
    async loadFromOldEndPointAndFormat(params) {
        let response = await this.loadFromOldEndPoint(params);
        return SteamUserInventory.formatDataFromOldEndPoint(response.body);
    }

    /**
     * Load steam inventory from new endpoint
     *
     * @param {String} steamId
     * @param {Number} appId
     * @param {Number} contextId
     * @param {String} language
     * @param {Number} count
     * @param {String|Number} cursor
     * @param {Object} gotOptions
     *
     * @throws {TypeError|SteamUserInventoryError}
     * @returns {Promise}
     */
    async loadFromNewEndPoint({
        steamId = '',
        appId = 730,
        contextId = 2,
        language = 'english',
        count = 5000,
        cursor = null,
        gotOptions = {}
    }) {
        SteamUserInventory._validateRequiredParams(steamId, appId, contextId);
        if (count < 0 || count > 5000) {
            count = 5000;
        }

        let url = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=${language}&count=${count}`;
        if (cursor && !isNaN(Number(cursor))) {
            url = url + `&start_assetid=${cursor}`;
        }

        return this._requestValidateBody(url, gotOptions);
    }

    /**
     * Load next page steam inventory from new endpoint
     *
     * @param {Object} params Parameters for method `loadFromNewEndPoint`
     * @param {Object} previousResponse
     *
     * @returns {Promise}
     */
    async loadFromNewEndPointNextPage(params, previousResponse) {
        let previousResBody = previousResponse.body;
        let lastItem = previousResBody.assets[previousResBody.assets.length - 1];
        params.cursor = lastItem.assetid;

        return this.loadFromNewEndPoint(params);
    }

    /**
     * Load steam inventory from new endpoint and format data
     *
     * @param {Object} params Parameters for method `loadFromNewEndPoint`
     *
     * @throws {TypeError|SteamUserInventoryError}
     * @returns {Promise}
     */
    async loadFromNewEndPointAndFormat(params) {
        let response = await this.loadFromNewEndPoint(params);
        return SteamUserInventory.formatDataFromNewEndPoint(response.body);
    }

    /**
     * Load steam inventory from new or old endpoints
     *
     * @param {Object} params Parameters for method `loadFromNewEndPoint` or `loadFromOldEndPoint`
     * @param {Boolean} useNewEndPoint
     * @param {Function} getGotOptionsPromise Function for getting new gotOptions per page (for new endpoint)
     *
     * @returns {Promise}
     */
    async load(params, useNewEndPoint = true, getGotOptionsPromise = null) {
        if (useNewEndPoint) {
            return this.loadAllDataFromNewEndPoint(params, getGotOptionsPromise);
        }

        return this.loadFromOldEndPoint(params).then(response => { return [response]; });
    }

    /**
     * Load steam inventory from new or old endpoints and format it
     *
     * @param {Object} params Parameters for method `loadFromNewEndPointAndFormat` or `loadFromOldEndPointAndFormat`
     * @param {Boolean} useNewEndPoint
     * @param {Function} getGotOptionsPromise Function for getting new gotOptions per page (for new endpoint)
     *
     * @returns {Promise}
     */
    async loadAndFormat(params, useNewEndPoint = true, getGotOptionsPromise = null) {
        if (useNewEndPoint) {
            return this.loadAllDataFromNewEndPointAndFormat(params, getGotOptionsPromise);
        }

        return this.loadFromOldEndPointAndFormat(params);
    }

    /**
     * Load steam inventory from new endpoint with all pages fetching
     *
     * @param {String} steamId
     * @param {Number} appId
     * @param {Number} contextId
     * @param {String} language
     * @param {Number} perPage
     * @param {Object} gotOptions
     * @param {Function} getGotOptionsPromise Function for getting new gotOptions per page
     *
     * @returns {Promise}
     */
    async loadAllDataFromNewEndPoint({
        steamId = '',
        appId = 730,
        contextId = 2,
        language = 'english',
        perPage = 5000,
        gotOptions = {}
    }, getGotOptionsPromise = null) {
        SteamUserInventory._validateRequiredParams(steamId, appId, contextId);
        if (perPage < 0 || perPage > 5000) {
            perPage = 5000;
        }

        if (typeof getGotOptionsPromise !== 'function') {
            getGotOptionsPromise = async () => {
                return gotOptions;
            };
        }

        let params = {steamId, appId, contextId, language, gotOptions};
        params.count = perPage;

        let responses = [];
        let response = await this.loadFromNewEndPoint(params);

        responses.push(response);

        let body = response.body;
        let totalCount = body.total_inventory_count;
        if (totalCount <= params.count) {
            return responses;
        }
        else {
            let arr = [];
            let pages = Math.ceil(totalCount / params.count) - 1;
            while (pages > 0) {
                arr.push(--pages);
            }

            for (const key of arr) {
                params.gotOptions = await getGotOptionsPromise();
                let iterateResponse = await this.loadFromNewEndPointNextPage(params, responses[responses.length - 1]);
                responses.push(iterateResponse);
            }

            return responses;
        }
    }

    /**
     * Load steam inventory from new endpoint with all pages fetching and format it
     *
     * @param {Object} params Parameters for method `loadAllDataFromNewEndPoint`
     * @param {Function} getGotOptionsPromise Function for getting new gotOptions per page
     *
     * @returns {Promise}
     */
    async loadAllDataFromNewEndPointAndFormat(params, getGotOptionsPromise = null) {
        let responses = await this.loadAllDataFromNewEndPoint(params, getGotOptionsPromise);
        let resultData = [];

        responses.forEach(response => {
            resultData = resultData.concat(SteamUserInventory.formatDataFromNewEndPoint(response.body));
        });

        return resultData;
    }
}

export {SteamUserInventoryError};
export {SteamUserInventory};