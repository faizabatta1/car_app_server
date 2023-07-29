const bcrypt = require('bcrypt');
const User = require('../models/usersModel');
const jwt = require('jsonwebtoken');


exports.getAllUsers = async (req, res) => {
  try {
    const token = req.headers.token;
    const decodedToken = jwt.verify(token, 'ManagerLoginKey');
    const role = decodedToken.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const users = await User.find({}, { __v: false });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAllUsers = async (req, res) =>{
  try{
    await User.deleteMany({});
    return res.status(200).send("All Users Were Deleted")
  }catch (error){
    return res.status(500).send("Failed To Delete All Users")
  }
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log(req.body);

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    const existingPhone = await User.findOne({ phone: phone })
    if(existingPhone){
      return res.status(400).send("Phone Already Exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      phone:phone
    });

    const savedUser = await newUser.save();



    return res.status(200).json(savedUser);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'user' },
        'your-secret-key',
        { expiresIn: '30d' }
      );

      return res.status(200).send(token);
    } else {
      return res.status(401).send('Invalid password');
    }
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
};

exports.getUser = async (req, res) => {
  try {
    const { token } = req.headers
    const decodedToken = jwt.verify(token, 'your-secret-key');

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;


    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      return res.status(200).json({ message: 'User deleted successfully' });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ error: 'Email already exists with another user' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name, email: email },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const bucket = require('../utils/firebase')

const uuid = require("uuid");


exports.uploadImage = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const token = uuid.v4();

    const metadata = {
      metadata: {
        // This line is very important. It's to create a download token.
        firebaseStorageDownloadTokens: token,
      },
      contentType: req.file.mimeType,
      cacheControl: `public, max-age=${Date.now() + 10 * 60 * 60 * 24 * 30 * 365}`,
    };

    await bucket.upload(`images/${req.file.filename}`, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      metadata: metadata,
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/zainfinal-b9de0.appspot.com/o/${req.file.filename}?alt=media&token=${token}5`


    let updated = await User.findOneAndUpdate({ _id:userId },{
      image:url
    },{ $new:true })

    return res.status(200).json(updated)

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.validateToken = (req,res) =>{
  try{
    const { token } = req.headers
    jwt.verify(token, 'your-secret-key',{

    },(error,cb) => {
      if(error){
        return res.status(400).send(error)
      }else{
        return res.status(200).send(cb)
      }
    })
  }catch (error){
    return res.status(500).send(error.message)
  }
}
