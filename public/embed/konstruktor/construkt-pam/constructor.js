var srcImg = 'images/construkt-pam/constructor/';
// создаём "оболочку" вокруг canvas элемента (id="c")
var canvas = new fabric.Canvas('c');

canvas.setBackgroundImage('images/construkt-pam/constructor/memorial/p1.png', canvas.renderAll.bind(canvas));

var HideControls = {
            'tl':true,
            'tr':false,
            'bl':true,
            'br':true,
            'ml':false,
            'mt':false,
            'mr':false,
            'mb':false,
            'mtr':true
        };

function addDeleteBtn(x, y){
    $(".deleteBtn").remove(); 
    var btnLeft = x-10;
    var btnTop = y-10;
    var deleteBtn = '<div class="deleteBtn" style="position:absolute;top:'+btnTop+'px;left:'+btnLeft+'px;cursor:pointer;width:20px;height:20px;">Х</div>';
    $(".canvas-container").append(deleteBtn);
}

canvas.on('object:selected',function(e){
        addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y);
});



canvas.on('mouse:down',function(e){
    if(!canvas.getActiveObject())
    {
        $(".deleteBtn").remove(); 
    }
});

canvas.on('object:modified',function(e){
    addDeleteBtn(e.target.oCoords.tr.x, e.target.oCoords.tr.y);
});

canvas.on('object:scaling',function(e){
    $(".deleteBtn").remove(); 
});
canvas.on('object:moving',function(e){
    $(".deleteBtn").remove(); 
});
canvas.on('object:rotating',function(e){
    $(".deleteBtn").remove(); 
});
$(document).on('click',".deleteBtn",function(){
    if(canvas.getActiveObject())
    {
        canvas.remove(canvas.getActiveObject());
        $(".deleteBtn").remove();
    }
});

$(document).ready(function () {

    var SKETCH_DESKTOP_BREAK = 801;

    function placeSketchActions() {
        var $actions = $('.sketch-actions');
        if (!$actions.length) {
            return;
        }
        if ($(window).width() >= SKETCH_DESKTOP_BREAK) {
            $('#constructor .right').append($actions);
        } else {
            $('.tabs-constructor_cont').after($actions);
        }
    }

    placeSketchActions();
    $(window).on('resize', placeSketchActions);

    if($(window).width() < 120) {
        // change functionality for smaller screens
        $('#constructor .left').after($('#slide-mem'));
    }

    $('#slide-mem img').on('click', function() {
        var src = $(this).attr('src');
        canvas.setBackgroundImage(src, canvas.renderAll.bind(canvas));
    });


    $(document).on('click', '.addImg img', function() {
        var src = $(this).attr('src') || $(this).attr('data-src');
        if (!src || src.indexOf('data:image/gif') === 0) {
            return;
        }
        fabric.Image.fromURL(src, function(img) {
            img.top = 60;
            img.left = 30;
            img.scaleToWidth(100);
            img.scaleToHeight(100);
            img.setControlsVisibility(HideControls);
            canvas.add(img);
        });
        canvas.renderAll();
    });

    download_img = function(el) {
        canvas.discardActiveObject();
        $(".deleteBtn").remove(); 
        var image = canvas.toDataURL("image/png");
        el.href = image;
    };

    $('#printCanvas').on('click', function printCanvas() {
        
        const dataUrl = canvas.toDataURL(); 

        let windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Эскиз памятника</title></head>';
        windowContent += '<body style="display:flex; justify-content: center;">';
        windowContent += '<div style="height: 550px; margin: 50px auto;">';
        windowContent += '<img style="max-height: 100%; max-width: 100%;" src="' + dataUrl + '">';
        windowContent += '</body>';
        windowContent += '</html>';

        const printWin = window.open('', '', 'width=' + screen.availWidth + ',height=700');
        printWin.document.open();
        printWin.document.write(windowContent); 

        printWin.document.addEventListener('load', function() {
            printWin.focus();
            printWin.print();
            printWin.document.close();
            printWin.close();            
        }, true);
    });

    $('#jsonCanvas').on('click', function () {
        $('#popup').css('display', 'block');
    });

    $('#popup .close').on('click', closePopup);

    function closePopup() {
        $('#popup').css('display', 'none');
        $('#popup .error').html('');
        $('#email').css('border', '1px solid #333');
        $('#email').val('');
    }

    $('#popup .button').on('click', sendImg);

    function setSendLoading(isLoading) {
        var $btn = $('#popup .button');
        if (isLoading) {
            $btn.prop('disabled', true).data('label', $btn.text()).text('Отправка…');
        } else {
            $btn.prop('disabled', false).text($btn.data('label') || 'ОТПРАВИТЬ');
        }
    }

    function sendImg() {
        var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var imgJson = canvas.toDataURL("image/png").replace("data:image/png;base64,", '');
        var email = $.trim($('#email').val());
        var imy = $.trim($('#imy').val());
        var telefon = $.trim($('#telefon').val());
        var urlref = $('#urlref').val();

        $('#popup .error').html('');

        if (email === '') {
            $('#popup .error').html('Поле e-mail не должно быть пустым!');
            $('#email').css('border', '1px solid rgb(230, 87, 87)');
            return;
        }

        if (email.search(pattern) !== 0) {
            $('#popup .error').html('Введите корректный Email');
            $('#email').css('border', '1px solid rgb(230, 87, 87)');
            return;
        }

        $('#email').css('border', '1px solid #333');
        setSendLoading(true);

        $.ajax({
            type: 'POST',
            url: '/api/send-sketch',
            data: { img: imgJson, email: email, imy: imy, telefon: telefon, urlref: urlref },
            timeout: 60000
        })
        .done(function () {
            closePopup();
            $('#imy').val('');
            $('#telefon').val('');
            alert('Эскиз отправлен на почту');
        })
        .fail(function (xhr) {
            var message = (xhr.responseText || '').trim() || 'Не удалось отправить письмо. Проверьте настройки SMTP на сервере.';
            $('#popup .error').html(message);
        })
        .always(function () {
            setSendLoading(false);
        });
    }

    //Аккордеон 
    $(".accordeon").on('click', function () {
        var $list = $(this).siblings('ul');
        if ($list.is(':visible')) {
            hidePanelLoader($list);
            $list.slideUp('slow');
            return;
        }
        $list.slideDown('slow', function () {
            loadPanelImages($list);
        });
    });

    function showPanelLoader($list) {
        hidePanelLoader($list);
        $list.append(
            '<div class="panel-loader-overlay" role="status" aria-live="polite">' +
            '<div class="panel-loader-spinner"></div>' +
            '<span class="panel-loader-text">Загрузка…</span></div>'
        );
        $list.addClass('panel-loading');
    }

    function hidePanelLoader($list) {
        $list.removeClass('panel-loading');
        $list.find('.panel-loader-overlay').remove();
    }

    function loadPanelImages($list) {
        var pending = [];

        $list.find('img').each(function () {
            var img = this;
            var dataSrc = img.getAttribute('data-src');
            var currentSrc = img.currentSrc || img.src || '';

            if (dataSrc) {
                pending.push(img);
                return;
            }

            if (currentSrc.indexOf('data:image/gif') === 0) {
                pending.push(img);
                return;
            }

            if (currentSrc && !img.complete) {
                pending.push(img);
            }
        });

        if (!pending.length) {
            return;
        }

        showPanelLoader($list);
        var remaining = pending.length;

        function onDone() {
            remaining--;
            if (remaining <= 0) {
                hidePanelLoader($list);
            }
        }

        pending.forEach(function (img) {
            var dataSrc = img.getAttribute('data-src');
            var finished = false;
            var timeoutId;

            function finish() {
                if (finished) {
                    return;
                }
                finished = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                img.onload = null;
                img.onerror = null;
                img.classList.remove('lazy-hidden');
                onDone();
            }

            img.onload = finish;
            img.onerror = finish;
            timeoutId = setTimeout(finish, 12000);

            if (dataSrc) {
                img.src = dataSrc;
                img.removeAttribute('data-src');
            }

            if (img.complete && img.naturalWidth > 1) {
                finish();
            }
        });
    }


 // Define an array with all fonts
var fonts = ['Roboto', 'Roboto Condensed', 'Roboto Slab', 'Poiret One', 'Playfair Display','Oswald','Open Sans Condensed','Open Sans','Marck Script','Lobster','Kelly Slab','Gabriela','EB Garamond','Cormorant Infant','Bad Script'];

WebFont.load({
    google: {
        families: fonts
    },
    active: function() {
            
        $('.addText li').on('click', function () {
            var selectFont = ($(this).data('font'));
            var text = ($(this).data('text'));
            addText(text, 100, selectFont);
        });
        
        
        function addText (text, top, selectFont) {      
            var textbox = new fabric.Textbox(text, { 
                    left: 80,
                    top: top,
                    width: 150,
                    fontFamily: selectFont,
                    fill: '#fff'
                });
            canvas.add(textbox).setActiveObject(textbox);
            return textbox;
        }

        addText('Ваш текст', 400);
        canvas.forEachObject (function (o) { 
            if (o.type == 'text') 
            { 
            o._charWidthsCache = {}; 
            o._clearCache (); 
            } 
            });

        var fontFamilyEl = document.getElementById('font-family');
        if (fontFamilyEl) {
            fontFamilyEl.onchange = function() {
                canvas.getActiveObject().set("fontFamily", this.value);
                canvas.requestRenderAll();
            };
        }

    },
});
    
    // });

    
});