/**
 * FILE VIEWER
 * Bruno Migliaretti 2022
 * */
(function (win) {
    class Swipe {
        constructor(options) {
            this.xDown = null;
            this.yDown = null;

            this.options = options;

            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchMove = this.handleTouchMove.bind(this);

            document.addEventListener('touchstart', this.handleTouchStart, false);
            document.addEventListener('touchmove', this.handleTouchMove, false);

        }

        onLeft() {
            this.options.onLeft();
        }

        onRight() {
            this.options.onRight();
        }

        onUp() {
            this.options.onUp();
        }

        onDown() {
            this.options.onDown();
        }

        static getTouches(evt) {
            return evt.touches // browser API

        }

        handleTouchStart(evt) {
            const firstTouch = Swipe.getTouches(evt)[0];
            this.xDown = firstTouch.clientX;
            this.yDown = firstTouch.clientY;
        }

        handleTouchMove(evt) {
            if (!this.xDown || !this.yDown) {
                return;
            }

            let xUp = evt.touches[0].clientX;
            let yUp = evt.touches[0].clientY;

            let xDiff = this.xDown - xUp;
            let yDiff = this.yDown - yUp;


            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                /*most significant*/
                if (xDiff > 0 && this.options.onLeft) {
                    /* left swipe */
                    this.onLeft();
                } else if (this.options.onRight) {
                    /* right swipe */
                    this.onRight();
                }
            } else {
                if (yDiff > 0 && this.options.onUp) {
                    /* up swipe */
                    this.onUp();
                } else if (this.options.onDown) {
                    /* down swipe */
                    this.onDown();
                }
            }

            /* reset values */
            this.xDown = null;
            this.yDown = null;
        }
    }
    win.MBSwiper = new Swipe();
})(window);

class MB_File {
    constructor(url, type, gal) {
        this.Url = url;
        this.Name = this.Url.substr(this.Url.lastIndexOf('/') + 1);
        this.gallery = gal;
        let extpos = this.Url.lastIndexOf('.');
        let ext = '';
        if (extpos > -1) {
            ext = this.Url.substr(extpos);
        }
        this.extension = ext;
        this.directory = this.Url.substr(0, this.Url.lastIndexOf('/'));
        if (this.supportPdf())
            this.filetypes.iframe = ['.pdf'];

        if (type)
            this.Type = type;
        else {
            for (const prop in this.filetypes) {
                if (this.filetypes[prop].indexOf(this.extension) > -1)
                    this.Type = prop;
            }
        }
        this.id = Math.floor(Math.random() * 10000000000);
    }
    id = 0;
    Name = "";
    Url = "";
    ext = "";
    gallery = "";
    filetypes = {
        "image": ('.jpg,.jpeg,.svg,.gif,.png').split(','),
        "video": ('.mov,.mpeg,.mp4').split(','),
        "audio": ('.mp3,.wav').split(',')
        //,"iframe": ['.pdf']
    }
    Type = 'other';

    get isSameOrigin() {
        let uri2 = window.location.href;
        let uri1 = this.Url;
        uri1 = new URL(uri1);
        uri2 = new URL(uri2);
        if (uri1.host !== uri2.host) return false;
        if (uri1.port !== uri2.port) return false;
        if (uri1.protocol !== uri2.protocol) return false;
        return true;
    }

    supportPdf() {
        function hasAcrobatInstalled() {
            function getActiveXObject(name) {
                try {
                    return new ActiveXObject(name);
                } catch (e) {}
            }

            return getActiveXObject('AcroPDF.PDF') || getActiveXObject('PDF.PdfCtrl')
        }

        function isIos() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
        }

        return navigator.mimeTypes['application/pdf'] || hasAcrobatInstalled() || isIos();
    }


}

class FM_Viewer {
    constructor(selector) {
        try {

            this.element = document.querySelector(selector);
            if (!this.element) {
                let id = 'fm-' + Math.floor(Math.random() * 1000000000);
                this.element = document.createElement('div');
                this.element.classList.add('fm-viewer');
                this.element.classList.add('off-screen');
                this.element.id = id;
                this.element.innerHTML = this.viewerTemplate;
                document.body.appendChild(this.element);
            }

            this.btnChoose = this.element.querySelector('[data-action="select-file"]');
            this.btnDownload = this.element.querySelector('[data-action="download-file"]');
            this.btnPrevious = this.element.querySelector('[data-action="previous"]');
            this.btnNext = this.element.querySelector('[data-action="next"]');
            this.btnClose = this.element.querySelector('[data-action="close-viewer"]');
            this.btnFullScreenToggle = this.element.querySelector('[data-action="toggle-fullscreen"]');
            this.btnFullScreenOn = this.element.querySelector('[data-action="fullscreen-on"]');
            this.btnFullScreenOff = this.element.querySelector('[data-action="fullscreen-off"]');
        } catch (e) {
            console.log(e);
        }
        this.initButtons();
        window.MBSwiper.options = {
            onLeft: () => this.next(),
            onRight: () => this.previous(),
            onUp: () => this.hide()
        };
        this.element.addEventListener('fullscreenchange', event => {
            let icon = null;
            if (this.btnFullScreenToggle)
                icon = self.btnFullScreenToggle.querySelector('.fa');

            if (document.fullscreenElement) {
                if (icon) {
                    icon.classList.remove('fa-arrows-alt');
                    icon.classList.add('fa-compress');
                }
                if (this.btnFullScreenOn)
                    this.btnFullScreenOn.classList.add('d-none');
                if (this.btnFullScreenOff)
                    this.btnFullScreenOff.classList.remove('d-none');
            } else {
                if (icon) {
                    icon.classList.add('fa-arrows-alt');
                    icon.classList.remove('fa-compress');
                }
                if (this.btnFullScreenOn)
                    this.btnFullScreenOn.classList.remove('d-none');
                if (this.btnFullScreenOff)
                    this.btnFullScreenOff.classList.add('d-none');
            }
        })
    }

    element = null;
    files = [];
    _currentFile = -1;
    btnNext = null;
    btnPrevious = null;
    btnChoose = null;
    btnClose = null;
    btnDownload = null;
    btnFullScreen = null;
    _currentId = 0;
    gallery = [];
    galleryIndex = 0;

    set currentId(val) {
        this._currentId = val;
        for (let index = 0; index < this.files.length; index++) {
            if (this.files[index].id == val) {
                this.currentFile = index;
                break;
            }
        }
        this.galleryIndex = this.gallery.indexOf(val);
    }
    get currentId() {
        return this._currentId;
    }

    get currentFile() {
        return this._currentFile;
    }

    set currentFile(val) {
        this._currentFile = val;
        if (val < 0 || val >= this.gallery.length) return;
    }

    get nextItem() {
        this.galleryIndex++;
        if (this.galleryIndex >= this.gallery.length)
            this.galleryIndex = 0;
        return this.gallery[this.galleryIndex];
    }

    get previousItem() {
        this.galleryIndex--;
        if (this.galleryIndex < 0)
            this.galleryIndex = this.gallery.length - 1;
        return this.gallery[this.galleryIndex];
    }

    get viewerTemplate() {
        return `<nav class="fm-navbar" role="navigation">
                    <h3 class="viewer-title"></h3>
                    <ul class="fm-navbar-nav">
                        <li class="">
                            <button type="button" data-action="download-file" title="Scarica" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M.6 13.7c0-.6.6-1.1 1.1-1.1s1.1.6 1.1 1.1v5.7c0 1.3 1 2.3 2.3 2.3h13.6c1.3 0 2.3-1 2.3-2.3v-5.7c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1v5.7c0 2.5-2 4.5-4.5 4.5H5.2c-2.5 0-4.5-2-4.5-4.5-.1-3.4-.1-5.3-.1-5.7z"
                                        opacity=".5" fill="#fff" />
                                    <path
                                        d="M12 16c-.6 0-1.1-.5-1.1-1.1V1.2c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1v13.6c0 .7-.5 1.2-1.1 1.2z"
                                        fill-rule="evenodd" clip-rule="evenodd" fill="#fff" />
                                    <path
                                        d="M16.9 9.5c.4-.5 1.1-.5 1.6 0s.4 1.2 0 1.6l-5.7 5.7c-.4.4-1.1.4-1.6 0l-5.7-5.1c-.5-.4-.5-1.1-.1-1.6.5-.5 1.2-.5 1.7-.1l4.9 4.4 4.9-4.9z"
                                        fill="#fff" />
                                </svg>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" data-action="previous" title="Precedente" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M18.4 2.9c.7-.7.7-1.8 0-2.4-.7-.7-1.8-.7-2.4 0L5.6 10.8c-.6.6-.6 1.7 0 2.4L15 23.4c.6.7 1.7.7 2.4.1s.7-1.7.1-2.4L9.2 12l9.2-9.1z"
                                        fill="#fff" />
                                </svg>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" data-action="next" title="Successivo" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M5.6 2.9C5 2.3 5 1.2 5.6.5c.7-.7 1.8-.7 2.4 0l10.3 10.3c.6.6.7 1.7.1 2.4L9 23.4c-.6.7-1.7.7-2.4.1s-.7-1.7-.1-2.4l8.3-9.1-9.2-9.1z"
                                        fill="#fff" />
                                </svg>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" data-action="fullscreen-on" title="Fullscreen on" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M9.9 12L2.2 4.3c-.6-.6-.6-1.5 0-2.1s1.5-.6 2.1 0L12 9.9 21.3.6c.6-.6 1.5-.6 2.1 0s.6 1.5 0 2.1L14.1 12l9.3 9.3c.6.6.6 1.5 0 2.1s-1.5.6-2.1 0L12 14.1l-7.7 7.7c-.6.6-1.5.6-2.1 0s-.6-1.5 0-2.1L9.9 12z"
                                        opacity=".7" fill-rule="evenodd" clip-rule="evenodd" fill="#fff" />
                                    <path
                                        d="M3 21h4.5c1 .2 1.5.7 1.5 1.5s-.5 1.3-1.5 1.5H0v-7.5c0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5V21zm18 0v-4.5c.2-1 .7-1.5 1.5-1.5s1.3.5 1.5 1.5V24h-7.5c-1 0-1.5-.5-1.5-1.5s.5-1.5 1.5-1.5H21zm0-18h-4.5c-1-.2-1.5-.7-1.5-1.5S15.5.2 16.5 0H24v7.5c0 1-.5 1.5-1.5 1.5S21 8.5 21 7.5V3zM3 3v4.5C2.8 8.5 2.3 9 1.5 9S.2 8.5 0 7.5V0h7.5C8.5 0 9 .5 9 1.5S8.5 3 7.5 3H3z"
                                        fill="#fff" />
                                </svg>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" data-action="fullscreen-off" title="Fullscreen off" class="btn btn-dark">
                                <svg version="1.1" id="prefix__Livello_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0"
                                    viewBox="0 0 24 24" xml:space="preserve">
                                    <style>
                                        .prefix__st2 {
                                            fill: none;
                                            stroke: #fff;
                                            stroke-width: 2.9537;
                                            stroke-linecap: round;
                                            stroke-miterlimit: 10
                                        }
                                    </style>
                                    <path id="prefix__Bound" fill="none" d="M0 0h24v24H0z" />
                                    <path id="prefix__Combined-Shape_00000038379922521257236590000010407855033361335999_"
                                        d="M6.1 17.9H1.7c-1-.1-1.5-.6-1.5-1.5s.4-1.3 1.5-1.5H9v7.4c0 1-.4 1.5-1.5 1.5S6 23.4 6 22.3v-4.4zm11.8 0v4.4c-.1 1-.6 1.5-1.5 1.5s-1.3-.4-1.5-1.5V15h7.4c1 0 1.5.4 1.5 1.5s-.4 1.5-1.5 1.5h-4.4zm0-11.8h4.4c1 .1 1.5.6 1.5 1.5s-.4 1.3-1.5 1.4H15V1.7c0-1 .4-1.5 1.5-1.5S18 .6 18 1.7v4.4zm-11.8 0V1.7C6.2.7 6.7.2 7.6.2S8.9.6 9 1.7V9H1.7C.7 9 .2 8.6.2 7.5S.6 6 1.7 6h4.4z"
                                        fill="#fff" />
                                    <path class="prefix__st2"
                                        d="M7.3 7.1L1.8 1.7M22.3 22.2l-5.4-5.5M7.3 16.9l-5.5 5.4M22.5 1.7L17 7.1" />
                                    <circle cx="12" cy="12.1" r="2.2" opacity=".7" fill="#fff" />
                                </svg>
                            </button>
                        </li>
                        <li class="">
                            <button type="button" data-action="close-viewer" title="Chiudi" class="btn btn-dark">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <g fill-rule="evenodd" clip-rule="evenodd" fill="#fff">
                                        <path
                                            d="M.616 20.556L20.556.616a2.006 2.006 0 012.828 0c.778.777.778 2.05 0 2.828l-19.94 19.94a2.006 2.006 0 01-2.828 0 2.006 2.006 0 010-2.828z" />
                                        <path
                                            d="M3.444.616l19.94 19.94c.778.778.778 2.05 0 2.828a2.006 2.006 0 01-2.828 0L.616 3.444a2.006 2.006 0 010-2.828 2.006 2.006 0 012.828 0z" />
                                    </g>
                                </svg>
                            </button>
                        </li>
                    </ul>
                </nav>`
    }

    initLinks() {
        const links = document.querySelectorAll('[data-fmviewer]');
        const self = this;
        for (let index = 0; index < links.length; index++) {
            const element = links[index];
            const gal = element.getAttribute('data-fmviewer') || "";
            const url = element.href;
            let type = element.getAttribute('data-type');
            const fi = new MB_File(url, type, gal);
            self.files.push(fi);
            element.addEventListener('click', function (e) {

                e.preventDefault();
                self.show(fi);
            })
        }
    }

    addItemToGallery(gallery, item) {
        if (gallery.length == 0)
            gallery.push(item);
        else {
            var found = false;
            gallery.every(elem => {
                if (elem.Url == item.Url) {
                    found = true;
                    return false;
                }
            });
            if (!found) gallery.push(item);
        }
    }


    initButtons() {
        const self = this;
        if (this.btnClose)
            this.btnClose.addEventListener('click', function () {
                self.hide();
            });
        if (this.btnNext)
            this.btnNext.addEventListener('click', function () {
                self.next();
            });
        if (this.btnPrevious)
            this.btnPrevious.addEventListener('click', function () {
                self.previous();
            });
        if (this.btnDownload)
            this.btnDownload.addEventListener('click', function () {
                self.downloadCurrent();
            });
        if (this.btnFullScreenToggle)
            this.btnFullScreenToggle.addEventListener('click', function () {
                self.toggleFullScreen();
            });
        if (this.btnFullScreenOn)
            this.btnFullScreenOn.addEventListener('click', function () {
                self.toggleFullScreen();
            });
        if (this.btnFullScreenOff)
            this.btnFullScreenOff.addEventListener('click', function () {
                self.toggleFullScreen();
            });
        this.initLinks();
    }

    show(fi) {
        this.element.classList.remove('off-screen');
        this.gallery = [];
        var galItems = [];
        for (let index = 0; index < this.files.length; index++) {
            const element = this.files[index];
            if (element.gallery && element.gallery == fi.gallery)
                galItems.push(element.id);
        }

        this.gallery = galItems.length > 0 ? galItems : [fi.id];
        this.render(fi.id);
        if (this.gallery.length > 1) {
            this.btnNext.classList.remove('disabled');
            this.btnPrevious.classList.remove('disabled');
        } else if (this.gallery) {
            this.btnNext.classList.add('disabled');
            this.btnPrevious.classList.add('disabled');
        }

    }

    hide() {
        const self = this;
        if (document.fullscreenElement)
            document.exitFullscreen();
        this.hideCurrentFile().then(esito => self.element.classList.add('off-screen'));
        this.currentFile = -1;
    }

    render(id) {
        const self = this;

        this.hideCurrentFile()
            .then(esito => {
                self.currentId = id;
                this.showCurrentFile().then(esito => {

                });
            })

    }

    hideCurrentFile(fade) {
        const self = this;
        const myFade = fade || 'fade-out';
        return new Promise(resolve => {
            if (self.currentFile == -1)
                resolve(true);
            else {
                const content = self.element.querySelector('.viewer-content');

                if (content) {
                    content.classList.add(myFade);
                    setTimeout(() => {
                        content.remove();
                        resolve(true);
                    }, 500);
                } else
                    resolve(false);
            }
        })
    }

    showCurrentFile(fade) {
        let myFile = this.files[this.currentFile];
        const myFade = fade || 'fade-in';
        if (myFile.isSameOrigin && this.btnDownload)
            this.btnDownload.classList.remove('d-none');
        else if (this.btnDownload)
            this.btnDownload.classList.add('d-none');
        return new Promise((resolve, reject) => {
            switch (myFile.Type) {
                case 'image':
                    this.showCurrentImage(myFade).then(result => {
                        resolve(result);
                    }).catch(error => reject(error));
                    break;
                case 'video':
                    this.showVideo(myFade).then(result => {
                        resolve(result);
                    }).catch(error => reject(error));
                    break;
                case 'audio':
                    break;
                case 'iframe':
                    this.showIframe(myFade).then(result => {
                        resolve(result);
                    }).catch(error => reject(error));
                    break
                default:
                    this.showUnHandledFile(myFade).then(result => {
                        resolve(result);
                    }).catch(error => reject(error));
                    break;
            }
        })
    }

    showCurrentImage(fade) {
        const self = this;
        const myFade = fade || 'fade-in';
        self.element.classList.add('loading');
        let myFile = this.files[this.currentFile];
        return new Promise(resolve => {
            let img = document.createElement('img');
            img.classList.add('viewer-content');
            img.classList.add(myFade);

            img.addEventListener('load', () => {
                self.element.appendChild(img);
                //img.classList.remove('fade-in');
                self.element.classList.remove('loading');
                setTimeout(() => {
                    img.classList.remove(myFade);
                    resolve(true);
                }, 300);
            });
            img.src = myFile.Url;
        })
    }

    showIframe(fade) {
        const myFade = fade || 'fade-in';
        const self = this;
        self.element.classList.add('loading');
        let myFile = this.files[this.currentFile];
        return new Promise(resolve => {
            let frame = document.createElement('iframe');
            frame.classList.add('viewer-content');
            frame.classList.add(myFade);
            frame.src = myFile.Url;
            self.element.appendChild(frame);
            self.element.classList.remove('loading');
            setTimeout(() => {
                frame.classList.remove(myFade);
                resolve(true);
            }, 300);
        })
    }

    showVideo(fade) {
        const myFade = fade || 'fade-in';
        const self = this;
        self.element.classList.add('loading');
        let myFile = this.files[this.currentFile];
        return new Promise(resolve => {
            let video = document.createElement('video');
            video.classList.add('viewer-content');
            video.classList.add(myFade);
            video.src = myFile.Url;
            video.setAttribute('controls', 'true');
            video.setAttribute('autoplay', 'true');
            self.element.appendChild(video);
            self.element.classList.remove('loading');
            setTimeout(() => {
                video.classList.remove(myFade);
                resolve(true);
            }, 300);
        })
    }

    showUnHandledFile(fade) {
        const myFade = fade || 'fade-in';
        const self = this;
        self.element.classList.add('loading');
        let myFile = this.files[this.currentFile];
        return new Promise(resolve => {
            let div = document.createElement('div');
            div.classList.add('viewer-content');
            div.classList.add('text-white');
            div.classList.add('text-center');
            div.classList.add(myFade);
            div.innerHTML = `   <h3>Anteprima non disponibile</h3> 
                                <p>Viewer non è in grado di visualizzare il file</p>
                                <div><a href="${myFile.Url}" download="${myFile.Name}" class="btn btn-warning">Scarica "${myFile.Name}"</button></div>`;
            self.element.appendChild(div);
            self.element.classList.remove('loading');
            setTimeout(() => {
                div.classList.remove(myFade);
                resolve(true);
            }, 300);
        })
    }

    downloadCurrent() {
        let url = this.files[this.currentFile].Url;
        let name = this.files[this.currentFile].Name;
        let link = document.createElement('a');
        link.download = name;
        link.href = url;
        link.click();
    }

    next() {
        const self = this;
        this.hideCurrentFile('fade-left').then(result => {
            self.currentId = self.nextItem;
            self.showCurrentFile('fade-right');
        })
    }

    previous() {
        const self = this;
        this.hideCurrentFile('fade-right').then(result => {
            self.currentId = self.previousItem;
            self.showCurrentFile('fade-left');
        })
    }

    toggleFullScreen() {
        const elem = this.element;
        if (!document.fullscreenElement) {
            elem.requestFullscreen()
                .catch(err => {
                    Swal.fire({
                        icon: 'error',
                        text: `Impossibile impostare la modalità "fullscreen": ${err.message} (${err.name})`
                    });
                });
        } else {
            document.exitFullscreen();
        }
    }

}