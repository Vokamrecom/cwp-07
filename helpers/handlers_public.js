const fs = require('fs');
const _url = require('url');

const pathFromUrl = {
    '/': '/public/index.html',
    '/index.html': '/public/index.html',
    '/form.html': '/public/form.html',
    '/app.js': '/public/app.js',
    '/form.js': '/public/form.js',
    '/site.css': '/public/site.css',
}

contentTypes = {
    'html'  : 'text/html',
    'js'    : 'text/javascript',
    'json'  : 'application/json',
    'css'   : 'text/css',
    'text'  : 'text/plain',
};

function getFile(req, res, payload, articles, cb){
    let path = `.${pathFromUrl[_url.parse(req.url, true).pathname]}`;
    if(path === '.undefined') path = `./public${req.url}`;
    let type = getType(path);
    res.setHeader('Content-Type', contentTypes[type]);
    let context = fs.readFileSync(path, 'utf8');
    cb(null, context, articles);
}

function getType(path){
    let obj = path.split('.');
    return obj[obj.length - 1];
}

module.exports.getFile = getFile;
