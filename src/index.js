const express = require('express')
const mountRoutes = require('./routes')

const app = express()
mountRoutes(app)

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});