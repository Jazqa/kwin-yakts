'use strict';

var WM = /** @class */ (function () {
    function WM() {
        var _this = this;
        this.windows = [];
        this.windowAllowed = function (window) {
            if (window.managed && window.moveable && window.normalWindow && window.resizeable) {
                return true;
            }
        };
        this.windowAdded = function (window) {
            if (_this.windowAllowed(window)) {
                _this.windows.push(window);
                _this.tileWindows();
            }
        };
        this.windowRemoved = function (window) {
            var index = _this.windows.findIndex(function (_a) {
                var internalId = _a.internalId;
                return internalId === window.internalId;
            });
            if (index > -1) {
                _this.windows.splice(index, 1);
                _this.tileWindows();
            }
        };
        this.tileWindows = function () {
            workspace.screens.forEach(function (output, index) {
                // Filter windows by output
                var windows = _this.windows.filter(function (window) { return window.output.serialNumber === output.serialNumber; });
                var tiles = [];
                var cb = function (tile) {
                    if (tile.tiles.length === 0) {
                        tiles.push(tile);
                    }
                };
                var rootTile = workspace.tilingForScreen(output).rootTile;
                // Traverse through the tree
                _this.traverse(rootTile, cb);
                windows.splice(tiles.length);
                tiles.reverse();
                windows.reverse();
                windows.forEach(function (window, index) {
                    window.tile = rootTile;
                });
            });
        };
        this.traverse = function (tile, cb) {
            var i = 0;
            while (tile.tiles[i]) {
                cb(tile.tiles[i]);
                _this.traverse(tile.tiles[i], cb);
                i++;
            }
        };
        workspace.windowAdded.connect(this.windowAdded);
        workspace.windowRemoved.connect(this.windowRemoved);
    }
    return WM;
}());

new WM();
