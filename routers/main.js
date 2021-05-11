const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Content = require("../models/contentDb");
const AdminUser = require("../models/adminDb");
const auth = require("../middleware/auth");

const router = express.Router();

// --- LOGIN ---

router.get("/adminLogin", (req, res) => {
  res.render("adminLogin", { title: "Admin Controle" });
});
router.post("/adminLogin", async (req, res) => {
  try {
    const user = await AdminUser.findOne({ email: req.body.email });
    if (!user) return res.redirect(401, "/adminRegister");
    try {
      const validUser = await bcrypt.compare(req.body.password, user.password);
      if (!validUser) return res.redirect(401, "/adminRegister");
      const token = jwt.sign({ _id: validUser._id }, "webparamJwtPrivateKey");
      // console.log(token);
      res.header("x-auth-token", token).redirect(302, "/adminView");
    } catch (err) {
      console.log(err.message);
    }
  } catch (err) {
    console.log(err.message);
  }
});

// --- REGISTER ---
router.get("/adminRegister", async (req, res) => {
  res.render("adminRegister", { title: "Registration" });
});
router.post("/adminRegister", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AdminUser.findOne({ email });
    if (user) {
      return res.send("user already registered");
    } else {
      const newUser = new AdminUser({ email, password });
      try {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password, salt);
        await newUser.save();
        const token = jwt.sign({ _id: newUser._id }, "webparamJwtPrivateKey");
        console.log(token);
        res.header("x-auth-token", token).redirect(302, "/adminLogin");
      } catch (err) {
        console.log(err.message);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
});
// --- ADMIN --- CRUD ---
router.get("/admin", (req, res) => {
  res.render("admin", { title: "Admin" });
});
router.get("/adminView", async (req, res) => {
  try {
    const contentData = await Content.find();
    res.render("adminView", {
      title: "Administrative View",
      data: contentData,
    });
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/adminEdit/:id", async (req, res) => {
  try {
    const contents = await Content.find({ _id: req.params.id });
    res.render("editContent", { contents });
  } catch (err) {
    console.log(err);
  }
});

router.get("/editContent", (req, res) => {
  res.render("editContent");
});
router.post("/adminEdit", async (req, res) => {
  const { id, title, description } = req.body;
  try {
    const contents = await Content.findByIdAndUpdate(
      { _id: id },
      {
        $set: { title, description },
      },
      { new: true }
    );
    const contentData = await Content.find();
    res.render("content", { title: "Content", data: contentData });
  } catch (err) {
    console.log(err);
  }
});

router.post("/adminDelete", async (req, res) => {
  try {
    const deleteId = await Content.findByIdAndRemove(req.body.id);
    const contentData = await Content.find();
    res.render("content", { title: "Content", data: contentData });
  } catch (err) {
    console.log(err);
  }
});

// --- GET ---
router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
router.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});
router.get("/content", async (req, res) => {
  try {
    const contentData = await Content.find();
    res.render("content", { title: "Content", data: contentData });
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/contentDetails/:id", async (req, res) => {
  try {
    const content = await Content.find({ _id: req.params.id });
    const detail = content[0].description;
    res.render("contentDetails", { detail, title: "More Details" });
  } catch (err) {
    console.log(err.message);
  }
});
router.get("/partners", (req, res) => {
  res.render("partners", { title: "Partners" });
});
router.get("/careers", (req, res) => {
  res.render("careers", { title: "Careers" });
});
router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact" });
});

// --- POST ---
router.post("/content", async (req, res) => {
  const { title, description } = req.body;
  const content = new Content({ title, description });

  try {
    const contentData = await content.save();
    res.redirect("/content", { title: "Content", data: contentData }, 302);
  } catch (err) {
    console.log(err.messge);
    res.render("admin", { title: "Admin" });
  }
});

module.exports = router;
