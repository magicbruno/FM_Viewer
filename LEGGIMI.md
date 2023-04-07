# 1. FM Viewer
Semplice visualizzatore di file javascript.

[Demo e documentazione.](https://magicbruno.github.io/FM_Viewer/)

## 1.1. introduzione
FM Viewer è un semplice visualizzatore di file e gallerie la cui interfaccia utente è modellata sulla popolare componente JavaScript FancyBox. 

Caratteristiche principali:
- Completamente gratuito e open source
- Nessuna dipendenza
- Molto leggero (JS + CSS circa 20 kb *minimized*)
- Completamente personalizzabile
- Scritto usando le classi ES6
- Funziona in tutti i *modern browsers*

## 1.2. Per iniziare

Installa Fm_viewer tramite NPM:
```
npm install @magicbruno/fm_viewer
```
o collegalo direttamente da CDN:
```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@magicbruno/fm_viewer@1.0.1/dist/css/file-man.min.css">
<script src="https://cdn.jsdelivr.net/npm/@magicbruno/fm_viewer@1.0.1/FM_Viewer.min.js"></script>
```

Se preferisci puoi [scaricarlo](https://github.com/magicbruno/FM_Viewer/archive/refs/heads/main.zip) o clonare il repository. I file si trovano nella cartella **dist**.

Collega il foglio di stile nella `head` della tua pagina:

```
<head>
...
    <link rel="stylesheet" href="..../file-man.css">
...
</head>
```
 
Collega lo script alla fine del `body` della pagina HTML

```
<script src="..../FM_Viewer.js"></script>
```
e quindi crea un'istanza della classe FM_Viewer per inizializzare il viewer.
```
<script>
    (function(win){
        win.TheViewer = new FM_Viewer(<selector>);
    })(window);
</script>
```
Il parametro `<selector>` è l'elemento HTML su cui è costruito il viewer. 
## 1.3. Uso di base
Se si crea l'istanza del viewer senza parametri, FM_VIEWER costruirà l'elemento html al volo e lo aggiungerà al `body` della pagina.

```
const TheViewer = new FM_Viewer();
```
Tutti gli elementi `<a>` che hanno l'attributo `data-fmviewer` vengono registrati dal viewer al caricamento del documento (evento `DomContentLoad`).  Quando cliccati il link a cui punta il loro `href` sarà aperto nel viewer.

È possibile specificare il tipo di documento da mostrare utilizzando l'attributo `data-type`. I tipi validi sono: `image`, `video`, `audio` e `iframe`.

 > #### NOTE
 >- Il viewer prova a determinare il tipo di documento collegato dall'estensione del file. Se il collegamento è un'URL senza estensione, è necessario specificare il tipo utilizzando l'attributo `data-type`.
 >- Utilizza il tipo `video` solo per i collegamenti a file video. Per video Vimeo o YouTube usa invece il tipo `iFrame` (vedi esempio).

Se si aggiungono elementi `<a>` dopo il caricamento del documento, ad esempio tramite chiamata Ajax, è possibile chiamare il metodo di aggiornamento del viewer per aggiungere i nuovi link ai link registrati.

```
TheViewer.refresh();
```


Ecco il codice aggiunto al `body` del documento per impostazione predefinita. È possibile fornire invece inserire nel `body` il tuo viewer personalizzato e passare il selettore al costruttore FM_Viewer().

```
<div class="fm-viewer off-screen" id="fm-828573602">
    <nav class="fm-navbar" role="navigation">
        <h3 class="viewer-title"></h3>
        <ul class="fm-navbar-nav" style="margin-left:auto">
            <li class="">
                <button type="button" data-action="download-file" title="Scarica" class="btn btn-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M.6 13.7c0-.6.6-1.1 1.1-1.1s1.1.6 1.1 1.1v5.7c0 1.3 1 2.3 2.3 2.3h13.6c1.3 0 2.3-1 2.3-2.3v-5.7c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1v5.7c0 2.5-2 4.5-4.5 4.5H5.2c-2.5 0-4.5-2-4.5-4.5-.1-3.4-.1-5.3-.1-5.7z" opacity=".5" fill="#fff"></path>
                        <path d="M12 16c-.6 0-1.1-.5-1.1-1.1V1.2c0-.6.5-1.1 1.1-1.1.6 0 1.1.5 1.1 1.1v13.6c0 .7-.5 1.2-1.1 1.2z" fill-rule="evenodd" clip-rule="evenodd" fill="#fff"></path>
                        <path d="M16.9 9.5c.4-.5 1.1-.5 1.6 0s.4 1.2 0 1.6l-5.7 5.7c-.4.4-1.1.4-1.6 0l-5.7-5.1c-.5-.4-.5-1.1-.1-1.6.5-.5 1.2-.5 1.7-.1l4.9 4.4 4.9-4.9z" fill="#fff"></path>
                    </svg>
                </button>
            </li>
            <li class="">
                <button type="button" data-action="previous" title="Precedente" class="btn btn-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M18.4 2.9c.7-.7.7-1.8 0-2.4-.7-.7-1.8-.7-2.4 0L5.6 10.8c-.6.6-.6 1.7 0 2.4L15 23.4c.6.7 1.7.7 2.4.1s.7-1.7.1-2.4L9.2 12l9.2-9.1z" fill="#fff"></path>
                    </svg>
                </button>
            </li>
            <li class="">
                <button type="button" data-action="next" title="Successivo" class="btn btn-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M5.6 2.9C5 2.3 5 1.2 5.6.5c.7-.7 1.8-.7 2.4 0l10.3 10.3c.6.6.7 1.7.1 2.4L9 23.4c-.6.7-1.7.7-2.4.1s-.7-1.7-.1-2.4l8.3-9.1-9.2-9.1z" fill="#fff"></path>
                    </svg>
                </button>
            </li>
            <li class="">
                <button type="button" data-action="fullscreen-on" title="Fullscreen on" class="btn btn-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" d="M0 0h24v24H0z"></path>
                        <path d="M9.9 12L2.2 4.3c-.6-.6-.6-1.5 0-2.1s1.5-.6 2.1 0L12 9.9 21.3.6c.6-.6 1.5-.6 2.1 0s.6 1.5 0 2.1L14.1 12l9.3 9.3c.6.6.6 1.5 0 2.1s-1.5.6-2.1 0L12 14.1l-7.7 7.7c-.6.6-1.5.6-2.1 0s-.6-1.5 0-2.1L9.9 12z" opacity=".7" fill-rule="evenodd" clip-rule="evenodd" fill="#fff"></path>
                        <path d="M3 21h4.5c1 .2 1.5.7 1.5 1.5s-.5 1.3-1.5 1.5H0v-7.5c0-1 .5-1.5 1.5-1.5s1.5.5 1.5 1.5V21zm18 0v-4.5c.2-1 .7-1.5 1.5-1.5s1.3.5 1.5 1.5V24h-7.5c-1 0-1.5-.5-1.5-1.5s.5-1.5 1.5-1.5H21zm0-18h-4.5c-1-.2-1.5-.7-1.5-1.5S15.5.2 16.5 0H24v7.5c0 1-.5 1.5-1.5 1.5S21 8.5 21 7.5V3zM3 3v4.5C2.8 8.5 2.3 9 1.5 9S.2 8.5 0 7.5V0h7.5C8.5 0 9 .5 9 1.5S8.5 3 7.5 3H3z" fill="#fff"></path>
                    </svg>
                </button>
            </li>
            <li class="">
                <button type="button" data-action="fullscreen-off" title="Fullscreen off" class="btn btn-dark">
                    <svg version="1.1" id="prefix__Livello_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 24 24" xml:space="preserve">
                        <style>
                            .prefix__st2 {
                                fill: none;
                                stroke: #fff;
                                stroke-width: 2.9537;
                                stroke-linecap: round;
                                stroke-miterlimit: 10
                            }
                        </style>
                        <path id="prefix__Bound" fill="none" d="M0 0h24v24H0z"></path>
                        <path id="prefix__Combined-Shape_00000038379922521257236590000010407855033361335999_" d="M6.1 17.9H1.7c-1-.1-1.5-.6-1.5-1.5s.4-1.3 1.5-1.5H9v7.4c0 1-.4 1.5-1.5 1.5S6 23.4 6 22.3v-4.4zm11.8 0v4.4c-.1 1-.6 1.5-1.5 1.5s-1.3-.4-1.5-1.5V15h7.4c1 0 1.5.4 1.5 1.5s-.4 1.5-1.5 1.5h-4.4zm0-11.8h4.4c1 .1 1.5.6 1.5 1.5s-.4 1.3-1.5 1.4H15V1.7c0-1 .4-1.5 1.5-1.5S18 .6 18 1.7v4.4zm-11.8 0V1.7C6.2.7 6.7.2 7.6.2S8.9.6 9 1.7V9H1.7C.7 9 .2 8.6.2 7.5S.6 6 1.7 6h4.4z" fill="#fff"></path>
                        <path class="prefix__st2" d="M7.3 7.1L1.8 1.7M22.3 22.2l-5.4-5.5M7.3 16.9l-5.5 5.4M22.5 1.7L17 7.1"></path>
                        <circle cx="12" cy="12.1" r="2.2" opacity=".7" fill="#fff"></circle>
                    </svg>
                </button>
            </li>
            <li class="">
                <button type="button" data-action="close-viewer" title="Chiudi" class="btn btn-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill-rule="evenodd" clip-rule="evenodd" fill="#fff">
                            <path d="M.616 20.556L20.556.616a2.006 2.006 0 012.828 0c.778.777.778 2.05 0 2.828l-19.94 19.94a2.006 2.006 0 01-2.828 0 2.006 2.006 0 010-2.828z"></path>
                            <path d="M3.444.616l19.94 19.94c.778.778.778 2.05 0 2.828a2.006 2.006 0 01-2.828 0L.616 3.444a2.006 2.006 0 010-2.828 2.006 2.006 0 012.828 0z"></path>
                        </g>
                    </svg>
                </button>
            </li>
        </ul>
    </nav>
</div>
```
FM Viewer non ha dipendenze. Non hai bisogno né di jQuery, né di Bootstrap e le icone sono SVG incorporati nel codice. Devi solo caricare il suo foglio di stile.

## 1.4. Personalizzazione 
È possibile personalizzare il tuo FM_Viewer che realizzando l'interfaccia in HTML e/o modificando il foglio di stile.

L'esempio seguente espone solo i pulsanti di base (`close-viewer`, `next` e `previous`) con icone personalizzate e consente la chiusura del visualizzatore facendo clic sul backdrop.

```
    <div class="fm-viewer off-screen" id="theViewer" data-action="close-viewer">
        <a href="javascript:;" data-action="close-viewer">
            <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <defs>
                    <style>
                        .b {
                            fill: none;
                            stroke: #fff;
                            stroke-linecap: round;
                            stroke-miterlimit: 10;
                            stroke-width: 8.68px;
                        }
                    </style>
                </defs>
                <line class="b" x1="39.9" y1="38.47" x2="140.53" y2="139.1" />
                <line class="b" x1="39.47" y1="139.53" x2="140.1" y2="38.9" />
            </svg>
        </a>
        <a href="javascript:;" data-action="next">
            <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <defs>
                    <style>
                        .b {
                            fill: none;
                            stroke: #fff;
                            stroke-linecap: round;
                            stroke-miterlimit: 10;
                            stroke-width: 8.75px;
                        }
                    </style>
                </defs>
                <line class="b" x1="64.84" y1="38.28" x2="115.6" y2="89.03" />
                <line class="b" x1="64.4" y1="140.22" x2="115.6" y2="89.03" />
            </svg>
        </a>
        <a href="javascript:;" data-action="previous">
            <svg id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <defs>
                    <style>
                        .b {
                            fill: none;
                            stroke: #fff;
                            stroke-linecap: round;
                            stroke-miterlimit: 10;
                            stroke-width: 8.79px;
                        }
                    </style>
                </defs>
                <line class="b" x1="115.27" y1="38.05" x2="64.29" y2="89.03" />
                <line class="b" x1="115.71" y1="140.45" x2="64.29" y2="89.03" />
            </svg>
        </a>
        <footer><div class="viewer-title d-none"></div></footer>
    </div>
```
La funzionalità degli elementi e le azioni dei pulsanti sono definite tramite classi CSS e attributi `data-`:

|Elemento (selettore CSS)|Tipo|Funzionalità/Azione|
|---|---|---|
|`.fm-viewer`|element|Container per il viewer (obbligatorio). Aggiungi la classe `off-screen` se desideri che lo spettatore sia inizialmente fuori schermo.|
|`.viewer-title`|element|Titolo/didascalia ottenuta dall'attributo `title` dell'elemento `<a>`. Nascosto se vuoto.|
|`[data-action="close-viewer"]`|button or element|Chiude il viewer. Se aggiunto al contenitore del viewer stesso consente di chiudere il viewer facendo clic sul backdrop.|
|`[data-action="download-file"]`|button|Avvia il download del file. Disponibile solo per i file provenienti dallo stesso dominio del viewer, altrimenti nascosto.|
|`[data-action="previous"]`|button|Mostra il file precedente nella galleria.|
|`[data-action="next"]`|button|Mostra il file successivo nella galleria.|
|`[data-action="fullscreen-on"]`|button|Apre la visualizzazione a schermo intero. Nascosto automaticamente se la visualizzazione a schermo intero è attiva.|
|`[data-action="fullscreen-off"]`|button|Chiude la visualizzazione a schermo intero. Nascosto automaticamente se la visualizzazione a schermo intero non è attiva.|


