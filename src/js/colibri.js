"use strict";

class Colibri {

    constructor(target, options) {
        this.target = document.querySelector(target);

        this.postUrl = this.target.dataset.post;

        // afterUpload mode
        if(this.target.dataset.pic) {
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
        // on new file
        this.ui.input.addEventListener('change', () => {
            this.uploadAttempt();
        });
    }

    uploadAttempt() {
        var formData = new FormData();
        formData.append('picture', this.ui.input.files[0]);

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

        xhr.open('POST',this.postUrl, true);

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

}

module.exports = Colibri;
