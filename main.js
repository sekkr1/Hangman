String.prototype.indexesOf = function(str){
    let indices = [];
    for(var i=0; i<this.length;i++) {
        if (this[i] === str) indices.push(i);
    }
    return indices
}
let express = require("express")
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mysql = require('mysql2/promise');
let pool  = mysql.createPool("mysql://h8adlys5otnbkj63:e873qhiupni8yztj@gi6kn64hu98hy0b6.chr7pe7iynqr.eu-west-1.rds.amazonaws.com:3306/yoe046niwqyicwb7");

app.use(express.static('public'));

io.on('connection', function(socket){
    console.log("connection from "+socket.conn.remoteAddress)
    pool.getConnection().then(db=>{db.query("SELECT DISTINCT Category FROM Words")
        .then(results=>socket.emit("categories",results[0].map(row=>row.Category)))})

    socket.on("category",category=>{
        pool.getConnection().then(db=>{db.execute('SELECT Word FROM Words WHERE Category=? ORDER BY rand() LIMIT 1',[category])
            .then(results=>{
                socket.word=results[0][0].Word.toLowerCase()
                socket.emit("structure",{length:socket.word.length,spaces:socket.word.indexesOf(" ")})
            })})
    })
    socket.on("guess",guess=>{
        let locations = socket.word.replace(" ","").indexesOf(guess)
        if(locations.length >0) socket.emit("locations",{letter:guess,locations:locations})
        else socket.emit("mistake",guess)
    })
})

http.listen(80, function() {
    console.log('listening on *:80');
})