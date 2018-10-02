function getArticles(page = 1, asc = true){
    let sortOrder = asc ? "asc" : "desc";
    let articlesStr = ``;
    let paginationStr = ``;
    let orderStr = ``;
    $.get('/api/articles', { "page": page, "sortOrder": sortOrder}, (data) => {
        orderStr += `<button onclick="getArticles(${page}, ${!asc})" id="sortOrderBttn" class="btn btn-primary">Order:${sortOrder}</button>`        
        data.items.forEach((element) => {
            articlesStr += `
            <div class="art">
            <h3>${element.title}</h3>
            <p id="artText">${element.text}</p>
            <span id="artclInfo">Author: <u><i>${element.author}</i></u> <b>|</b> 
            Date: ${element.date}</span>
            </div>
            <br/>
            `;
        }, this);
        for(let index = 1; index < data.meta.pages + 1; index++){
            paginationStr += `
            <li><button onclick="getArticles(${index}, ${asc})" class="btn btn-primary btn-xs"`;
            if(index === page) paginationStr += ` id="darkbttn"`;
            paginationStr += `>${index}</button></li>
            `;
        }
        $('#sortOrder').empty().append(orderStr);
        $('.pagination').empty().append(paginationStr);
        $("#articles").empty().append(articlesStr);
    });
}
