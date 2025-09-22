const express= require('express')
const router = express.Router();
const userController=require('../controller/userController');
const {protect,restrictTo}= require("../middleware/authMid");

const {registerUser,loginUser}= userController;

router.post('/register',registerUser);
router.post('/login',loginUser);

router.get('/faculty-dashboard',protect,restrictTo('faculty'),(req,res)=>{
    res.status(200).json({
        message:`Welcome faculty ${req.user.firstName}`
    });
})

router.get('/admin-dashboard',protect,restrictTo('admin'),(req,res)=>{
    res.status(200).json({
        message:`Welcome admin ${req.user.firstName}`
    })
})

router.get('/student-dashboard',protect,restrictTo('student'),(req,res)=>{
    res.status(200).json({
        message:`Welcome student ${req.user.firstName}`
    })
})

module.exports=router;