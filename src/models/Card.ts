import mongoose from "mongoose";

const CardSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    exp_date: {
        type: String,
        required: true
    },
    sec_number: {
        type: Number,
        required: true
    },
    card_holder: {
        type: String,
        required: true
    }
});

export default mongoose.model('Card', CardSchema);