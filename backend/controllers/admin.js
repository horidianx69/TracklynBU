import User from "../models/user.js";

// Get all pending faculty requests
const getPendingFaculty = async (req, res) => {
  try {
    const pendingFaculty = await User.find({
      role: "faculty",
      isApproved: false,
      isEmailVerified: true,
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json(pendingFaculty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve a faculty account
const approveFaculty = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "faculty") {
      return res.status(400).json({ message: "User is not a faculty member" });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: "Faculty already approved" });
    }

    user.isApproved = true;
    await user.save();

    return res.status(200).json({ message: "Faculty approved successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject (delete) a faculty account
const rejectFaculty = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "faculty") {
      return res.status(400).json({ message: "User is not a faculty member" });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Faculty account rejected and deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getPendingFaculty, approveFaculty, rejectFaculty };
