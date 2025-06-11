const mongoose = require('mongoose')
const Schema = mongoose.Schema

const englishSchema = new Schema({
    type: {
        type: String,
        enum: ["idiom", "phrase", "saying", "slang", "word"],
        required: true
    },
    term: {
        type: String,
        required: true
    },
    user_context: {
        type: String,
        required: true
    },
    meaning: {
        english: { type: String, required: true },
        swahili: { type: String, required: true }
    },
    examples: [{
        en: { type: String, required: true },
        sw: { type: String, required: true }
    }],
    challenge: {
        text: { type: String, required: true },
        type: {
            type: String,
            enum: ["sentence-creation", "translation", "fill-in-the-blank"],
        }
    },
    pubDate: {
        type: String
    },
    link: {
        type: String
    },
}, {strict: false, timestamps: true })

const scraping = mongoose.connection.useDb('scraping')
const englishClubModel = scraping.model('english-club', englishSchema)
module.exports = englishClubModel