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

var findWindowToSplit = function (windows) {
    var firstMatch = false;
    var i = -1;
    workspace.stackingOrder
        .slice()
        .reverse()
        .some(function (kwinWindow) {
        var secondMatch = firstMatch;
        var j = windows.findIndex(function (window) {
            return window.kwin.internalId === kwinWindow.internalId;
        });
        firstMatch = j > -1;
        if (secondMatch && firstMatch)
            i = j;
        return secondMatch && firstMatch;
    });
    return i;
};
var BSPLayout = (function () {
    function BSPLayout(rect) {
        var _this = this;
        this.leaves = [];
        this.oldWindows = [];
        this.tileWindows = function (windows) {
            for (var i = 0; i < windows.length - _this.leaves.length; i++) {
                var index = findWindowToSplit(windows);
                var node = _this.leaves[index] || _this.leaves[_this.leaves.length - 1];
                node.addChildren(_this.leaves);
            }
            if (_this.leaves.length > 1) {
                var _loop_1 = function () {
                    var window_1 = _this.oldWindows.filter(function (window) {
                        return !windows.includes(window);
                    })[0];
                    var index = _this.leaves.findIndex(function (leaf) { return leaf.id === window_1.kwin.internalId; });
                    var node = _this.leaves[index] || _this.leaves[_this.leaves.length - 1];
                    node.remove(_this.leaves);
                };
                for (var i = 0; i < _this.leaves.length - windows.length; i++) {
                    _loop_1();
                }
            }
            windows.forEach(function (window, i) {
                _this.leaves[i].id = window.kwin.internalId;
                window.setFrameGeometry(_this.leaves[i].rect);
            });
            _this.oldWindows = windows;
        };
        this.rect = rect;
        this.root = new Node(rect);
        this.leaves.push(this.root);
    }
    return BSPLayout;
}());
var Node = (function () {
    function Node(rect, parent) {
        var _this = this;
        this.addChildren = function (leaves) {
            var rects = _this.rect.split(Ori.V);
            _this.left = new Node(rects[0], _this);
            _this.right = new Node(rects[1], _this);
            leaves.splice(leaves.indexOf(_this), 1, _this.left);
            leaves.push(_this.right);
        };
        this.remove = function (leaves) {
            leaves.splice(leaves.indexOf(_this), 1);
            if (!_this.bro.left) {
                leaves.splice(leaves.indexOf(_this.bro), 1, _this.parent);
            }
            else {
                _this.parent.set(_this.bro);
            }
        };
        this.set = function (node) {
            _this.left = node.left;
            _this.right = node.right;
        };
        this.rect = rect;
        this.parent = parent;
    }
    Object.defineProperty(Node.prototype, "bro", {
        get: function () {
            if (this.parent.left === this) {
                return this.parent.right;
            }
            else {
                return this.parent.left;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "which", {
        get: function () {
            if (this.parent.left === this) {
                return "left";
            }
            else {
                return "right";
            }
        },
        enumerable: false,
        configurable: true
    });
    return Node;
}());

var Layouts = [BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout, BSPLayout];

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
var Output = (function () {
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

var kwinDesktopIndex = function (kwinVirtualDesktop) {
    return workspace.desktops.findIndex(function (_a) {
        var id = _a.id;
        return id === kwinVirtualDesktop.id;
    });
};
var Desktop = (function () {
    function Desktop(kwin) {
        var _this = this;
        this.outputs = [];
        this.addKwinOutput = function (kwinOutput) {
            if (_this.outputs.some(function (output) { return output.kwin.serialNumber === kwinOutput.serialNumber; }))
                return;
            var output = new Output(kwinOutput, maximizeArea(kwinOutput, _this.kwin));
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

var Window = (function () {
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
        this.enable = function (manual, push) {
            if (manual || (_this.disabled && !_this.enabledByDefault)) {
                _this.disabled = false;
                _this.enabled = true;
                if (push) {
                    _this.movedToBottom(_this);
                }
            }
        };
        this.disable = function (manual) {
            if (!manual)
                _this.disabled = true;
            _this.enabled = false;
            _this.affectedOthers(_this);
            if (manual)
                workspace.activeWindow = _this.kwin;
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

var YAKTS = (function () {
    function YAKTS() {
        var _this = this;
        this.desktops = [];
        this.windows = [];
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
        this.addKwinDesktop = function (kwinVirtualDesktop) {
            if (config.desktops.indexOf(kwinDesktopIndex(kwinVirtualDesktop)))
                return;
            if (_this.desktops.some(function (desktop) { return desktop.kwin.id === kwinVirtualDesktop.id; }))
                return;
            var desktop = new Desktop(kwinVirtualDesktop);
            _this.desktops.push(desktop);
        };
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
        this.isKwinWindowAllowed = function (kwinWindow) {
            return kwinWindow.managed && kwinWindow.normalWindow && kwinWindow.moveable && kwinWindow.resizeable;
        };
        this.filterWindows = function () {
            return _this.windows.filter(function (window) {
                return window.enabled;
            });
        };
        this.tileWindows = function () {
            _this.desktops.find(function (desktop) { return desktop.kwin.id === workspace.currentDesktop.id; }).tileWindows(_this.filterWindows());
        };
        this.swapWindows = function (i, j) {
            var window = _this.windows[i];
            _this.windows[i] = _this.windows[j];
            _this.windows[j] = window;
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
            }
            else {
                window.enable(true, true);
            }
        };
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
            if (window.kwin.desktops.length !== 1)
                return;
            var desktop = _this.desktops.find(function (desktop) { return desktop.kwin.id === window.kwin.desktops[0].id; });
            if (!desktop)
                return;
            desktop.resizeWindow(window, oldRect);
            _this.tileWindows();
        };
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
        registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
        registerUserActionsMenu(this.createMenuEntry);
    }
    return YAKTS;
}());

new YAKTS();
