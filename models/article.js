const uid = require('uid');

class Article {

    constructor(artcl){
        this.article = {
            "id": uid().slice(0, 3),
            "title": artcl.title,
            "text": artcl.text,
            "date": this.getDate(),
            "author": artcl.author,
            "comments": [],
        }
    }

    getArticle(){
        return this.article;
    }

    getDate(){
        let date = new Date().toString();
        return date.split(/ /g).slice(1, 5).join(' ');
    }
}

module.exports.Article = Article;
