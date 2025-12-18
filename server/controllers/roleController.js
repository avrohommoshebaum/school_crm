import Role from "../db/models/role.js";
import { normalizePermissions } from "../utils/normalizePermissions.js";

export const getAllRoles = async (req, res) => {
  const roles = await Role.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "roles",
        as: "users",
      },
    },
    {
      $addFields: {
        userCount: { $size: "$users" },
      },
    },
    { $project: { users: 0 } }, 
    { $sort: { isSystem: -1, displayName: 1 } },
  ]);

  res.json({ roles });
}

export const createRole = async (req, res) => {
  const { name, displayName, description, permissions, color } = req.body;

  const existing = await Role.findOne({ name });
  if (existing)
    return res.status(400).json({ message: "Role already exists" });

  const role = await Role.create({
    name,
    displayName,
    description,
    color,
    isSystem: false,
    permissions: normalizePermissions(permissions),
  });

  res.status(201).json({ role });
};

export const updateRole = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role)
    return res.status(404).json({ message: "Role not found" });

  if (role.isSystem)
    return res.status(400).json({ message: "System roles cannot be edited" });

  const { displayName, description, color, permissions } = req.body;

  if (displayName !== undefined) role.displayName = displayName;
  if (description !== undefined) role.description = description;
  if (color !== undefined) role.color = color;
  if (permissions !== undefined)
    role.permissions = normalizePermissions(permissions);

  await role.save();

  res.json({ role });
};

export const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });

  if (role.isSystem)
    return res.status(400).json({ message: "System roles cannot be deleted" });

  await role.deleteOne();

  res.json({ message: "Role deleted" });
};
