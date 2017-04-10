"use strict";
const BEFORE_UPLOAD = 1;
const DURING_UPLOAD = 2;
const AFTER_UPLOAD = 3;

class Colibri {

    constructor(target, options) {
        this.target = document.querySelector(target);

        this.currentUi = BEFORE_UPLOAD;

        this.postUrl = this.target.dataset.post;

        // afterUpload mode
        if (this.target.dataset.pic) {
            this.imageUrl = this.target.dataset.pic;
            this.switchUI("afterUpload");
        } else {
            this.imageUrl = null;
        }

        let progress = this._createProgress();
        let loadingContent = this._createLoadingContent(progress);

        this.ui = {
            input: this.target.querySelector('input'),
            progress: progress,
            label: this.target.querySelector('label'),
            labelContent: this.target.querySelector('label > div'),
            loadingContent: loadingContent
        }

        // events
        this.listen();

    }

    _createProgress() {
        let progress = document.createElement("progress");
        progress.value = 0;
        progress.max = 100;
        return progress;
    }

    _createLoadingContent(progress) {
        let container = document.createElement('div');
        let message = document.createElement('div');
        message.innerHTML = "Téléchargement en cours..."
        container.appendChild(message);
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

            this.target.classList.remove('colibri--afterUpload');
            this.target.classList.add('colibri--dragover');

        });

        this.target.addEventListener('dragleave', (e) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.enterTarget == e.target){
                this.target.classList.remove('colibri--dragover');
                if(this.currentUi == AFTER_UPLOAD) {
                    this.target.classList.add('colibri--afterUpload');
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
            this.target.classList.remove('colibri--dragover');
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
                this.target.classList.add('colibri--duringUpload');
            }

            this.target.classList.remove('colibri--afterUpload');

            if(this.currentUi !== DURING_UPLOAD) {
                this.ui.label.replaceChild(this.ui.loadingContent, this.ui.labelContent);
            }
            this.currentUi = DURING_UPLOAD;
            break;

            case "afterUpload":
            this.currentUi = AFTER_UPLOAD;
            this.target.classList.remove('colibri--duringUpload');
            this.ui.label.replaceChild(this.ui.labelContent, this.ui.loadingContent);
            this.target.style.backgroundImage = "url(" + this.imageUrl + ")";
            this.target.classList.add('colibri--afterUpload');
            break;

            default:

        }
    }

}

module.exports = Colibri;
