

const express = require('express')
const app = express()
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render("main.ejs")
})

app.listen(3000, () => {
    console.log("Server is running")
})