/* eslint-disable no-param-reassign */
function get(path, object) {
    return path.split('.').reduce((obj, property) => obj[property], object);
}
  

function normalizeEmptyValue(value) {
    if ([undefined, null].indexOf(value) >= 0) {
        return '';
    } else if (Number.isNaN(value)) {
        return value.toString();
    }
    return value;
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
            return compare(get(sortOrder.path, a), get(sortOrder.path, b));
            } else if (sortOrder.direction === 'desc') {
            return compare(get(sortOrder.path, b), get(sortOrder.path, a));
            }
            return 0;
        })
        .reduce((p, n) => {
            return p !== 0 ? p : n;
        }, 0);
    });
}

function filterItems(items, filters) {
    return items.filter((item) => {
        return filters.every((filter) => {
        const value = normalizeEmptyValue(get(filter.path, item));
        const filterValueLowercase = normalizeEmptyValue(filter.value).toString().toLowerCase();
        return value.toString().toLowerCase().includes(filterValueLowercase);
        });
    });
}

/**
  * This function will get the desired value from a nested object.
  * eg. for items = {foo: {bar: [1,3,5]}} and paths = ['foo', 'bar'] it will return
  * [1,3,5]
 */
function getItemsFromNestedObject(items, paths) {
    if (typeof(paths) === 'string')
        paths = [paths];
    const data = paths.reduce(
        (object, path) => {return (object || {})[path];},
        items);
    return data;
}

export const createDataProvider = (url, itemsPath) => {
    return async (params, callback) => {
        const itemsPromise = await fetch(url);
        let items = await itemsPromise.json();

        // if itemsPath is given the response must be an object
        if (itemsPath && !Array.isArray(items))
            items = getItemsFromNestedObject(items, itemsPath);
        
        if (!Array.isArray(items) && typeof(items) === 'object') {
            items = Object.values(items);
        }
            

        if (!items || items.length === 0)
            callback([], 0);
    
        if (params.filters && checkPaths(params.filters, 'filtering', items)) {
            items = filterItems(items, params.filters);
        }
        
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
