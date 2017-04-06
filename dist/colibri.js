(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Colibri = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Colibri = function () {
    function Colibri(target, options) {
        _classCallCheck(this, Colibri);

        this.target = document.querySelector(target);

        this.postUrl = this.target.dataset.post;

        // afterUpload mode
        if (this.target.dataset.pic) {
            this.imageUrl = this.target.dataset.pic;
            this.switchUI("afterUpload");
        } else {
            this.imageUrl = null;
        }

        var progress = this._createProgress();
        var loadingContent = this._createLoadingContent(progress);

        this.ui = {
            input: this.target.querySelector('input'),
            progress: progress,
            label: this.target.querySelector('label'),
            labelContent: this.target.querySelector('label > div'),
            loadingContent: loadingContent
        };

        // events
        this.listen();
    }

    _createClass(Colibri, [{
        key: "_createProgress",
        value: function _createProgress() {
            var progress = document.createElement("progress");
            progress.value = 0;
            progress.max = 100;
            return progress;
        }
    }, {
        key: "_createLoadingContent",
        value: function _createLoadingContent(progress) {
            var container = document.createElement('div');
            var message = document.createElement('div');
            message.innerHTML = "Téléchargement en cours...";
            container.appendChild(message);
            container.appendChild(progress);
            return container;
        }
    }, {
        key: "listen",
        value: function listen() {
            var _this = this;

            // on new file
            this.ui.input.addEventListener('change', function () {
                _this.uploadAttempt();
            });
        }
    }, {
        key: "uploadAttempt",
        value: function uploadAttempt() {
            var _this2 = this;

            var formData = new FormData();
            formData.append('picture', this.ui.input.files[0]);

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
        key: "switchUI",
        value: function switchUI(state) {
            switch (state) {
                case "beforeUpload":

                    break;

                case "duringUpload":
                    this.ui.label.replaceChild(this.ui.loadingContent, this.ui.labelContent);
                    break;

                case "afterUpload":
                    this.ui.label.replaceChild(this.ui.labelContent, this.ui.loadingContent);
                    this.target.style.backgroundImage = "url(" + this.imageUrl + ")";
                    this.target.classList.add('colibri--afterUpload');
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