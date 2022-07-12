/* eslint-disable no-param-reassign */

// This will get the value from a nested object
// eg. object = {foo: {bar: "baz"}} and path = "foo.bar" will return "baz"
function getNestedObjValue(path, object) {
    return path.split('.').reduce((obj, property) => (obj || {})[property], object);
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

    return values.some(value => value.toString().toLowerCase().includes(term.toLowerCase()));
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


export const createDataProvider = (url, itemsPath) => {
    return async (params, callback) => {
        const itemsPromise = await fetch(url);
        let items = await itemsPromise.json();

        // if itemsPath is given the response must be an object
        if (itemsPath && !Array.isArray(items))
            items = getNestedObjValue(itemsPath, items);
        
        // if items is still an object, use the values
        if (!Array.isArray(items) && typeof(items) === 'object') {
            items = Object.values(items);
        }

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
