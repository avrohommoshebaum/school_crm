import User from "../db/models/user.js";
import Role from "../db/models/role.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().populate("roles");

  const formatted = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    status: u.status,
    roles: u.roles.map(r => ({
      id: r._id,
      name: r.name,
      displayName: r.displayName,
      color: r.color
    })),
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));

  res.json({ users: formatted });
};

export const updateUser = async (req, res) => {
  const { name, email, status, roleIds } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.status = status ?? user.status;
if (Array.isArray(roleIds) && roleIds.length > 0) {
  user.roles = roleIds;
}


  await user.save();
  await user.populate("roles");

  res.json({ message: "User updated", user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.deleteOne();

  res.json({ message: "User deleted" });
};
