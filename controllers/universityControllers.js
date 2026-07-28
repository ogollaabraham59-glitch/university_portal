const { university } = require('../models/universityModel')

//add class room
exports.newuniversity = async (req, res) => {
    try {
        const adduniversity = req.body
        const saveduniversity = new university(adduniversity);
        await saveduniversity.save()
        res.status(201).json(saveduniversity)
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

//fetch all class rooms

exports.getAlluniversity = async (req, res) => {
    try {

        const University = await university.find()
 res.status(200).json(University)

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

//ting a single classroom
exports.getAlluniversityById = async (req, res) => {
    try {
        const University = await university.findById(req.params.id, req.body)


        if (!university) return res.status(404).json({ message: ' university not found' })
        res.status(200).json(University)
    } catch (error) {
        res.status(500).json({ message: error.message })

    }

}

//updating a class
exports.updateuniversity = async (req, res) => {
    try {
        const update = await university.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if (!update) return res.status(404).json({ message: "university not found" })
        res.status(200).json(update)
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

// deleting class room
exports.deletuniversity = async (req, res) => {
    try {
        const delet = await university.findByIdAndDelete(
            req.params.id

        )
        if (!delet) return res.status(404).json({ message: 'connot find classroom' })
        res.status(200).json(delet)
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}