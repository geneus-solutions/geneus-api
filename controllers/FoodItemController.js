import Item from '../models/FoodItems.js'

const createItem = async (req, res) => {
    try {
        const newItems = await Item.insertMany(req.body);
       
        res.status(201).json(newItems);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export  {
    createItem,
    getItems
}