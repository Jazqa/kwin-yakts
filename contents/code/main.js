'use strict';

function readConfigString(key, defaultValue) {
    return readConfig(key, defaultValue).toString();
}
function maximizeArea(output, desktop) {
    return workspace.clientArea(2, output, desktop);
}

var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
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
var processes = __spreadArrays([
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
], readConfigString("processes", "wine, steam").toLowerCase().split(", "), [readConfigString("java", false) === "true" ? "sun-awt-x11-xframepeer" : ""]);
var captions = __spreadArrays([
    "Configure — System Settings",
    "File Upload",
    "Move to Trash",
    "Quit GIMP",
    "Create a New Image"
], readConfigString("captions", "Quit GIMP, Create a New Image")
    .split(", ")
    .filter(function (caption) { return caption; }));
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

var toX2 = function (rect) {
    return rect.x + rect.width;
};
var toY2 = function (rect) {
    return rect.y + rect.height;
};
var rectClone = function (rect) {
    var x = rect.x, y = rect.y, width = rect.width, height = rect.height;
    return { x: x, y: y, width: width, height: height };
};
var rectCombine = function (rectA, rectB) {
    var newRect = rectClone(rectA);
    newRect.x = Math.min(rectA.x, rectB.x);
    newRect.y = Math.min(rectA.y, rectB.y);
    var x2 = Math.max(rectA.x + rectA.width, rectB.x + rectB.width);
    var y2 = Math.max(rectA.y + rectA.height, rectB.y + rectB.height);
    newRect.width = x2 - newRect.x;
    newRect.height = y2 - newRect.y;
    return newRect;
};
var rectAdd = function (rectA, rectB) {
    var newRect = rectClone(rectA);
    newRect.x += rectB.x;
    newRect.y += rectB.y;
    newRect.width -= rectB.width + rectB.x;
    newRect.height -= rectB.height + rectB.y;
    return newRect;
};
// No clue what happens when with and height are modified in the same call, but it's completely broken
// Values look fine on JavaScript side of things, but windows go crazy
var rectDivide = function (rect, size) {
    var rectA = rectClone(rect);
    // rectA.width = rect.width * size.width;
    rectA.height = rect.height * size.height;
    var rectB = rectClone(rectA);
    // rectB.x = rectA.x + rectA.width;
    rectB.y = rectA.y + rectA.height;
    return [rectA, rectB];
};
var rectGap = function (rect, gap) {
    var x = rect.x, y = rect.y, width = rect.width, height = rect.height;
    x += gap;
    y += gap;
    width -= gap * 2;
    height -= gap * 2;
    return { x: x, y: y, width: width, height: height };
};
var rectMargin = function (rect, margin) {
    var x = rect.x, y = rect.y, width = rect.width, height = rect.height;
    x += margin.left;
    y += margin.top;
    width -= margin.left + margin.right;
    height -= margin.top + margin.bottom;
    return { x: x, y: y, width: width, height: height };
};
var rectCenterTo = function (rectA, rectB) {
    var x = rectA.x, y = rectA.y, width = rectA.width, height = rectA.height;
    x = (rectB.x + rectB.width) * 0.5 - width * 0.5;
    y = (rectB.y + rectB.height) * 0.5 - height * 0.5;
    return { x: x, y: y, width: width, height: height };
};
var distanceTo = function (rectA, rectB) {
    return Math.abs(rectA.x - rectB.x) + Math.abs(rectA.y - rectB.y);
};
var inRange = function (value, min, max) {
    return value >= min && value <= max;
};
var overlapsWith = function (rectA, rectB) {
    var x = inRange(rectA.x, rectB.x, rectB.x + rectB.width) || inRange(rectB.x, rectA.x, rectA.x + rectA.width);
    var y = inRange(rectA.y, rectB.y, rectB.y + rectB.height) || inRange(rectB.y, rectA.y, rectA.y + rectA.height);
    return x && y;
};

var id = 0;
var BaseLayout = /** @class */ (function () {
    function BaseLayout(rect) {
        this.adjustRect = function (newRect) { };
        this.tileWindows = function (windows) { };
        this.resizeWindow = function (window, oldRect) { };
        this.id = id.toString();
        id++;
        this.rect = rect;
    }
    BaseLayout.prototype.reset = function () { };
    return BaseLayout;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Columns = /** @class */ (function (_super) {
    __extends(Columns, _super);
    function Columns(rect) {
        var _this = _super.call(this, rect) || this;
        _this.name = "Columns";
        _this.minWindowWidth = 500;
        _this.separators = [];
        _this.resized = [];
        _this.adjustRect = function (newRect) {
            _this.rect = newRect;
            _this.reset();
        };
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
            var newRect = rectClone(window.kwin.frameGeometry);
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
            var rect = { x: 0, y: 0, width: 0, height: 0 };
            var newRectY2 = toY2(newRect);
            var oldRectY2 = toY2(oldRect);
            if (newRect.y !== oldRect.y) {
                rect.y = oldRect.y - newRect.y;
            }
            if (newRectY2 !== oldRectY2) {
                rect.height = oldRectY2 - newRectY2;
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

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Full = /** @class */ (function (_super) {
    __extends$1(Full, _super);
    function Full(rect) {
        var _this = _super.call(this, rect) || this;
        _this.name = "Full";
        _this.limit = 0;
        _this.layouts = [];
        _this.adjustRect = function (newRect) { };
        _this.addLayout = function (layout) {
            _this.layouts.push(layout);
            _this.limit += layout.limit;
        };
        _this.createLayout = function (layoutA) {
            var rects = rectDivide(layoutA.rect, { width: 1, height: 0.5 });
            layoutA.adjustRect(rects[0]);
            var layoutB = new Columns(rects[1]);
            _this.addLayout(layoutB);
        };
        _this.removeLayout = function () {
            var length = _this.layouts.length;
            var layoutA = _this.layouts[length - 2];
            var layoutB = _this.layouts.splice(length - 1)[0];
            _this.limit -= layoutB.limit;
            layoutA.adjustRect(rectCombine(layoutA.rect, layoutB.rect));
        };
        // @param layoutA - The layout in which a window triggered the resize event
        // @param rect    - "Raw" resize rect from the resize event (even if it goes way over bounds)
        _this.resizeLayout = function (layoutA, rect) {
            // Actual resize rect used to resize layoutA (has values only on overlap)
            var rectA = { x: 0, y: 0, width: 0, height: 0 };
            _this.layouts.forEach(function (layoutB) {
                if (layoutB.id === layoutA.id)
                    return;
                // Overlap rect between layoutB and layoutA
                var rectB = { x: 0, y: 0, width: 0, height: 0 };
                if (layoutA.rect.y === toY2(layoutB.rect)) {
                    rectA.y = rect.y;
                    rectB.height = -rect.y;
                }
                if (layoutB.rect.y === toY2(layoutA.rect)) {
                    rectB.y = rect.height;
                    rectA.height = -rect.height;
                }
                if (layoutA.rect.x === toX2(layoutB.rect)) {
                    rectA.x = rect.x;
                    rectB.width = -rect.x;
                }
                if (layoutB.rect.x === toX2(layoutA.rect)) {
                    rectB.x = rect.width;
                    rectA.width = -rect.width;
                }
                layoutB.adjustRect(rectAdd(layoutB.rect, rectB));
            });
            layoutA.adjustRect(rectAdd(layoutA.rect, rectA));
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
                if (overlapsWith(layout.rect, oldRect)) {
                    var edge = layout.resizeWindow(window, oldRect);
                    if (edge) {
                        _this.resizeLayout(layout, edge);
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
    function Output(wm, kwin, rect) {
        var _this = this;
        this.filterWindows = function (windows) {
            return windows.filter(function (window) {
                // Window is not on this output
                if (window.kwin.output.serialNumber !== _this.kwin.serialNumber)
                    return false;
                return true;
            });
        };
        this.tileWindows = function (windows) {
            _this.layout.tileWindows(_this.filterWindows(windows));
        };
        this.resizeWindow = function (window, oldRect) {
            _this.layout.resizeWindow(window, oldRect);
        };
        this.wm = wm;
        this.kwin = kwin;
        this.index = outputIndex(kwin);
        this.margin = config.margin[this.index];
        this.layout = new Layouts[config.layout[this.index]](rectMargin(rect, this.margin));
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
    function Desktop(wm, kwin) {
        var _this = this;
        this.outputs = [];
        this.addKwinOutput = function (kwinOutput) {
            // 04c1
            // Desktop is already initialized
            if (_this.outputs.some(function (output) { return output.kwin.serialNumber === kwinOutput.serialNumber; }))
                return;
            var rect = maximizeArea(kwinOutput, _this.kwin);
            var output = new Output(_this.wm, kwinOutput, rect);
            _this.outputs.push(output);
        };
        this.filterWindows = function (windows) {
            return windows.filter(function (window) {
                // Window is not on this desktop
                if (!window.isOnKwinDesktop(_this.kwin))
                    return false;
                return true;
            });
        };
        this.tileWindows = function (windows) {
            _this.outputs.forEach(function (output) { return output.tileWindows(_this.filterWindows(windows)); });
        };
        this.resizeWindow = function (window, oldRect) {
            var output = _this.outputs.find(function (output) { return output.kwin.serialNumber === window.kwin.output.serialNumber; });
            output.resizeWindow(window, oldRect);
        };
        this.wm = wm;
        this.kwin = kwin;
        workspace.screens.forEach(this.addKwinOutput);
    }
    return Desktop;
}());

var Window = /** @class */ (function () {
    function Window(wm, kwin) {
        var _this = this;
        // Enabled  can      be changed manually by the user or automatically by the script
        // Disabled can only be changed                         automatically by the script
        // In practice, disabled = true tiles can be re-enabled automatically by the script, but disabled = false tiles can only be re-enabled manually by the user
        this.enabled = true;
        this.disabled = false;
        this.isAutoTilingEnabled = function () {
            return config.auto[outputIndex(_this.kwin.output)];
        };
        this.isDisabledByDefault = function () {
            return !_this.isAutoTilingEnabled() || _this.kwin.minimized || _this.kwin.fullScreen || _this.isMaximized();
        };
        // cf3f
        this.isOnKwinDesktop = function (kwinDesktop) {
            return _this.kwin.desktops.length === 1 && _this.kwin.desktops[0].id === kwinDesktop.id;
        };
        this.deconstruct = function () {
            _this.kwin.moveResizedChanged.disconnect(_this.moveResizedChanged);
            _this.kwin.outputChanged.disconnect(_this.outputChanged);
            _this.kwin.desktopsChanged.disconnect(_this.desktopsChanged);
            _this.kwin.maximizedChanged.disconnect(_this.maximizedChanged);
            _this.kwin.fullScreenChanged.disconnect(_this.fullScreenChanged);
            _this.kwin.frameGeometryChanged.disconnect(_this.frameGeometryChanged);
            _this.kwin.frameGeometryAboutToChange.disconnect(_this.frameGeometryAboutToChange);
        };
        // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
        // @param capture - Inciates whether the window's frameGeometry should be used as its originalGeometry when restored later
        this.enable = function (manual, capture) {
            if (manual || (_this.disabled && _this.isAutoTilingEnabled())) {
                _this.disabled = false;
                _this.enabled = true;
                if (capture) {
                    _this.originalGeometry = rectClone(_this.kwin.frameGeometry);
                }
            }
        };
        // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
        // @param restore - Indicates the window's frameGeometry should be restored to its original rect
        this.disable = function (manual, restore) {
            if (!manual)
                _this.disabled = true;
            _this.enabled = false;
            if (restore) {
                _this.kwin.frameGeometry = rectCenterTo(_this.originalGeometry, _this.kwin.output.geometry);
                workspace.activeWindow = _this.kwin;
            }
        };
        // b43a
        this.setFrameGeometry = function (rect) {
            rect = rectGap(rect, config.gap[outputIndex(_this.kwin.output)]);
            if (rect.width < _this.kwin.minSize.width) {
                rect.width = _this.kwin.minSize.width;
            }
            if (rect.height < _this.kwin.minSize.height) {
                rect.height = _this.kwin.minSize.height;
            }
            _this.kwin.frameGeometry = rect;
            _this.oldGeometryKeyboard = undefined;
        };
        this.startMove = function (oldRect) {
            _this.move = true;
            _this.oldGeometry = rectClone(oldRect);
        };
        this.stopMove = function () {
            if (_this.kwinOutput !== _this.kwin.output) {
                _this.outputChanged(true);
            }
            else if (_this.enabled) {
                _this.wm.moveWindow(_this, _this.oldGeometry);
            }
            _this.move = false;
        };
        this.startResize = function (oldRect) {
            _this.resize = true;
            _this.oldGeometry = rectClone(oldRect);
        };
        this.stopResize = function () {
            _this.wm.resizeWindow(_this, _this.oldGeometry);
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
        // frameGeometryAboutToChange and frameGeometryChanged are used only for moving windows via KWin's default shortcuts
        // _isKeyboard and _oldGeometryKeyboard are used to identify signals triggered by the shortcut
        this.frameGeometryAboutToChange = function () {
            if (!_this.wm.tiling && !_this.kwin.move && !_this.kwin.resize && !_this.move && !_this.resize) {
                _this.isKeyboard = true;
            }
        };
        this.frameGeometryChanged = function (oldRect) {
            if (!_this.wm.tiling && _this.kwin.move && _this.kwin.resize && !_this.move && !_this.resize && _this.isKeyboard) {
                if (_this.oldGeometryKeyboard) {
                    _this.startMove(_this.oldGeometryKeyboard);
                    _this.stopMove();
                    _this.oldGeometryKeyboard = undefined;
                }
                else {
                    _this.oldGeometryKeyboard = oldRect;
                }
                _this.isKeyboard = false;
            }
        };
        this.fullScreenChanged = function () {
            if (_this.kwin.fullScreen) {
                _this.disable();
            }
            else {
                _this.enable();
            }
            _this.wm.tileWindow(_this);
        };
        this.maximizedChanged = function () {
            if (_this.kwin.fullScreen)
                return;
            if (_this.isMaximized()) {
                _this.disable();
            }
            else {
                _this.enable();
            }
            _this.wm.tileWindow(_this);
        };
        this.minimizedChanged = function () {
            if (_this.kwin.minimized) {
                _this.disable();
            }
            else {
                _this.enable();
            }
            _this.wm.pushWindow(_this);
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
                if (_this.isAutoTilingEnabled()) {
                    _this.enable();
                }
                else {
                    _this.disable();
                }
                // TODO
                _this.wm.pushWindow(_this);
            }
        };
        // cf3f
        this.desktopsChanged = function () {
            if (_this.kwin.desktops.length > 1) {
                _this.disable();
            }
            else if (_this.kwin.desktops.length === 1) {
                _this.enable();
            }
            _this.kwinDesktops = _this.kwin.desktops;
            _this.wm.pushWindow(_this);
        };
        this.wm = wm;
        this.kwin = kwin;
        this.kwinOutput = kwin.output;
        this.kwinDesktops = kwin.desktops;
        this.originalGeometry = kwin.frameGeometry;
        this.kwin.moveResizedChanged.connect(this.moveResizedChanged);
        this.kwin.outputChanged.connect(this.outputChanged);
        this.kwin.desktopsChanged.connect(this.desktopsChanged);
        this.kwin.maximizedChanged.connect(this.maximizedChanged);
        this.kwin.minimizedChanged.connect(this.minimizedChanged);
        this.kwin.fullScreenChanged.connect(this.fullScreenChanged);
        this.kwin.frameGeometryChanged.connect(this.frameGeometryChanged);
        this.kwin.frameGeometryAboutToChange.connect(this.frameGeometryAboutToChange);
        if (this.isDisabledByDefault()) {
            this.disable();
        }
    }
    return Window;
}());

var WM = /** @class */ (function () {
    function WM() {
        var _this = this;
        this.tiling = true;
        this.desktops = [];
        this.windows = [];
        // KWin Actions
        this.actionsMenu = function (kwinWindow) {
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
            var desktop = new Desktop(_this, kwinDesktop);
            _this.desktops.push(desktop);
        };
        // KWin Windows
        this.addKwinWindow = function (kwinWindow) {
            if (_this.isKwinWindowAllowed(kwinWindow)) {
                var window_1 = new Window(_this, kwinWindow);
                _this.windows.push(window_1);
                _this.tileWindows();
            }
        };
        this.removeKwinWindow = function (kwinWindow) {
            var index = _this.windows.findIndex(function (window) { return window.kwin.internalId === kwinWindow.internalId; });
            var window = _this.windows[index];
            if (index > -1) {
                window.deconstruct();
                _this.windows.splice(index, 1);
                _this.tileWindows();
            }
        };
        this.isKwinWindowAllowed = function (window) {
            return (window.managed &&
                window.normalWindow &&
                window.moveable &&
                window.resizeable &&
                window.rect.width >= config.minWidth &&
                window.rect.height >= config.minHeight &&
                config.processes.indexOf(window.resourceClass.toString().toLowerCase()) === -1 &&
                config.processes.indexOf(window.resourceName.toString().toLowerCase()) === -1 &&
                !config.captions.some(function (caption) { return window.caption.toLowerCase().includes(caption.toLowerCase()); }));
        };
        // Windows
        this.filterWindows = function () {
            return _this.windows.filter(function (window) { return window.enabled; });
        };
        this.tileWindows = function () {
            if (_this.tiling)
                return;
            _this.tiling = true;
            _this.desktops.forEach(function (desktop) {
                if (desktop.kwin.id === workspace.currentDesktop.id) {
                    desktop.tileWindows(_this.filterWindows());
                }
            });
            _this.tiling = false;
        };
        this.swapWindows = function (i, j) {
            var window = _this.windows[i];
            _this.windows[i] = _this.windows[j];
            _this.windows[j] = window;
        };
        this.moveWindow = function (window, oldRect) {
            var nearestWindow = _this.windows.find(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === window.kwin.internalId;
            });
            var nearestDistance = distanceTo(window.kwin.frameGeometry, oldRect);
            _this.windows.forEach(function (_a, index) {
                var kwin = _a.kwin;
                if (kwin.internalId !== window.kwin.internalId) {
                    var distance = distanceTo(kwin.frameGeometry, window.kwin.frameGeometry);
                    if (distance < nearestDistance) {
                        nearestWindow = _this.windows[index];
                        nearestDistance = distance;
                    }
                }
            });
            var i = _this.windows.findIndex(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === window.kwin.internalId;
            });
            var j = _this.windows.findIndex(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === nearestWindow.kwin.internalId;
            });
            if (i !== j) {
                _this.swapWindows(i, j);
            }
            _this.tileWindows();
        };
        this.resizeWindow = function (window, oldRect) {
            var desktop = _this.desktops.find(function (desktop) { return desktop.kwin.id === window.kwin.desktops[0].id; });
            if (!desktop)
                return;
            desktop.resizeWindow(window, oldRect);
            _this.tileWindows();
        };
        this.tileWindow = function (window) {
            _this.tileWindows();
        };
        this.pushWindow = function (window) {
            var index = _this.windows.findIndex(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === window.kwin.internalId;
            });
            if (index > -1) {
                var window_2 = _this.windows[index];
                _this.windows.splice(index, 1);
                _this.windows.push(window_2);
            }
            _this.tileWindows();
        };
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
                _this.tileWindows();
                workspace.activeWindow = window.kwin;
            }
            else {
                window.enable(true);
                _this.pushWindow(window);
            }
        };
        workspace.desktops.forEach(this.addKwinDesktop);
        workspace.stackingOrder.forEach(this.addKwinWindow);
        workspace.currentDesktopChanged.connect(this.tileWindows);
        workspace.windowAdded.connect(this.addKwinWindow);
        workspace.windowRemoved.connect(this.removeKwinWindow);
        workspace.windowActivated.connect(this.tileWindows);
        registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
        registerUserActionsMenu(this.actionsMenu);
        this.tiling = false;
        this.tileWindows();
    }
    return WM;
}());

new WM();
