const mongoClient = require('mongodb').MongoClient;
const state = {
    db:null
}

module.exports.connectDb = (done) => {
    const url = 'mongodb://localhost:27017';
    mongoClient.connect(url,(err, data)=>{
        if (err) return done(err)
        state.db = data.db('wearAgain')
    })
    done()
}

module.exports.get = () => {
    return state.db
}