let users = []; // Mảng tạm để lưu user

exports.getUsers = (req, res) => {
    res.json(users);
};

exports.addUser = (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Tên và email là bắt buộc' });
    }
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
};