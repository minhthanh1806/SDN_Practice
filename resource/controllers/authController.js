const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// POST /auth/tokens
const issueToken = (req, res) => {
  const { name, pass } = req.body;

  // Đọc danh sách members từ members.json (nếu có), mặc định dùng storeadmin
  let members = [{ name: 'storeadmin', pass: 'Store@123' }];
  const filePath = path.join(__dirname, '..', 'members.json');
  if (fs.existsSync(filePath)) {
    members = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Xác thực tài khoản
  const validMember = members.find(m => (m.name === name || m.username === name) && (m.pass === pass || m.password === pass));
  if (!validMember) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Tạo và trả về JWT
  const token = jwt.sign({ name: validMember.name }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  return res.status(200).json({ token });
};

module.exports = {
  issueToken
};
