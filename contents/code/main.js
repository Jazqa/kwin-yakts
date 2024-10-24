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
    "xwaylandvideobridge",
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

var BSPLayout = /** @class */ (function () {
    function BSPLayout(rect) {
        var _this = this;
        this.leaves = [];
        this.traverse = function (node, cb) {
            cb(node);
            var i = 0;
            while (node.children[i]) {
                _this.traverse(node.children[i], cb);
                i++;
            }
        };
        this.tileWindows = function (windows) {
            // Adds missing leaves
            for (var i = 0; i < windows.length - _this.leaves.length; i++) {
                // TODO: LAST WITH LOWEST DEPTH
                var node = _this.leaves[_this.leaves.length - 1];
                _this.leaves.splice(-1, 1);
                node.addChild();
                _this.leaves.push(node.children[0], node.children[1]);
            }
            // Removes excess leaves
            if (_this.leaves.length > 1) {
                for (var i = 0; i < _this.leaves.length - windows.length; i++) {
                    var node = _this.leaves[_this.leaves.length - 1];
                    _this.leaves.splice(-2, 2);
                    _this.leaves.push(node.parent);
                }
            }
            windows.forEach(function (window, i) {
                window.setFrameGeometry(_this.leaves[i].rect);
            });
        };
        this.rect = rect;
        this.root = new Node(rect);
        this.leaves.push(this.root);
    }
    return BSPLayout;
}());
var Node = /** @class */ (function () {
    function Node(rect, parent) {
        var _this = this;
        this.addChild = function () {
            var rects = _this.rect.split(true);
            _this.children = [new Node(rects[0], _this), new Node(rects[1], _this)];
        };
        this.rect = rect;
        this.parent = parent;
        this.depth = this.parent ? this.parent.depth + 1 : 0;
    }
    return Node;
}());

/**
 *
 * Adding a new layout to the script:
 *
 *  - 1. Create a "src/layouts/LayoutName.ts" file
 *
 *  - 2. Write a Layout that implements Layout from "/src/types/layout.d.ts"
 *
 *  - 3. Import the new Layout and add it to the Layouts-array below
 *
 *  - 4. Add the following entry to each "kcfg_layout" element in "contents/code/config.ui"
 *
 *           <item>
 *             <property name="text">
 *               <string>NewLayout</string>
 *             </property>
 *           </item>
 *
 */
var Layouts = [BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout];

/**
 * Enum for direction in two-dimensional space.
 * @enum
 */
var Dir;
(function (Dir) {
    Dir[Dir["Up"] = 1] = "Up";
    Dir[Dir["Down"] = 2] = "Down";
    Dir[Dir["Left"] = 3] = "Left";
    Dir[Dir["Right"] = 4] = "Right";
})(Dir || (Dir = {}));
/**
 * Checks if `value` is between `min` and `max`.
 * @param value Value to check
 * @param min Minimum acceptable value
 * @param max Maximum acceptable value
 * @returns Whether the `value` is between `min` and `max`
 */
var between = function (value, min, max) {
    return value >= min && value <= max;
};
/**
 * Represents a rectangle in two-dimensional space.
 * @extends QRect Adds additional helpers for easy two-dimensional math
 */
var Rect = /** @class */ (function () {
    /**
     *
     * @param rect {@link QRect} to base `this` on
     */
    function Rect(rect) {
        var _this = this;
        /**
         * Clones `this`.
         * @returns New instance of `this`
         */
        this.clone = function () {
            return new Rect(_this);
        };
        /**
         * Checks if `this` intersects with `rect`.
         * @param rect {@link QRect} to check
         * @returns Whether there is an intersection between `this` and `rect`
         */
        this.intersects = function (rect) {
            var x = between(_this.x, rect.x, rect.x + rect.width) || between(rect.x, _this.x, _this.x + _this.width);
            var y = between(_this.y, rect.y, rect.y + rect.height) || between(rect.y, _this.y, _this.y + _this.height);
            return x && y;
        };
        /**
         * Calculates the distance between `this` and `rect`.
         * @param rect {@link QRect} to calculate distance to
         * @returns Distance between `this` and `rect`
         */
        this.distance = function (rect) {
            return Math.abs(_this.x - rect.x) + Math.abs(_this.y - rect.y);
        };
        /**
         * Positions `this` in the center of `rect`.
         * @param rect {@link QRect} to center in
         * @mutates `this`
         * @returns {this} `this`
         */
        this.center = function (rect) {
            _this.x = (rect.x + rect.width) * 0.5 - _this.width * 0.5;
            _this.y = (rect.y + rect.height) * 0.5 - _this.height * 0.5;
            return _this;
        };
        /**
         * Adjusts `this` by `rect`.
         * @param rect {@link QRect} to adjust by
         * @mutates `this`
         * @returns `this`
         */
        this.add = function (rect) {
            _this.x += rect.x;
            _this.y += rect.y;
            _this.width -= rect.width + rect.x;
            _this.height -= rect.height + rect.y;
            return _this;
        };
        /**
         * Combines `this` with `rect`.
         * @param rect {@link QRect} to combine with
         * @mutates `this`
         * @returns `this`
         */
        this.combine = function (rect) {
            var x2 = Math.max(_this.x2, rect.x + rect.width);
            var y2 = Math.max(_this.y2, rect.y + rect.height);
            _this.x = Math.min(_this.x, rect.x);
            _this.y = Math.min(_this.y, rect.y);
            _this.width = x2 - _this.x;
            _this.height = y2 - _this.y;
            return _this;
        };
        /**
         * Creates two halves of `this`.
         * @param v Creates vertical halves instead of horizontal ones
         * @returns Two halves of `this`
         */
        this.split = function (v) {
            var rectA = _this.clone();
            var rectB = rectA.clone();
            if (v) {
                rectA.height *= 0.5;
                rectB.height *= 0.5;
                rectB.y = rectA.y + rectA.height;
            }
            else {
                rectA.width *= 0.5;
                rectB.width *= 0.5;
                rectB.x = rectA.x + rectA.width;
            }
            return [rectA, rectB];
        };
        /**
         * Adds space around `this`.
         * @param size Amount of space to add
         * @mutates `this`
         * @returns `this`
         */
        this.gap = function (size) {
            _this.x += size;
            _this.y += size;
            _this.width -= size * 2;
            _this.height -= size * 2;
            return _this;
        };
        /**
         * Adds space around `this`.
         * @param margin {@link Margin} to add
         * @mutates `this`
         * @returns `this`
         */
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

/**
 * @todo 2ed6
 *
 * Unlike proper `.qml` interface, the `.ui` interface required by KWin doesn't support detecting outputs.
 * As a result, the configuration interface is hard-coded for up to 4 outputs
 * @param kwinOutput {@link KWinOutput} for which to find the index
 * @returns Index of the output in {@link Workspace.screens}, which can be used to fetch configuration values that use the format:
 * `kcfg_<key>_<output_index>`
 */
var outputIndex = function (kwinOutput) {
    var index = workspace.screens.findIndex(function (_a) {
        var serialNumber = _a.serialNumber;
        return serialNumber === kwinOutput.serialNumber;
    });
    // Supports more than 4 outputs by defaulting to 1st's configuration
    if (index === -1) {
        index = 0;
    }
    return index;
};
/**
 * Represents a screen managed by the script (KWin *mostly* uses the term output)
 * @augments KWinOutput Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
var Output = /** @class */ (function () {
    function Output(kwin, rect) {
        var _this = this;
        /**
         * Filters `windows` to exclude {@link Window|Windows} that are not on `this.kwin`.
         * @param windows {@link Window|Windows} to be filtered
         * @returns Filtered copy of `windows`
         */
        this.filterWindows = function (windows) {
            return windows.filter(function (window) { return window.kwin.output.serialNumber === _this.kwin.serialNumber; });
        };
        /**
         * Calls `this.layout`'s {@link Layout.tileWindows|tileWindows}.
         */
        this.tileWindows = function (windows) {
            _this.layout.tileWindows(_this.filterWindows(windows));
        };
        /**
         * Calls `this.layout`'s {@link Layout.resizeWindow|resizeWindow}.
         */
        this.resizeWindow = function (window, oldRect) {
            _this.layout.resizeWindow(window, oldRect);
        };
        this.kwin = kwin;
        this.index = outputIndex(kwin);
        this.margin = config.margin[this.index];
        this.layout = new Layouts[config.layout[this.index]](new Rect(rect).margin(this.margin));
        /** Uses the lower value between `this.layout.limit` and {@link config.limit} */
        var limit = config.limit[this.index];
        if (limit > -1) {
            this.layout.limit = Math.min(this.layout.limit, limit);
        }
    }
    return Output;
}());

/**
 * @param kwinVirtualDesktop {@link KWinVirtualDesktop} for which to find the index
 * @returns Index of the output in {@link Workspace.screens}
 */
var kwinDesktopIndex = function (kwinVirtualDesktop) {
    return workspace.desktops.findIndex(function (_a) {
        var id = _a.id;
        return id === kwinVirtualDesktop.id;
    });
};
/**
 * Represents a virtual desktop managed by the script
 * @augments KWinVirtualDesktop Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
var Desktop = /** @class */ (function () {
    function Desktop(kwin) {
        var _this = this;
        this.outputs = [];
        /**
         * @todo
         * 04c1
         *
         * Creates a new {@link Output} based on `kwinOutput` and adds it to `this.outputs`.
         * @param kwinOutput {@link KWinOutput} to add
         * @mutates `this.outputs`
         */
        this.addKwinOutput = function (kwinOutput) {
            // KWinOutput is already added
            if (_this.outputs.some(function (output) { return output.kwin.serialNumber === kwinOutput.serialNumber; }))
                return;
            var output = new Output(kwinOutput, maximizeArea(kwinOutput, _this.kwin));
            _this.outputs.push(output);
        };
        /**
         * Filters `windows` to exclude {@link Window|Windows} that are not on `this.kwin`.
         * @param windows {@link Window|Windows} to be filtered
         * @returns Filtered copy of `windows`
         */
        this.filterWindows = function (windows) {
            return windows.filter(function (window) { return window.kwin.desktops.length === 1 && window.kwin.desktops[0].id === _this.kwin.id; });
        };
        /**
         * Calls {@link Output.tileWindows|tileWindows} of each {@link Output} in `this.outputs`.
         */
        this.tileWindows = function (windows) {
            _this.outputs.forEach(function (output) { return output.tileWindows(_this.filterWindows(windows)); });
        };
        /**
         * Finds the {@link Output} `window` is on and calls its {@link Output.resizeWindow|resizeWindow}.
         */
        this.resizeWindow = function (window, oldRect) {
            var output = _this.outputs.find(function (output) { return output.kwin.serialNumber === window.kwin.output.serialNumber; });
            output.resizeWindow(window, oldRect);
        };
        this.kwin = kwin;
        workspace.screens.forEach(this.addKwinOutput);
    }
    return Desktop;
}());

/**
 * Represents a window managed by the script.
 * @augments KWinWindow Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
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
        /**
         *
         * @param manual Action was performed **manually by the user** instead of *automatically by the script*
         * @param push Moves `this` to the bottom of {@link YAKTS.windows}
         * @mutates `this.enabled`, `this.disabled`
         */
        this.enable = function (manual, push) {
            if (manual || (_this.disabled && !_this.enabledByDefault)) {
                _this.disabled = false;
                _this.enabled = true;
                if (push) {
                    _this.movedToBottom(_this);
                }
            }
        };
        /**
         *
         * @param manual Action was performed **manually by the user** instead of *automatically by the script*
         * @mutates `this.enabled`, `this.disabled`
         */
        this.disable = function (manual) {
            if (!manual)
                _this.disabled = true;
            _this.enabled = false;
            _this.affectedOthers(_this);
            if (manual)
                workspace.activeWindow = _this.kwin;
        };
        /**
         * @todo b43a
         *
         * Sets `this.kwin.frameGeometry` to `rect` but caps its `width` and `height` to `this.kwin.minSize`.
         * @param rect Target {@link QRect}
         * @mutates `this.kwin.frameGeometry`
         */
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
        /**
         * Callback triggered when `kwin` starts moving.
         * @param oldRect {@link QRect} before `kwin` moved
         * @mutates `this.move`
         * @mutates `this.oldRect`
         */
        this.startMove = function (oldRect) {
            _this.move = true;
            _this.oldRect = new Rect(oldRect).kwin;
        };
        /**
         * Callback triggered when `kwin` stops moving.
         * Calls {@link outputChanged} if output before moving (`this.kwinOutput`) doesn't match output after moving (`this.kwin.output`).
         * @mutates `this.move`
         */
        this.stopMove = function () {
            if (_this.kwinOutput !== _this.kwin.output) {
                _this.outputChanged(true);
            }
            else if (_this.enabled) {
                _this.positionChanged(_this, _this.oldRect);
            }
            _this.move = false;
        };
        /**
         * Callback triggered when `kwin` starts being resized.
         * @param oldRect {@link QRect} before `kwin` was resized
         * @mutates `this.resize`
         * @mutates `this.oldRect`
         */
        this.startResize = function (oldRect) {
            _this.resize = true;
            _this.oldRect = new Rect(oldRect).kwin;
        };
        /**
         * Callback triggered when `kwin` stops being resized.
         * Calls {@link sizeChanged}.
         * @mutates `this.resize`
         */
        this.stopResize = function () {
            _this.sizeChanged(_this, _this.oldRect);
            _this.resize = false;
        };
        /**
         * Callback triggered when `kwin` starts and stops being moved and resized.
         * Identifies the event and calls {@link startMove}, {@link stopMove}, {@link startResize} or {@link stopResize} accordingly.
         */
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
        /**
         * Callback triggered when `kwin.fullScreen` changes.
         * Toggles `this.enabled` accordingly.
         * @mutates `this.enabled`, `this.disabled`
         */
        this.fullScreenChanged = function () {
            if (_this.kwin.fullScreen) {
                _this.disable();
            }
            else {
                _this.enable(false, false);
            }
        };
        /**
         * Callback triggered when `kwin` is maximized.
         * Toggles `this.enabled` accordingly.
         * @mutates `this.enabled`, `this.disabled`
         */
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
        /**
         * Callback triggered when `kwin.minimized` changes.
         * Toggles `this.enabled` accordingly.
         * @mutates `this.enabled`, `this.disabled`
         */
        this.minimizedChanged = function () {
            if (_this.kwin.minimized) {
                _this.disable();
            }
            else {
                _this.enable(false, true);
            }
        };
        /**
         * {@link KWinWindow} has no property for maximized, so its size has to be compared to {@link maximizeArea}.
         * @returns Whether `this.kwin` is maximized or not
         */
        this.isMaximized = function () {
            var desktop = _this.kwin.desktops[0] || workspace.desktops[0];
            var area = maximizeArea(_this.kwin.output, desktop);
            var h = _this.kwin.frameGeometry.width === area.width && _this.kwin.frameGeometry.x === area.x;
            var v = _this.kwin.frameGeometry.height === area.height && _this.kwin.frameGeometry.y === area.y;
            if (h || v) {
                return true;
            }
        };
        /**
         * Callback triggered when `kwin`'s output changes.
         * Identifies whether the output was changed by manually moving the window or via shortcuts.
         * Toggles `this.enabled` accordingly.
         * @param force Ignore the `this.move`-check, so outputChanged signal isn't triggered if moveResizedChanged might trigger it later
         * @mutates `this.kwinOutput`, `this.enabled`, `this.disabled`
         */
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
        /**
         * @todo cf3f
         *
         * Callback triggered when `kwin`'s desktops change.
         * Toggles `this.enabled` accordingly.
         * @mutates `this.kwinDesktops`, `this.enabled`, `this.disabled`
         */
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
        /**
         * @getter Much like {@link YAKTS.isKwinWindowAllowed}, checks if `this.enabled` should be `true` by default
         */
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

/**
 * Entry point of the script.
 */
var YAKTS = /** @class */ (function () {
    function YAKTS() {
        var _this = this;
        this.desktops = [];
        this.windows = [];
        // KWin ActionsMenu
        /**
         * Creates a new {@link KWinActionsMenuEntry}.
         * @param kwinWindow {@link KWinWindow} to create an entry for
         * @returns Entry to show in `kwinWindow`'s right-click menu
         */
        this.createMenuEntry = function (kwinWindow) {
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
        /**
         * Creates a new {@link Desktop} based on `kwinVirtualDesktop` and adds it to `this.desktops`.
         * @param kwinVirtualDesktop {@link KWinVirtualDesktop} to add
         * @mutates `this.desktops`
         * @returns
         */
        this.addKwinDesktop = function (kwinVirtualDesktop) {
            // KWinVirtualDesktop is exluded
            if (config.desktops.indexOf(kwinDesktopIndex(kwinVirtualDesktop)))
                return;
            // KWinVirtualDesktop is already added
            if (_this.desktops.some(function (desktop) { return desktop.kwin.id === kwinVirtualDesktop.id; }))
                return;
            var desktop = new Desktop(kwinVirtualDesktop);
            _this.desktops.push(desktop);
        };
        // KWin Windows
        /**
         * Creates a new {@link Window} based on `kwinWindow` and adds it to `this.windows`.
         * @param kwinWindow {@link KWinWindow} to add
         * @param loop Skips {@link YAKTS.windowAffectedOthers} call
         * @mutates `this.windows`
         */
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
        /**
         * Finds {@link Window} from `this.windows` by `kwinWindow.internalId` and removes it.
         * @param kwinWindow {@link KWinWindow} to remove
         * @mutates `this.windows`
         */
        this.removeKwinWindow = function (kwinWindow) {
            var index = _this.windows.findIndex(function (window) { return window.kwin.internalId === kwinWindow.internalId; });
            var window = _this.windows[index];
            if (index > -1) {
                _this.windows.splice(index, 1);
                window.remove();
            }
        };
        /**
         * Checks if `kwinWindow` is compatible with the script.
         * @param kwinWindow {@link KWinWindow} to check
         * @returns Whether `kwinWindow` is compatible or not
         */
        this.isKwinWindowAllowed = function (kwinWindow) {
            return kwinWindow.managed && kwinWindow.normalWindow && kwinWindow.moveable && kwinWindow.resizeable;
        };
        // Windows
        /**
         * Filters `this.windows` to exclude {@link Window|Windows} that are not {@link Window.enabled|enabled}.
         * @returns Filtered copy of `this.windows`
         */
        this.filterWindows = function () {
            return _this.windows.filter(function (window) {
                return window.enabled;
            });
        };
        /**
         * Finds the current {@link Desktop} from `this.desktops` and calls its {@link Desktop.tileWindows|tileWindows}.
         */
        this.tileWindows = function () {
            _this.desktops.find(function (desktop) { return desktop.kwin.id === workspace.currentDesktop.id; }).tileWindows(_this.filterWindows());
        };
        /**
         * Swaps the positions of `this.windows[i]` and `this.windows[j]` in `this.windows`.
         * @param i First index to swap
         * @param j Second index to swap
         * @mutates `this.windows`
         */
        this.swapWindows = function (i, j) {
            var window = _this.windows[i];
            _this.windows[i] = _this.windows[j];
            _this.windows[j] = window;
        };
        /**
         * Finds `workspace.activeWindow` in `this.windows` and calls {@link toggleWindow} with it.
         */
        this.toggleActiveWindow = function () {
            var window = _this.windows.find(function (_a) {
                var kwin = _a.kwin;
                return kwin.internalId === workspace.activeWindow.internalId;
            });
            _this.toggleWindow(window);
        };
        /**
         * Toggles {@link Window.enabled} property of `window`.
         * @param window {@link Window} for which to toggle the property
         */
        this.toggleWindow = function (window) {
            if (window.enabled) {
                window.disable(true);
            }
            else {
                window.enable(true, true);
            }
        };
        // Window signals
        /**
         * Callback triggered whenever `window` affects other windows.
         * Calls {@link tileWindows}.
         * @param window {@link Window} window that triggered the callback
         */
        this.windowAffectedOthers = function (window) {
            _this.tileWindows();
        };
        /**
         * Callback triggered whenever `window` should be moved to the end of `this.windows`.
         * Splices `window` from its current index and pushes it to the end of `this.windows`.
         * @param window {@link Window} window that triggered the callback
         * @mutates `this.windows`
         */
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
        /**
         * Callback triggered whenever `window`'s size changes.
         * Finds the `window`'s current {@link Desktop} from `this.desktops` and calls its {@link Desktop.resizeWindow|resizeWindow}.
         * @param window {@link Window} window that triggered the callback
         * @param oldRect {@link QRect} before the size changed
         */
        this.windowSizeChanged = function (window, oldRect) {
            if (window.kwin.desktops.length !== 1)
                return;
            var desktop = _this.desktops.find(function (desktop) { return desktop.kwin.id === window.kwin.desktops[0].id; });
            if (!desktop)
                return;
            desktop.resizeWindow(window, oldRect);
            _this.tileWindows();
        };
        /**
         * Callback triggered whenever `window`'s position changes.
         * Compares the `window`'s position to `oldRect` and `this.windows` entries with matching {@link KWinWindow.desktops|desktops}
         * and "snaps" it to the closest one by returning it to `oldRect` or calling {@link swapWindows}.
         * @param window {@link Window} window that triggered the callback
         * @param oldRect {@link QRect} before the size changed
         * @mutates `this.windows`
         */
        this.windowPositionChanged = function (windowA, oldRect) {
            if (windowA.kwin.desktops.length !== 1)
                return;
            var index = _this.windows.findIndex(function (windowB) { return windowB.kwin.internalId === windowA.kwin.internalId; });
            var newRect = new Rect(windowA.kwin.frameGeometry);
            var nearestIndex = index;
            var nearestDistance = newRect.distance(oldRect);
            _this.windows.forEach(function (windowB, index) {
                if (windowB.kwin.internalId !== windowA.kwin.internalId &&
                    windowB.kwin.desktops.length === 1 &&
                    windowB.kwin.desktops[0].id === windowA.kwin.desktops[0].id) {
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
        registerUserActionsMenu(this.createMenuEntry);
    }
    return YAKTS;
}());

new YAKTS();
