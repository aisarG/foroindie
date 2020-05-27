const Category = require('../models/categories');

exports.createCategory = (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;

    Category.findOne({title: title})
    .then(category => {
        if (category) {
            errorHandler(422, 'That category already exists')
        }
        category = new Category({ 
            title: title, 
            description: description })
    
        return category.save()
    })
    .then(category => {
        res.status(200).json({ message: `Category ${category.title} created` })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getCategories = (req, res, next) => {
    Category.find().select('title -_id')
    .then(categories => {
        res.status(200).json(categories)
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })

}   