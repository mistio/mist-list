import '@polymer/polymer/polymer-legacy.js';
import {
    Polymer
} from '@polymer/polymer/lib/legacy/polymer-fn.js';
Polymer({
    is: 'rest-data-provider',

    properties: {

        loading: {
            type: Boolean,
            notify: true,
            value: false
        },

        delay: {
            type: Number,
            value: 100
        },

        count: {
            type: Number,
            value: 0,
            notify: true
        },

        received: {
            type: Number,
            value: 0,
            notify: true
        },

        url: {
            type: String
        },

        colmap: {
            type: Object,
            value: function () {
                return {};
            }
        },

        columns: {
            type: Array,
            notify: true
        },

        frozen: {
            type: Array,
            value: function () {
                return [];
            }
        },

        itemMap: {
            type: Object,
            value: function () {
                return {};
            },
            notify: true
        },

        primaryFieldName: {
            type: String,
            value: 'id'
        },

        timeseries: {
            type: Boolean,
            value: false
        },

        stop: {
            type: Number,
            value: 0
        },

        filter: {
            type: String
        },

        provider: {
            notify: true,
        },

        finished: {
            type: Boolean,
            value: false,
            notify: true
        },

        rest: {
            type: Boolean,
            value: false
        },
        treeView: {
            type: Boolean,
            value: true,
            reflectToAttribute: true
        }
    },

    observers: [
        '_computeDataProvider(filter, url)'
    ],

    _computeDataProvider: function () {
        if (this.url && this.url.length)
            this.debounce('_computeDataProvider', function () {
                this.stop = 0;
                this.count = 0;
                this.received = 0;
                this.finished = false;
                var _this = this;
                this.set('provider', function (opts, callback) {
                    if (_this.rest) {
                        if (_this.finished)
                            return;
                        if (!opts.page) {
                            _this.count = 0;
                            _this.received = 0;
                        }
                        var xhr = new XMLHttpRequest();
                        var url = _this.url + '?';
                        url += 'limit=' + opts.pageSize + '&';
                        if (!_this.timeseries) {
                            url += 'start=' + (opts.page * opts.pageSize) + '&';
                        } else if (_this.stop) {
                            url += 'stop=' + Math.floor(_this.stop) + '&';
                        }
                        if (_this.filter) {
                            url += 'filter=' + encodeURIComponent(_this.filter);
                        }
                        if (opts.sortOrders && opts.sortOrders.length)
                            url += 'order=' + encodeURIComponent(opts.sortOrders.map(
                                function (b) {
                                    return (b.direction == 'desc' ? '-' : '') + b.path;
                                }));
                        if (opts.page == 0)
                            _this.set('received', 0);
                        xhr.open('GET', url);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText),
                                    items;
                                if (!_this.timeseries) {
                                    _this.count = response.count;
                                    items = response.items;
                                } else {
                                    items = response;
                                    _this.count += items.length;
                                    if (items.length < opts.pageSize)
                                        _this.set('finished', true);
                                }
                                _this.received += items.length;
                                if (items && items.length) {
                                    // update column map using response.items values
                                    items.forEach(function (i) {
                                        _this.itemMap[i[_this.primaryFieldName]] =
                                            i;
                                        Object.keys(i).forEach(function (k) {
                                            _this.colmap[k] = true;
                                        });
                                    });
                                    _this.set('received', Object.keys(_this.itemMap).length);
                                    // Compute columns list from colmap, removing frozen columns
                                    var cols = Object.keys(_this.colmap);
                                    _this.frozen.forEach(function (f) {
                                        if (cols.indexOf(f) > -1)
                                            cols.splice(cols.indexOf(f), 1);
                                    });
                                    _this.set('columns', cols);
                                    if (_this.timeseries && items.length == opts.pageSize) {
                                        _this.set('stop', items[items.length - 1][_this
                                            .primaryFieldName
                                        ]);
                                    } else if (_this.timeseries && items.length < opts.pageSize) {
                                        _this.count = _this.received;
                                    }
                                }
                                callback(items, _this.count);
                                _this.async(function () {
                                    _this.fire('resize');
                                }, 500);
                            }
                            _this.loading = false;
                        };

                        xhr.send();
                        _this.loading = true;
                    } else {
                        let items = (Array.isArray(this.items) ? this.items : []).slice(0);
                        if (this._filters && this._checkPaths(this._filters, 'filtering', items)) {
                            items = this._filter(items);
                        }

                        this.size = items.length;
                        if (opts.sortOrders.length && this._checkPaths(this._sorters, 'sorting', items)) {
                            items = items.sort(this._multiSort.bind(this));
                        }
                        if (_this.filteredItems && _this.filter && _this.filter.trim().length > 0) {
                            const filterMap = {};
                            _this.filteredItems.forEach(item => {
                                filterMap[item.id] = item;
                            });
                            // add parents
                            Object.values(filterMap).forEach(item => {
                                if (item.parent)
                                    filterMap[item.parent] = _this.itemMap[item.parent];
                            });
                            items = Object.values(filterMap);
                        }
                        let data = [];
                        if (!_this.treeView) {
                            data = items;
                            _this.count = data.length;
                        } else if (opts.parentItem) {
                            data = items.filter(item => {
                                return item.parent === opts.parentItem.id;
                            });
                            _this.count += data.length;
                        } else {
                            data = items.filter(item => {
                                return !item.parent;
                            });
                            _this.count = data.length;
                        }
                        const start = opts.page * opts.pageSize;
                        const end = start + opts.pageSize;
                        const slice = data.slice(start, end);
                        callback(slice, data.length);
                    }
                });

            }, 500);
    }
});
