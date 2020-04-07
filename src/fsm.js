"use strict";
exports.__esModule = true;
var FSM = /** @class */ (function () {
    function FSM(initial) {
        this.current = initial;
    }
    FSM.prototype.on = function (e) {
        var transitionFn = this.current[e];
        var next = transitionFn();
        if (next !== undefined) {
            this.current = next;
        }
    };
    return FSM;
}());
exports["default"] = FSM;
