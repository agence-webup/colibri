(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Colibri = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BEFORE_UPLOAD = 1;
var DURING_UPLOAD = 2;
var AFTER_UPLOAD = 3;

var CSS = {
    afterUpload: 'colibri--afterUpload',
    duringUpload: 'colibri--duringUpload',
    dragover: 'colibri--dragover'
};

var Colibri = function () {
    function Colibri(target) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Colibri);

        this.options = options;

        if (typeof options.onUploadComplete !== 'function') {
            this.options.onUploadComplete = null;
        }

        this.target = typeof target === 'string' ? document.querySelector(target) : target;
        this.postUrl = this.target.dataset.post;
        this.currentUi = BEFORE_UPLOAD;

        // build dom elements
        var progress = this._createProgress();
        var input = this.target.querySelector('input[type="file"]');
        var message = input.dataset.message ? input.dataset.message : 'Upload in progress...';
        var loadingContent = this._createLoadingContent(progress, message);

        // cache UI
        this.ui = {
            input: input,
            progress: progress,
            label: this.target.querySelector('label'),
            labelContent: this.target.querySelector('label > div'),
            loadingContent: loadingContent
        };

        // afterUpload mode
        if (this.target.dataset.pic) {
            this.imageUrl = this.target.dataset.pic;
            this.switchUI("afterUpload");
        } else {
            this.imageUrl = null;
        }

        // ready to listen for events
        this.listen();
    }

    _createClass(Colibri, [{
        key: '_createProgress',
        value: function _createProgress() {
            var progress = document.createElement("progress");
            progress.value = 0;
            progress.max = 100;
            return progress;
        }
    }, {
        key: '_createLoadingContent',
        value: function _createLoadingContent(progress, message) {
            var container = document.createElement('div');
            var m = document.createElement('div');
            m.innerHTML = message;
            container.appendChild(m);
            container.appendChild(progress);
            return container;
        }
    }, {
        key: 'listen',
        value: function listen() {
            var _this = this;

            this.enterTarget = null;

            // on new file
            this.ui.input.addEventListener('change', function () {
                if (!_this.ui.input.files[0]) return;
                _this.uploadAttempt(_this.ui.input.files[0]);
            });

            this.target.addEventListener('dragenter', function (e) {
                // cache enter target
                _this.enterTarget = e.target;

                e.preventDefault();
                e.stopPropagation();

                _this.target.classList.remove(CSS.afterUpload);
                _this.target.classList.add('colibri--dragover');
            });

            this.target.addEventListener('dragleave', function (e) {
                event.stopPropagation();
                event.preventDefault();
                if (_this.enterTarget == e.target) {
                    _this.target.classList.remove(CSS.dragover);
                    if (_this.currentUi == AFTER_UPLOAD) {
                        _this.target.classList.add(CSS.afterUpload);
                    }
                }
            });

            // mandatory since we need to ignore default behavior (open file) on drop
            this.target.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });

            this.target.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.target.classList.remove(CSS.dragover);
                _this.uploadAttempt(e.dataTransfer.files[0]);
            });
        }
    }, {
        key: 'uploadAttempt',
        value: function uploadAttempt(file) {
            var _this2 = this;

            var formData = new FormData();
            formData.append('picture', file);

            // sitch to upload state
            this.switchUI('duringUpload');

            // prepare request
            var xhr = new XMLHttpRequest();

            // listen for upload progression
            xhr.upload.addEventListener("progress", function (e) {
                if (e.lengthComputable) {
                    var percentComplete = e.loaded / e.total * 100;
                    _this2.ui.progress.value = percentComplete;
                }
            });

            xhr.open('POST', this.postUrl, true);

            xhr.onload = function () {

                // callback onUpload
                if (_this2.options.onUploadComplete !== null) {
                    _this2.options.onUploadComplete(xhr.status, xhr.response);
                }

                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.response);
                    _this2.imageUrl = response.url;
                    _this2.switchUI('afterUpload');
                } else {
                    alert('An error occurred!');
                }
            };

            xhr.send(formData);
        }
    }, {
        key: 'switchUI',
        value: function switchUI(state) {
            switch (state) {
                case "beforeUpload":
                    this.currentUi = BEFORE_UPLOAD;
                    break;

                case "duringUpload":

                    // dark bg if there already is a picture
                    if (this.currentUi === AFTER_UPLOAD) {
                        this.target.classList.add(CSS.duringUpload);
                    }

                    this.target.classList.remove(CSS.afterUpload);

                    if (this.currentUi !== DURING_UPLOAD) {
                        this.ui.label.replaceChild(this.ui.loadingContent, this.ui.labelContent);
                    }

                    this.currentUi = DURING_UPLOAD;
                    break;

                case "afterUpload":
                    this.target.classList.remove(CSS.duringUpload);
                    if (this.currentUi === DURING_UPLOAD) {
                        this.ui.label.replaceChild(this.ui.labelContent, this.ui.loadingContent);
                    }
                    this.target.style.backgroundImage = "url(" + this.imageUrl + ")";
                    this.target.classList.add(CSS.afterUpload);
                    this.currentUi = AFTER_UPLOAD;
                    break;

                default:

            }
        }
    }]);

    return Colibri;
}();

module.exports = Colibri;

},{}]},{},[1])(1)
});