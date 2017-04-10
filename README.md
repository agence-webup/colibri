# Colibri

A light and easy to use AJAX uploader.

![](https://media.giphy.com/media/l4FGp62U3cIVgrTxu/giphy.gif)

## Install

### NPM

```
npm install colibri.js
```

### Standalone

Import CSS:

```html
<link rel="stylesheet" href="colibri.css">
```

Import JS:

```html
<script src="colibri.js"></script>
```

## Use

Colibri is fully extensible via HTML and CSS and requires just a minimum markup:

```html
 <div class="colibri" id="colibri" data-pic="" data-post="http://localhost:5000/upload">
     <label for="file">
         <div>Choose a picture</div>
     </label>
     <input type="file" name="file" id="file" data-message="Upload in progress...">
 </div>
```

Then instanciate colibri:

```html
var colibri = new Colibri('#colibri');
```

Importants elements:

* **class** colibri CSS class
* **data-pic** if there is already a picture (leave empty for the first upload) 
* **data-post** URL where the post request will be processed
* **label** put evering you want in it (don't forget the div!)
* **input** connect input to label (for attribute) and customize uploading message

Another example (PHP):

```html
 <div class="colibri" id="colibri" data-pic="<?php echo $uploadedPic ?>" data-post="/upload.php">
     <label for="file">
                <div>
                    <svg class="colibri__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                        <path d="M69.27 42.085L51.448 20.67c-.437-.523-.95-.714-1.447-.68-.496-.034-1.01.157-1.447.68L30.73 42.086c-1.1 1.32-.462 3.494 1.445 3.494h7.48v32.385c0 1.116.93 2.047 2.046 2.047h16.6c1.115 0 2.046-.93 2.046-2.047V45.58h7.48c1.906 0 2.545-2.176 1.445-3.495z"/>
                        <path d="M50 0C22.386 0 0 22.386 0 50s22.386 50 50 50 50-22.386 50-50S77.614 0 50 0zm0 92C26.804 92 8 73.195 8 50 8 26.804 26.804 8 50 8c23.195 0 42 18.804 42 42 0 23.195-18.805 42-42 42z"/>
                    </svg>
                    Choose a picture <br> <span class="smaller">(minimum 1280px)</span>
                </div>
        </label>
     <input type="file" name="file" id="file" data-message="Upload in progress...">
 </div>
```

## Contribute

There is already a small express server capable of receiving the upload.

```bash
npm install
npm run dev
```

