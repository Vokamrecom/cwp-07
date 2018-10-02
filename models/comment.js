const uid = require('uid');

class Comment {

    constructor(commnt){
        this.comment = {
            "id": uid().slice(0, 3),
            "articleId": commnt.articleId,
            "text": commnt.text,
            "date": this.getDate(),
            "author": commnt.author,
        }
    }

    getComment(){
        return this.comment;
    }

    getArticleId(){
        return this.comment.articleId;
    }

    getDate(){
        let date = new Date().toString();
        return date.split(/ /g).slice(1, 5).join(' ');
    }    
}

module.exports.Comment = Comment;
