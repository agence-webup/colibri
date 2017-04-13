"use strict";
const BEFORE_UPLOAD = 1;
const DURING_UPLOAD = 2;
const AFTER_UPLOAD = 3;

const CSS = {
    afterUpload: 'colibri--afterUpload',
    duringUpload: 'colibri--duringUpload',
    dragover: 'colibri--dragover'
};

class Colibri {

    constructor(target) {

        this.target = (typeof(target) === 'string') ? document.querySelector(target) : target;
        this.postUrl = this.target.dataset.post;
        this.currentUi = BEFORE_UPLOAD;

        // build dom elements
        let progress = this._createProgress();
        let input = this.target.querySelector('input[type="file"]');
        let message = input.dataset.message ? input.dataset.message : 'Upload in progress...';
        let loadingContent = this._createLoadingContent(progress, message);

        // cache UI
        this.ui = {
            input: input,
            progress: progress,
            label: this.target.querySelector('label'),
            labelContent: this.target.querySelector('label > div'),
            loadingContent: loadingContent
        }

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

    _createProgress() {
        let progress = document.createElement("progress");
        progress.value = 0;
        progress.max = 100;
        return progress;
    }

    _createLoadingContent(progress, message) {
        let container = document.createElement('div');
        let m = document.createElement('div');
        m.innerHTML = message;
        container.appendChild(m);
        container.appendChild(progress);
        return container;
    }

    listen() {

        this.enterTarget = null;

        // on new file
        this.ui.input.addEventListener('change', () => {
            if(!this.ui.input.files[0]) return;
            this.uploadAttempt(this.ui.input.files[0]);
        });

        this.target.addEventListener('dragenter', (e) => {
            // cache enter target
            this.enterTarget = e.target;

            e.preventDefault();
            e.stopPropagation();

            this.target.classList.remove(CSS.afterUpload);
            this.target.classList.add('colibri--dragover');

        });

        this.target.addEventListener('dragleave', (e) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.enterTarget == e.target){
                this.target.classList.remove(CSS.dragover);
                if(this.currentUi == AFTER_UPLOAD) {
                    this.target.classList.add(CSS.afterUpload);
                }
            }
        });

        // mandatory since we need to ignore default behavior (open file) on drop
        this.target.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.target.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.target.classList.remove(CSS.dragover);
            this.uploadAttempt(e.dataTransfer.files[0]);
        });
    }

    uploadAttempt(file) {
        var formData = new FormData();
        formData.append('picture', file);

        // sitch to upload state
        this.switchUI('duringUpload');

        // prepare request
        var xhr = new XMLHttpRequest();

        // listen for upload progression
        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                var percentComplete = (e.loaded / e.total) * 100;
                this.ui.progress.value = percentComplete;
            }
        });

        xhr.open('POST', this.postUrl, true);

        xhr.onload = () => {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.response);
                this.imageUrl = response.url;
                this.switchUI('afterUpload');

            } else {
                alert('An error occurred!');
            }
        };

        xhr.send(formData);
    }


    switchUI(state) {
        switch (state) {
            case "beforeUpload":
            this.currentUi = BEFORE_UPLOAD;
            break;

            case "duringUpload":

            // dark bg if there already is a picture
            if(this.currentUi === AFTER_UPLOAD) {
                this.target.classList.add(CSS.duringUpload);
            }

            this.target.classList.remove(CSS.afterUpload);

            if(this.currentUi !== DURING_UPLOAD) {
                this.ui.label.replaceChild(this.ui.loadingContent, this.ui.labelContent);
            }

            this.currentUi = DURING_UPLOAD;
            break;

            case "afterUpload":
            this.target.classList.remove(CSS.duringUpload);
            if(this.currentUi === DURING_UPLOAD) {
                this.ui.label.replaceChild(this.ui.labelContent, this.ui.loadingContent);
            }
            this.target.style.backgroundImage = "url(" + this.imageUrl + ")";
            this.target.classList.add(CSS.afterUpload);
            this.currentUi = AFTER_UPLOAD;
            break;

            default:

        }
    }

}

module.exports = Colibri;
