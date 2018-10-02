const Article = require("../models/article").Article;

const defaultValue = {
    "sortField": "date",
    "sortOrder": "desc",
    "page": "1",
    "limit": "5",
    "includeDeps": "false"
}

function sort(payload, articles){
    const sortField = getFieldValue(payload, "sortField");
    let newArticles = articles.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1;
        if (a[sortField] > b[sortField]) return 1;
        return 0;
    });
    if(payload["sortOrder"] === "desc") articles.reverse();
    newArticles = sliceArray(payload, newArticles);
    return { "items": includeDeps(payload, newArticles.slice()), "meta": createMeta(payload, articles) };
}

function getFieldValue(payload, field){
    let sortField;
    if((field in payload) && (payload[field] in new Article({}).getArticle()) && field !== "comments"){
        sortField = payload[field].toString();
    }
    else{
        sortField = defaultValue[field];
    }

    return sortField;
}

function sliceArray(payload, array){
    const page = "page" in payload ? +payload["page"] : +defaultValue["page"];
    const limit = "limit" in payload ? +payload["limit"] : +defaultValue["limit"];
    if(page <= 0 || limit <= 0) throw new Error();
    array.reverse();
    const arr = array.slice((page - 1) * limit, page * limit)
    return arr;
}

function createMeta(payload, articles){
    const page = "page" in payload ? payload["page"] : defaultValue["page"];
    const limit = "limit" in payload ? payload["limit"] : defaultValue["limit"];
    return {
        "page": page,
        "limit": limit,
        "count": articles.length,
        "pages": Math.ceil(articles.length / limit)
    };
}

function includeDeps(payload, array){
    array = JSON.parse(JSON.stringify(array));
    if(!("includeDeps" in payload && payload["includeDeps"] === "true")){
        for(let elem in array){
            delete array[elem].comments;
        }
    }
    return array;
}

module.exports.sort = sort;
