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
let pool  = mysql.createPool(process.env.JAWSDB_URL || {host:"localhost",
	user:"root",
	password:"root",
	database:"hangman"
});

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

http.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})