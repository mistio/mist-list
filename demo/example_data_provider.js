/* eslint-disable no-param-reassign */

// This will get the value from a nested object
// eg. object = {foo: {bar: "baz"}} and path = "foo.bar" will return "baz"
function getNestedObjValue(path, object) {
    return path.split('.').reduce((obj, property) => (obj || {})[property], object);
}


function checkPaths(arrayToCheck, action, items) {
    if (items.length === 0) {
        return false;
    }

    let result = true;

    for (const i in arrayToCheck) {
        const path = arrayToCheck[i].path;

        // Skip simple paths
        if (!path || path.indexOf('.') === -1) {
        continue;
        }

        const parentProperty = path.replace(/\.[^.]*$/, ''); // A.b.c -> a.b
        if (get(parentProperty, items[0]) === undefined) {
        console.warn(`Path "${path}" used for ${action} does not exist in all of the items, ${action} is disabled.`);
        result = false;
        }
    }

    return result;
}

function normalizeEmptyValue(value) {
    if ([undefined, null].indexOf(value) >= 0) {
        return '';
    } else if (Number.isNaN(value)) {
        return value.toString();
    }
    return value;
}

function compare(a, b) {
    a = normalizeEmptyValue(a);
    b = normalizeEmptyValue(b);

    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}

function multiSort(items, sortOrders) {
    return items.sort((a, b) => {
        return sortOrders
        .map((sortOrder) => {
            if (sortOrder.direction === 'asc') {
            return compare(getNestedObjValue(sortOrder.path, a), getNestedObjValue(sortOrder.path, b));
            } else if (sortOrder.direction === 'desc') {
            return compare(getNestedObjValue(sortOrder.path, b), getNestedObjValue(sortOrder.path, a));
            }
            return 0;
        })
        .reduce((p, n) => {
            return p !== 0 ? p : n;
        }, 0);
    });
}

function matchesTerm(values, term) {

    return values.some(value => value && value.toString().toLowerCase().includes(term.toLowerCase()));
}

function filterItems(items, filter) {
    if (!items || items.length === 0)
        return items
    if (!filter || filter.value === "" || filter.value == null)
        return items
    return items.filter((item) => {
        let values = []
        //const value = normalizeEmptyValue(getNestedObjValue(filter.path, item));
        if (filter.path === 'all')
            values = Object.values(item)
        else if (Array.isArray(filter.path)) {
            filter.path.forEach(key => {values.push(item[key])})
        } else
            values = [filter.path]
        const filterValueLowercase = normalizeEmptyValue(filter.value).toString().toLowerCase();
        return matchesTerm(values, filterValueLowercase);
    });
}

// this is a data provider that fetches the items from an url
// and uses a path to find the items in the response.
// This means that if the url returns a nested object and the items
// are deep inside, itemsPath should be set.
// eg: urlResponse = { data: {itemMap: {item1: {}, item2: {}, item3:{}}}
//                     meta: {...}}
// In this case itemsPath should be itemsPath = "data.itemMap".
// The data provider will extract the values of the itemMap to use as items.
// Of course it will work even if itemMap was an Array with the items.
// If the url returns an Array with the items, itemsPath should be undefined.
export const createDataProvider = (url, itemsPath) => {
    return async (params, callback) => {
        const itemsPromise = await fetch(url);
        const urlResponse = await itemsPromise.json();
        let items;
        // if itemsPath is given the response must be an object
        if (itemsPath && !Array.isArray(urlResponse)) {
            items = getNestedObjValue(itemsPath, urlResponse);        
            // if items is still an object, use the values
            if (!Array.isArray(items) && typeof(items) === 'object') {
                items = Object.values(items);
            }
        } else if (Array.isArray(urlResponse))
            items = urlResponse
        else if (!itemsPath && !Array.isArray(urlResponse))
            items = Object.values(urlResponse)

        if (!items || items.length === 0)
            callback([], 0);
        // filter items
        if (params.filters && params.filters.length === 1) {
            items = filterItems(items, params.filters[0]);
        }
        
        // sort items
        if (
            Array.isArray(params.sortOrders) &&
            params.sortOrders.length &&
            checkPaths(params.sortOrders, 'sorting', items)
        ) {
            items = multiSort(items, params.sortOrders);
        }

        const count = Math.min(items.length, params.pageSize);
        const start = params.page * count;
        const end = start + count;
        const slice = items.slice(start, end);
        callback(slice, items.length);
    }
}
