
const fs = require('fs');
let articles = require("../content/articles.json");

module.exports = {
    readall,
    read,
    createArticle,
    update,
    deleteArticle
};

const sortFieldDefault = "date";
const sortOrderDefault = "desc";
const pageDefault = 1;
const limitDefault = 10;
const includeDepsDefault = true;

function readall(req, res, payload, cb) {
    let sortField;
    let sortOrder;
    let limit;
    let page;
    let Deps;

    if (payload.sortField === undefined) {
        sortField = sortFieldDefault;
    }
    else {
        sortField = payload.sortField;
    }
    if (payload.sortOrder === undefined) {
        sortOrder = sortOrderDefault;
    }
    else {
        sortOrder = payload.sortOrder;
    }
    if (payload.page === undefined) {
        page = pageDefault;
    }
    else {
        page = payload.page;
    }
    if (payload.limit === undefined) {
        limit = limitDefault;
    }
    else {
        limit = payload.limit;
    }
    if (payload.includeDeps === undefined) {
        Deps = includeDepsDefault;
    }
    else {
        Deps = payload.includeDeps;
    }
    let a = 1;
    if ((articles.length / limit ^ 0) === articles.length / limit)
        a = 0;    let pages = Math.floor(articles.length / limit) + a;
    if (page > pages || page < 1) {
        cb(null, "error");
        return;
    }

    console.log(1);
    if (limit >= articles.length) {
        cb(null, articles);
    }
    else {
        let whereStart = (limit * page) - 2;
        let whereEnd;
        if (page === pages) {
            whereEnd = articles.length;
        }
        else {
            whereEnd = page * limit;
        }
        resultArticles(whereStart, whereEnd, function (res) {
                for (let i = 0; i < res.length; i++) {
                    if (!Deps) {
                        res[i].comment = undefined;
                    }
                }
                res.sort((a, b) => {
                    if (a[sortField] > b[sortField]) {
                        return sortOrder === "asc" ? 1 : -1;
                    }
                    else {
                        return sortOrder === "asc" ? -1 : 1;
                    }
                });

                let result = {
                    "meta": {
                        "page: ": page,
                        "pages: ": pages,
                        "count: ": articles.length,
                        "limit: ": limit
                    },
                    "items": res
                }
                cb(null, result);
            }
        )
        ;
    }
}

function resultArticles(whereStart, whereEnd, callback) { //формируем нужные статьи
    let result = [];
    for (i = whereStart; i < whereEnd; i++) {
        result.push(articles[i]);
        if (i + 1 == whereEnd) {
            callback(result);
        }
    }
}

function ExistID(id) {
    return new Promise((resolve, reject) => {
        let exist = 0;
        for (i = 0; i < articles.length; i++) {
            if (articles[i].id == id) {
                resolve("exist");
                exist = 1;
            }
            if (i == articles.length && exist == 0) {
                reject("error");
            }
        }
    })
}

function update(req, res, payload, cb) {
    if (payload.id !== undefined) {
        ExistID(payload.id).then(
            exist => {
                for (i = 0; i < articles.length; i++) {
                    if (articles[i].id == payload.id) {
                        if (payload.title !== undefined)
                            articles[i].title = payload.title;
                        if (payload.text !== undefined)
                            articles[i].text = payload.text;
                        if (payload.author !== undefined)
                            articles[i].author = payload.author;
                        if (payload.date !== undefined)
                            articles[i].date = payload.date;
                        let result = articles[i];
                        fs.writeFile("./content/articles.json", JSON.stringify(articles), "utf8", function () {
                        });
                        cb(null, "update");
                    }
                }
            },
            error => {
                cb({code: 404, message: 'Not found'});
            }
        )
    }
    else {
        cb(null, "{code: 400, message: Request invalid}");
    }
}

function read(req, res, payload, cb) {
    let result;
    for (i = 0; i < articles.length; i++) {
        if (articles[i].id == payload.id) {
            result = articles[i];
        }
    }
    cb(null, result);
}

function createArticle(req, res, payload, cb) {
    let d = new Date();
    if (payload.title !== undefined || payload.text !== undefined || payload.author !== undefined) {
        payload.id = articles.length + 1;
        payload.comment = [];
        payload.date = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
        articles.push(payload);
        fs.writeFile("./content/articles.json", JSON.stringify(articles), "utf8", function () {
        });
        cb(null, "created");
    }
    else {
        cb(null, "{code: 400, message: Request invalid}");
    }
}

function deleteArticle(req, res, payload, cb) {
    ExistID(payload.id).then(
        exist => {
            articles.splice(articles.findIndex(index => index.id === payload.id), 1);
            fs.writeFile("./content/articles.json", JSON.stringify(articles), "utf8", function () {
            });
            cb(null, {"msg": "Delete success"});
        },
        error => {
            cb({code: 404, message: 'Not found'});
        })
}