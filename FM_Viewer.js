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
            return evt.touches      // browser API

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


            if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
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
    constructor(url, type) {
        this.Url = url;
        this.Name = this.Url.substr(this.Url.lastIndexOf('/') + 1);
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
    }
    Name = "";
    Url = "";
    ext = "";
    filetypes = {
        "image": ('.jpg,.jpeg,.svg,.gif,.png').split(','),
        "video": ('.mov,.mpeg,.mp4').split(','),
        "audio": ('.mp3,.wav').split(',')
        //,"iframe": ['.pdf']
    }
    Type = 'other';
    supportPdf() {
        function hasAcrobatInstalled() {
            function getActiveXObject(name) {
                try { return new ActiveXObject(name); } catch (e) { }
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

    set currentId(val) {
        this.currentFile = val;
        this._currentId = val;
    }

    get currentFile() {
        return this._currentFile;
    }

    set currentFile(val) {
        this._currentFile = val;
        if (val < 0 || val >= this.files.length) return;
        let title = this.element.querySelector('.viewer-title');
        if (title && val >= 0)
            title.innerHTML = this.files[val].Name || '';

    }

    get nextItem() {
        this.currentFile++;
        if (this.currentFile >= this.files.length)
            this.currentFile = 0;
        if (this.files[this.currentFile].Type == 'Folder')
            return this.nextItem;
        return this.currentFile;
    }

    get previousItem() {
        this.currentFile--;
        if (this.currentFile < 0)
            this.currentFile = this.files.length - 1;
        if (this.files[this.currentFile].Type == 'Folder')
            return this.previousItem;
        return this.currentFile;
    }

    initLinks() {
        const links = document.querySelectorAll('[data-fmviewer]');
        const self = this;
        for (let index = 0; index < links.length; index++) {
            const element = links[index];
            const gal = element.getAttribute('data-fmviewer');
            const galItems = [];

            element.addEventListener('click', function (e) {
                const galElements = document.querySelectorAll(`[data-fmviewer="${gal}"]`);
                var i = 0;
                galElements.forEach(item => {
                    let type = item.getAttribute('data-type');
                    galItems.push(new MB_File(item.href, type));
                    if (this.href == item.href)
                        i = galItems.length - 1;
                });
                e.preventDefault();
                self.show(i, galItems);
            })
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

    show(indexOrUrl, list) {
        this.element.classList.remove('off-screen');
        this.files = list || [];
        this.render(indexOrUrl);
        if (this.files.length > 1) {
            this.btnNext.classList.remove('disabled');
            this.btnPrevious.classList.remove('disabled');
        } else if (list) {
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

    render(indexOrUrl) {
        const self = this;
        if (Number.isInteger(indexOrUrl)) {
            this.hideCurrentFile()
                .then(esito => {
                    self.currentId = indexOrUrl;
                    this.showCurrentFile().then(esito => {

                    });
                })
        } else {
            this.files.push(new MB_File(indexOrUrl));
            this.currentFile = this.files.length - 1;
            this.showCurrentFile().then(esito => {

            })
        }
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
            self.currentFile = self.nextItem;
            self.showCurrentFile('fade-right');
        })
    }

    previous() {
        const self = this;
        this.hideCurrentFile('fade-right').then(result => {
            self.currentFile = self.previousItem;
            self.showCurrentFile('fade-left');
        })
    }

    toggleFullScreen() {
        const elem = this.element;
        const self = this;
        const icon = self.btnFullScreenToggle.querySelector('.fa');
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

