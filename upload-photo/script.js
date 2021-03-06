var krbb = {
    root: 'https://fish-ball.github.io/krbb-plugins/upload-photo'
};

// 先把 jQuery 替换掉
$('body').append('<script src="https://fish-ball.github.io/krbb-plugins/lib/jquery-2.1.4.min.js"></script>');

var jqLoaded = setInterval(function() {
    var version = jQuery.fn.jquery;
    console.log(version);
    if(version[0] == '2') {
        clearInterval(jqLoaded);
        main();
    }
}, 50);

var main = function() {

    // -----------------------------------
    //              库引入
    // -----------------------------------

    $.watch = function(fnCase) {
        return $.Deferred(function(dfd) {
            var itv = setInterval(function() {
                var obj = fnCase();
                if(obj) {
                    clearInterval(itv);
                    dfd.resolve(obj);
                }
            }, 50);
        }).promise();
    };

    // jquery.formdata.js
    (function(c){"function"===typeof define&&define.amd?define(["jquery"],c):c("undefined"!=typeof jQuery?jQuery:window.Zepto)})(function(c){var l=window.TextEncoder?function(c){c=(new TextEncoder("utf8")).encode(c);for(var a="",d=0;d<c.length;++d)a+=String.fromCharCode(c[d]);return a}:function(c){return eval("'"+encodeURI(c).replace(/%/gm,"\\x")+"'")};c.ajaxFormData=function(f,a){"object"==typeof f&&(a=f,f=void 0);a=a||{};a.url=a.url||f||"";a.method=a.method||"post";var d=jQuery.ajaxSetup({},a);if("object"!==typeof d.data||!/^(GET|HEAD|OPTIONS|TRACE)$/.test(d.type))return c.ajax(d);var p=d.data,g="----JQBoundary"+btoa(Math.random().toString()).substr(0,12),m=[],e="",n=function(h,b){if(b instanceof File||b instanceof Blob)m.push(c.Deferred(function(c){var a=new FileReader;a.onload=function(a){a=a.target.result;var d=b.name&&l(b.name)||"blob";e+="--"+g+'\r\nContent-Disposition: form-data; name="'+h+'"; filename="'+d+'"\r\nContent-Type: '+(b.type||"application/octet-stream")+"\r\n\r\n"+a+"\r\n";c.resolve()};a.readAsBinaryString(b)}).promise());else if(/^data:image\/\w+;base64,/.test(b)){var a=b.search(";base64,"),d=b.substr(5,a-5),a=atob(b.substr(a+8));e+="--"+g+'\r\nContent-Disposition: form-data; name="'+h+'"; filename="'+(window.filename||'blob')+'"\r\nContent-Type: '+d+"\r\n\r\n"+a+"\r\n"}else"string"==typeof b||"number"==typeof b?e+="--"+g+'\r\nContent-Disposition: form-data; name="'+h+'"\r\n\r\n'+l(b.toString())+"\r\n":"boolean"===typeof b?b&&(e+="--"+g+'\r\nContent-Disposition: form-data; name="'+h+'"\r\n\r\non\r\n'):alert("jQuery.formdata: Post field type not supported,\nignore the field ["+h+"].")};c.each(p,function(a,b){b instanceof Array||b instanceof FileList?/\[]$/.test(a)?c.each(b,function(){n(a,this)}):alert("jQuery.formdata: an array field must have a `[]` suffix.\nignore the field ["+a+"]."):n(a,b)});return c.when.apply(c,m).then(function(){e+="--"+g+"--\r\n";var a;a:{a=e;for(var b=[],f,k=0;k<a.length;++k){f=a.charCodeAt(k);if(255<f){alert("Char code range out of 8 bit, parse error!");a=[];break a}b.push(a.charCodeAt(k))}a=new Uint8Array(b)}e=a.buffer;d.data=e;d.processData=!1;d.contentType="multipart/form-data; boundary="+g;return c.ajax(d)})}});

    // file to url
    var getFileURL = function(file) {
        var URL = window.URL || window.webkitURL;
        if(!URL) {
            alert('你的浏览器不支持客户端图片处理！');
            return false;
        }
        return imgURL = URL.createObjectURL(file);
    };

    // ------------------------------------
    //              执行脚本
    // ------------------------------------

    var galleries = [];
    var files = [];
    var $body = $('body');

    $.watch(function() {
        return $.ajaxFormData;
    }).then(function() {
        var result = /"javascript:menuonclick\('BookList','(\d+)'\);"/.exec($('#NavigateMenu').html());
        OpenWinUpload('上传图片','图片',{menuid:parseInt(result[1]),cateid:0,type:2});
        return $.watch(function() {
            return $(document.frame1.document).find('#xc_sel').children().length;
        });
    }).then(function() {
        $(document.frame1.document).find('#xc_sel').children().each(function() {
            galleries.push([$(this).html(), $(this).val()]);
        });
        $('head').append('<link rel="stylesheet" type="text/css" href="'+krbb.root+'/style.css" />');
        $body.html(
            '<h1 id="site-title">幼教通图片上传增强插件 v0.2.0</h1>' +
            '<nav id="menu">' +
            '    <label>选择相册：</label>' +
            '    <select id="gallery"></select>' +
            '    <a class="hideOnProgress" href="javascript:$(\'#fileUpload\').click();">选择图片</a>' +
            '    <input id="fileUpload" style="display: none;" type="file" name="images" multiple accept="image/*" />' +
            '</nav>' +
            '<section>' +
            '    <ul id="images"></ul>' +
            '    <div><a id="submit" href="javascript:;" class="hideOnProgress">上传</a></div>' +
            '</section>'
        );
        $.each(galleries, function() {
            $('#gallery').append('<option value="'+this[1]+'">'+this[0]+'</option>')
        });
        var $images = $('#images');
        var $upload = $('#fileUpload').change(function() {
            files = [];
            $images.html('');
            $.each($upload[0].files, function() {
                var url = getFileURL(this);
                $images.append(
                    '<li>' +
                    '  <a style="background-image: url('+url+');" /></a>' +
                    '</li>'
                );
                files.push(this);
            });
        });
        var fileSizeText = function(sz) {
            var e = Math.pow(10, parseInt(Math.log10(sz))-2);
            sz = Math.round(sz/e)*e;
            if (sz < 1000) return sz + 'B';
            else if(sz < 1e6) return sz/1e3 + 'KB';
            else if(sz < 1e9) return sz/1e6 + 'MB';
            else return sz/1e9+ 'GB';
        };
        var doUpload = function() {
            $('.hideOnProgress').toggle(!files.length);
            if(files.length == 0) {return;}
            var file = files.shift();
            window.filename = file.name;
            return $.Deferred(function(dfd) {
                // 先压缩图片
                var $img = $('<img style="max-width: 1000px; position: fixed; opacity: 0;" />').appendTo($body);
                $img.one('load', function() {
                    var c = document.createElement('canvas');
                    var ctx = c.getContext('2d');
                    c.width = $img.width();
                    c.height = $img.height();
                    // 填上白色背景，否则对于透明图会有 bug
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, c.width, c.height);
                    // 将图片渲染上去
                    ctx.drawImage($img[0], 0, 0, c.width, c.height);
                    // 通过 HTML5 编码压缩并且获取 base64，这里使用 jpeg 压缩，可能不太理想，但起码能够缩小体积，png 也可以，但文件体积无法缩小
                    file = c.toDataURL('image/jpeg', 0.9);
                    // 释放资源
                    URL.revokeObjectURL($(this).attr('src'));
                    $(this).remove();
                    dfd.resolve();
                });
                $img.attr('src', getFileURL(file));
            }).promise().then(function() {
                // 获取上传令牌码
                return $.getJSON('http://www.krbb.cn/NewWebSite/Manage/js/uploadify3.2/getcode.ashx?OperateType=1&time='+Math.random());
            }).then(function(obj) {
                // 执行上传
                var code = obj.code;
                var gallery_id = $('#gallery').val();
                $images.find('li:first').append('<div id="progress"><h2>0%</h2></div>');
                return $.ajaxFormData({
                    url: '/newwebsite/manage/js/uploadify3.2/Upload.ashx',
                    xhr: function() {
                        var xhr = $.ajaxSettings.xhr();
                        //绑定上传进度的回调函数
                        xhr.upload.addEventListener('progress', function(evt) {
                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                $('#progress').html(
                                    '<h2>' + parseInt(percentComplete*100)+'%</h2>' +
                                    '<p>'+fileSizeText(evt.loaded)+'/'+fileSizeText(evt.total)+'</p>'
                                );
                            }
                        }, false);
                        return xhr;
                    },
                    data: {
                        Filename: filename,
                        Paras: gallery_id + '\t' + filename,
                        OperateType: 1,
                        CheckCode: code,
                        Filedata: file,
                        Upload: 'Submit Query'
                    }
                });
            }).then(function() {
                $images.find('li:first').fadeOut().detach();
            }).then(doUpload);
        };
        $('#submit').click(function() {
            doUpload();
        });

    });

};