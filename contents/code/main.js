'use strict';

var readConfigString = function (key, defaultValue) {
    return readConfig(key, defaultValue).toString();
};
var maximizeArea = function (output, desktop) {
    return workspace.clientArea(2, output, desktop);
};
var outputIndex = function (kwinOutput) {
    var index = workspace.screens.findIndex(function (_a) {
        var serialNumber = _a.serialNumber;
        return serialNumber === kwinOutput.serialNumber;
    });
    if (index === -1) {
        index = 0;
    }
    return index;
};
var getLayoutId = function (kwinActivity, kwinDesktop, kwinOutput) {
    return kwinActivity + (kwinDesktop === null || kwinDesktop === void 0 ? void 0 : kwinDesktop.id) + kwinOutput.serialNumber;
};
var getOutputLayoutId = function (kwinOutput) {
    return getLayoutId(workspace.currentActivity, workspace.currentDesktop, kwinOutput);
};
var getWindowLayoutId = function (window) {
    return getLayoutId(window.kwinActivities[0], window.kwinDesktops[0], window.kwinOutput);
};

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
    .map(function (s) { return !!s && Number(s); })
    .filter(function (s) { return typeof s === "number"; });
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

var Dir;
(function (Dir) {
    Dir[Dir["Up"] = 1] = "Up";
    Dir[Dir["Down"] = 2] = "Down";
    Dir[Dir["Left"] = 3] = "Left";
    Dir[Dir["Right"] = 4] = "Right";
})(Dir || (Dir = {}));
var Ori;
(function (Ori) {
    Ori[Ori["H"] = 0] = "H";
    Ori[Ori["V"] = 1] = "V";
})(Ori || (Ori = {}));
var between = function (value, min, max) {
    return value >= min && value <= max;
};
var Rect = (function () {
    function Rect(rect) {
        var _this = this;
        this.clone = function () {
            return new Rect(_this);
        };
        this.intersects = function (rect) {
            var x = between(_this.x, rect.x, rect.x + rect.width) || between(rect.x, _this.x, _this.x + _this.width);
            var y = between(_this.y, rect.y, rect.y + rect.height) || between(rect.y, _this.y, _this.y + _this.height);
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
        this.split = function (ori) {
            var rectA = _this.clone();
            var rectB = rectA.clone();
            if (ori) {
                rectA.width *= 0.5;
                rectB.width *= 0.5;
                rectB.x = rectA.x + rectA.width;
            }
            else {
                rectA.height *= 0.5;
                rectB.height *= 0.5;
                rectB.y = rectA.y + rectA.height;
            }
            return [rectA, rectB];
        };
        this.gap = function (size) {
            _this.x += size;
            _this.y += size;
            _this.width -= size * 2;
            _this.height -= size * 2;
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

var nextLayoutId = 0;
var Layout = (function () {
    function Layout(rect) {
        var _this = this;
        this.limit = 99;
        this.setRect = function (newRect) {
            _this.rect = newRect;
        };
        this.tileWindows = function (windows) { };
        this.addWindow = function (window, windows, activeWindow) { };
        this.removeWindow = function (window, windows) { };
        this.resizeWindow = function (window, windows, oldRect) { };
        this.id = nextLayoutId++;
        this.rect = rect;
    }
    Layout.prototype.reset = function () { };
    return Layout;
}());

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
var find = function (node, cb) {
    if (node) {
        if (cb(node))
            return;
        find(node.left, cb);
        find(node.right, cb);
    }
};
var findParent = function (root, target) {
    var parent;
    find(root, function (node) {
        if (node.left === target || node.right === target) {
            parent = node;
            return true;
        }
        return false;
    });
    return parent;
};
var BSP = (function (_super) {
    __extends(BSP, _super);
    function BSP(rect) {
        var _this = _super.call(this, rect) || this;
        _this.name = "BSP";
        _this.addWindow = function (window, windows, activeWindow) {
            if (!_this.leaves) {
                _this.leaves = [_this.root];
            }
            else {
                var index = windows.indexOf(activeWindow);
                _this.addLeaves(index);
            }
        };
        _this.removeWindow = function (window, windows) {
            if (_this.leaves.length === 1) {
                _this.leaves = undefined;
            }
            else {
                var index = windows.indexOf(window);
                _this.removeLeaf(index);
            }
        };
        _this.tileWindows = function (windows) {
            windows.forEach(function (window, i) {
                window.setFrameGeometry(_this.leaves[i].rect);
            });
        };
        _this.addLeaves = function (index) {
            if (index < 0)
                index = _this.leaves.length + index;
            var branch = _this.leaves[index];
            var rects = branch.rect.split(Ori.V);
            branch.left = new Node(rects[0]);
            branch.right = new Node(rects[1]);
            _this.leaves.splice(index, 1, branch.left);
            _this.leaves.splice(_this.leaves.length, 0, branch.right);
        };
        _this.removeLeaf = function (index) {
            if (index < 0)
                index = _this.leaves.length + index;
            var removed = _this.leaves.splice(index, 1)[0];
            var parent = findParent(_this.root, removed);
            var remaining = parent.left === removed ? parent.right : parent.left;
            parent.replaceWith(remaining, _this.leaves);
        };
        _this.root = new Node(rect);
        return _this;
    }
    return BSP;
}(Layout));
var nextNodeId = 0;
var Node = (function () {
    function Node(rect) {
        var _this = this;
        this.replaceWith = function (node, leaves) {
            _this.id = node.id;
            _this.left = node.left;
            _this.right = node.right;
            if (node.leaf) {
                leaves.splice(leaves.indexOf(node), 1, _this);
            }
            else {
                find(_this, function (node) {
                    if (!node.left || !node.right)
                        return false;
                    var rects = node.rect.split(Ori.V);
                    node.left.rect = rects[0];
                    node.right.rect = rects[1];
                    return false;
                });
            }
        };
        this.id = nextNodeId++;
        this.rect = rect;
    }
    Object.defineProperty(Node.prototype, "leaf", {
        get: function () {
            return !this.left;
        },
        enumerable: false,
        configurable: true
    });
    return Node;
}());

var Layouts = [BSP, BSP, BSP, BSP, BSP, BSP, BSP];

var Window = (function () {
    function Window(kwin, callbacks) {
        var _this = this;
        this.remove = function () {
            _this.kwin.moveResizedChanged.disconnect(_this.moveResizedChanged);
            _this.kwin.outputChanged.disconnect(_this.outputChanged);
            _this.kwin.desktopsChanged.disconnect(_this.desktopsChanged);
            _this.kwin.maximizedChanged.disconnect(_this.maximizedChanged);
            _this.kwin.fullScreenChanged.disconnect(_this.fullScreenChanged);
            _this.callbacks.windowRemoved(_this);
        };
        this.enable = function (manual, push) {
            if (manual || _this.disabled) {
                _this.disabled = false;
                _this.enabled = true;
                _this.callbacks.windowEnabledChanged(_this, manual, push);
            }
        };
        this.disable = function (manual) {
            if (!manual)
                _this.disabled = true;
            _this.enabled = false;
            _this.callbacks.windowEnabledChanged(_this, manual);
        };
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
            _this.oldRect = new Rect(oldRect);
        };
        this.stopMove = function () {
            if (_this.kwinOutput !== _this.kwin.output) {
                _this.outputChanged(true);
            }
            else if (_this.enabled) {
                _this.callbacks.windowPositionChanged(_this, _this.oldRect);
            }
            _this.move = false;
        };
        this.startResize = function (oldRect) {
            _this.resize = true;
            _this.oldRect = new Rect(oldRect).kwin;
        };
        this.stopResize = function () {
            _this.callbacks.windowSizeChanged(_this, _this.oldRect);
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
        this.outputChanged = function (force) {
            if (force || !_this.move) {
                if (_this.enabled) {
                    _this.callbacks.windowOutputChanged(_this, _this.kwinOutput, _this.kwin.output);
                }
                _this.kwinOutput = _this.kwin.output;
            }
        };
        this.desktopsChanged = function () {
            if (_this.kwinDesktops === _this.kwin.desktops)
                return;
            var oldLength = _this.kwinDesktops.length;
            var newLength = _this.kwin.desktops.length;
            if (_this.enabled && oldLength === 1 && newLength === 1) {
                _this.callbacks.windowDesktopsChanged(_this, _this.kwinDesktops, _this.kwin.desktops);
            }
            if (oldLength === 1 && newLength !== 1) {
                _this.disable();
            }
            _this.kwinDesktops = _this.kwin.desktops;
            if (oldLength !== 1 && newLength === 1) {
                _this.enable(false, true);
            }
        };
        this.activitiesChanged = function () {
            if (_this.kwinActivities === _this.kwin.activities)
                return;
            var oldLength = _this.kwinActivities.length;
            var newLength = _this.kwin.activities.length;
            if (_this.enabled && oldLength === 1 && newLength === 1) {
                _this.callbacks.windowActivitiesChanged(_this, _this.kwinActivities, _this.kwin.activities);
            }
            if (oldLength === 1 && newLength !== 1) {
                _this.disable();
            }
            _this.kwinActivities = _this.kwin.activities;
            if (oldLength !== 1 && newLength === 1) {
                _this.enable(false, true);
            }
        };
        this.wasOnWindowLayout = function (window) {
            return (_this.kwinActivities[0] === window.kwinActivities[0] &&
                _this.kwinDesktops[0] === window.kwinDesktops[0] &&
                _this.kwinOutput === window.kwinOutput);
        };
        this.isOnWindowLayout = function (window) {
            return (window.kwin.activities.length === 1 &&
                window.kwin.desktops.length === 1 &&
                _this.kwin.activities.length === 1 &&
                _this.kwin.desktops.length === 1 &&
                _this.kwin.activities[0] === window.kwin.activities[0] &&
                _this.kwin.desktops[0] === window.kwin.desktops[0] &&
                _this.kwin.output === window.kwin.output);
        };
        this.isOnOutputLayout = function (output) {
            return (_this.kwin.activities.length === 1 &&
                _this.kwin.activities[0] === workspace.currentActivity &&
                _this.kwin.desktops.length === 1 &&
                _this.kwin.desktops[0] === workspace.currentDesktop &&
                _this.kwin.output === output);
        };
        this.kwin = kwin;
        this.callbacks = callbacks;
        this.kwinOutput = kwin.output;
        this.kwinDesktops = kwin.desktops;
        this.kwinActivities = kwin.activities;
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
        this.kwin.activitiesChanged.connect(this.activitiesChanged);
        this.callbacks.windowAdded(this);
    }
    Object.defineProperty(Window.prototype, "enabledByDefault", {
        get: function () {
            var _this = this;
            return (!this.kwin.minimized &&
                !this.kwin.fullScreen &&
                !this.isMaximized() &&
                this.kwin.desktops.length === 1 &&
                this.kwin.activities.length === 1 &&
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

var YAKTS = (function () {
    function YAKTS() {
        var _this = this;
        this.layouts = new Map();
        this.windows = [];
        this.addActivities = function () {
            workspace.activities.forEach(function (kwinActivity) {
                _this.addActivity(kwinActivity);
            });
        };
        this.addActivity = function (kwinActivity) {
            workspace.desktops.forEach(function (kwinDesktop) {
                workspace.screens.forEach(function (kwinOutput, kwinOutputIndex) {
                    var kcfgIndex = kwinOutputIndex >= 0 ? kwinOutputIndex : 0;
                    _this.addLayout(kwinActivity, kwinDesktop, kwinOutput, kcfgIndex);
                });
            });
        };
        this.addLayout = function (kwinActivity, kwinDesktop, kwinOutput, kcfgIndex) {
            var L = Layouts[config.layout[kcfgIndex]];
            var rect = new Rect(maximizeArea(kwinOutput, kwinDesktop)).margin(config.margin[kcfgIndex]);
            _this.layouts.set(getLayoutId(kwinActivity, kwinDesktop, kwinOutput), new L(rect));
        };
        this.addKwinWindow = function (kwinWindow) {
            if (_this.isKwinWindowAllowed(kwinWindow)) {
                new Window(kwinWindow, _this.callbacks);
            }
        };
        this.removeKwinWindow = function (kwinWindow) {
            var index = _this.windows.findIndex(function (window) { return window.kwin === kwinWindow; });
            var window = _this.windows[index];
            if (index > -1) {
                window.remove();
            }
        };
        this.isKwinWindowAllowed = function (kwinWindow) {
            return kwinWindow.managed && kwinWindow.normalWindow && kwinWindow.moveable && kwinWindow.resizeable;
        };
        this.tileWindows = function (windowA) {
            if (windowA) {
                var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
                _this.layouts.get(getWindowLayoutId(windowA)).tileWindows(windows);
            }
            else {
                workspace.screens.forEach(function (output) {
                    var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.isOnOutputLayout(output); });
                    _this.layouts.get(getOutputLayoutId(output)).tileWindows(windows);
                });
            }
        };
        this.swapWindows = function (i, j) {
            var window = _this.windows[i];
            _this.windows[i] = _this.windows[j];
            _this.windows[j] = window;
        };
        this.pushWindow = function (window) {
            var index = _this.windows.indexOf(window);
            if (index > -1) {
                _this.windows.push(_this.windows.splice(index, 1)[0]);
            }
        };
        this.windowAdded = function (windowA) {
            _this.windows.push(windowA);
            if (windowA.enabled) {
                var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
                var activeWindow = windows
                    .slice()
                    .sort(function (a, b) { return workspace.stackingOrder.indexOf(b.kwin) - workspace.stackingOrder.indexOf(a.kwin); })[1];
                _this.layouts.get(getWindowLayoutId(windowA)).addWindow(windowA, windows, activeWindow);
                _this.tileWindows(windowA);
            }
        };
        this.windowRemoved = function (windowA) {
            if (windowA.enabled) {
                var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
                _this.layouts.get(getWindowLayoutId(windowA)).removeWindow(windowA, windows);
            }
            _this.windows.splice(_this.windows.indexOf(windowA), 1);
            if (windowA.enabled)
                _this.tileWindows(windowA);
        };
        this.windowEnabledChanged = function (windowA, manual, push) {
            if (push)
                _this.pushWindow(windowA);
            if (windowA.enabled) {
                _this.windowEnabled(windowA);
            }
            else {
                _this.windowDisabled(windowA, manual);
            }
            _this.tileWindows(windowA);
        };
        this.windowEnabled = function (windowA) {
            var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
            _this.layouts.get(getWindowLayoutId(windowA)).addWindow(windowA, windows);
        };
        this.windowDisabled = function (windowA, manual) {
            var windows = _this.windows.filter(function (windowB) {
                if (windowB === windowA)
                    return true;
                return windowB.enabled && windowB.wasOnWindowLayout(windowA);
            });
            _this.layouts.get(getWindowLayoutId(windowA)).removeWindow(windowA, windows);
            if (manual)
                workspace.activeWindow = windowA.kwin;
        };
        this.windowOutputChanged = function (windowA, from, to) {
            var fromLayout = _this.layouts.get(getLayoutId(windowA.kwinActivities[0], windowA.kwinDesktops[0], from));
            var fromWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
            fromLayout.removeWindow(windowA, fromWindows);
            _this.pushWindow(windowA);
            var toLayout = _this.layouts.get(getLayoutId(windowA.kwinActivities[0], windowA.kwinDesktops[0], to));
            var toWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.isOnWindowLayout(windowA); });
            toLayout.addWindow(windowA, toWindows);
            _this.tileWindows();
        };
        this.windowDesktopsChanged = function (windowA, from, to) {
            var fromLayout = _this.layouts.get(getLayoutId(windowA.kwinActivities[0], from[0], windowA.kwinOutput));
            var fromWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
            fromLayout.removeWindow(windowA, fromWindows);
            _this.pushWindow(windowA);
            var toLayout = _this.layouts.get(getLayoutId(windowA.kwinActivities[0], to[0], windowA.kwinOutput));
            var toWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.isOnWindowLayout(windowA); });
            toLayout.addWindow(windowA, toWindows);
            _this.tileWindows(windowA);
        };
        this.windowActivitiesChanged = function (windowA, from, to) {
            var fromLayout = _this.layouts.get(getLayoutId(from[0], windowA.kwinDesktops[0], windowA.kwinOutput));
            var fromWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
            fromLayout.removeWindow(windowA, fromWindows);
            _this.pushWindow(windowA);
            var toLayout = _this.layouts.get(getLayoutId(to[0], windowA.kwinDesktops[0], windowA.kwinOutput));
            var toWindows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.isOnWindowLayout(windowA); });
            toLayout.addWindow(windowA, toWindows);
            _this.tileWindows(windowA);
        };
        this.windowSizeChanged = function (windowA, oldRect) {
            var layout = _this.layouts.get(getWindowLayoutId(windowA));
            var windows = _this.windows.filter(function (windowB) { return windowB.enabled && windowB.wasOnWindowLayout(windowA); });
            layout.resizeWindow(windowA, windows, oldRect);
            _this.tileWindows(windowA);
        };
        this.windowPositionChanged = function (windowA, oldRect) {
            var windows = _this.windows.filter(function (windowB) { return windowB !== windowA && windowB.wasOnWindowLayout(windowA); });
            var newRect = new Rect(windowA.kwin.frameGeometry);
            var nearestWindow = windowA;
            var nearestDistance = newRect.distance(oldRect);
            windows.forEach(function (windowB, index) {
                var distance = newRect.distance(windowB.kwin.frameGeometry);
                if (distance < nearestDistance) {
                    nearestWindow = windowB;
                    nearestDistance = distance;
                }
            });
            if (nearestWindow !== windowA) {
                _this.swapWindows(_this.windows.indexOf(windowA), _this.windows.indexOf(nearestWindow));
            }
            _this.tileWindows(windowA);
        };
        this.callbacks = {
            windowAdded: this.windowAdded,
            windowRemoved: this.windowRemoved,
            windowOutputChanged: this.windowOutputChanged,
            windowDesktopsChanged: this.windowDesktopsChanged,
            windowActivitiesChanged: this.windowActivitiesChanged,
            windowEnabledChanged: this.windowEnabledChanged,
            windowPositionChanged: this.windowPositionChanged,
            windowSizeChanged: this.windowSizeChanged,
        };
        this.createMenuEntry = function (kwinWindow) {
            var window = _this.windows.find(function (window) { return window.kwin === kwinWindow; });
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
        this.toggleActiveWindow = function () {
            var window = _this.windows.find(function (window) { return window.kwin === workspace.activeWindow; });
            _this.toggleWindow(window);
        };
        this.toggleWindow = function (window) {
            if (window.enabled) {
                window.disable(true);
            }
            else {
                window.enable(true, true);
            }
        };
        this.addActivities();
        workspace.activitiesChanged.connect(this.addActivity);
        workspace.stackingOrder.forEach(this.addKwinWindow);
        workspace.currentDesktopChanged.connect(function () { return _this.tileWindows(); });
        workspace.windowAdded.connect(this.addKwinWindow);
        workspace.windowRemoved.connect(this.removeKwinWindow);
        registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
        registerUserActionsMenu(this.createMenuEntry);
    }
    return YAKTS;
}());

new YAKTS();
