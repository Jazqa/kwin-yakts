'use strict';

function readConfigString(key, defaultValue) {
    return readConfig(key, defaultValue).toString();
}
function maximizeArea(output, desktop) {
    return workspace.clientArea(2, output, desktop);
}

var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var auto = [
    readConfigString("auto_0", true) === "true",
    readConfigString("auto_1", true) === "true",
    readConfigString("auto_2", true) === "true",
    readConfigString("auto_3", true) === "true",
];
var gap = [
    readConfig("gap_0", 8),
    readConfig("gap_1", 8),
    readConfig("gap_2", 8),
    readConfig("gap_3", 8),
];
var margin = [
    {
        top: readConfig("marginTop_0", 0),
        left: readConfig("marginLeft_0", 0),
        bottom: readConfig("marginBottom_0", 0),
        right: readConfig("marginRight_0", 0),
    },
    {
        top: readConfig("marginTop_1", 0),
        left: readConfig("marginLeft_1", 0),
        bottom: readConfig("marginBottom_1", 0),
        right: readConfig("marginRight_1", 0),
    },
    {
        top: readConfig("marginTop_2", 0),
        left: readConfig("marginLeft_2", 0),
        bottom: readConfig("marginBottom_2", 0),
        right: readConfig("marginRight_2", 0),
    },
    {
        top: readConfig("marginTop_3", 0),
        left: readConfig("marginLeft_3", 0),
        bottom: readConfig("marginBottom_3", 0),
        right: readConfig("marginRight_3", 0),
    },
];
var layout = [
    readConfigString("layout_0", 1),
    readConfigString("layout_1", 1),
    readConfigString("layout_2", 1),
    readConfigString("layout_3", 1),
];
var limit = [
    readConfig("limit_0", -1),
    readConfig("limit_1", -1),
    readConfig("limit_2", -1),
    readConfig("limit_3", -1),
];
var minWidth = readConfig("minWidth", 256);
var minHeight = readConfig("minHeight", 256);
var processes = __spreadArray(__spreadArray([
    "albert",
    "kazam",
    "krunner",
    "ksmserver",
    "lattedock",
    "pinentry",
    "Plasma",
    "plasma",
    "plasma-desktop",
    "plasmashell",
    "plugin-container",
    "simplescreenrecorder",
    "yakuake",
    "ksmserver-logout-greeter",
    "QEMU",
    "Latte Dock"
], readConfigString("processes", "wine, steam").toLowerCase().split(", "), true), [readConfigString("java", false) === "true" ? "sun-awt-x11-xframepeer" : ""], false);
var captions = __spreadArray([
    "Configure — System Settings",
    "File Upload",
    "Move to Trash",
    "Quit GIMP",
    "Create a New Image"
], readConfigString("captions", "Quit GIMP, Create a New Image")
    .split(", ")
    .filter(function (caption) { return caption; }), true);
var desktops = readConfigString("desktops", "")
    .split(", ")
    .map(function (s) { return Number(s); });
var config = {
    auto: auto,
    gap: gap,
    margin: margin,
    layout: layout,
    limit: limit,
    minWidth: minWidth,
    minHeight: minHeight,
    processes: processes,
    captions: captions,
    desktops: desktops,
};

var inRange = function (value, min, max) {
    return value >= min && value <= max;
};
var Rect = /** @class */ (function () {
    function Rect(rect) {
        var _this = this;
        this.clone = function () {
            return new Rect(_this);
        };
        this.intersects = function (rect) {
            var x = inRange(_this.x, rect.x, rect.x + rect.width) || inRange(rect.x, _this.x, _this.x + _this.width);
            var y = inRange(_this.y, rect.y, rect.y + rect.height) || inRange(rect.y, _this.y, _this.y + _this.height);
            return x && y;
        };
        this.distance = function (rect) {
            return Math.abs(_this.x - rect.x) + Math.abs(_this.y - rect.y);
        };
        this.center = function (rect) {
            _this.x = (rect.x + rect.width) * 0.5 - _this.width * 0.5;
            _this.y = (rect.y + rect.height) * 0.5 - _this.height * 0.5;
            return _this;
        };
        this.add = function (rect) {
            _this.x += rect.x;
            _this.y += rect.y;
            _this.width -= rect.width + rect.x;
            _this.height -= rect.height + rect.y;
            return _this;
        };
        this.combine = function (rect) {
            var x2 = Math.max(_this.x2, rect.x + rect.width);
            var y2 = Math.max(_this.y2, rect.y + rect.height);
            _this.x = Math.min(_this.x, rect.x);
            _this.y = Math.min(_this.y, rect.y);
            _this.width = x2 - _this.x;
            _this.height = y2 - _this.y;
            return _this;
        };
        // No clue what happens when with and height are modified in the same call, but it's completely broken
        // Values look fine on JavaScript side of things, but windows go crazy
        this.divide = function (point) {
            // this.width *= point.x;
            _this.height *= point.y;
            var rect = new Rect(_this);
            // rect.x = this.x + this.width;
            rect.y = _this.y + _this.height;
            return [_this, rect];
        };
        this.gap = function (gap) {
            _this.x += gap;
            _this.y += gap;
            _this.width -= gap * 2;
            _this.height -= gap * 2;
            return _this;
        };
        this.margin = function (margin) {
            _this.x += margin.left;
            _this.y += margin.top;
            _this.width -= margin.left + margin.right;
            _this.height -= margin.top + margin.bottom;
            return _this;
        };
        if (!rect)
            rect = { x: 0, y: 0, width: 0, height: 0 };
        this.x = rect.x;
        this.y = rect.y;
        this.width = rect.width;
        this.height = rect.height;
    }
    Object.defineProperty(Rect.prototype, "kwin", {
        get: function () {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "x2", {
        get: function () {
            return this.x + this.width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y2", {
        get: function () {
            return this.y + this.height;
        },
        enumerable: false,
        configurable: true
    });
    return Rect;
}());

var id = 0;
var BaseLayout = /** @class */ (function () {
    function BaseLayout(rect) {
        var _this = this;
        this.setRect = function (newRect) {
            _this.rect = newRect;
        };
        this.tileWindows = function (windows) { };
        this.resizeWindow = function (window, oldRect) { };
        this.id = id.toString();
        id++;
        this.rect = rect;
    }
    BaseLayout.prototype.reset = function () { };
    return BaseLayout;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Columns = /** @class */ (function (_super) {
    __extends$1(Columns, _super);
    function Columns(rect) {
        var _this = _super.call(this, rect) || this;
        _this.name = "Columns";
        _this.minWindowWidth = 500;
        _this.separators = [];
        _this.resized = [];
        _this.resetSeparators = function (windows) {
            if (windows.length > _this.separators.length) {
                for (var i = 0; i < _this.resized.length; i++) {
                    if (_this.resized[i]) {
                        _this.resized[i] *= 0.5;
                    }
                }
            }
            _this.separators.splice(windows.length - 1);
            _this.resized.splice(windows.length - 1);
        };
        _this.tileWindows = function (windows) {
            _this.resetSeparators(windows);
            for (var i = 0; i < windows.length; i++) {
                // Width: 1000
                // Separators: [250, 500, 750, 1000]
                var seq = i + 1; // 0-index to 1-index: [1st, 2nd, 3rd, 4th]
                var ratio = windows.length / seq; // 4 separators: [4.0, 2.0, 1.33, 1.0]
                var base = _this.rect.x + _this.rect.width / ratio; // 4 positions: [250, 500, 750, 1000]
                var res = _this.resized[i] || 0;
                _this.separators[i] = base + res;
            }
            // Calculates tile rects based on the separators
            var tiles = [];
            for (var i = 0; i < _this.separators.length; i++) {
                var end = _this.separators[i];
                var start = _this.rect.x;
                if (i > 0) {
                    start = _this.separators[i - 1];
                }
                tiles.push({ x: start, y: _this.rect.y, width: end - start, height: _this.rect.height });
            }
            windows.forEach(function (window, index) {
                var tile = tiles[index];
                window.setFrameGeometry(tile);
            });
        };
        _this.resizeWindow = function (window, oldRect) {
            var newRect = new Rect(window.kwin.frameGeometry);
            var x = oldRect.x;
            var separatorDir = -1;
            if (newRect.x - oldRect.x === 0) {
                x = oldRect.x + oldRect.width;
                separatorDir = 1;
            }
            var i = -1;
            var distance = x - _this.rect.x;
            var distanceAbs = Math.abs(distance);
            for (var j = 0; j < _this.separators.length; j++) {
                var newDistance = x - _this.separators[j];
                var newDistanceAbs = Math.abs(newDistance);
                if (newDistanceAbs < distanceAbs) {
                    distance = newDistance;
                    distanceAbs = newDistanceAbs;
                    i = j;
                }
            }
            var overlap = _this.resizeLayout(i, oldRect, newRect);
            // Stops resizing from rect edges
            if (i < 0 || i === _this.separators.length - 1)
                return overlap;
            var diff = oldRect.width - newRect.width;
            if (separatorDir > 0) {
                diff = newRect.width - oldRect.width;
            }
            // Stops resizing over rect edges and other separators
            var prevSeparator = i === 0 ? _this.rect.x : _this.separators[i - 1];
            var minX = prevSeparator + _this.minWindowWidth;
            if (_this.separators[i] + diff <= minX) {
                diff = minX - _this.separators[i];
            }
            var nextSeparator = i === _this.separators.length - 1 ? _this.rect.x + _this.rect.width : _this.separators[i + 1];
            var maxX = nextSeparator - _this.minWindowWidth;
            if (_this.separators[i] + diff >= maxX) {
                diff = maxX - _this.separators[i];
            }
            if (!_this.resized[i])
                _this.resized[i] = 0;
            _this.resized[i] = _this.resized[i] + diff;
            return overlap;
        };
        // Calculates how much resizeWindow is trying to resize over this layout's rect (used to resize layouts in layouts that combine layouts)
        _this.resizeLayout = function (index, newRect, oldRect) {
            var rect = new Rect();
            if (newRect.y !== oldRect.y) {
                rect.y = oldRect.y - newRect.y;
            }
            else if (newRect.height !== oldRect.height) {
                rect.height = oldRect.height - newRect.height;
            }
            if (index < 0 && newRect.width !== oldRect.width) {
                rect.x = newRect.width - oldRect.width;
            }
            if (index === _this.separators.length - 1 && newRect.width !== oldRect.width) {
                rect.width = oldRect.width - newRect.width;
            }
            return rect;
        };
        _this.limit = 4;
        return _this;
    }
    Columns.prototype.reset = function () { };
    return Columns;
}(BaseLayout));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Full = /** @class */ (function (_super) {
    __extends(Full, _super);
    function Full(rect) {
        var _this = _super.call(this, rect) || this;
        _this.name = "Full";
        _this.limit = 0;
        _this.layouts = [];
        _this.addLayout = function (layout) {
            _this.layouts.push(layout);
            _this.limit += layout.limit;
        };
        _this.createLayout = function (layoutA) {
            var _a = new Rect(layoutA.rect).divide({ x: 1, y: 0.5 }), rectA = _a[0], rectB = _a[1];
            layoutA.setRect(rectA);
            var layoutB = new Columns(rectB);
            _this.addLayout(layoutB);
        };
        _this.removeLayout = function () {
            var length = _this.layouts.length;
            var layoutA = _this.layouts[length - 2];
            var layoutB = _this.layouts.splice(length - 1)[0];
            _this.limit -= layoutB.limit;
            layoutA.setRect(new Rect(layoutA.rect).combine(layoutB.rect));
        };
        // @param layoutA - The layout in which a window triggered the resize event
        // @param rect    - "Raw" resize rect from the resize event (even if it goes way over bounds)
        _this.resizeLayout = function (layoutA, rect) {
            // Actual resize rect used to resize layoutA (has values only on overlap)
            var rectA = new Rect(layoutA.rect);
            var overlapA = new Rect();
            _this.layouts.forEach(function (layoutB) {
                if (layoutB.id === layoutA.id)
                    return;
                // Overlap rect between layoutB and layoutA
                var rectB = new Rect(layoutB.rect);
                var overlapB = new Rect();
                if (rectA.y === rectB.y2) {
                    overlapA.y = rect.y;
                    overlapB.height = -rect.y;
                }
                if (rectB.y === rectA.y2) {
                    overlapB.y = rect.height;
                    overlapA.height = -rect.height;
                }
                if (rectA.x === rectB.x2) {
                    overlapA.x = rect.x;
                    overlapB.width = -rect.x;
                }
                if (rectB.x === rectA.x2) {
                    overlapB.x = rect.width;
                    overlapA.width = -rect.width;
                }
                layoutB.setRect(new Rect(rectB).add(overlapB));
            });
            layoutA.setRect(new Rect(rectA).add(overlapA));
        };
        _this.tileWindows = function (windows) {
            var length = _this.layouts.length;
            var layoutA = _this.layouts[length - 1];
            if (windows.length > _this.limit) {
                _this.createLayout(layoutA);
            }
            else if (length > 1 && windows.length <= _this.limit - layoutA.limit) {
                _this.removeLayout();
            }
            var i = 0;
            _this.layouts.forEach(function (layout) {
                var j = i + layout.limit;
                var w = windows.slice(i, j);
                layout.tileWindows(w);
                i = j;
            });
        };
        _this.resizeWindow = function (window, oldRect) {
            _this.layouts.some(function (layout) {
                if (new Rect(oldRect).intersects(layout.rect)) {
                    var rect = layout.resizeWindow(window, oldRect);
                    if (rect) {
                        _this.resizeLayout(layout, rect);
                    }
                    return true;
                }
            });
        };
        var layout = new Columns(rect);
        _this.addLayout(layout);
        return _this;
    }
    Full.prototype.reset = function () { };
    return Full;
}(BaseLayout));

/*
 * Adding a new layout to the script:
 *
 *  1. Create a "src/layouts/LayoutName.ts" file
 *
 *  2. Write a Layout that implements Layout from "/src/types/layout.d.ts"
 *
 *  3. Import the new Layout and add it to the Layouts-array below
 *
 *  4. Add the following entry to each "kcfg_layout" element in "contents/code/config.ui"
 *
 *           <item>
 *             <property name="text">
 *               <string>NewLayout</string>
 *             </property>
 *           </item>
 *
 */
var Layouts = [Full, Full, Full, Full, Full, Full];

// 2ed6
// Used to fetch configuration values for individual outputs (configuration value format: kcfg_<key>_<index>)
// Unlike proper .qml, the required .ui configuration interface doesn't support detecting outputs, so the configuration interface is hard-coded for up to 4 outputs
var outputIndex = function (kwinOutput) {
    var index = workspace.screens.findIndex(function (_a) {
        var serialNumber = _a.serialNumber;
        return serialNumber === kwinOutput.serialNumber;
    });
    // Theoretically supports more than 4 outputs by defaulting to 1st's configuration
    if (index === -1) {
        index = 0;
    }
    return index;
};
var Output = /** @class */ (function () {
    function Output(kwin, rect) {
        var _this = this;
        this.filterWindows = function (windows) {
            return windows.filter(function (window) { return window.kwin.output.serialNumber === _this.kwin.serialNumber; });
        };
        this.tileWindows = function (windows) {
            _this.layout.tileWindows(_this.filterWindows(windows));
        };
        this.resizeWindow = function (window, oldRect) {
            _this.layout.resizeWindow(window, oldRect);
        };
        this.kwin = kwin;
        this.index = outputIndex(kwin);
        this.margin = config.margin[this.index];
        this.layout = new Layouts[config.layout[this.index]](new Rect(rect).margin(this.margin));
        var limit = config.limit[this.index];
        if (limit > -1) {
            this.layout.limit = Math.min(this.layout.limit, limit);
        }
    }
    return Output;
}());

var kwinDesktopIndex = function (kwinDesktop) {
    return workspace.desktops.findIndex(function (_a) {
        var id = _a.id;
        return id === kwinDesktop.id;
    });
};
var Desktop = /** @class */ (function () {
    function Desktop(kwin) {
        var _this = this;
        this.outputs = [];
        this.addKwinOutput = function (kwinOutput) {
            // 04c1
            // Desktop is already initialized
            if (_this.outputs.some(function (output) { return output.kwin.serialNumber === kwinOutput.serialNumber; }))
                return;
            var rect = maximizeArea(kwinOutput, _this.kwin);
            var output = new Output(kwinOutput, rect);
            _this.outputs.push(output);
        };
        this.filterWindows = function (windows) {
            return windows.filter(function (window) { return window.kwin.desktops.length === 1 && window.kwin.desktops[0].id === _this.kwin.id; });
        };
        this.tileWindows = function (windows) {
            _this.outputs.forEach(function (output) { return output.tileWindows(_this.filterWindows(windows)); });
        };
        this.resizeWindow = function (window, oldRect) {
            var output = _this.outputs.find(function (output) { return output.kwin.serialNumber === window.kwin.output.serialNumber; });
            output.resizeWindow(window, oldRect);
        };
        this.kwin = kwin;
        workspace.screens.forEach(this.addKwinOutput);
    }
    return Desktop;
}());

var Window = /** @class */ (function () {
    function Window(kwin) {
        var _this = this;
        this.remove = function () {
            _this.kwin.moveResizedChanged.disconnect(_this.moveResizedChanged);
            _this.kwin.outputChanged.disconnect(_this.outputChanged);
            _this.kwin.desktopsChanged.disconnect(_this.desktopsChanged);
            _this.kwin.maximizedChanged.disconnect(_this.maximizedChanged);
            _this.kwin.fullScreenChanged.disconnect(_this.fullScreenChanged);
            _this.affectedOthers(_this);
        };
        // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
        // @param push    - Indicates whether the window should be moved to the bottom of the Window stack
        this.enable = function (manual, push) {
            if (manual || (_this.disabled && !_this.enabledByDefault)) {
                _this.disabled = false;
                _this.enabled = true;
                if (push) {
                    _this.movedToBottom(_this);
                }
            }
        };
        // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
        this.disable = function (manual) {
            if (!manual)
                _this.disabled = true;
            _this.enabled = false;
            _this.affectedOthers(_this);
        };
        // b43a
        this.setFrameGeometry = function (rect) {
            var frameGeometry = new Rect(rect).gap(config.gap[outputIndex(_this.kwin.output)]);
            if (rect.width < _this.kwin.minSize.width) {
                frameGeometry.width = _this.kwin.minSize.width;
            }
            if (rect.height < _this.kwin.minSize.height) {
                frameGeometry.height = _this.kwin.minSize.height;
            }
            _this.kwin.frameGeometry = frameGeometry.kwin;
        };
        this.startMove = function (oldRect) {
            _this.move = true;
            _this.oldRect = new Rect(oldRect).kwin;
        };
        this.stopMove = function () {
            if (_this.kwinOutput !== _this.kwin.output) {
                _this.outputChanged(true);
            }
            else if (_this.enabled) {
                _this.positionChanged(_this, _this.oldRect);
            }
            _this.move = false;
        };
        this.startResize = function (oldRect) {
            _this.resize = true;
            _this.oldRect = new Rect(oldRect).kwin;
        };
        this.stopResize = function () {
            _this.sizeChanged(_this, _this.oldRect);
            _this.resize = false;
        };
        this.moveResizedChanged = function () {
            if (_this.kwin.move && !_this.move) {
                _this.startMove(_this.kwin.frameGeometry);
            }
            else if (!_this.kwin.move && _this.move) {
                _this.stopMove();
            }
            else if (!_this.enabled) {
                return;
            }
            else if (_this.kwin.resize && !_this.resize) {
                _this.startResize(_this.kwin.frameGeometry);
            }
            else if (!_this.kwin.resize && _this.resize) {
                _this.stopResize();
            }
        };
        this.fullScreenChanged = function () {
            if (_this.kwin.fullScreen) {
                _this.disable();
            }
            else {
                _this.enable(false, false);
            }
        };
        this.maximizedChanged = function () {
            if (_this.kwin.fullScreen)
                return;
            if (_this.isMaximized()) {
                _this.disable();
            }
            else {
                _this.enable(false, false);
            }
        };
        this.minimizedChanged = function () {
            if (_this.kwin.minimized) {
                _this.disable();
            }
            else {
                _this.enable(false, true);
            }
        };
        this.isMaximized = function () {
            var desktop = _this.kwin.desktops[0] || workspace.desktops[0];
            var area = maximizeArea(_this.kwin.output, desktop);
            var h = _this.kwin.frameGeometry.width === area.width && _this.kwin.frameGeometry.x === area.x;
            var v = _this.kwin.frameGeometry.height === area.height && _this.kwin.frameGeometry.y === area.y;
            if (h || v) {
                return true;
            }
        };
        // @param force - Ignores the move check (used to ignore outputChanged signal if moveResizedChanged might do the same later)
        this.outputChanged = function (force) {
            if (force || !_this.move) {
                _this.kwinOutput = _this.kwin.output;
                if (_this.enabledByDefault) {
                    _this.enable(false, true);
                }
                else {
                    _this.disable();
                }
            }
        };
        // cf3f
        this.desktopsChanged = function () {
            if (_this.kwin.desktops.length > 1) {
                _this.disable();
            }
            else if (_this.kwin.desktops.length === 1) {
                _this.enable(false, true);
            }
            _this.kwinDesktops = _this.kwin.desktops;
        };
        this.kwin = kwin;
        this.kwinOutput = kwin.output;
        this.kwinDesktops = kwin.desktops;
        this.move = false;
        this.resize = false;
        this.disabled = !this.enabledByDefault;
        this.enabled = this.enabledByDefault;
        this.kwin.moveResizedChanged.connect(this.moveResizedChanged);
        this.kwin.outputChanged.connect(this.outputChanged);
        this.kwin.desktopsChanged.connect(this.desktopsChanged);
        this.kwin.maximizedChanged.connect(this.maximizedChanged);
        this.kwin.minimizedChanged.connect(this.minimizedChanged);
        this.kwin.fullScreenChanged.connect(this.fullScreenChanged);
    }
    Object.defineProperty(Window.prototype, "enabledByDefault", {
        get: function () {
            var _this = this;
            return (!this.kwin.minimized &&
                !this.kwin.fullScreen &&
                !this.isMaximized() &&
                this.kwin.frameGeometry.width >= config.minWidth &&
                this.kwin.frameGeometry.height >= config.minHeight &&
                config.auto[outputIndex(this.kwin.output)] &&
                config.processes.indexOf(this.kwin.resourceClass.toString().toLowerCase()) === -1 &&
                config.processes.indexOf(this.kwin.resourceName.toString().toLowerCase()) === -1 &&
                !config.captions.some(function (caption) { return _this.kwin.caption.toLowerCase().includes(caption.toLowerCase()); }));
        },
        enumerable: false,
        configurable: true
    });
    return Window;
}());

var WM = /** @class */ (function () {
    function WM() {
        var _this = this;
        this.desktops = [];
        this.windows = [];
        // KWin ActionsMenu
        this.kwinActionsMenuEntry = function (kwinWindow) {
            var window = _this.windows.find(function (window) { return window.kwin.internalId === kwinWindow.internalId; });
            if (window) {
                return {
                    text: "Tile Window",
                    checkable: true,
                    checked: window.enabled,
                    triggered: function () {
                        _this.toggleWindow(window);
                    },
                };
            }
        };
        // KWin Desktops
        this.addKwinDesktop = function (kwinDesktop) {
            // Desktop is excluded
            if (config.desktops.indexOf(kwinDesktopIndex(kwinDesktop)))
                return;
            // Desktop is already initialized
            if (_this.desktops.some(function (desktop) { return desktop.kwin.id === kwinDesktop.id; }))
                return;
            var desktop = new Desktop(kwinDesktop);
            _this.desktops.push(desktop);
        };
        // KWin Windows
        this.addKwinWindow = function (kwinWindow, loop) {
            if (_this.isKwinWindowAllowed(kwinWindow)) {
                var window_1 = new Window(kwinWindow);
                window_1.affectedOthers = function (window) { return _this.windowAffectedOthers(window); };
                window_1.movedToBottom = function (window) { return _this.windowMovedToBottom(window); };
                window_1.positionChanged = function (window, oldRect) { return _this.windowPositionChanged(window, oldRect); };
                window_1.sizeChanged = function (window, oldRect) { return _this.windowSizeChanged(window, oldRect); };
                _this.windows.push(window_1);
                if (!loop) {
                    _this.windowAffectedOthers(window_1);
                }
            }
        };
        this.removeKwinWindow = function (kwinWindow) {
            var index = _this.windows.findIndex(function (window) { return window.kwin.internalId === kwinWindow.internalId; });
            var window = _this.windows[index];
            if (index > -1) {
                _this.windows.splice(index, 1);
                window.remove();
            }
        };
        this.isKwinWindowAllowed = function (window) {
            return window.managed && window.normalWindow && window.moveable && window.resizeable;
        };
        // Windows
        this.filterWindows = function () {
            return _this.windows.filter(function (window) {
                return window.enabled;
            });
        };
        this.tileWindows = function () {
            _this.desktops.forEach(function (desktop) {
                if (desktop.kwin.id === workspace.currentDesktop.id) {
                    desktop.tileWindows(_this.filterWindows());
                }
            });
        };
        this.swapWindows = function (i, j) {
            var window = _this.windows[i];
            _this.windows[i] = _this.windows[j];
            _this.windows[j] = window;
        };
        // Window
        this.toggleActiveWindow = function () {
            var window = _this.windows.find(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === workspace.activeWindow.internalId;
            });
            _this.toggleWindow(window);
        };
        this.toggleWindow = function (window) {
            if (window.enabled) {
                window.disable(true);
                workspace.activeWindow = window.kwin;
            }
            else {
                window.enable(true, true);
            }
        };
        // Window signals
        this.windowAffectedOthers = function (window) {
            _this.tileWindows();
        };
        this.windowMovedToBottom = function (window) {
            var index = _this.windows.findIndex(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === window.kwin.internalId;
            });
            if (index > -1) {
                _this.windows.push(_this.windows.splice(index, 1)[0]);
            }
            _this.tileWindows();
        };
        this.windowSizeChanged = function (window, oldRect) {
            var desktop = _this.desktops.find(function (desktop) { return desktop.kwin.id === window.kwin.desktops[0].id; });
            if (!desktop)
                return;
            desktop.resizeWindow(window, oldRect);
            _this.tileWindows();
        };
        this.windowPositionChanged = function (windowA, oldRect) {
            var index = _this.windows.findIndex(function (windowB) { return windowB.kwin.internalId === windowA.kwin.internalId; });
            var newRect = new Rect(windowA.kwin.frameGeometry);
            var nearestIndex = index;
            var nearestDistance = newRect.distance(oldRect);
            _this.windows.forEach(function (windowB, index) {
                if (windowB.kwin.internalId !== windowA.kwin.internalId) {
                    var distance = newRect.distance(windowB.kwin.frameGeometry);
                    if (distance < nearestDistance) {
                        nearestIndex = index;
                        nearestDistance = distance;
                    }
                }
            });
            if (index !== nearestIndex) {
                _this.swapWindows(index, nearestIndex);
            }
            _this.tileWindows();
        };
        workspace.desktops.forEach(this.addKwinDesktop);
        workspace.stackingOrder.forEach(function (kwinWindow, index) {
            return _this.addKwinWindow(kwinWindow, index === workspace.stackingOrder.length - 1);
        });
        workspace.currentDesktopChanged.connect(this.tileWindows);
        workspace.windowAdded.connect(this.addKwinWindow);
        workspace.windowRemoved.connect(this.removeKwinWindow);
        // workspace.windowActivated.connect(this.tileWindows);
        registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
        registerUserActionsMenu(this.kwinActionsMenuEntry);
    }
    return WM;
}());

new WM();
