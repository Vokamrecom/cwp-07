const fs = require('fs');
const artcl = require('../models/article');
const cmmnt = require('../models/comment');
const sort = require('./delivery_settings').sort;
const Err = require('./errors').Errors;
const LOG = require('./logger').LOG;
const logger = require('./logger');
const public_hndl = require('./handlers_public');

const handlers = {
    '/api/articles/readall': articlesReadall,
    '/api/articles/read': articlesRead,
    '/api/articles/create': articlesCreate,
    '/api/articles/update': articlesUpdate,
    '/api/articles/delete': articlesDelete,
    '/api/comments/create': commentsCreate,
    '/api/comments/delete': commentsDelete,
    '/api/logs': getLogs,
    '/': public_hndl.getFile,
    '/index.html': public_hndl.getFile,
    '/form.html': public_hndl.getFile,
    '/app.js': public_hndl.getFile,
    '/form.js': public_hndl.getFile,
    '/site.css': public_hndl.getFile,
};

function articlesReadall(req, res, payload, articles, cb) {
    try{
        const result = sort(payload, articles);
        cb(null, result, articles);
    }
    catch(Error){
        cb(Err[400], {}, articles);          
    }
}

function articlesRead(req, res, payload, articles, cb) {
    let context = {};
    const index = articles.length > 0 ? articles.findIndex((elem) => elem.id === payload.id) : -1;

    if(index !== undefined && index >= 0){
        context = articles[index];
    }
    else{
        context = logError(411);
    }
    cb(null, context, articles);
}

function articlesCreate(req, res, payload, articles, cb) {
    try{
        let article = new artcl.Article(payload);
        if(!isCorrectFields(article.getArticle())){
            throw (err);
        }
        articles.push(article.getArticle());

        cb(null, article.getArticle(), articles);  
    }
    catch(Error){
        cb(Err[400], {}, articles);          
    }
    
}

function articlesUpdate(req, res, payload, articles, cb) {
    let context = {};
    
    try{
        const index = articles.length > 0 ? articles.findIndex((elem) => elem.id === payload.id) : -1;
        
        if(index !== undefined && index >= 0){
            articles[index] = updateArticle(articles[index], payload);
            context = {"Result": "Article updated"};
        }
    }
    catch(Error){
        context = logError(400);
    }
  
    cb(null, context, articles);
}

function articlesDelete(req, res, payload, articles, cb) {
    let context = {};
    const index = articles.length > 0 ? articles.findIndex((elem) => elem.id === payload.id) : -1;

    if(index !== undefined && index >= 0){
        articles.splice(index, 1);
        context = {"Result": "Article deleted"};
    }
    else{
        context = logError(411);
    }
    cb(null, context, articles);
}

function commentsCreate(req, res, payload, articles, cb) {
    try{
        let comment = new cmmnt.Comment(payload);
        if(!isCorrectFields(comment.getComment())){
            throw (err);
        }
        let context = {};
        const index = articles.length > 0 ? articles.findIndex((elem) => elem.id === comment.getArticleId()) : -1;
    
        if(index !== undefined){
            context = comment.getComment();
            articles[index].comments.push(context);
        }
        else{
            context = logError(411);
        }
        cb(null, context, articles);
    }
    catch(Error){
        cb(Err[400], {}, articles);
    }
}

function commentsDelete(req, res, payload, articles, cb) {
    let comment_index;
    let context = Err[412];
    articles.forEach((elem) => {
        comment_index = getCommentIndex(elem, payload.id);
        if(comment_index !== -1){
            elem.comments.splice(comment_index, 1);
            context = {"Result": "Comment deleted"};
        }
    });
  
    cb(null, context, articles);
}

function getLogs(req, res, payload, articles, cb){
    const context = logger.getJSON();
    cb(null, context, articles);
}

function notFound(req, res, payload, articles, cb) {
    cb(Err[404], {}, articles);
}

function getCommentIndex(article, comment_id){
    let index;
    if(article.comments.length > 0){
        index = article.comments.findIndex((elem) => elem.id === comment_id);   
    }
    else{
        index = -1;
    }
    return index;
}

function updateArticle(currentArticle, newArticle){
    try{
        for(let elem in newArticle){
            currentArticle[elem] = newArticle[elem];
        }
    }
    catch(Error){

    }
    return currentArticle;
}

function isCorrectFields(object){
    for(let elem in object){
        if(object[elem] === undefined) return false;
    }
    return true;
}

function logError(err){
    const Error = Err[err];
    LOG(`Error(${Error.code}): ${Error.message}.`);
    return Err[err];
}

module.exports.handlers = handlers;
module.exports.notFound = notFound;
  