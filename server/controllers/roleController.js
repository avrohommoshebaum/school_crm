import { roleService } from "../db/services/roleService.js";
import { normalizePermissions } from "../utils/normalizePermissions.js";

export const getAllRoles = async (req, res) => {
  const roles = await roleService.findAllWithUserCount();
  res.json({ roles });
}

export const createRole = async (req, res) => {
  const { name, displayName, description, permissions, color } = req.body;

  const existing = await roleService.findByName(name);
  if (existing)
    return res.status(400).json({ message: "Role already exists" });

  const role = await roleService.create({
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
  const role = await roleService.findById(req.params.id);
  if (!role)
    return res.status(404).json({ message: "Role not found" });

  if (role.isSystem)
    return res.status(400).json({ message: "System roles cannot be edited" });

  const { displayName, description, color, permissions } = req.body;

  const updates = {};
  if (displayName !== undefined) updates.displayName = displayName;
  if (description !== undefined) updates.description = description;
  if (color !== undefined) updates.color = color;
  if (permissions !== undefined)
    updates.permissions = normalizePermissions(permissions);

  const updatedRole = await roleService.update(role._id || role.id, updates);

  res.json({ role: updatedRole });
};

export const deleteRole = async (req, res) => {
  const role = await roleService.findById(req.params.id);
  if (!role) return res.status(404).json({ message: "Role not found" });

  if (role.isSystem)
    return res.status(400).json({ message: "System roles cannot be deleted" });

  await roleService.delete(role._id || role.id);

  res.json({ message: "Role deleted" });
};
