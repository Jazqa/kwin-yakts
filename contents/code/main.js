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
                _this.tileWindows(window);
            }
        };
        this.windowRemoved = function (window) {
            var index = _this.windows.findIndex(function (_a) {
                var internalId = _a.internalId;
                return internalId === window.internalId;
            });
            if (index > -1) {
                _this.windows.splice(index, 1);
            }
        };
        this.tileWindows = function (window) {
            var tiles = [];
            _this.traverse(workspace.tilingForScreen(window.output).rootTile, function (tile) {
                if (tile.tiles.length === 0) {
                    tiles.push(tile);
                }
            });
            var windows = _this.windows
                .filter(function (_a) {
                var output = _a.output;
                return output.serialNumber === window.output.serialNumber;
            })
                .filter(function (_a) {
                var desktops = _a.desktops;
                return desktops[0].id === workspace.currentDesktop.id;
            })
                .slice(0, tiles.length);
            windows.forEach(function (window, index) {
                var tile = tiles[index];
                window.tile = tile;
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
